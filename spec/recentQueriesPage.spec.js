var request = require("request");
var helloWorld = require("../server.js")
var base_url = "http://localhost:8080/"

var checkThatArrayIsSortedByDate = function(arr) {
  // return true;
  for (var i = 0 ; i < arr.length - 1; i++) {
    if (arr[i].queryDate < arr[i+1].queryDate) {
      return false;
    }
  }
  return true;
}


describe("Recent image queries", function() {
  describe("GET /api/recent/", function() {
    it("returns status code 200", function(done) {
      request.get(base_url + 'api/recent', function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("returns results in correct json form", function(done) {
      request.get(base_url + 'api/recent', function(error, response, body) {
        expect(body).toEqual(jasmine.any(String));  //verify body is a string
        expect(body).toMatch(/queryDate/);  //part of response. The string should include the term queryDate
        var json = JSON.parse(body);
        expect(json).toEqual(jasmine.any(Object));  //verify string could be parsed as json
        // console.log("checking for array:", json.length);
        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBeLessThan(11);       
        json.forEach(function(element) {
          expect(element.hasOwnProperty('queryTerm') && element.hasOwnProperty('queryDate')).toBe(true);
  			});
				// helloWorld.closeServer();
			  done();
      });
    });
    it("returns results that are sorted by queryDate, with the most recent being first", function(done) {
      request.get(base_url + 'api/recent', function(error, response, body) {
        var json = JSON.parse(body);
        expect(checkThatArrayIsSortedByDate(json)).toBe(true);
        helloWorld.closeServer();
        done();
      });
    });
  });
});