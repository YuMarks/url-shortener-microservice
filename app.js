var express = require('express');
var app = express();
var http = require('http');
var port = process.env.PORT || 8080;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoose = require('mongoose');
var url = require('url');
var validUrl = require('valid-url');
var testUrl = "";
function checkUrl(address){
    var urlChop = address.href.slice(1);
    var validUrl = require('valid-url');
  
    if (validUrl.isUri(urlChop)){
        console.log('Looks like an URI');
        return urlChop;
    } else {
        console.log('Not a URI');
        urlChop = "Not a valid URL";
        return urlChop;
    }
   }

function realUrl(result, req, res) {
    var request = require('request');
    request(result, function (error, response, body){
       if(!error && response.statusCode == 200){
           console.log("This URL is real!");
           return result;
       }else{
           console.log("Not a real URL");      
           
           return "Not a valid URL";
       } 
    });
    
}   
var server = http.createServer(function (req, res){
    var origUrl = url.parse(req.url, true);
    var result = checkUrl(origUrl);
    console.log("result equals " + result);
    if(result == "Not a valid URL"){
      var html = "<p>"+ result + "</p>";
    }else{
        var html = "<p>"+ result + "</p>";
        testUrl = realUrl(result);
        console.log("testUrl " + testUrl);
    }
    //var html = "<p>" + result + "</p>";
    MongoClient.connect('mongodb://velma:&inkies101@ds049848.mongolab.com:49848/urlshortened', function(err, db){
    if(err){
        console.log("The error is " + err);
    }else{
        console.log("Huzzah, we are connected!");
    }
    //var shortUrls = db.collection('shortUrls');
   
    db.close();
    res.end(html);
});
});
server.listen(port);