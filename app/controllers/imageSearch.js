var mongoose = require('mongoose');

var ImageQuery = require('../models/searchQueryModel');
// console.log("api key is " , process.env.API_KEY);
// var Bing = require('node-bing-api')({ accKey: "9Pt3X/jx2XJc15y9RLou7znzgJHWSkqtm4Vd8fTkD/M=" });
var Bing = require('node-bing-api')({ accKey: process.env.API_KEY });


module.exports.controller = function(app) {
	// console.log();
	//home page with instructions
	app.get('/', function (req, res) {
		console.log("rendering homepage");
		var appURL = req.protocol + '://' + req.headers.host;
		process.env.APPURL= appURL
		var pageData = require('../views/indexPageData.js');
		res.render('index', pageData);
		res.end();
	});


	app.get('/api/recent/', function(req, res) {
		console.log('listing recent queries stored in database');
		var q = ImageQuery.
			find({}, 'queryDate queryTerm -_id').
			// select('-_id').
			sort('-queryDate').
			limit(10);
		q.exec(function(err, results) {
			if (err) {
				res.send(err);
				res.end();
			}
			else {
				// console.log(results);
				res.json(results);
				res.end();
			}
		})
	});



	app.get('/api/imagesearch/:query', function(req, res) {
		console.log('Trying to conduct new search');
		var query = req.params.query 
		//iff an offset is entered (/querytext?offset=10), that will be available in the variable req.query.offset

		Bing.images(query, {'top': 10, 'skip': Number.parseInt(req.query.offset) ||  0}, function(error, response, body){
		    //console.log(JSON.stringify(body.d.results));
		    //console.log(JSON.stringify(body.d.results.data));
		    if (error) {
		    	res.send(error);
		    	console.log("error when running query with bing api");
		    	res.end();
		    }
		    else {
				var data = body.d.results;
				// console.log(JSON.stringify(data, false, ' '));
				var results = [];
				// console.log("res is ", res);
				data.forEach(function(dataItem) {
					var result = {
						url : dataItem.MediaUrl || '', 
						snippet: dataItem.Title || '',
						thumbnail: dataItem.Thumbnail.MediaUrl || '',
						context: dataItem.SourceUrl || ''
					}
					// console.log(JSON.stringify(result));
					results.push(result);
				});

				var imageQuery = new ImageQuery();
				imageQuery.queryTerm = query;
				// imageQuery.queryResults = results;
				imageQuery.queryResults = {};  //just for testing
				imageQuery.queryDate = new Date();

				imageQuery.save(function(err) {
					if (err) {
						res.send(err);
						console.log("error when saving imageQuery to database");
					}
					res.json(results);
					res.end();
				});		    
			}
		});
	});
};