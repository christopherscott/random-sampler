var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');
var Video = require('./Video');

var PopularVideoCollection = Backbone.Collection.extend({
	url: 'https://api.tmade.co/v1/popular/videos?api_key=webdevtest',
	model: Video,
  parse: function(models) {
    return models.map(function(model) {
     if (!model.venue) { model.venue = false; }
     return model;
    });
  }
});

module.exports = PopularVideoCollection;
