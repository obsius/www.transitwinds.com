window.app.views.ImageViewer = Backbone.View.extend({
	el: '<div class="absolute"></div>',
	events: {
		'click img': 'nextImg',
		'click .blackout': 'close'
	},
	
	initialize: function(options) {
		var self = this;
		
		this.template = window.app.loadTemplate('image-viewer', window.app.data);
		this.$el.append(this.template);
	
		this.$parent = options.$parent;
		this.$img = options.$img;
		this.imageCur = 0;
		
		var albumRef = this.$img.data('album-ref');
		if (albumRef) {
			$.getJSON(albumRef, function(data) {
				self.data = data;
				
				self.showImage(self.data.images[self.imageCur]);
			});
		} else {
			this.data = {
				images: [
					{
						title: this.$img.data('data'),
						src: this.$img.attr('src'),
						caption: this.$img.data('caption')
					}
				]
			};
			
			this.showImage(this.data.images[this.imageCur]);
		}
		
		this.render();
	},
	
	render: function() {
		
		this.$parent.append(this.$el);
	},
	
	close: function() {

		this.$el.remove();
		this.$el = null;
	},
	
	showImage: function(imageData) {
		this.$('.img-modal img').attr('src', imageData.src);
		this.$('.img-modal div').html(imageData.caption);
	},
	
	nextImg: function() {
		var imageData = this.data.images[++this.imageCur % this.data.images.length];
		this.showImage(imageData);
	}
});