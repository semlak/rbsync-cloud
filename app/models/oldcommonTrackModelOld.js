var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');


var commonTrackSchema = new Schema({
	"artist" :		String,
	"album" :			String,
	"year":			Number,
	"track_number" :	Number,
	"disc_number" :	Number,
	"track_total" :	Number,
	"disc_total" :		Number,
	// "media_type" :		String,
	"album_artist" :	String,
	"composer" :		String,
	"title" :			String,
	"rating" :		Number,
	"play_count" :		Number,
	"bpm" :			Number,
	"genre" :			String,
	"comment" :		String,
	// "status" :		Number,
	// "description" :	String,
	// "subtitle" :		String,
	// "post_time" :		Number,
	// "entry_type" :		String,
	"duration" :		Number,
	// "file_size" :		Number,
	"mountpoint" :		String,
	// "mtime" :			Number,
	// "first_seen" :		Number,
	// "last_seen" :		Number,
	// "last_played" :	Number,
	// "bitrate" :		Number,
	"hidden" :		Number,
	"local_id" : 		Number,
	// "rbsync_id" :		Number,
	"last_update_time" :	Number,
	// "local_play_count" :	Number,
	"artist_ch_time" :		Number,
	"album_ch_time" :		Number,
	"year_ch_time" :		Number,
	"track_number_ch_time" :	Number,
	"disc_number_ch_time" :	Number,
	"track_total_ch_time" :	Number,
	"disc_total_ch_time" :	Number,
	// "media_type_ch_time" :	Number,
	"album_artist_ch_time": 	Number,
	"composer_ch_time" : 	Number,
	"title_ch_time" :		Number,
	"rating_ch_time" :		Number,
	"play_count_ch_time" :	Number,
	"bpm_ch_time" :		Number,
	"genre_ch_time" :		Number
});

commonTrackSchema.plugin(autoIncrement.plugin, 'commonTrack');
//uses automIncrement plugin to automatically make the IDs incrementing integegers, used for commonTracks

module.exports = mongoose.model('commonTrack', commonTrackSchema);