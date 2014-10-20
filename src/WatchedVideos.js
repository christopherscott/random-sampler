var Backbone = require('./Backbone');
Backbone.LocalStorage = require('backbone.localstorage');

var WatchedVideos = Backbone.Collection.extend({
  model: Backbone.Model.extend(),
  localStorage: new Backbone.LocalStorage('tm-watched-videos')
});

module.exports = WatchedVideos;
