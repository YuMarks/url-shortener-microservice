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
var shortid = require('shortid');
var html = "";
var displayThis = "";
//var shortUrl = {real: 'http://www.yahoo.com', short: 'https://url-shortener-ymarks.c9users.io/1'};
function checkExisting(origUrl, res){
    MongoClient.connect('mongodb://velma:&inkies101@ds049848.mongolab.com:49848/urlshortened', function(err, db){
    if(err){
        console.log("The error is " + err);
    }else{
        console.log("Huzzah, we are connected!");
           var shortUrls = db.collection('shortUrls');
           var checkExisting = origUrl.path.slice(1);
           checkExisting = 'https://url-shortener-ymarks.c9users.io/' + checkExisting
           console.log(checkExisting);
        shortUrls.findOne({
        short: checkExisting
    },function(err, docs){
        if(err){
            console.log(err);
            db.close();
        }else if(docs){
            console.log(docs.real);
            res.setHeader("Location", docs.real);
            html ="<script>window.location.assign('" + docs.real + "');</script>";
            res.end(html);
    }
    });}});
}
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
function checkDB(address, res){
    MongoClient.connect('mongodb://velma:&inkies101@ds049848.mongolab.com:49848/urlshortened', function(err, db){
    if(err){
        console.log("The error is " + err);
    }else{
        console.log("Huzzah, we are connected!");
        
        var shortUrls = db.collection('shortUrls');
        shortUrls.findOne({
        real: address
    },function(err, docs){
        if(err){
            console.log(err);
            db.close();
        }else if(docs){
            console.log(docs);
            console.log("found it");
            displayThis = {original_url: docs.real, short_url: docs.short};
            db.close();
           html = "<p>" + JSON.stringify(displayThis) + "</p>"
           res.end(html);
            
        }else{
            console.log("not found");
            var genShort = shortid.generate();
            var shortUrl = {real: address, short: 'https://url-shortener-ymarks.c9users.io/' + genShort};
            console.log(shortUrl);
             shortUrls.insert(
            shortUrl,
            function(err, data){
                if(err){
                    console.log(err);
                }
                db.close();
                displayThis = {original_url: shortUrl.real, short_url: shortUrl.short};
                var html = "<p>" + JSON.stringify(displayThis) + "</p>";
                res.end(html);
            });
            
        }
        
    });
        
       
            
    }
}
        
    )}

var server = http.createServer(function (req, res){
    var origUrl = url.parse(req.url, true);
    var result = checkUrl(origUrl);
    console.log("result equals " + result);
    
    if(result == "Not a valid URL"){
        checkExisting(origUrl, res);
       html = "<p>"+ result + "</p>";
      // res.end(html);
    }else{
         
         request(result, function (error, response, body){
       if(!error && response.statusCode == 200){
           console.log("This URL is real!");
            
            checkDB(result, res); 
            
            html = "<p>"+ displayThis + "</p>";
            
           
       }else{
           result = "Not a valid URL";
           console.log("result is " + result);
            html = "<p>Sorry, "+ result + "</p>";
            res.end(html);
       }}
        );
    }});
    

server.listen(port);