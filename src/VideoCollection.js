var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');
var Video = require('./Video');
var Bacon = require('baconjs').Bacon;

// max near 10650 pages
var VideoCollection = Backbone.Collection.extend({
  url: 'https://api.tmade.co/v1/videos?api_key=webdevtest',
  model: Video,
  pages: 50,
  parse: function(models) {
    return models.filter(function(model) {
      var notReal = /not a real.*/i.test(model.title);
      var exampleVid = model.video.url === 'http://www.example.com/video.url.mp4';
      if (!model.venue) { model.venue = false; }
      return !notReal && !exampleVid;
    });
  }

});

module.exports = VideoCollection;
