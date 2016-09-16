window.app.views.Loading = Backbone.View.extend({
	el: '<div class="full-overlay emblem-background"></div>',
	events: {},
	
	initialize: function(options) {
		this.template = window.app.loadTemplate('loading', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		this.dontShow = !!options.dontShow;
		this.noHeader = !!options.noHeader;
		this.lite = !!options.lite;
		
		this.displayed = false;
		
		if (this.noHeader) { this.$('h3').remove(); }
		if (this.lite) { this.$('.root').addClass('lite'); }
		
		if (!this.dontShow) { this.show(); }
	},
	
	show: function() {
		if (!this.displayed) {
			this.displayed = true;
			this.$parent.append(this.$el);
			this.resize();
		}
	},
	
	hide: function() {
		if (this.displayed) {
			this.displayed = false;
			this.$el.detach();
		}
	},
	
	resize: function() {
		var margin = Math.max((this.$parent.height() - this.$('.loading-box').outerHeight()) / 2, 0);
		this.$('.loading-box').css('margin-top', margin);
	}
});