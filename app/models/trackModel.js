var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');


var trackSchema = new Schema({
	location :		String,
	artist :			String,
	album :			String,
	year :			Number,
	track_number :		Number,
	disc_number :		Number,
	track_total :		Number,
	disc_total :		Number,
	album_artist :		String,
	composer :		String,
	title :			String,
	rating :			Number,
	play_count :		Number,
	bpm :			Number,
	genre :			String,
	comment :			String,
	// media_type :		String,
	// status :			Number,
	// description :		String,
	// subtitle :		String,
	// post_time :		Number,
	// entry_type :		String,
	// duration :		Number,
	// file_size :		Number,
	// mountpoint :		String,
	// mtime :			Number,
	// first_seen :		Number,
	// last_seen :		Number,
	// last_played :		Number,
	// bitrate :			Number,
	// hidden :			Number,
	// local_id : 		Number,
	// rbsync_id :		Number,
	old_play_count: 		Number,
	local_play_count :		Number,
	artist_ch_time :		Number,
	album_ch_time :		Number,
	year_ch_time :			Number,
	track_number_ch_time :	Number,
	disc_number_ch_time :	Number,
	track_total_ch_time :	Number,
	disc_total_ch_time :	Number,
	album_artist_ch_time : 	Number,
	composer_ch_time :	 	Number,
	title_ch_time :		Number,
	rating_ch_time :		Number,
	play_count_ch_time :	Number,
	bpm_ch_time :			Number,
	genre_ch_time :		Number,
	comment_ch_time : 		Number,
	rbsync_client_id :	Number,
	sync_time :		Number,
	common_track_id : 	Number
	// media_type_ch_time :	Number,

});

trackSchema.plugin(autoIncrement.plugin, 'track');
//uses automIncrement plugin to automatically make the IDs incrementing integegers, used for tracks

module.exports = mongoose.model('track', trackSchema);