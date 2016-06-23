

	var addAllTracksToCommonTrackIfNotAlreadyByClientId = function(client_id, callback) {
		Track.find({rbsync_client_id : client_id},function(err, tracks) {
			if (err == null) {
				tracks.forEach(function(track) {
					createOrFindCommonTrackFromTrack(track, callback);
				});
			}

		});
	};




	var addAllTracksToCommonTrackIfNotAlready = function(callback) {
		Track.find(function(err, tracks) {
			if (err == null) {
				tracks.forEach(function(track) {
					createOrFindCommonTrackFromTrack(track, callback);
				});
			}

		});
	};



	var createOrFindCommonTrackFromTrackId = function(initial_id, callback) {
	  async.waterfall([
	      function(next){
	      	console.log("Running track find.")
	      	// Track.findExistingTrackById(initial_id, next)
	          Track.findById(initial_id).exec(function(err, track) {
	          	if (err) {
	          		console.log("error finding track by ID", initial_id, err)
	          		next(err, null, null)
	          	}
	          	else if (track == null) {
	          		console.log("error finding track by ID", initial_id, err)
	          		next ("error", null, null)
	          	}
	          	else {
	          		// console.log("track title is ", track.title)
	          		next(null, track)
	          	}
	          });
	      },
		findExistingAssociatedWithTrack,
	  	findExistingCommonTrackToAddTo,
		createNewCommonTrack
	  ], callback);
	}





	var createOrFindCommonTrackFromTrack1 = function(track, callback) {
	  async.waterfall([
	      function(next){
     		// console.log("track title is ", track.title)
     		next(null, track)
	      },
		findExistingAssociatedWithTrack1,
	  	findExistingCommonTrackToAddTo1,
		createNewCommonTrack1
	  ], callback);
	}




	var createNewCommonTrack1 = function(track, next) {
		// assumes already checked for existing commonTrack
		// This creates a common track with a single trackid linked to it.
		// Other trackids from other clients can be added (handled separately)
		// Only the track_id and client_id are added to the commonTrack entry, and the callback will update the other attributes

		var commonTrack = new CommonTrack();
		// CommonTrack.schema.tree.forEach(function(key, value) {})
		console.log("track is:", track)
		console.log("track._id", track._id, "track.id", track.id)
		commonTrack.track_ids.push(parseInt(track._id));
		commonTrack.client_ids.push(parseInt(track.rbsync_client_id));
		// console.log(commonTrack)
		commonTrack.save(function(err) {
			if (err) {
				console.log ("Error saving common track for track title \"" + track.title + "\"", err);
				next(err, track, null);
			}
			else {
				console.log("Successfully created commonTrack for track title \"" + track.title  + "\" (_id " + track._id + ")");
				// skip to end. Callback at end potentially adds track data to commonTrack entry
				next();
			}
		})
	}


	var findExistingCommonTrackToAddTo1 = function(track, next) {
		// assumes already have checked for existing commonTrack already linked to input track.
		// Looking for commonTrack entry whose attributes (artist, title, album, track_number, disc_number) match.
		// Would like to customize parameters that are matched, but right now, don't.
	 	// console.log("running commonTrack.find, looking for commonTrack to add to. Track title is \"" + track.title + "\"")

	 	console.log("Looking for existing commonTrack entry to add ", track.title, "track._id", track._id)
		var query_attrs = ['title', 'artist', 'album', 'track_number', 'disc_number']
		var queryObj = {};
		query_attrs.forEach(function(key) {
			queryObj[key] = track[key]
		});
		// console.log("queryObj is ", queryObj);
		CommonTrack.find(queryObj).exec(function(err, commonTrackResults) {
			console.log("search results in findExistingCommonTrackToAddTo1, length", commonTrackResults.length, commonTrackResults)
			if (commonTrackResults.length == 0) {
				console.log("no commonTrack entry found matching track title", track.title)
				// no current commonTrack entries exist that resemble this track. Create One (next function)
				next(null, track)
			}
			else if (commonTrackResults.length == 1) {
				// found existing commonTrack entry. Need to add to it, which will be handled by callback (if desired). Skip to end.
				console.log("!!!!found existing commonTrack entry to add track to for track title ", track.title)
				var commonTrackEntry = commonTrackResults[0];
				if (commonTrackEntry.track_ids.indexOf(parseInt(track._id)) < 0) {
					commonTrackEntry.track_ids.push(track._id);
					commonTrackEntry.client_ids.push(track.rbsync_client_id);
					commonTrackEntry.save(function(err) {
						if (err) {
							next(err)
						}
						else {
							console.log("saving track._id " + track._id + " to commonTrackEntry id ", commonTrackEntry._id)
							track.common_track_id = commonTrackEntry._id
							track.save(function(err) {
								if (err) {
									next(err);
								}
								else {
								next(false)
								}
							})
						}
					})
				}
				else {
					var err = "some sort of error. The commonTrack entry should not have already had this track id associated with it";
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


	var findExistingAssociatedWithTrack1 = function(track, next) {
	 	// console.log("running commonTrack.find. Track title is \"" + track.title + "\"")
	     if (track.common_track_id != null ) {
	     	CommonTrack.findById(track.common_track_id).exec(function(err, commonTrackEntry) {
				if (err) {
					console.log("error querying for commonTrack with id " + track.common_track_id + " and track title " + track.title);
					next(err, track, null);
				}
				else {
					// found commonTrack entry.
					// console.log("hey!!!")
					next();
				}
	     	})
	     }
	     else {
		     CommonTrack.find({track_ids : track._id }).exec(function (err, commonTrackResults) {
				if (err) {
					console.log("error querying for commonTrack with track " + track.title)
					next(err, track, null)
				}
				else if (commonTrackResults.length == 0) {
					// no current commonTrack entries exist with this track_id. However, there may be an existing entry to add to from another client. Check
					next(null, track)
					// next(track, "error")
				}
				else if (commonTrackResults.length == 1) {
					// found existing commonTrack entry. Skip to end (callback)
					console.log("!!found existing commonTrack entry that already contains track")
					if (track.common_track_id == null) {
						track.common_track_id = commonTrackResults[0]._id
						track.save(function(err) {
							console.log("saving commontrack id to track.", "err was ", err)
						})
					}
					next()
				}
				else {
					// More than one matching result. This is an error. Hopefully I have programmed to avoid this, but need to figure out a good way to handle
					// skip to end (callback) with an error message
					next("Error: More than one existing commonTrack", track, null)
				}
		     });
		}

	}



	var f = function(data0, data1, data2) {
		console.log("data1 is", data2);
	}


	var f1 = function(err, track, commonTrack) {
		if (err == "no error") {
			updateCommonTrack(err, track, commonTrack);
		}
		// console.log("commonTrack\n", commonTrack);
	}

	var f2 = function(err, blah, commonTrack) {
		if (err == "no error" ) {
			updateCommonTrackWithEachMemberTrack(commonTrack)
		}
		console.log("commonTrack\n", commonTrack);

	}

	// console.log(Track)
	initial_id = 1854;  //client2
	// initial_id = 1760;  //client1
	// var q2 = createOrFindCommonTrackFromTrackId(initial_id + 0, f2)






	var updateAllCommonTrackEntries = function(callback) {
		CommonTrack.find(function(err, commonTracks) {
			if (err == null) {
				async.each(commonTracks,
					function(commonTrackEntry, asyncCallback) {
						updateCommonTrackWithEachMemberTrack(commonTrackEntry, asyncCallback);
					},
					function() {
						if (callback != null) {
							callback(err)
						}						
					}
				);
			}
		});
	};

	










	var updateCommonTrack = function(err, track, commonTrack, callback) {
	 	// console.log("Adding to existing commonTrack entry. Track title is \"" + track.title + "\"");
		// commonTrack.track_ids.push(track._id);
		// commonTrack.client_ids.push(track.rbsync_client_id);
		var changesMade = false;
		async.each(attributes_to_track_with_ch_time, 
			function(ch_time_key, asyncCallback) {
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
						// key is play_count. We don't want to use the most recent play_count, what we want to do is set the play_count equal to the sum of the local_play counts
						// This seems like it could be problematic if you wibe a client and then setup again. It's local play_count would be set to whatever it's current (cumulative) playcount is.
						// Which would then be added to the total.
						// I need to really only increase play_count by delta(play_count) of syncing track.
						track.find({common_track_id : commonTrack._id}, function(err, tracks) {
							if (err) {
								asyncCallback(err);
							}
							else if (tracks.length == 0) {
								asyncCallback("no tracks found");
							}
							else {
								var new_play_count = tracks.map(e => e.local_play_count).reduce( (x, y) => x+y)
								console.log("new_play_count", new_play_count)
								commonTrack[key] = new_play_count;
								commonTrack[ch_time_key] = track[ch_time_key];
								changesMade = true;
							}
						})
					}
				}
				asyncCallback()
			},
			function(err) {
				if (changesMade) {
				 	console.log("Adding to existing commonTrack entry. Track title is \"" + track.title + "\"");
					var track_ch_times = attributes_to_track_with_ch_time.map(function(key) {
						return commonTrack[key] || 0;
					})
					// console.log(track_ch_times)
					// use the latest attr_ch_time value for the last_update_time
					// this isn't necessarily or even likely to be the time the that the track was synced, just when user updated track on client
					commonTrack.last_update_time = Math.max(...track_ch_times);
					commonTrack.save(function(err) {
						if (err) {
							console.log ("Error saving common track for track title \"" + track.title + "\"", err);
							// next(err, commonTrack);
						}
						else {
							console.log("Successfully added to commonTrack for track title \"" + track.title  + "\" (_id " + track._id + ")");
							// next(track, commonTrack);
						}
						if (callback != null) {
							callback();
						}				
					})
				}				
			}
		);
	};