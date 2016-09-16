window.app.views.Sync = Backbone.View.extend({
	el: '<div></div>',
	events: {},
	
	initialize: function(options) {
		var self = this;
		
		this.template = window.app.loadTemplate('sync');
		this.$el.append(this.template);
		
		this.hidden = false;
		
		// visibility throttle for quick show/hide commands
		this.hideThrottle = _.debounce(function() {
			if (!self.hidden && !_.size(self.waitingOn)) {
				self.hidden = true;
				this.$('.root').modal('hide');
			}
		}, 200);
		
		this.waitingOn = {};
		this.render();
	},
	
	render: function() {
		$('body').append(this.$el);
	},
	
	show: function(id) {
		this.hidden = false;
		this.waitingOn[id] = true;
		this.$('.root').modal('show');
	},
	
	hide: function(id) {
		if (id) {
			delete this.waitingOn[id];
		} else {
			this.waitingOn = {};
		}
		
		this.hideThrottle();
	}
});