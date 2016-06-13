var request = require("request");
var helloWorld = require("../server.js")
var base_url = "http://localhost:8080/"



describe("Hello World Server", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("returns Hello World", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).toMatch(/API Basejump: An Image Search Abstraction Layer/);  //contain title
        helloWorld.closeServer();
        // request.connection.destroy();
        done();
      });
    });
  });
});