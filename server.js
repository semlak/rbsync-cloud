'use strict';

//used https://www.npmjs.com/package/mongoose-auto-increment to help with auto incrementing object ids in database

var attributes_to_track = ["artist", "album", "year", "track_number", "disc_number", "track_total", "disc_total", "album_artist", "composer", "title", "rating", "play_count", "bpm", "genre", "comment"]
var attributes_to_track_with_ch_time = ["artist_ch_time", "album_ch_time", "year_ch_time", "track_number_ch_time", "disc_number_ch_time", "track_total_ch_time", "disc_total_ch_time", "album_artist_ch_time", "composer_ch_time", "title_ch_time", "rating_ch_time", "play_count_ch_time", "bpm_ch_time", "genre_ch_time", "comment_ch_time"]
var attributes_to_track_all = attributes_to_track.concat(attributes_to_track_with_ch_time, ['sync_time'])
var valid_client_ids = [1, 2]



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
var async = require('async');

var exports = module.exports = {};
//app.engine('.html', require('jade'));
app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');

exports.attributes_to_track = attributes_to_track
exports.attributes_to_track_with_ch_time = attributes_to_track_with_ch_time
exports.valid_client_ids = valid_client_ids
exports.attributes_to_track_all = attributes_to_track_all


//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('json spaces', 2);


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


var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);


// var RBsyncQuery = require('./app/models/searchQueryModel');
// var TrackMatch = require('./app/models/trackMatchModel');
// var route = require('./app/controllers/sync-up.js');
// route.controller(app);
// var TrackLink = require('./app/models/trackLinkModel');

var a = {'changes': null}




// var link = new CommonTrack();
// link.save(function(err) {
// 	if (err)	{
// 		console.log(err)
// 	}
// 	else {
// 		console.log("saved dumb link")
// 	}
// });




var tryMe = function (var1, param1, param2) {
	log (var1)
    log (param1 + " and " + param2);
}

var callbackTester = function (callback) {
	var temp = 1
    callback(temp);
}

// callbackTester(tryMe.bind(null, "hello", "goodbye"));






// var keys = Object.keys(Track.schema.tree)
// console.log("keys", keys)



var route = require('./app/controllers/track.js');
route.controller(app);

var route = require('./app/controllers/commonTrack.js');
route.controller(app);


//information about server error handling at http://www.hacksparrow.com/express-js-custom-error-pages-404-and-500.html
// Handle 404
app.use(function(req, res, next) {
  res.status(400);
 res.render('404.jade', {title: '404: File Not Found'});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500);
 res.render('500.jade', {title:'500: Internal Server Error', error: error});
});




var initial_id = 1591
// var q2 = createOrFindCommonTrackFromTrackId(initial_id, f1)

// console.log(route.controller)

// testFindMatch(initial_id);
// testFindExisingTrackMatch(initial_id);

var server = app.listen(port);
console.log('Magic happens on port ' + port);

exports.closeServer = function(){
	//mainly used for testing
	console.log("closing server");
	mongoose.connection.close();
 	server.close();
};

// console.log(module.exports)
// setTimeout(function() {
// 	console.log("closing server");
// 	server.close();
// }, 3000);