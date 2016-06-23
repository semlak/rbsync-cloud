var mongoose = require('mongoose');

var CommonTrack = require('../models/commonTrackModel');
var async = require('async');
var log = console.log

var Track = require('../models/trackModel');
// var Track = module.exports.Track;
// console.log("Track", Track)
// var Track = require('../controllers/track.js');

var main = require("../../server.js")
var valid_client_ids = main.valid_client_ids
var attributes_to_track_all = main.attributes_to_track_all
var attributes_to_track_with_ch_time = main.attributes_to_track_with_ch_time

var query_attrs = ['title', 'artist', 'album', 'track_number', 'disc_number']



var getTime = function() {
	var date = Math.floor(new Date().valueOf()/1000);
	return date;

}


function JSONstringify(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, '\t');
    }

    var 
        arr = [],
        _string = 'color:green',
        _number = 'color:darkorange',
        _boolean = 'color:blue',
        _null = 'color:magenta',
        _key = 'color:red';

    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var style = _number;
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                style = _key;
            } else {
                style = _string;
            }
        } else if (/true|false/.test(match)) {
            style = _boolean;
        } else if (/null/.test(match)) {
            style = _null;
        }
        arr.push(style);
        arr.push('');
        return '%c' + match + '%c';
    });

    arr.unshift(json);

    console.log.apply(console, arr);
}


module.exports.controller = function(app) {

	var createNewCommonTrack = function(track, next) {
		// assumes already checked for existing commonTrack
		// This creates a common track with a single trackid linked to it.
		// Other trackids from other clients can be added (handled separately)
		// Only the track_id and client_id are added to the commonTrack entry, and the callback will update the other attributes

		var commonTrack = new CommonTrack();
		// CommonTrack.schema.tree.forEach(function(key, value) {})

		commonTrack.track_ids.push(track._id);
		commonTrack.client_ids.push(track.rbsync_client_id);
		// console.log(commonTrack)
		// console.log('attributes_to_track_all', attributes_to_track_all)
		// console.log('query_attrs', query_attrs)
		attributes_to_track_all.forEach(key => commonTrack[key] = track[key])

		commonTrack.save(function(err) {
			if (err) {
				console.log ("Error saving common track for track title \"" + track.title + "\"", err);
				next(err, track, null);
			}
			else {
				console.log("Successfully created commonTrack for track title \"" + track.title  + "\" (_id " + track._id + ")");
				// skip to end. Callback at end potentially adds track data to commonTrack entry
				track.common_track_id = commonTrack._id
				track.save(function(err) {
					if (err) {
						next(err)
					}
					else {
						next("no error", track, commonTrack);
					}
				})
			}
		})
	}

	var findExistingAssociatedWithTrack = function(track, next) {
	 	// console.log("running commonTrack.find. Track title is \"" + track.title + "\"")
	 	// this function checks if the track is already linked to a commonTrack. It should be linked unless the track is just added.
	     if (track.common_track_id != null ) {
	     	CommonTrack.findById(track.common_track_id).exec(function(err, commonTrackEntry) {
				if (err) {
					console.log("error querying for commonTrack with id " + track.common_track_id + " and track title " + track.title);
					next(err, track, null);
				}
				else {
					// found commonTrack entry.
					// console.log("hey!!!")
					next("no error", track, commonTrackEntry);
				}
	     	})
	     }
	     else {
	     	// track should have just been added if it got to this point. Passing to the next function (createNewCommonTrack), which should create a new commonTrack entry.
	     	next(null, track)
	     	// console.log("shouldn't see this error!!!!")
	     	// next("error. Shouldn't see this error", null, null)
	     }
	 //     else {
		//      CommonTrack.find({track_ids : track._id }).exec(function (err, commonTrackResults) {
		// 		if (err) {
		// 			console.log("error querying for commonTrack with track " + track.title)
		// 			next(err, track, null)
		// 		}
		// 		else if (commonTrackResults.length == 0) {
		// 			// no current commonTrack entries exist with this track_id. However, there may be an existing entry to add to from another client. Check
		// 			next(null, track)
		// 			// next(track, "error")
		// 		}
		// 		else if (commonTrackResults.length == 1) {
		// 			// found existing commonTrack entry. Skip to end (callback)
		// 			console.log("!!found existing commonTrack entry that already contains track")
		// 			if (track.common_track_id == null) {
		// 				commonTrack = commonTrackResults[0]
		// 				track.common_track_id = commonTrack._id
		// 				track.save(function(err) {
		// 					if (err) {
		// 						console.log("error saving commontrack id to track.", "err was ", err)
		// 						next(err)
		// 					}
		// 					else {
		// 						console.log("saving commontrack id to track. no error")
		// 						commonTrack.track_ids.push(track._id)
		// 						commonTrack.client_ids.push(track.rbsync_client_id)
		// 						commonTrack.save(function(err) {
		// 							if (err) {
		// 								console.log("error saving commontrack id to track.", "err was ", err)
		// 								next(err)
		// 							}
		// 							else {
		// 								console.log("commonTrack._id", commonTrack._id, "entry updated with track._id", track._id)
		// 								next("no error", track, commonTrack)
		// 							}
		// 						})

		// 					}

		// 				})
		// 			}
		// 			// next("no error", track, commonTrackResults[0])
		// 		}
		// 		else {
		// 			// More than one matching result. This is an error. Hopefully I have programmed to avoid this, but need to figure out a good way to handle
		// 			// skip to end (callback) with an error message
		// 			next("Error: More than one existing commonTrack", track, null)
		// 		}
		//      });
		// }

	}


	var findExistingCommonTrackToAddTo = function(track, next) {
		// assumes already have checked for existing commonTrack already linked to input track.
		// Looking for commonTrack entry whose attributes (artist, title, album, track_number, disc_number) match.
		// Would like to customize parameters that are matched, but right now, don't.
	 	// console.log("running commonTrack.find, looking for commonTrack to add to. Track title is \"" + track.title + "\"")

	 	console.log("Looking for existing commonTrack entry to add ", track.title, "rbsync_id", track._id)
		var queryObj = {};
		query_attrs.forEach(function(key) {
			queryObj[key] = track[key]
		});
		console.log("queryObj is ", queryObj);
		CommonTrack.find(queryObj).exec(function(err, commonTrackResults) {
			console.log("search results in findExistingCommonTrackToAddTo1, length", commonTrackResults.length, commonTrackResults)
			if (commonTrackResults.length == 0) {
				// no current commonTrack entries exist that resemble this track. Create One (next function)
				next(null, track)
			}
			else if (commonTrackResults.length == 1) {
				// found existing commonTrack entry. Need to add to it, which will be handled by callback (if desired). Skip to end.
				console.log("!!!!!!found existing commonTrack entry to add track to for track title ", track.title, "track._id", track._id, "commonTrack._id", commonTrackResults[0]._id)
				// console.log("!!!!found existing commonTrack entry to add track to")
				var commonTrackEntry = commonTrackResults[0];
				if (commonTrackEntry.title != track.title) {
					var err = "error. titles for commonTrack and track do not match"
					console.log(err, track, commonTrack)
					next(err)
				}
				else if (commonTrackEntry.track_ids.indexOf(track._id) < 0) {
					console.log("Adding track ", track._id, " to existing CommonTrack ", commonTrackEntry._id)
					commonTrackEntry.track_ids.push(track._id);
					commonTrackEntry.client_ids.push(track.rbsync_client_id);
					commonTrackEntry.save(function(err) {
						if (err) {
							next(err)
						}
						else {
							console.log("saved commonTrackEntry successfully, commonTrackEntry._id", commonTrackEntry._id)
							console.log("updating track._id", track._id," with common_track_id")
							track.common_track_id = commonTrackEntry._id;
							track.save(function(err) {
								if (err) {
									next(err)
								}
								else {
									console.log("common_track_id for track._id", track._id , " updated successfully with to ", track.common_track_id)
									next("no error", track, commonTrackEntry);
								}
							})
						}
					});
				}
				else {
					var err = "some sort of error. The commonTrack entry should not have already had the track id associated with it";
					console.log(err)
					next(err, track, commonTrackEntry)
				}
			}
			else {
				// More than one matching result. This is an error. Hopefully I have programmed to avoid this, but need to figure out a good way to handle
				// If user sets the search parameters above too stricly, creates commonTrack entries, and then losens the parameters, this could be encountered
				// skip to end (callback) with an error message
				next("Error: More than one existing commonTrack", track, null)
			}
		});
	}

	var updateCommonTrack = function(err, track, commonTrack, callback) {
	 	// console.log("Adding to existing commonTrack entry. Track title is \"" + track.title + "\"");
		// commonTrack.track_ids.push(track._id);
		// commonTrack.client_ids.push(track.rbsync_client_id);
		console.log("in updateCommonTrack for track ", track._id, ", title", track.title, ", commonTrack id", commonTrack._id)
		if (commonTrack.title != track.title) {
			var err = "error. titles for commonTrack and track do not match"
			console.log(err, track, commonTrack)
			callback(err)
		}
		else {
			var changesMade = false;
			// if (track.sync_time > commonTrack.sync_time) {
			console.log("Track update time appears newer than commonTrack, title:", track.title, ",id:", track._id)
			attributes_to_track_with_ch_time.forEach(function(ch_time_key) {
				// if (commonTrack[ch_time_key] == null || track[ch_time_key] > commonTrack[ch_time_key] ) {

				if (track[ch_time_key] > commonTrack[ch_time_key] || (commonTrack[ch_time_key] == null && track[ch_time_key] != null ) ) {
				// if (track[ch_time_key] > commonTrack[ch_time_key] ) {
					var key = ch_time_key.substr(0, ch_time_key.length - 8)
					// console.log("key is ", key);
					if (key != "play_count") {
						commonTrack[key] = track[key];
						commonTrack[ch_time_key] = track[ch_time_key]
						changesMade = true;
					}
					else {
						// key is play_count. We want to add the change in the track's play_count from its old_play_count to the commonTrack playCount
						var delta = track.play_count - track.old_play_count;
						if (delta > 0) {
							commonTrack.play_count += delta;
							changesMade = true;
						}
					}
				}
			});
			if (changesMade) {
			 	console.log("Adding to existing commonTrack entry. Track title is \"" + track.title + "\"");
				// var track_ch_times = attributes_to_track_with_ch_time.map(function(key) {
				// 	return commonTrack[key] || 0;
				// })
				var track_ch_times = attributes_to_track_with_ch_time.map(key => commonTrack[key] || 0);
				// use the latest attr_ch_time value for the sync_time
				// this isn't necessarily or even likely to be the time the that the track was synced, just when user updated track on client
				// commonTrack.sync_time = Math.max(...track_ch_times);
				commonTrack.sync_time = getTime();
				commonTrack.save(function(err) {
					if (err) {
						console.log ("Error saving common track for track title \"" + track.title + "\"", err);
						// callback(err);
						// next(err, commonTrack);
					}
					else {
						console.log("Successfully added to commonTrack for track title \"" + track.title  + "\" (_id " + track._id + ")");
						// callback(err);
						// next(track, commonTrack);
					}
					console.log("\calling callback")
					callback(err);

					// if (err == null && callback != null) {
						// callback();
					// }				
				});
			}
			else {
				console.log("no changes made for commonTrack with title", commonTrack.title, ", id", commonTrack._id, "\calling callback")
				callback();
			}
		// }
		// else {
		// 	console.log("no changes made for commonTrack with title", commonTrack.title, ", id", commonTrack._id)
		// 	callback();				
		// }
		}
	}







	var createOrFindCommonTrackFromTrack = function(track, callback) {
		// callback should take three parameters: err, track, and commonTrack
	  async.waterfall([
	      function(next){
     		// console.log("track title is ", track.title)
     		next(null, track)
	      },
		findExistingAssociatedWithTrack,
	  	findExistingCommonTrackToAddTo,
		createNewCommonTrack
	  ], callback);
	}


	var addTrackToExistingCommonTrackOrCreate = function(track, callback) {
		var cb = function(err, track, commonTrack) {
			if (err && err != "no error") {
				callback(err)
			}
			else {
				updateCommonTrack(null, track, commonTrack, callback)
				// callback()
			}
		}
		createOrFindCommonTrackFromTrack(track, cb)
	}


	var updateCommonTrackWithEachMemberTrack = function(commonTrack, callback) {
		console.log("In updateCommonTrackWithEachMemberTrack for commonTrack ", commonTrack._id, ", title:" , commonTrack.title)
		async.each(
			commonTrack.track_ids, 
			function(track_id, asyncCallback) {
		          Track.findById(track_id).exec(function(err, track) {
		          	if (err || track == null) {
		          		console.log("error finding track by ID", track_id, err)
		          		asyncCallback(err || "error finding track by ID");
		          	}
		          	else {
		          		// console.log("track title is ", track.title, 'commonTrack ID is ', commonTrack._id)
		          		updateCommonTrack(null, track, commonTrack, asyncCallback)
		          	}
		          });
			},
			function(err) {
				console.log("finished with updateCommonTrackWithEachMemberTrack async part. Calling callback.")
				callback(err);
			}
		);
	};


	var updateAllCommonTrackEntriesForClient = function(client_id, callback) {
		console.log("In updateAllCommonTrackEntriesForClient for client_id number ", client_id)
		CommonTrack.find({client_ids : client_id} ,function(err, commonTracks) {
			if (err == null) {
				console.log("Updating commonTracks for rbsync_client_id", client_id, ", number of commonTracks: ", commonTracks.length)
				async.each(
					commonTracks,
					function(commonTrackEntry, asyncCallback) {
						updateCommonTrackWithEachMemberTrack(commonTrackEntry, asyncCallback);
					},
					function(err) {
						console.log("finished with updateAllCommonTrackEntriesForClient. Calling callback")
						callback(err)
					}
				);
			}
		});
	};


	var updateTrackWithRBSyncEntryInfo = function(entry, response_data, callback) {
		Track.findById(entry.rbsync_id, function(err, track) {
			if (err) {
				// res.send(err);
			}
			else {
				var changesMade = false
				for (var key in entry) {
					// should verify that this is correct client id
					// here, rbsync_id from the client is the is the primary key for the track on the server
					if (key != 'rbsync_id' && attributes_to_track_all.indexOf(key) >=0 && entry[key] != track[key]) {
						track[key] = entry[key];
						console.log("changing entry " + key + " to " + track[key] +  " for \"" + track.title + "\" (_id " + track._id + ")")
						changesMade = true;
					}															
				}
				if (changesMade) {
					// track.sync_time = getTime()
					track.save(function(err) {
						if (err) {
							// res.json(err);
						}
						else {
						console.log('track entry updated! The track._id was', track._id, ', title was ', track.title);
						// var entry_to_send_back = {'rbsync_id' : parseInt(track._id)};
						// response_data[track._id] = entry_to_send_back
						response_data[parseInt(track._id)] = {'sync_time' : getTime()};
						// entryChangeData['sync_time'] = getTime();

						// response_data.push({'rbsync_id' : parseInt(track._id), 'entry_data' : entry_to_send_back});
						// console.log(entry_to_send_back);
						//signal to async.each that this iteration is done
						callback();
						}
					});					
				}
				else	{
					// no changes made. Might have been a key that is configured to be ignored.
					console.log('updateTrackWithRBSyncEntryInfo was run, but no changes were made to track')
					callback();
				}

			}
		});
	}

	var getUpdatesForTrack = function(track, response_data, callback) {
		var cb = function(err, track, commonTrack) {
			var foundChanges = false;
			entryChangeData = {}
			attributes_to_track_with_ch_time.forEach(function(ch_time_key) {
				// console.log("checking key ", ch_time_key, "for title", track.title)
				// if (commonTrack[ch_time_key] == null || track[ch_time_key] > commonTrack[ch_time_key] ) {
				if (track[ch_time_key] < commonTrack[ch_time_key] || (track[ch_time_key] == null && commonTrack[ch_time_key] != null ) ) {
				// if (track[ch_time_key] > commonTrack[ch_time_key] ) {
					var key = ch_time_key.substr(0, ch_time_key.length - 8)
					// console.log("key is ",	 key);
					// track[key] = commonTrack[key];
					// console.log("changing")
					entryChangeData[key] = commonTrack[key]
					// track[ch_time_key] = commonTrack[ch_time_key]
					foundChanges = true;
				}
			});
			if (foundChanges) {
				entryChangeData['sync_time'] = getTime();
				entryChangeData.rbsync_id = parseInt(track._id)
				response_data[track._id] = entryChangeData
				// changeData.push({'rbsync_id' : parseInt(track._id), 'entry_data' : entryChangeData})
				console.log("entryChanges to track title ", track.title, "entryChangeData: " , entryChangeData);
			}
		}
		CommonTrack.findById(track.common_track_id, function(err, commonTrackEntry) {
			console.log("commonTrackEntry is ", commonTrackEntry)
			cb(err, track, commonTrackEntry);
			callback(err)
		})

	};



	var getAllNewChangesForClient1 = function(client_id, response_data, callback) {
		// this first updates all the commonTracks, then gets any new changes to send back to client.
		console.log("updating and then getting all additional track changes for client ", client_id)
		var cb = function(err) {
			console.log("In little callback ('cb'), getting all additional track changes for client ", client_id)
			Track.find({rbsync_client_id : client_id}).exec(function(err, tracks) {
				async.each(tracks, 
					function(track, asyncCallback) {
						console.log("in async.each. track title is ", track.title);
						createOrFindCommonTrackFromTrack(track, function(err, track, commonTrack) {
							getUpdatesForTrack(track, response_data, asyncCallback);
						});
					},
					function(err1) {
						console.log("Done with async forEach part of little cb. changes for client:", client_id, response_data)
						var response = {'changes': response_data, 'message': null}
						console.log('sending response', response)					
						callback(response)
						// console.log("hey, err is ", err);
					}
				);
			});
		}
		updateAllCommonTrackEntriesForClient(client_id, cb)
	};



	var getAllNewChangesForClient = function(client_id, response_data, callback) {
		console.log("getting all additional track changes for client ", client_id)
		Track.find({rbsync_client_id : client_id}).exec(function(err, tracks) {
			async.each(tracks, 
				function(track, asyncCallback) {
					// console.log("in async.each. track title is ", track.title);
					createOrFindCommonTrackFromTrack(track, function(err, track, commonTrack) {
						getUpdatesForTrack(track, response_data, asyncCallback);
					});
				},
				function(err) {
					// console.log("changes for client", client_id, response_data)
					var response = {'changes': response_data, 'message': null}
					console.log('sending response', response)					
					callback(response)
					// console.log("hey, err is ", err);
				}
			);
		});
	};

	var saveRBSyncEntryAsNewTrack = function(entry, rbsync_client_id, response_data, callback) {
		// assumes rbsync_client_id verified.
		// assumes entries are unique tracks
		// assumes that entries represent tracks that have not already been entered

		// these assumptions are mostly straight forward. Even if another client connects, these are not violated.
		// However, createOrFindCommonTrackFromTrack is called in this chain. If another client is entering a new track matching one for this client
		// simultaneously, createOrFindCommonTrackFromTrack might create separate common tracks for those two tracks. 

		if (!(entry['rbsync_id'])) {
			// rbsync_id not provided. this should be a new track. Really should verify it is not in database.
			// numNewEntriesCounter += 1;
			var track = new Track();
			Object.keys(Track.schema.tree).forEach(function(key) {
				if (key == 'rbsync_client_id') {
					track['rbsync_client_id'] = rbsync_client_id;
				}
				else if (key != '_id' && key != 'id' && key != 'common_track_id') {
					// console.log("key is ", key, "entry's attr is ", entry[key])
					track[key] = entry[key];
				}
			});;
			track.save(function(err) {
				if (err) {
					// res.json(err);
					callback(err)
				}
				else {
					// here, the track._id in the cloud is the rbsync_id in the client rbsync database
					console.log('track entry created! Title is ', track.title, "id is " , track._id);
					// here, 'ID' is the primary key for the track in its client rbsync db, but is not even stored on the server database.
					// It is just sent back to the client so that the client can efficiently assign the correct track its corresponding rbsync_id.
					var entry_to_send_back = {'id': entry['ID'], 'rbsync_id' : parseInt(track._id), 'sync_time' : getTime()};
					// console.log("response_data is", response_data )
					response_data.push(entry_to_send_back);
					console.log(entry_to_send_back);
					// callback();
					// createOrFindCommonTrackFromTrack1(track, callback)
					addTrackToExistingCommonTrackOrCreate(track, callback)
				}
			});
		}
	};



	app.post("/api/new_tracks/", function (req, res) {
		var new_tracks = req.body.new_tracks;
		var response_data = [];
		var numNewEntriesCounter = 0; 
		// might be able to replace part of foreach with a map function, and then only have the foreach on the track.save portion.
		console.log("client id is " , req.body.rbsync_client_id)
		var rbsync_client_id = req.body.rbsync_client_id;
		if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
			rbsync_client_id = req.body.rbsync_client_id;
			console.log('received request to add new tracks by client with rbsync_client_id == ' + rbsync_client_id)
			// var keys = Object.keys(Track.schema.tree)

			async.each(new_tracks, function(entry, asyncCallback) {
				saveRBSyncEntryAsNewTrack(entry, rbsync_client_id, response_data, asyncCallback)
			}, 
			function(err) {
				if (err) {
					res.json(err);
				}
				else if (response_data.length == 0) {
					res.json({'changes': null, 'message': 'No new tracks entered'})
				}
				else {
					var response = {'changes': response_data, 'message': null}
					console.log('sending response', response)
					res.json(response);					
				}
			});
		}
		else {
			var response = {'changes': null, 'message': 'Must send valid rbsync_client_id'}
			console.log("Sending respondse:", response);
			res.json(response);
		}
	});


	app.post("/api/confirm_track_updates/", function(req, res) {
		var changes = req.body.changes;
		var response_data = {};
		var numNewEntries = 0;
		var rbsync_client_id = req.body.rbsync_client_id;
		if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
			// rbsync_client_id = req.body.rbsync_client_id;
			console.log('received request to confirm track updates by client with rbsync_client_id == ' + rbsync_client_id)
			async.each(changes,
				// changes are the items async.each iterates over

				// async.each iteratoes over the following function. asyncCallback signals back to async.each when the particular iteration is done
				function (change, asyncCallback) {
					updateTrackWithRBSyncEntryInfo(change, response_data, asyncCallback);
				},

				// this last part gets called by async.each after all iterations are done
				function(err) {
					if (err) {
						console.log("resonding with err", err)
						res.json(err);
					}
					else {
						var cb = function(data) {
							console.log("responding in callback with data:", data)
							res.json(data)
						}
						console.log("Sending confirmation message that changes were confirmed")
						res.json({'changes': {}, 'message': 'Changes confirmed'})
					}
				}
			);
		}
		else {
			var response = {'changes': null, 'message': 'Must send valid rbsync_client_id'}
			console.log("Sending respondse:", response);
			res.json(response);			
			// res.json({'changes': {}, 'message': 'Must send valid rbsync_client_id'})
		}
	});


	app.post("/api/sync_up/", function (req, res) {
		var changes = req.body.changes;
		var response_data = {};
		var numNewEntries = 0;
		var rbsync_client_id = req.body.rbsync_client_id;
		if (rbsync_client_id != null && valid_client_ids.indexOf(rbsync_client_id) >= 0) {
			// rbsync_client_id = req.body.rbsync_client_id;
			console.log('received request to sync tracks from client ' + rbsync_client_id)
			async.each(changes,
				// changes are the items async.each iterates over

				// async.each iteratoes over the following function. asyncCallback signals back to async.each when the particular iteration is done
				function (change, asyncCallback) {
					updateTrackWithRBSyncEntryInfo(change, response_data, asyncCallback);
				},

				// this last part gets called by async.each after all iterations are done
				function(err) {
					if (err) {
						console.log("responding with error", err)
						res.json(err);
					}
					else {
						var cb = function(data) {
							console.log("responding in callback with data:", data)
							res.json(data)
						}	
						getAllNewChangesForClient1(rbsync_client_id, response_data, cb)
						// updateAllCommonTrackEntriesForClient(rbsync_client_id, 
							// getAllNewChangesForClient(rbsync_client_id, response_data, cb))
						// var response = {'changes': response_data, 'message': null}
						// console.log('sending response', response)
						// res.json(response);		
					}
				}
				// console.log("rd.length", response_data.length, "changes.length", changes.length)
		
			);
			// if (numNewEntries == 0) {
			// 	res.json({'changes': {}, 'message': null})
			// }
		}
		else {
			var response = {'changes': null, 'message': 'Must send valid rbsync_client_id'}
			console.log("Sending respondse:", response);
			res.json(response);			
			// res.json({'changes': {}, 'message': 'Must send valid rbsync_client_id'})
		}


	});



	app.get("/api/common_tracks/", function (req, res) {
		log('listing all commonTracks stored in database');
		CommonTrack.find(function(err, commonTracks) {
			if (err) {
				res.send(err);
			}
			res.json(commonTracks);
		}).sort('sync_time');

	});

	app.get("/api/delete_all_data/", function(req, res) {
		// this is only for testing. It is convenient to quickly delete the database
		log('deleting all data from database');
		// deleteAllDatabaseData1(res.json)
		deleteAllDatabaseData1((status, ojb) => res.json(status))

		// res.status(status).json(obj)

	})


	var deleteTracks = function() { 
		Track.find(function(err, tracks) {
			if (err) {
				res.send(err);
			}
			console.log(tracks);
			tracks.forEach(function(track) {
				Track.remove({
					_id: track._id
				}, function(err, track1) {
					if (err) {
						console.log(err);
					}
					console.log({ message: 'Successfully deleted' });
				});
			});
		}).sort('_id');	
	}

	// deleteTracks()

	var deleteCommonTracks = function() {
		CommonTrack.find(function(err, commonTracks) {
			if (err) {
				res.send(err);
			}
			log(commonTracks);
			commonTracks.forEach(function(commonTrack) {
				CommonTrack.remove({
					_id: commonTrack._id
				}, function(err, commonTrack1) {
					if (err) {
						log(err);
					}
					log({ message: 'Successfully deleted' });
				});
			});
		});

		// also delete common_track_id values from Tracks.
		Track.find(function(err, tracks) {
			tracks.forEach (function(track) {
				if (track.common_track_id != null) {
					track.common_track_id = null;
					track.save(function(err) {
						if (err) {
							console.log("error removing common_track_id from track ", track.title, track, err);
						}
					});
				}
			});
		})
	}


	// deleteCommonTracks()

	var deleteAllDatabaseData = function(callback) {

		CommonTrack.find(function(err, commonTracks) {
			if (err) {
				res.send(err);
			}
			commonTracks.forEach(function(commonTrack) {
				CommonTrack.remove({
					_id: commonTrack._id
				}, function(err, commonTrack1) {
					if (err) {
						log(err);
					}
					log({ message: 'Successfully deleted CommonTrack' });
				});
			});
		});
		Track.find(function(err, tracks) {
			if (err) {
				res.send(err);
			}
			tracks.forEach(function(track) {
				Track.remove({
					_id: track._id
				}, function(err, track1) {
					if (err) {
						console.log(err);
					}
					console.log({ message: 'Successfully deleted track' });
				});
			});
		});	
	};

	var deleteAllDatabaseData1 = function(callback) {
		var objects = [Track, CommonTrack];
		async.each(
			objects,
			function(object, asyncCallback1) {
				object.find(function(err, items) {
					if (err) {
						asyncCallback1(err)
					}
					else {
						async.each(
							items, 
							function(item, asyncCallback2) {
								object.remove({
									_id: item._id
								}, function(err, item1) {
									if (err) {
										log(err);
										asyncCallback2(err)
									}
									else {
										log({ message: 'Successfully deleted object of type'  + object.modelName});
										asyncCallback2(err)
									}

								});							
							},
							function(err) {
								asyncCallback1(err)
							}
						);
					}
				});
			},
			function(err) {
				if (callback != null) {
					if (err) {
						callback(err)
					}
					else {
						callback(["succesfully deleted data in objects: ", objects.map(o =>o.modelName).join(', ')].join(""))
					}
				}
			}
		);
	}
		

	var deleteTracksByClient = function(client_id) {
		Track.find({rbsync_client_id : client_id}, function(err, tracks) {
			if (err) {
				res.send(err);
			}
			tracks.forEach(function(track) {
				if (track.common_track_id != null) {
					track_id = track._id
					common_track_id = track.common_track_id
					// it shouldn't be null, but could have been maually deleted.
					CommonTrack.findById(common_track_id, function(err, commonTrack) {
						if (commonTrack.client_ids.length == 1) {
							CommonTrack.remove({
								_id: commonTrack._id
							}, function(err, commonTrack1) {
								if (err) {
									log(err);
								}
								log({ message: 'Successfully deleted CommonTrack' });
							});					
						}
						else {
							console.log("modifying commonTrack with id ", commonTrack._id, "before", commonTrack)
							CommonTrack.client_ids = CommonTrack.client_ids.filter( e => e != client_id)
							CommonTrack.track_ids = CommonTrack.track_ids.filter( e => e != track_id)
							commonTrack.save(function(err) {
								if (err) {
									console.log("error updating commonTrack", commonTrack, err);
								}
								else {
									console.log("updated commonTrack. updated version: ", commonTrack)
								}
							});
						}
					});
				}
				Track.remove({
					_id: track._id
				}, function(err, track1) {
					if (err) {
						console.log(err);
					}
					console.log({ message: 'Successfully deleted track' });
				});
			});
		});
	};

	// deleteTracksByClient(2)
	// deleteAllDatabaseData();
	// deleteAllDatabaseData1(console.log)


	// var q3 = addAllTracksToCommonTrackIfNotAlready(f1)
	// var q31 = addAllTracksToCommonTrackIfNotAlreadyByClientId(2, f1);
	// var q4 = updateAllCommonTrackEntries();


	var f5 = function(changeData) {
		console.log("in callback function")
		console.log(changeData);
	}

	// var q4 = updateAllCommonTrackEntries(f5);

	// var q5 = getAllNewChangesForClient(1, [], f5);

	// console.log(getTime());
};