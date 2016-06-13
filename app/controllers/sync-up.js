var mongoose = require('mongoose');

var SyncUpQuery = require('../models/searchQueryModel');


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
		var q = SyncUpQuery.
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



	app.get('/api/sync-up/:query', function(req, res) {
		console.log('Trying to conduct new search');
		var query = req.params.query 
		//iff an offset is entered (/querytext?offset=10), that will be available in the variable req.query.offset

		    //console.log(JSON.stringify(body.d.results));
		    //console.log(JSON.stringify(body.d.results.data));
				var results = [];
				// console.log("res is ", res);

				var rbsyncQuery = new SyncUpQuery();
				rbsyncQuery.queryTerm = query;
				// rbsyncQuery.queryResults = results;
				rbsyncQuery.queryResults = {};  //just for testing
				// rbsyncQuery.queryDate = new Date();

				rbsyncQuery.save(function(err) {
					if (err) {
						res.send(err);
						console.log("error when saving rbsyncQuery to database");
					}
					res.json(results);
					res.end();
				});		    
		});
};