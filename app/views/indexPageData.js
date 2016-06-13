
var appURL = process.env.APPURL;
var pageData = {
	"title" : "API Basejump: An Image Search Abstraction Layer",
	"userStories" : [
		"I can get the image URLs, alt text and page urls for a set of images relating to a given search string.", 
		"I can paginate through the responses by adding a ?offset=2 parameter to the URL.", 
		"I can get a list of the most recently submitted search strings." 	
	],
	"notes" : [
		"This image search uses Bing, by Microsoft",
		"I have the app to return 10 results at a time. The offset allows you to get additional results, 10 at a time. So using ?offset=10 returns results 10 - 19."
		],
	"examples" : [
		{
			"input" : appURL + "/api/recent", 
			"action" : "Returns:", 
			"output" : [
				{
					"queryDate" : "2016-01-18T21:32:47.880Z",
					"queryTerm" : "freecodecamp"
				},
				{
					"queryDate" : "2016-01-18T21:32:43.129Z",
					"queryTerm" : "npr"
				},
				{
					"queryDate" : "2016-01-18T21:32:37.707Z",
					"queryTerm" : "flint water"
				},
				{
					"queryDate" : "2016-01-18T21:32:31.512Z",
					"queryTerm" : "amazon"
				},
				{
					"queryDate" : "2016-01-18T21:32:26.961Z",
					"queryTerm" : "ultrabook"
				},
				{
					"queryDate" : "2016-01-18T21:32:02.459Z",
					"queryTerm" : "zenbook"
				},
				{
					"queryDate" : "2016-01-18T21:31:50.217Z",
					"queryTerm" : "computer architecture"
				},
				{
					"queryDate" : "2016-01-18T21:31:28.153Z",
					"queryTerm" : "crytography"
				},
				{
					"queryDate" : "2016-01-18T21:31:14.795Z",
					"queryTerm" : "knight"
				},
				{
					"queryDate" : "2016-01-18T21:31:02.907Z",
					"queryTerm" : "existential"
				}
			]
		}, 
		{
			"input": appURL + "/api/imagesearch/lolcat", 
			"action" : "Returns:", 
			"output": [
				{
					"url" : "http://upload.wikimedia.org/wikipedia/commons/3/37/Wikipedia-lolcat.jpg",
					"snippet" : "Description Wikipedia-lolcat.jpg","thumbnail" : "http://ts2.mm.bing.net/th?id=OIP.Me229bf93cc4d975ee553c93644968b48o0&pid=15.1",
					"context" : "http://en.wikipedia.org/wiki/File:Wikipedia-lolcat.jpg"
				},
				{
					"url" : "http://1.bp.blogspot.com/_LvWzMHLToJ4/THyP1jxIHyI/AAAAAAAABTo/jXyRYJkHojk/s1600/cute-lolcat-ears-hear-you.jpg",
					"snippet" : "Republic Of Durian: LOLcat",
					"thumbnail" : "http://ts3.mm.bing.net/th?id=OIP.M975db550ad3354d0156be35266476600H0&pid=15.1",
					"context" : "http://ivan-tai.blogspot.com/2010/08/lolcat.html"
				},
				{
					"url" : "http://thewondergallery.files.wordpress.com/2013/01/lolcat.jpg",
					"snippet" : "LOLCAT | The Wonder Gallery",
					"thumbnail" : "http://ts2.mm.bing.net/th?id=OIP.Mcf9b79708b09471e7651ce55f63fdbaeH0&pid=15.1",
					"context" : "http://thewondergallery.com/2013/01/22/lolcat/"
				},
				{
					"url" : "http://upload.wikimedia.org/wikipedia/commons/4/4c/Lolcat.jpg",
					"snippet" : "Description Lolcat.jpg",
					"thumbnail" : "http://ts3.mm.bing.net/th?id=OIP.M7e044b6402e950eaea5a6717cee17f53H0&pid=15.1",
					"context" : "http://commons.wikimedia.org/wiki/File:Lolcat.jpg"
				},
				{
					"url" : "http://iamkio.files.wordpress.com/2011/04/lolcat-1april-trashcat.jpg",
					"snippet" : "LOLcat Friday: They Are Not Happy With Your Jokes edition",
					"thumbnail" : "http://ts2.mm.bing.net/th?id=OIP.M001075ad9361f33e8196cfee94d56c2eH0&pid=15.1",
					"context" : "http://iamkio.wordpress.com/category/lolcat-friday/"
				},
				{
					"url" : "http://upload.wikimedia.org/wikipedia/commons/f/fa/Lolcat_especially_made_for_Wikinews.jpg",
					"snippet" : "Description Lolcat especially made for Wikinews.jpg",
					"thumbnail" : "http://ts4.mm.bing.net/th?id=OIP.Me3fef3f84ded2892108e13ac8bee36bco0&pid=15.1",
					"context" : "http://en.wikipedia.org/wiki/File:Lolcat_especially_made_for_Wikinews.jpg"
				},
				{
					"url" : "http://3.bp.blogspot.com/_LvWzMHLToJ4/THyPXG0cpSI/AAAAAAAABTQ/wDj1PWJcqcw/s1600/lolcat.png",
					"snippet" : "Republic Of Durian: LOLcat",
					"thumbnail" : "http://ts4.mm.bing.net/th?id=OIP.M078287bbf4891e507812aff9670db2abH0&pid=15.1",
					"context" : "http://ivan-tai.blogspot.com/2010/08/lolcat.html"
				},
				{
					"url" : "http://captionsearch.com/pix/7sqtzp7ssn.jpg",
					"snippet" : "lolcat proceed\" - CaptionSearch",
					"thumbnail" : "http://ts4.mm.bing.net/th?id=OIP.Md7cf95a0c7ef45c88da27aed6216128eH0&pid=15.1",
					"context" : "http://captionsearch.com/image.php?id=124"
				},
				{
					"url" : "http://kara.allthingsd.com/files/2009/09/Lolcat7.jpg",
					"snippet" : "what\'s your take on LOLcats?",
					"thumbnail" : "http://ts2.mm.bing.net/th?id=OIP.M0272224ffde8b28d5792a4c7113988efo0&pid=15.1",
					"context" : "http://www.sodahead.com/fun/whats-your-take-on-lolcats/question-1449363/"
				},
				{
					"url" : "http://3.bp.blogspot.com/_Oq4_ReQHBR4/THmwWh4VwtI/AAAAAAAAABY/-j4qMJvgUwQ/s1600/lol-cats_IBeleiveYouHaveMyCompu-tar.jpg",
					"snippet" : "Who Da Thunk IT: lol cat pictures caturday cats",
					"thumbnail" : "http://ts4.mm.bing.net/th?id=OIP.M22dd957fc61504e1f952020c7c707d37H0&pid=15.1",
					"context" : "http://gigefrog.blogspot.com/2010/08/lol-cat-pictures-caturday-cats.html"
				}
			]
		}, 
		{
			"input": appURL + "/api/imagesearch/lolcat?offset=10", 
			"action" : "Returns:", 
			"output": "The next ten results"
		}
	]
}

module.exports = pageData;
