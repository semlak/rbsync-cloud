'use strict';

//used https://www.npmjs.com/package/mongoose-auto-increment to help with auto incrementing object ids in database


// server.js

var log = function(data) {
	console.log(data);
};

var fs = require('fs');
// console.log(fs.lstatSync('./.env'));	
// base setup
// var pageData = require('./app/views/indexPageData.js');
// console.log(pageData);
// return 1 ;

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var url = require('url');
var path = require('path');
var port = process.env.PORT || 8080;
var https = require('https');
var http = require('http');
var router = express.router;
var exports = module.exports = {};
//app.engine('.html', require('jade'));
app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');




//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

try {
	var dotenv = require('dotenv').load();
}

catch (e) {
	// console.log(e);
	if (e == 'ENOENT') {
		console.log("caught error. file '.env' is not present. It does not need to be present on a heroku application");
	}
	else {
		throw e;
	}
}
var apiKey = process.env.API_KEY


var connection = mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGO_URI || 'mongodb://localhost/rbsync');

// var RBsyncQuery = require('./app/models/searchQueryModel');
var RBsyncQuery = require('./app/models/rbsyncModel');
var trackQuery = require('./app/models/trackModel');
// var route = require('./app/controllers/sync-up.js');
// route.controller(app);
app.post("/api/sync-up/", function (req, res) {
	// log(req.body);
	// res.send("Hi");
     // jsondata = JSON.parse("[1]")
     // jsondata = JSON.parse(req.body);
     log(req.body.changes);
     var changes = req.body.changes;
     changes.forEach(function (entry) {
          if (!(entry['rbsync_id'])) {
               // rbsync_id not provided. presumably, this is a new track. Check first.
	               // var q = RBsyncQuery.
	               //      find({}, 'queryTerm -_id').
	               //      select('-_id').
	               //      sort('-queryDate').
	               //      limit(10);          
			var q1 = "blah";
               }
     });

     res.json(req.body);
     res.end();
});

app.get("/api/sync-up/*", function (req, res) {
     log(req.body);
     res.end("You should send a POST request, not a GET request");

});

// start server

var server = app.listen(port);
console.log('Magic happens on port ' + port);

exports.closeServer = function(){
	//mainly used for testing
	console.log("closing server");
	mongoose.connection.close();
 	server.close();
};


// setTimeout(function() {
// 	console.log("closing server");
// 	server.close();
// }, 3000);