var assert = require("assert")
var gissues = require('../index');

describe('gissues', function(){
  it('should find two issues', function(done) {
    gissues.show('./test/sample/').then(function(){
      done();
    });
  });
});

