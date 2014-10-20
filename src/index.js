var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');

var Application = require('./Application');
var AppModel = require('./AppModel');
var app;

$(document).ready(function() {
  model = new AppModel();
  app = new Application({
    el: $('#game'),
    model: model
  });

  window.app = app;
  window.model = model;
});
