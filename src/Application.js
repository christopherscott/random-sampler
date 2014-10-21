var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');
var NProgress = require('NProgress');
var ChoiceView = require('./ChoiceView');
var WatchedVideos = require('./WatchedVideos');
var transitionend = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
var convertMaps = require('static-maps');

var VIDEO_CONTROL_DELAY_MS = 1000;

var Application = Backbone.View.extend({
  currentVideoMetaTpl: _.template($('#currentVideoMetaTpl').html()),
  events: {
    'keyup #username': 'handleUsernameChange',
    'change #username': 'handleUsernameChange',
    'click .current-play': 'handleClickPlay',
    'click .current-pause': 'handleClickPause',
    'click .current-skip': 'handleFinishedVideo',
    'click .current-info': 'handleClickInfo',
    'click .back-to-video': 'handleClickBackToVideo'
  },
  initialize: function() {
    _.bindAll(this,
      'updateUsername',
      'showChoices',
      'handleBucketLoad',
      'handleTimeUpdate',
      'updatePoints',
      'handlePlay',
      'handlePause',
      'transitionToVideo',
      'fadeToVideo',
      'hideChoices',
      'handleFinishedVideo',
      'handleAppReady'
    );
    this.cacheNodes();
    this.attachEvents();
    this.watchedVideos = new WatchedVideos();
    this.watchedVideos.fetch();

    // progress loader
    NProgress.configure({
      showSpinner: false,
      parent: '.splash-sampler'
    });
    NProgress.start();
    NProgress.inc();

    this.$current.hide();
    this.hideChoices();
    this.$current.show();
  },
  hideChoices: function() {
    this.$choices.removeClass('show');
  },
  cacheNodes: function() {
    this.$bgimage = $('#bgimage');
    this.$choiceList = this.$('.choice-list');
    this.$username = this.$('.username');
    this.$video = this.$('#current-video');
    this.video = this.$video.get(0);
    this.$meta = this.$('#current-meta .meta');
    this.$currentMeta = this.$('#current-meta');
    this.$videoContainer = this.$('.current-video-container');
    this.$videoWrapper = this.$('.current-video-wrapper');
    this.$choiceList = this.$('.choice-list');
    this.$choices = this.$('.choices');
    this.$current = this.$('.current');
    this.$currentTime = this.$('.current-time');
    this.$currentTitle = this.$('.current-thumb .title');
    this.$currentThumb = this.$('.current-thumb');
    this.$score = this.$('#score');
    this.$map = this.$('.current-map');
    this.$splash = this.$('.splash');
    this.$banner = $('.banner');
  },
  attachEvents: function() {
    this.listenTo(this.model, 'change:username', this.updateUsername);
    this.listenTo(this.model, 'ready', this.handleAppReady);
    this.listenTo(this.model, 'load:bucket', this.handleBucketLoad);
    this.listenTo(this.model, 'change:points', this.updatePoints);
    this.listenTo(this, 'chosen', this.handleChosen);
    this.$video.on('timeupdate', this.handleTimeUpdate);
    this.$video.on('pause', this.handlePause);
    this.$video.on('play', this.handlePlay);
    this.$video.on('ended', this.handleFinishedVideo);
  },
  handleAppReady: function() {
    NProgress.done();
    this.$splash.addClass('dismiss');
    this.$splash.on(transitionend, function() {
      this.$splash.hide();
      this.$el.addClass('initialized');
      this.showChoices();
    }.bind(this));
  } ,
  updatePoints: function() {
    this.$('.points').text(this.model.get('points'));
  },
  makeMap: function(latitude, longitude) {
    var newMap = $('<div data-latitude="' + latitude + '" data-longitude="' +  longitude + '" />');
    this.$map.html(newMap.addClass('map-todo'));
    convertMaps({
      navigationControl: false,
      mapTypeControl: false,
      scaleControl: false,
      draggable: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 7
    });
  },
  showUI: function() {
    this.$banner.removeClass('hidden');
    this.$current.removeClass('hidden');
    this.$currentMeta.removeClass('hidden');
  },
  showChoices: function () {
    var choices = this.model.getChoices();
    this.$choiceList.html('');
    choices.forEach(this.addChoice, this);
    this.$choices.on(transitionend, _.once(function() {
      this.$choices.removeClass('enter');
    }.bind(this)));
    setTimeout(function() {
      window.scrollTo(0,0);
      this.$choices.addClass('show enter');
    }.bind(this), 10);
  },
 addChoice: function(choice, i) {
   var view = new ChoiceView({
      app: this,
      model: choice,
      index: i
    });
    this.$choiceList.append(view.render().el);
  },
  updateUsername: function(model, value) {
    this.$username.text(value);
  },
  handleClickInfo: function() {
    this.$videoContainer.addClass('flipped');
  },
  handleClickBackToVideo: function() {
    this.$videoContainer.removeClass('flipped');
  },
  handlePause: function() {
    this.$videoContainer.removeClass('paused playing');
    setTimeout(function() {
      this.$videoContainer.addClass('paused');
    }.bind(this), VIDEO_CONTROL_DELAY_MS);
  },
  handlePlay: function() {
    this.$videoContainer.removeClass('paused playing');
    setTimeout(function() {
      this.$videoContainer.addClass('playing');
    }.bind(this), VIDEO_CONTROL_DELAY_MS);
  },
  handleFinishedVideo: function() {
    this.video.pause();
    this.$currentThumb.show();
    this.$choices.removeClass('fold first second third fade-out hidden');
    this.$chosenChoice.removeClass('deploy');
    this.$choiceList.removeClass('deploy');
    this.showChoices();
  },
  handleClickPlay: function() {
    this.$currentThumb.hide();
    this.video.play();
  },
  handleClickPause: function() {
    this.video.pause();
  },
  handleTimeUpdate: function(evt) {
    var duration = this.video.duration;
    if (isNaN(duration)) { return; }
    var currentPoints = this.model.get('currentPoints');
    var currentTime = this.video.currentTime;
    var progress = currentTime / duration;
    var points = Math.floor(progress * 100);
    var earnedPoints = points - currentPoints;
    var seconds = currentTime.toFixed(0);
    var hundreths = Math.round((currentTime % 1) * 10).toFixed(0);
    var thousands = Math.round((currentTime % 1) * 100);
    this.model.set('points', this.model.get('points') + earnedPoints);
    this.model.set('currentPoints', currentPoints + earnedPoints);
    this.$score.text(this.model.get('points'));
    this.$currentTime.text(this.pad(seconds) + ':' + this.pad(hundreths) + ':' + thousands);
  },
  pad: function(n) {
   return ((n < 10) ? '0' : '') + n;
  },
  handleChosen: function (data) {
    var model = data.model,
        chosenChoice,
        choiceClone;

    this.chosenVideo = model;
    this.watchedVideos.add(model);
    this.model.set('currentPoints', 0);
    this.video.pause();
    this.$video.prop('src', model.get('video').url);
    this.$video.trigger('pause');
    this.$videoWrapper.removeClass('paused playing');
    this.$videoWrapper.addClass('paused');
    this.$choices.addClass('fold');
    this.$choices.addClass(['first', 'second', 'third'][data.index]);
    this.chosenIndex = data.index;
    this.$choices.on(transitionend, _.once(this.transitionToVideo));
  },
  transitionToVideo: function() {
    this.$choices.off();
    $chosenChoice = this.$choices.find('li:eq(' + this.chosenIndex + ')');
    $chosenChoice.siblings().detach();
    $chosenChoice.css({
      height: $chosenChoice.innerHeight(),
      width: $chosenChoice.innerWidth()
    });
    $chosenChoice.addClass('deploy');
    this.$choiceList.addClass('deploy');
    this.$chosenChoice = $chosenChoice;
    setTimeout(function() {
      $chosenChoice.css({width: window.innerWidth + 'px', height: window.innerHeight + 'px'});
      $chosenChoice.on(transitionend, _.once(this.fadeToVideo));
    }.bind(this), 10);
  },
  fadeToVideo: function() {
    var model = this.chosenVideo;

    // update with video info
    this.renderMeta(model);
    this.$currentTitle.text(model.get('title'));

    // update the map
    if (model.has('coordinate')) {
      this.makeMap(model.get('coordinate')[1], model.get('coordinate')[0]);
    }

    // add thumbnail image
    this.$currentThumb.css({
      'backgroundImage': 'url(' + this.chosenVideo.get('thumbnail').url + ')'
    });

    // show banner, meta, etc...
    this.showUI();

    // fade to video
    this.$chosenChoice.off();
    this.$choices.addClass('fade-out');
    this.$choices.on(transitionend, _.once(function() {
      this.$choices.addClass('hidden');
      this.$choices.removeClass('show');
      this.$choices.off();
   }.bind(this)));
  },
  renderMeta: function(model) {
    var context = _.extend(model.toJSON(), {
      points: this.model.get('points')
    });
    this.$meta.html(this.currentVideoMetaTpl(context));
  },
  handleBucketLoad: function() {
    var numBuckets = this.model.buckets.length;
    NProgress.inc();
  },
  handleUsernameChange: function(evt) {
    var currentName = this.model.get('username');
        newName = $(evt.target).val();
    if (_.isString(newName) && newName.length && newName!== username) {
      this.model.set('username', newName);
    }
  }
});

module.exports = Application;
