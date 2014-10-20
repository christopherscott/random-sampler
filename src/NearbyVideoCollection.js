var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');
var Video = require('./Video');

var NearbyVideoCollection = Backbone.Collection.extend({
	model: Video,
  url: 'https://api.tmade.co/v1/nearby/videos?api_key=webdevtest',
  initialize: function (options) {
    this.url += '&lat=' + options.latitude + '&long=' + options.longitude;
  },
  parse: function(models) {
    return models.map(function(model) {
     if (!model.venue) { model.venue = false; }
     return model;
    });
  }
});

module.exports = NearbyVideoCollection;
