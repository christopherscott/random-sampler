var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('./Backbone');

var ChoiceView = Backbone.View.extend({
  tagName: 'li',
  className: 'choice',
  template: _.template($('#choiceTpl').html()),
  events: {
    'click': 'handleClick'
  },
  initialize: function(options) {
    this.app = options.app;
    this.index = options.index;
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  handleClick: function() {
    this.app.trigger('chosen', {
      model: this.model,
      index: this.index
    });
    this.$el.addClass('chosen');
  }
});

module.exports = ChoiceView;
