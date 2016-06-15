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


var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);


// var RBsyncQuery = require('./app/models/searchQueryModel');
var Track = require('./app/models/trackModel');
// var route = require('./app/controllers/sync-up.js');
// route.controller(app);

app.get("/api/tracks/", function (req, res) {
	log('listing all tracks stored in database');
	Track.find(function(err, tracks) {
		if (err) {
			res.send(err);
		}
		res.json(tracks);
	}).sort('_id');	

});



var a = {'changes': null}

var valid_client_ids = [1, 2]


app.post("/api/new_tracks/", function (req, res) {
	var new_tracks = req.body.new_tracks;
	var response_data = [];
	var numNewEntriesCounter = 0; 
	// might be able to replace part of foreach with a map function, and then only have the foreach on the track.save portion.
	var rbsync_client_id = null;
	if (req.body.rbsync_client_id != null && valid_client_ids[req.body.rbsync_client_id]) {
		rbsync_client_id = req.body.rbsync_client_id;
		log('received request to add new tracks by client with rbsync_client_id == ' + rbsync_client_id)
		new_tracks.forEach(function (entry, i) {
			if (!(entry['rbsync_id'])) {
				// rbsync_id not provided. this should be a new track. Really should verify it is not in database.
				// I should add a check.
				numNewEntriesCounter += 1;
				var track = new Track();
				for (var key in entry) {
					if (key == 'ID') {
						track['local_id'] = entry[key];
						log('local_id');
						log(track.local_id);

					}
					else {
						track[key] = entry[key];
					}
				};
				track['rbsync_client_id'] = rbsync_client_id;
				track.save(function(err) {
					if (err) {
						res.json(err);
					}
					log('track entry created!');
					// console.log(i, j);
					// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
					var entry_to_send_back = {'id': track.local_id, 'rbsync_id' : parseInt(track.id)};
					response_data.push(entry_to_send_back);
					log(entry_to_send_back);
					if (response_data.length == new_tracks.length ) {
						var response = {'changes': response_data, 'message': null}
						log('sending response', response)
						res.json(response);
						// res.end();
					}
				});
			}
			
		});

		if (numNewEntriesCounter == 0) {
			res.json({'changes': null, 'message': null})
		}
	}
	else {
		res.json({'changes': null, 'message': 'Must send valid rbsync_client_id'})
	}


});


app.post("/api/sync_up/", function (req, res) {
	var changes = req.body.changes;
	var response_data = [];
	var numNewEntries = 0;
	var rbsync_client_id = null;
	if (req.body.rbsync_client_id != null && valid_client_ids[req.body.rbsync_client_id]) {
		rbsync_client_id = req.body.rbsync_client_id;
		log('received request to update tracks by client with rbsync_client_id == ' + rbsync_client_id)
		changes.forEach(function (entry, i) {
			if ((entry['rbsync_id'])) {
				// rbsync_id is provided. this should already be in cloud database. 
				// I should add a check.
				numNewEntries += 1;
				Track.findById(entry.rbsync_id, function(err, track) {
					if (err) {
						res.send(err);
					}
					else {
						for (var key in entry) {
							// should verify that this is correct client id
							// here, rbsync_id from the client is the is the primary key for the track
							if (key != 'rbsync_id' && entry.key != track.key) {
								track.key = entry.key;
							}															
						}
						track.save(function(err) {
							if (err) {
								res.json(err);
							}
							log('track entry updated!');
							var entry_to_send_back = {'rbsync_id' : parseInt(track.id)};
							// now, look for changes to send back. Probably need helper function.
							if (entry_to_send_back['rbsync_id'] == 1212) {
								entry_to_send_back['genre'] = 'Saucy';
								// entry_to_send_back['title'] = 'Azafata';
							}
							response_data.push(entry_to_send_back);
							log(entry_to_send_back);
							console.log("rd.length", response_data.length, "changes.length", changes.length)
							if (response_data.length == changes.length ) {
								var response = {'changes': response_data, 'message': null}
								console.log('sending response', response)
								res.json(response);
							}
						});
					}
				});				
			}
			
		});
		if (numNewEntries == 0) {
			res.json({'changes': null, 'message': null})
		}
	}
	else {
		res.json({'changes': null, 'message': 'Must send valid rbsync_client_id'})
	}


});

app.get("/api/sync-up/*", function (req, res) {
	log(req.body);
	res.end("You should send a POST request, not a GET request");

});

var delete_tracks = function() { 
	Track.find(function(err, tracks) {
		if (err) {
			res.send(err);
		}
		log(tracks);
		tracks.forEach(function(track) {
			Track.remove({
				_id: track._id
			}, function(err, track1) {
				if (err) {
					log(err);
				}
				log({ message: 'Successfully deleted' });
			});
		});
	}).sort('_id');	
}

// delete_tracks()

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