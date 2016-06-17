var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');


var trackMatchSchema = new Schema({
	"client_1": 	Number,
	"client_2": 	Number,
	"rbsync_id_1": Number,
	"rbsync_id_2": Number
});

trackMatchSchema.plugin(autoIncrement.plugin, 'trackMatch');
//uses automIncrement plugin to automatically make the IDs incrementing integegers, used for tracks

module.exports = mongoose.model('trackMatch', trackMatchSchema);