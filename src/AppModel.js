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
    _.bindAll(this, 'getNearbyVideos', 'finalizeLoad');

    var triggerLoadBucket = this.trigger.bind(this, 'load:bucket');

    // 'random' videos
    var videos = this.videos = new VideoCollection();
    videos.fetch();
    videos.on('sync', function() {
      this.loadedBuckets++;
      this.trigger('load:bucket');
      this.finalizeLoad();
    }.bind(this));

    // popular videos
    var popVideos = this.popVideos = new PopularVideoCollection();
    popVideos.fetch();
    popVideos.on('sync', function() {
      this.loadedBuckets++;
      this.trigger('load:bucket');
      this.finalizeLoad();
    }.bind(this));

    // nearby videos
    navigator.geolocation.getCurrentPosition(this.getNearbyVideos);
  },

  /**
   * Get and stash nearby videos
   * @param  {Object} position
   */
  getNearbyVideos: function(position) {
    var nearbyVideos = this.nearVideos = new NearbyVideoCollection({
      'latitude': position.coords.latitude,
      'longitude': position.coords.longitude
    });
    nearbyVideos.fetch();
    nearbyVideos.on('sync', function() {
      this.loadedBuckets++;
      this.trigger('load:bucket');
      this.finalizeLoad();
    }.bind(this));
  },

  /**
   * Trigger 'ready', basially
   */
  finalizeLoad: function() {
    if (this.loadedBuckets < 3) { return; }
    this.trigger('load:bucket');
    this.buckets = [this.videos, this.popVideos, this.nearbyVideos];
    this.trigger('ready');
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
      } else {
        return this.getRandomChoice(this.buckets[0]);
      }
    }, this);
    return choices;
  },

  /**
   * Return a random element from a Backbone collection
   * @param  {Backbone.Collection} choices - Backbone collection
   */
  getRandomChoice: function (choices) {
    var length = choices.length,
        rand = _.random(length - 1),
        randomChoice = choices.at(rand);

    if (randomChoice) {
      return randomChoice;
    }
  }

});

module.exports = AppModel;
