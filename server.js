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
var async = require('async');

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
var TrackMatch = require('./app/models/trackMatchModel');
// var route = require('./app/controllers/sync-up.js');
// route.controller(app);



var a = {'changes': null}

var valid_client_ids = [1, 2]




var foundPossibleMatchByTags = function(track1, err, tracks) {
	// var args = Array.prototype.slice.call(arguments);
	// console.log("args:", args);
	if (err) { 
		log(err)
	}
	else {
		if (tracks.length == 1) {
		var track2 = tracks[0] 
			console.log("track2 identified:", track2.title, "\nlength of result:", tracks.length)
			var match = new TrackMatch();
			match.client_2 = track2.rbsync_client_id
			// console.log("track1 title is " + track1.title)
			match.client_1 = track1.rbsync_client_id;
			match.rbsync_id_1 = track1.id
			match.rbsync_id_2 = track2.id
			match.save(function(err) {
				if (err) {
					res.json(err);
				}
				log('trackMatch entry created!');
				// console.log(i, j);
				log(match.rbsync_id_1)
				// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
			});
		};
	}
}



var findMatchingTracksByTags = function(rbsync_client_id, track1, callback) {
	// a matching track would be one with the same 'location' attribute. However, this is unlikely to occur,
	// as it would require two client machines to have the same directory and file structure for their music library.
	// However, it might happen, as this program is meant for a single user with their libraries on multiple machines.

	// Also, there will be an attempt to strip out the non-music portion of the file's path, to make it more likely to find a match.
	if (track1.location != null && track1.location != '') {
		console.log("track1 title is " + track1.title)
		Track.
			find({'rbsync_client_id': rbsync_client_id}).
			where('title').equals(track1.title).
			// where('artist').equals(track1.artist).
			// where('album').equals(track1.album).
			exec(function(err, tracks) {
				if (err) {
					console.log("found no matches");
				}
				else {
					console.log("looking for possible matches. Number of possible matches to search is ", tracks.length)
					var possibleMatches = [];
					// var matches = null;
					tracks.forEach(function(track2) {
						// we know track1 and track2 titles match. Now check artist, album.
						// Not testing genre because there does not seem to be a very good standard for genre.
						// However, would like to add optional ones: genre, composer, track #, disc#, etc..

						// Sometimes the same track exists in multiple albums, so even using album could be undesirable for some people
						// I would rather have a separate feature that searches for the similar tracks and gives option to mark as such.
						// var match = true;
						var attrs = ['title', 'artist', 'album', 'track_number', 'disc_number']
						// console.log(track1.title, ", ", track1.artist, ", ", track1.album, ", ", track1.track_number, ", ", track1.disc_number)
						// console.log(track2.title, ", ", track1.artist, ", ", track2.album, ", ", track2.track_number, ", ", track2.disc_number)
						var match = attrs.every(function(attr) {
							// console.log(track1)
							return ( (track1[attr] == null || track2[attr] == null) ||  (track1[attr] == track2[attr]) )
							// if (track1[attr] == null || track2[attr] == null) {
							// 	console.log('returning true; One or both track attributes are null for attr ', attr)
							// 	return true;
							// }
							// else {
							// 	// console.log("I don't even seem to be getting here")
							// 	// return (track1[attr] == track2[attr])
							// 	if (track1[attr] == track2[attr]) {
							// 		console.log("returning true!");
							// 		return true;
							// 	}
							// 	else {
							// 		console.log("returning false :(");
							// 		return false;
							// 	}
							// }
						})
						// console.log("match", match);
						if (match == true) {
							possibleMatches.push(track2);
							// console.log('possibleMatches', possibleMatches);

						}

					})
					// console.log('possibleMatches', possibleMatches);
					if (possibleMatches.length == 1) {
						// match presumed to be found.
						var track2 = possibleMatches[0];
						// console.log("track2 identified:", track2.title, "\nlength of result:", possibleMatches.length)
						var trackMatch = new TrackMatch();
						trackMatch.client_2 = track2.rbsync_client_id
						// console.log("track1 title is " + track1.title)
						trackMatch.client_1 = track1.rbsync_client_id;
						trackMatch.rbsync_id_1 = track1.id
						trackMatch.rbsync_id_2 = track2.id
						trackMatch.save(function(err) {
							if (err) {
								// res.json(err);
								console.log(err);
							}
							else {
								log('trackMatch entry created!');
								// console.log(i, j);
								log(trackMatch.rbsync_id_1)
								// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
							}
						});
					}
					else {
						console.log("found no matches1")
					}
				}
			});
	}
}




var foundPossibleMatchByLocation = function(track1, err, tracks) {
	// var args = Array.prototype.slice.call(arguments);
	// console.log("args:", args);
	if (err) { 
		log(err)
	}
	else {
		if (tracks.length == 1) {
		var track2 = tracks[0] 
			console.log("track2 identified:", track2.title, "\nlength of result:", tracks.length)
			var trackMatch = new TrackMatch();
			trackMatch.client_2 = track2.rbsync_client_id
			// console.log("track1 title is " + track1.title)
			trackMatch.client_1 = track1.rbsync_client_id;
			trackMatch.rbsync_id_1 = track1.id
			trackMatch.rbsync_id_2 = track2.id
			trackMatch.save(function(err) {
				if (err) {
					res.json(err);
				}
				log('trackMatch entry created!');
				// console.log(i, j);
				log(trackMatch.rbsync_id_1)
				// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
			});
		};
	}
}



var findMatchingTracksByLocation = function(rbsync_client_id, track1, callback) {
	// a matching track would be one with the same 'location' attribute. However, this is unlikely to occur,
	// as it would require two client machines to have the same directory and file structure for their music library.
	// However, it might happen, as this program is meant for a single user with their libraries on multiple machines.

	// Also, there will be an attempt to strip out the non-music portion of the file's path, to make it more likely to find a match.
	if (track1.location != null && track1.location != '') {
		// console.log("track1 title is " + track1.title)
		Track.
			find({ 'rbsync_client_id': rbsync_client_id}).
			where('location').equals(track1.location).
			exec(callback);
	}
}





var initial_id = 1286
var testFindMatch = function(initial_id) {
	Track.findById(initial_id,  function(err, track) {
		console.log(track.title);
		// findMatchingTracksByLocation (1, track, foundPossibleMatchByLocation.bind(null, track));
		// findMatchingTracksByTags (1, track, foundPossibleMatchByTags.bind(null, track));
		findMatchingTracksByTags (2, track);
		// findMatchingTracks (1, track, f);
	});
}


var testFindExisingTrackMatch = function(initial_id) {
	Track.findById(initial_id,  function(err, track) {
		console.log(track.title);
		// findMatchingTracksByLocation (1, track, foundPossibleMatchByLocation.bind(null, track));
		// findMatchingTracksByTags (1, track, foundPossibleMatchByTags.bind(null, track));
		findExistingTrackMatch (2, track);
		// findMatchingTracks (1, track, f);
	});
}



var demo = function() {
 async.waterfall(
    [
      function (callback) {
          console.info("1");
          callback(null, 'one', 'two');
      },
    function (arg1, arg2, callback) {
        console.info("2");
        console.info(arg1 + arg2);
        // arg1 now equals 'one' and arg2 now equals 'two'
        callback(null, 'three');
    },
    function (arg1, callback) {
        console.info("3");
        console.info(arg1);
        // arg1 now equals 'three'
        callback(null, 'done');
    }
    ], function (err, result) {
        console.info("4");
        console.info(err);
        console.info(result);
    });
}






var createNewTrackLink = function(track1, track2, next) {
	// assumes already checked for existing match
		var match = new TrackMatch();
		match.client_2 = track2.rbsync_client_id
		// console.log("track1 title is " + track1.title)
		match.client_1 = track1.rbsync_client_id;
		match.rbsync_id_1 = track1.id
		match.rbsync_id_2 = track2.id
		match.save(function(err) {
			if (err) {
				console.log("error saving new trackMatch", err);
				next(err, null)
			}
			log('trackMatch entry created!');
			// console.log(i, j);
			log(match.rbsync_id_1)
			next(track1, match)
			// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
		});
}


var findMatchingTrack = function(target_client, track1, next) {
	//Look for track in target_client that matches track1. Pass both tracks (track1, matchingTrack) to next function.
	console.log("in processing function. track1.title is", track1.title)
	Track.
		find({'rbsync_client_id': target_client}).
		where('title').equals(track1.title).
		where('artist').equals(track1.artist).
		where('album').equals(track1.album).exec(function(err, potentialMatches) {
			if (potentialMatches.length == 1) {
				var matchingTrack = potentialMatches[0]
				next(null, track1, matchingTrack)
			}
		})

}

var findExistingTrackLink = function(target_client, trackResult, next) {
 	console.log("running trackMatch find. Track title is ", trackResult.title)
     TrackMatch.find({
     	'rbsync_id_1': trackResult._id , 
		'client_1': trackResult.rbsync_client_id, 
		'client_2': target_client }).exec(function (err, trackMatchResult) {
			if (trackMatchResult.length == 0) {
				// no current trackMatch entries exist. Create one.
				next(null, target_client, trackResult)
			}
			else if (trackMatchResult.length == 1) {
				// found exiting trackMatch entry. Skip to end (callback)
				console.log("found existing match entry")
				next(trackResult, trackMatchResult[0])
			}
			else {
				// More than one matching result. This is an error. Need to figure out a good way to handle
				next("More than one existing track link", null)
			}
     });	
}

var findData = function (userinfo, callback) {  
  async.waterfall([
      function(next){
      	console.log("Running track find.")
          Track.findById(userinfo.initial_id).exec(function(err, track) {
          	next(null, userinfo.target_client, track)
          });
      },
	findExistingTrackLink,
     findMatchingTrack,
	createNewTrackLink
  ], callback);
};

var f = function(data0, data1) {
	console.log("data1.client_2 is", data1);
}

var user_input = {
	'initial_id' : initial_id +6,
	'target_client': 2
}

var q = findData(user_input, f)










var findExisingTrackById = function(initial_id, socket, data, callback) {
	Track.findById(initial_id,  function(err, track) {
		console.log(track.title);
		// findMatchingTracksByLocation (1, track, foundPossibleMatchByLocation.bind(null, track));
		// findMatchingTracksByTags (1, track, foundPossibleMatchByTags.bind(null, track));
		// findExistingTrackMatch (2, track);
		// findMatchingTracks (1, track, f);
		callback(null, socket, data, {
			'track' : track,
		});
	});
}

var findExistingTrackMatch = function(socket, data, asyncObj, callback) {
	var track1 = asyncObj.track
	var q = TrackMatch.find({ 'rbsync_id_1': track1._id , 
		'client_1': track1.rbsync_client_id, 
		'client_2': 2 });
	q.exec(function(err, trackMatches) {
		if (err) {
			console.log("no trackMatches");
		}
		else {
			console.log("hey", trackMatches[0])
		}
	})
}



var blah = findMachingTrackAndCreateTrackMatch

var OldfindExistingTrackMatchOld = function(target_rbsync_client_id, track1, callback) {
	var q = TrackMatch.find({ 'rbsync_id_1': track1._id , 
		'client_1': track1.rbsync_client_id, 
		'client_2': target_rbsync_client_id });
	q.exec(function(err, trackMatches) {
		if (err) {
			console.log("no trackMatches");
		}
		else {
			console.log("hey", trackMatches[0])
		}
	})
}



var tryMe = function (var1, param1, param2) {
	log (var1)
    log (param1 + " and " + param2);
}

var callbackTester = function (callback) {
	var temp = 1
    callback(temp);
}

// callbackTester(tryMe.bind(null, "hello", "goodbye"));










app.post("/api/new_tracks/", function (req, res) {
	var new_tracks = req.body.new_tracks;
	var response_data = [];
	var numNewEntriesCounter = 0; 
	// might be able to replace part of foreach with a map function, and then only have the foreach on the track.save portion.
	console.log("client id is " , req.body.rbsync_client_id)
	var rbsync_client_id = req.body.rbsync_client_id;
	if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
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
								track.title = track.title + '1';
								// entry_to_send_back['rating'] = 4.0;
								// track.genre = track.genre + '1';
								track.bpm = track.bpm + 0.5 || 96.0;
								track.album = track.album + 'X';
								track.composer = track.composer + '!';									
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
								entry_to_send_back['title'] = track.title
								// entry_to_send_back['rating'] = 4.0
								// entry_to_send_back['genre'] = track.genre
								entry_to_send_back['bpm'] = track.bpm
								entry_to_send_back['album'] = track.album
								entry_to_send_back['composer'] = track.composer
							}
							response_data.push({'rbsync_id' : parseInt(track.id), 'entry_data' : entry_to_send_back});
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
			res.json({'changes': {}, 'message': null})
		}
	}
	else {
		res.json({'changes': {}, 'message': 'Must send valid rbsync_client_id'})
	}


});

app.get("/api/sync_up/*", function (req, res) {
	log(req.body);
	res.end("You should send a POST request, not a GET request");

});



app.get("/api/tracks/", function (req, res) {
	log('listing all tracks stored in database');
	Track.find(function(err, tracks) {
		if (err) {
			res.send(err);
		}
		res.json(tracks);
	}).sort('_id');	

});





app.get("/api/track_matches/", function (req, res) {
	log('listing all trackMatches stored in database');
	TrackMatch.find(function(err, trackMatches) {
		if (err) {
			res.send(err);
		}
		res.json(trackMatches);
	}).sort('_id');	

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

var deleteTrackMatches = function() { 
	TrackMatch.find(function(err, trackMatches) {
		if (err) {
			res.send(err);
		}
		log(trackMatches);
		trackMatches.forEach(function(trackMatch) {
			TrackMatch.remove({
				_id: trackMatch._id
			}, function(err, trackMatch1) {
				if (err) {
					log(err);
				}
				log({ message: 'Successfully deleted' });
			});
		});
	});	
}



// deleteTrackMatches()



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


// setTimeout(function() {
// 	console.log("closing server");
// 	server.close();
// }, 3000);