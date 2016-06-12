var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var shortenedURLSchema = new Schema({
	"original_url" : String
});

shortenedURLSchema.plugin(autoIncrement.plugin, 'shortenedURL');
//uses automIncrement plugin to automatically make the IDs incrementing integegers, used for short_urls

module.exports = mongoose.model('shortenedURL', shortenedURLSchema);