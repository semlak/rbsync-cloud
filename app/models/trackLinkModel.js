var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
""

var trackLinkSchema = new Schema({
	// tracks : [{type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
	track_ids : 		[Number],
	client_ids : 		[Number],
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
	duration :		Number,
	mountpoint :		String,
	hidden :			Number,
	local_id : 		Number,
	last_update_time :	Number,
	// rbsync_id :			Number,
	// media_type :		String,
	// status :			Number,
	// description :		String,
	// subtitle :			String,
	// post_time :			Number,
	// entry_type :		String,
	// file_size :			Number,
	// mtime :			Number,
	// first_seen :		Number,
	// last_seen :			Number,
	// last_played :		Number,
	// bitrate :			Number,
	// local_play_count :	Number,
	artist_ch_time :		Number,
	album_ch_time :		Number,
	year_ch_time :			Number,
	track_number_ch_time :	Number,
	disc_number_ch_time :	Number,
	track_total_ch_time :	Number,
	disc_total_ch_time :	Number,
	// media_type_ch_time :	Number,
	album_artist_ch_time : 	Number,
	composer_ch_time : 		Number,
	title_ch_time :		Number,
	rating_ch_time :		Number,
	play_count_ch_time :	Number,
	bpm_ch_time :			Number,
	genre_ch_time :		Number	
});

trackLinkSchema.plugin(autoIncrement.plugin, 'trackLink');
//uses automIncrement plugin to automatically make the IDs incrementing integegers, used for tracks

module.exports = mongoose.model('trackLink', trackLinkSchema);