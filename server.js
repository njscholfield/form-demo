var express = require('express');
var formidable = require('formidable');
var pg = require('pg');
var app = express();

app.set('port', process.env.PORT);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('form');
});

app.get('/results/', function(req, res) {
  retrieveAllDatabaseTuples(req, res);
});

app.post('/', function(req, res) {
  processAllFieldsOfTheForm(req, res);
  setTimeout(function () {
    retrieveAllDatabaseTuples(req, res);
  }, 500);
});

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query('INSERT INTO input_data (id, name) VALUES($1, $2) RETURNING id', [fields['inputNumber'], fields['inputName']], function(err, result) {
            done();
            if (err) {
              console.log(err);
            } else {
              console.log('row inserted with id: ' + result.rows[0].id);
            }
            client.end();
          });
        });
    });
}

function retrieveAllDatabaseTuples(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM input_data', function(err, result) {
      done();
      if (err)
       { console.error(err); res.send("Error " + err); }
      else
       { res.render('db', {results: result.rows} ); }
    });
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
