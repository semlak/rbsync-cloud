var mongoose = require('mongoose');

var Track = require('../models/trackModel');
var main = require("../../server.js")

var valid_client_ids = main.valid_client_ids

var commonTrackController = require('../controllers/commonTrack');

// console.log("commonTrack controller initial_id is ", commonTrackController.initial_id)


module.exports.controller = function(app) {

	// var q3 = commonTrackController.controller.addAllTracksToCommonTrackIfNotAlready()
	// var keys = Object.keys(commonTrackController.controller)
	// console.log("keys", commonTrackController.controller)

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





	// var initial_id = 1286
	var testFindMatch = function(initial_id) {
		Track.findById(initial_id,  function(err, track) {
			console.log(track.title);
			// findMatchingTracksByLocation (1, track, foundPossibleMatchByLocation.bind(null, track));
			// findMatchingTracksByTags (1, track, foundPossibleMatchByTags.bind(null, track));
			findMatchingTracksByTags (2, track);
			// findMatchingTracks (1, track, f);
		});
	}







	// not currently using but might use.
	var findMatchingTrack = function(target_client, track1, next) {
		//Look for track in target_client that matches track1. Pass both tracks (track1, matchingTrack) to next function.
		console.log("Looking for Matching Track. track1.title is", track1.title)
		Track.
			find({'rbsync_client_id': target_client}).
			where('title').equals(track1.title).
			where('artist').equals(track1.artist).
			where('album').equals(track1.album).exec(function(err, potentialMatches) {
				if (err) {
					// skip to callback
					console.log("error in search for matching track", err)
					next(err, null)
				}
				else if (potentialMatches.length == 1) {
					var matchingTrack = potentialMatches[0]
					next(null, track1, matchingTrack)
				}
				else if (potentialMatches.length == 0) {
					// there are just no matching tracks for the target_client. Really common.
					console.log("no matching tracks for ", track1.title)
					next(track1, null)
				}
			})

	}



	var findTrackLinksForAllClientTracks = function (sourceClient, targetClient, callback) {
		Track.find(function(err, tracks) {
			tracks.forEach(function(track) {
				if (track.rbsync_client_id == sourceClient) {
					findOrCreateTrackLinkGivenTrack(track, targetClient, callback)
				}
			});


		});
	};

	// var q1 = findTrackLinksForAllClientTracks(1, 2, f)



	var findExistingTrackById = function(initial_id, callback) {
		Track.findById(initial_id,  function(err, track) {
			if (err) {
				console.log("error when searching for track by id " + initial_id)
				callback(err, null)
			}
			console.log("found track titled ", track.title);
			callback(null, track);
		});
	}




	app.post("/api/new_tracks1/", function (req, res) {
		var new_tracks = req.body.new_tracks;
		var response_data = [];
		var numNewEntriesCounter = 0; 
		// might be able to replace part of foreach with a map function, and then only have the foreach on the track.save portion.
		console.log("client id is " , req.body.rbsync_client_id)
		var rbsync_client_id = req.body.rbsync_client_id;
		if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
			rbsync_client_id = req.body.rbsync_client_id;
			console.log('received request to add new tracks by client with rbsync_client_id == ' + rbsync_client_id)
			var keys = Object.keys(Track.schema.tree)
			new_tracks.forEach(function (entry, i) {
				if (!(entry['rbsync_id'])) {
					// rbsync_id not provided. this should be a new track. Really should verify it is not in database.
					// I should add a check.
					numNewEntriesCounter += 1;
					var track = new Track();
					keys.forEach(function(key) {
						if (key == 'rbsync_client_id') {
							track['rbsync_client_id'] = rbsync_client_id;
						}
						else if (key != '_id' && key != 'id' && key != 'common_track_id') {
							console.log("key is ", key, "entry's attr is ", entry[key])
							track[key] = entry[key];
						}
					});;
					// for (var key in entry) {
					// 	if (key == 'ID') {
					// 		// track['local_id'] = entry[key];
					// 		console.log('local_id');
					// 		// console.log(track.local_id);

					// 	}
					// 	else {
					// 		track[key] = entry[key];
					// 	}
					// };

					// track['rbsync_client_id'] = rbsync_client_id;
					track.save(function(err) {
						if (err) {
							res.json(err);
						}
						console.log('track entry created!');
						// console.log(i, j);
						// here, id is the primary key for the track in its client rbsync db, called local_id in the cloud
						var entry_to_send_back = {'id': entry['ID'], 'rbsync_id' : parseInt(track._id)};
						response_data.push(entry_to_send_back);
						console.log(entry_to_send_back);
						if (response_data.length == new_tracks.length ) {
							var response = {'changes': response_data, 'message': null}
							console.log('sending response', response)
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



	app.post("/api/sync_up1/", function (req, res) {
		var changes = req.body.changes;
		var response_data = [];
		var numNewEntries = 0;
		var rbsync_client_id = req.body.rbsync_client_id;
		if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
			// rbsync_client_id = req.body.rbsync_client_id;
			console.log('received request to update tracks by client with rbsync_client_id == ' + rbsync_client_id)
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
								if (key != 'rbsync_id' && entry[key] != track[key]) {
									track[key] = entry[key];
									console.log("changing entry " + key + " to " + track[key] +  " for " + track.title + "(_id " + track._id + ")")
									// track.title = track.title + '1';
									// entry_to_send_back['rating'] = 4.0;
									// track.genre = track.genre + '1';
									// track.bpm = track.bpm + 0.5 || 96.0;
									// track.album = track.album + 'X';
									// track.composer = track.composer + '!';									
								}															
							}
							track.save(function(err) {
								if (err) {
									res.json(err);
								}
								console.log('track entry updated!');
								var entry_to_send_back = {'rbsync_id' : parseInt(track.id)};
								// now, look for changes to send back. Probably need helper function.
								// if (entry_to_send_back['rbsync_id'] == 1212) {
								// 	entry_to_send_back['title'] = track.title
								// 	// entry_to_send_back['rating'] = 4.0
								// 	// entry_to_send_back['genre'] = track.genre
								// 	entry_to_send_back['bpm'] = track.bpm
								// 	entry_to_send_back['album'] = track.album
								// 	entry_to_send_back['composer'] = track.composer
								// }
								response_data.push({'rbsync_id' : parseInt(track.id), 'entry_data' : entry_to_send_back});
								console.log(entry_to_send_back);
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
		console.log(req.body);
		res.end("You should send a POST request, not a GET request");

	});



	app.get("/api/tracks/", function (req, res) {
		console.log('listing all tracks stored in database');
		Track.find(function(err, tracks) {
			// console.log(module.exports.controller)
			if (err) {
				res.send(err);
			}
			res.json(tracks);
		}).sort('_id');	

	});




}


