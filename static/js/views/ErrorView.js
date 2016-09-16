window.app.views.Error = Backbone.View.extend({
	el: '<div class="fill"></div>',
	events: {
		'click .nothing': 'nothing'
	},
	
	initialize: function(options) {
		this.template = window.app.loadTemplate('error', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		this.render(options.errorMessage);
	},
	
	render: function(message) {
		this.$parent.append(this.$el);
		$('#error-message').html(message);
	}
});