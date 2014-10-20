var _ = require('underscore');
var Backbone = require('Backbone');
var VideoCollection = require('./VideoCollection');
var PopularVideoCollection = require('./PopularVideoCollection');
var NearbyVideoCollection = require('./NearbyVideoCollection');

var AppModel = Backbone.Model.extend({
  defaults: {
    username: 'User',
    points: 0,
    turns: 0,
    videos: []
  },

  buckets: [],

  initialize: function() {
    var triggerLoadBucket = this.trigger.bind(this, 'load:bucket');
    // videos
    var videos = this.videos = new VideoCollection();
    videos.fetch();
    videos.on('sync', triggerLoadBucket);

    // popular videos
    var popVideos = this.popVideos = new PopularVideoCollection();
    popVideos.fetch();
    popVideos.on('sync', triggerLoadBucket);

    var that = this;

    navigator.geolocation.getCurrentPosition(function (position) {
      var nearbyVideos = that.nearVideos = new NearbyVideoCollection({
        'latitude': position.coords.latitude,
        'longitude': position.coords.longitude
      });
      nearbyVideos.fetch();
      nearbyVideos.on('sync', function () {
        triggerLoadBucket();
        that.buckets = [videos, popVideos, nearbyVideos];
        that.trigger('ready');
      });
    });
  },

  /**
   * Return an array of random video choices
   * @return {Array} - of choices (video objects)
   */
  getChoices: function() {
    var choices = _.times(3, function (i) {
      var bucket = this.buckets[i];
      if (bucket) {
        return this.getRandomChoice(this.buckets[i]);
      }
    }, this);
    return choices;
  },

  /**
   * Return a random element from a Backbone collection
   * @param  {Backbone.Collection} choices - Backbone collection
   */
  getRandomChoice: function (choices) {
    if (!choices) { return null; }
    var length = choices.length,
        rand = _.random(length - 1),
        randomChoice = choices.at(rand);

    if (randomChoice) {
      return randomChoice;
    } else {
      // try again
      return this.getRandomChoice(choices);
    }
  }

});

module.exports = AppModel;
