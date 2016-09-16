window.app.views.Projects = Backbone.View.extend({
	el: '<div class="fill"></div>',
	events: {
		'click .skill-tag': 'openLink'
	},
	
	initialize: function(options) {
		this.template = window.app.loadTemplate('projects', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		
		this.render();
	},
	
	render: function() {
		
		this.$parent.append(this.$el);
	}
});