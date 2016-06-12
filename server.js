'use strict';

//used https://www.npmjs.com/package/mongoose-auto-increment to help with auto incrementing object ids in database


// server.js


var log = function(data) {
	console.log(data);
};

// base setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var url = require('url');
var path = require('path');
//require('dotenv').load();

var port = process.env.PORT || 8080;

//app.engine('.html', require('jade'));
app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');




//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var connection = mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGO_URI || 'mongodb://localhost/');
 var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var ShortenedURL = require('./app/models/shortenedURLModel');

/*
app.get('/', function(req, res) {
	// res.render('index.html')
	res.render('index', {title: 'Hey', message: 'Hello Xena'});
	res.end();
});
*/

app.get('/', function (req, res) {
	console.log("rendering homepage");
	//get page data
	var pageData = require('./app/views/indexPageData.json');
	var appURL = req.protocol + '://' + req.headers.host;
	pageData = JSON.parse(JSON.stringify(pageData).replace(/APPURL/g, appURL));
	res.render('index', pageData);
	res.end();
});


app.get('/urls/', function(req, res) {
	log('listing all shortened urls stored in database');
	ShortenedURL.find(function(err, URLs) {
		if (err) {
			res.send(err);
		}
		res.json(URLs)
;	});	
});

app.get('/:url_id', function(req, res) {
	log('attempting to load shorturl ' + req.params.url_id);
	if (Number.parseInt(req.params.url_id)) {
		ShortenedURL.findById(Number.parseInt(req.params.url_id), function(err, shortenedURL) {
			if (err) {
				res.send(err);
			}
			log("redirecting to " + shortenedURL.original_url);
			res.redirect(shortenedURL.original_url);
			res.end();
		});
	}
	else if (req.params.url_id === 'favicon.ico'){
		log('serving favicon.ico (github icon)')
	    var img = require('fs').readFileSync('./public/img/favicon.ico');
	    res.writeHead(200, {'Content-Type': 'image/gif' });
	    res.end(img, 'binary');
	}

});

app.get('/new/*', function(req, res) {
	//working on this. did not parse correctiong using the :query notation, probably due to slashes.
	log('Trying to create new short url');
	var originalURL = req.url.slice(5);  //remove the '/new/' portion from url
	var returnObj = {
		'original_url' 	: originalURL,
		'short_url' 	: null,
		'message'		: ''
	};
	var parse = url.parse(originalURL);
	log('Parsed URL is ' + originalURL);


	if (parse.protocol && parse.host) {
		log('creating short url for ' + originalURL);
		var URL = new ShortenedURL();
		URL.original_url = originalURL;  
		// console.log(URL);
		URL.save(function(err) {
			if (err) {
				res.send(err);
			}
			log('URL created!');
			returnObj.short_url = 'http://127.0.0.1:8080/' + URL._id.toString();
			returnObj.message = 'Success';
			res.end(JSON.stringify(returnObj, false, ' '));
			//returnObj contains original URL and shortened URL

		});    		
	}
	else {
		log('parsing of original url failed. Original URL is ' + originalURL);
		returnObj.message = 'Parsing of original_url failed.'
		res.end(JSON.stringify(returnObj, false, ' '));
		//returnObj contains original URL and null

	}
});


// start server

app.listen(port);
console.log('Magic happens on port ' + port);


/*
router.route('/bears')
	//create a bear (accesed at POST http://localhost:8080/api/bears)
	.post(function(req, res) {
		log(req.body);
		var bear = new Bear();
		bear.name = req.body.name;  
		bear.color = req.body.color;
		bear.age = Number.parseInt(req.body.age);
		bear.save(function(err) {
			if (err) {
				res.send(err);
			}
			res.json({ message: 'Bear created!'});
		});
	})
	//get all the bears (accessed via get request)
	.get(function(req, res) {
		Bear.find(function(err, bears) {
			if (err) {
				res.send(err);
			}
			res.json(bears);
		});
	});

	router.route('/bears/:bear_id')

	// get the bear with that id (accessed via get request)
	.get(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			if (err) {
				res.send(err);
			}
			log(bear);
			res.json(bear);
		});
	})

	//update the bear with this id (accessed via put request)
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			console.log(req.body)
			if (err) {
				res.send(err);
			}
			if (req.body.name  && bear.name !== req.body.name) {
				bear.name = req.body.name; //update the bears name
			}
			if (req.body.age && bear.age !== Number.parseInt(req.body.age)) {
				bear.age = Number.parseInt(req.body.age);
			}
			if (req.body.color && bear.color !== req.body.color) {
				bear.color = req.body.color;
			}

			//save the bear
			bear.save(function(err) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'Bear updated!'});
			});
		});
	// delete the bear with this id (accessed via delete request)
	}).delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err) {
				res.send(err);
			}
			res.json({ message: 'Successfully deleted' });
		});
	});

*/