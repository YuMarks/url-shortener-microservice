var express = require('express');
var app = express();
var http = require('http');
var port = process.env.PORT || 8080;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoose = require('mongoose');
var url = require('url');
var validUrl = require('valid-url');
var request = require('request');
var short = require('short');
var shortUrl = {real: 'http://www.yahoo.com', short: 'https://url-shortener-ymarks.c9users.io/1'};
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
function checkDB(address){
    MongoClient.connect('mongodb://velma:&inkies101@ds049848.mongolab.com:49848/urlshortened', function(err, db){
    if(err){
        console.log("The error is " + err);
    }else{
        console.log("Huzzah, we are connected!");
        var shortUrls = db.collection('shortUrls');
        //var shortUrl1 = {real: "http://www.yahoo.com", short: 'https://url-shortener-ymarks.c9users.io/1'};
        shortUrls.insert(
            shortUrl,
            function(err, data){
                if(err){
                    console.log(err);
                }});
            
    
    console.log("We are looking for " + address);
   
    shortUrls.find({
        real: {address}
    }).toArray(function(err, docs){
        if(err){
            console.log(err);
            db.close();
        }
        console.log(docs);
        db.close();
    }); 
    
    }
}
        
    )}

var server = http.createServer(function (req, res){
    var origUrl = url.parse(req.url, true);
    var result = checkUrl(origUrl);
    console.log("result equals " + result);
    if(result == "Not a valid URL"){
      var html = "<p>"+ result + "</p>";
    }else{
         
         request(result, function (error, response, body){
       if(!error && response.statusCode == 200){
           console.log("This URL is real!");
            checkDB(result); 
           
       }else{
           result = "Not a valid URL";
           console.log("result is " + result);
         
       } 
    });
    }
    
    
    var html = "<p>"+ result + "</p>";
    res.end(html);
});

server.listen(port);