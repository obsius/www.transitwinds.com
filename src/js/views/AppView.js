window.app.setView('App', Backbone.View.extend({

	el: '<div class="fill"></div>',

	events: {
		'change select.has-list-enabler': 'handleList',
		'click .div-toggler': 'toggleDiv',
		'click [data-href]': 'gotoLink',
		'click [data-ehref]': 'openLink',
		'click [data-album-ref]': 'openImage',
		'click .expandable': 'openImage'
	},
	
	initialize: function() {
		var self = this;
		
		this.template = window.app.loadTemplate('app', window.app.data);
		this.$el.append(this.template);
		
		this.resize = _.debounce(function() {
			if (!!self.pageView) { self.pageView.resize(); }
		}, 50, false);
		
		$(window).on('resize', function() { self.resize(); });
		
		$('body').prepend(this.$el);
		
		this.render();
	},
	
	openImage: function(e) {
		new window.app.views.ImageViewer({
			$parent: $(this.$el),
			$img: $(e.target)
		});
	},
	
	gotoLink: function(e) {
		window.open($(e.target).data('href'), '_self');
	},
	
	openLink: function(e) {
		window.open($(e.target).data('ehref'), '_blank');
	},
	
	route: function(page, path) {

		if (!!this.pageView) {
			this.pageView.hide();
		}

		// make sure the page container is empty and the app bar cleared
		$('#page').empty();
		$('#app-bar').empty();

		if (!!this.pages[page]) {
			this.pageView = this.pages[page];
		} else {

			var view = window.app.getView(page);

			if (view) {
				this.pages[page] = new view({ $parent: $('#page'), path: path});
				this.pageView = this.pages[page];
			} else {
				this.pageView = new window.app.views.Error({ $parent: $('#page'), errorMessage: '404: Page not found.' });
			}
		}
		
		this.pageView.show();
		
		if (path) {

			var matches = path.match(/([^\/]*)\/?(.*)/);

			if (page) {
				this.pageView.route(matches[1], matches[2]);
			}
		}

		this.setNavs(page);
	},
	
	setNavs: function(page) {

		var $activeOption = this.$('#top .item').filter(function() {
			if ($(this).data('href')) {
				return $(this).data('href').match(new RegExp('#app\\/' + page));
			} else {
				return false;
			}
		});

		if ($activeOption) {
			$('#top .active').removeClass('active');
			$activeOption.addClass('active');
		}
	},
	
	render: function() {
		
		this.pages = {};
		this.pageView = null;
		
		$('title').html(window.app.title());
	}
}));