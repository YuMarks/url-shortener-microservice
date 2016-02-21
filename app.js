var http = require('http'),
  dotenv = require('dotenv').config(), //load environment variables from .env
  mongodb = require('mongodb'),
  url = require('url'),
  validUrl = require('valid-url'), //checks for valid url format
  request = require('request'), //makes http call to check for status code
  shortid = require('shortid'); //generates a short, unique id
var MongoClient = mongodb.MongoClient;
var port = process.env.PORT || 8080;
var html = "";
var displayThis = "";
var dbInfo = process.env.MONGOLAB_URI;

function checkExisting(origUrl, res) { //if url is not in correct format, check if it is in database as short URL
  MongoClient.connect(dbInfo, function(err, db) {
    if (err) {
      console.log("The error is " + err);
    } else {
      var shortUrls = db.collection('shortUrls');
      var checkExisting = origUrl.path.slice(1);
      checkExisting = 'https://url-shortener-ymarks.c9users.io/' + checkExisting

      shortUrls.findOne({ //use findOne() rather than find() when expecting only one result 
        short: checkExisting
      }, function(err, docs) {
        if (err) {
          console.log(err);
          db.close();
        } else if (docs) {
          html = "<script>window.location.assign('" + docs.real + "');</script>";
          res.end(html);
        } else {
          html = "Not a valid URL";
          res.end(html);
        }
      });
    }
  });
}

function checkUrl(address) {
  var urlChop = address.href.slice(1);
  var validUrl = require('valid-url');
  if (validUrl.isUri(urlChop)) {
    return urlChop;
  } else {
    urlChop = "Not a valid URL";
    return urlChop;
  }
}

function checkDB(address, res) {
  MongoClient.connect(dbInfo, function(err, db) {
      if (err) {
        console.log("The error is " + err);
      } else {
        var shortUrls = db.collection('shortUrls');
        shortUrls.findOne({
          real: address
        }, function(err, docs) {
          if (err) {
            console.log(err);
            db.close();
          } else if (docs) {
            displayThis = {
              original_url: docs.real,
              short_url: docs.short
            };
            db.close();
            html = "<p>" + JSON.stringify(displayThis) + "</p>";
            res.end(html);

          } else {
            var genShort = shortid.generate();
            var shortUrl = {
              real: address,
              short: 'https://url-shortener-ymarks.c9users.io/' + genShort
            };

            shortUrls.insert(
              shortUrl,
              function(err, data) {
                if (err) {
                  console.log(err);
                }
                db.close();
                displayThis = {
                  original_url: shortUrl.real,
                  short_url: shortUrl.short
                };
                var html = "<p>" + JSON.stringify(displayThis) + "</p>";
                res.end(html);
              });
          }
        });
      }
    }
  );
}

var server = http.createServer(function(req, res) {
  var origUrl = url.parse(req.url, true);
  var result = checkUrl(origUrl);

  if (result == "Not a valid URL") {
    checkExisting(origUrl, res);
    html = "<p>" + result + "</p>";

  } else {

    request(result, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        checkDB(result, res);
        html = "<p>" + displayThis + "</p>";

      } else {
        result = "Not a valid URL";

        html = "<p>Sorry, " + result + "</p>";
        res.end(html);
      }
    });
  }
});
server.listen(port);
