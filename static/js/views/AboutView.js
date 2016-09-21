window.app.views.About = Backbone.View.extend({
	el: '<div class="fill"></div>',
	events: {
		'click .skill-tag': 'openLink'
	},
	
	initialize: function(options) {
		this.template = window.app.loadTemplate('about', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		
		this.render();
	},
	
	render: function() {
		
		this.$canvas = this.$('#about-canvas');
		this.canvas = this.$('#about-canvas')[0];

		this.$parent.append(this.$el);
	},
	
	resize: function() {
		this.canvas.width = $(window).width() / 1;
		this.canvas.height = $(window).height() / 1;
		
		if (this.graphics) {
			this.graphics.clear();
			this.graphics = null;
		}
		
		this.graphics = new Graphics.GraphicsEngine(this.canvas);
		this.graphics.addEffect(new Graphics.SpaceEffect(this.canvas));
		this.graphics.addEffect(new Graphics.Twinkle(this.canvas));
		this.graphics.run();
	}
});