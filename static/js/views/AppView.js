window.app.views.App = Backbone.View.extend({
	el: '<div class="fill"></div>',
	events: {
		'change select.has-list-enabler': 'handleList',
		'click .div-toggler': 'toggleDiv',
		'click [data-href]': 'gotoLink',
		'click [data-ehref]': 'openLink'
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
	
	gotoLink: function(e) {
		window.open($(e.target).data('href'), '_self');
	},
	
	openLink: function(e) {
		window.open($(e.target).data('ehref'), '_blank');
	},
	
	route: function(page, path) {
	    var self = this;

		if (!!this.pageView) {
			this.pageView.hide();
		}
		
		// make sure the page container is empty and the app bar cleared
		$('#page').empty();
		$('#app-bar').empty();
		
	//	if (!!this.pages[page] && !this.pages[page].reload) {
		if (!!this.pages[page]) {
			this.pageView = this.pages[page];
		} else {
			var view = window.app.getView(page);
			if (!!view) {
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
		
		// set nav for page
		this.setNavs(page);
	},
	
	setNavs: function(page) {
		console.log(this.$('#top .item'));
		var $activeOption = this.$('#top .item').filter(function() {
			if (!$(this).data('href')) { return false; }
			return $(this).data('href').match(new RegExp('#App\\/' + page));
		});
		console.log($activeOption);
		if ($activeOption) { $('#top .active').removeClass('active'); }
		$activeOption.addClass('active');
	},
	
	showError: function(e) {
		var $label = $(e.currentTarget);
		
		var label = $label.text();
		var msg = $label.find('.error-details').data('msg');
		
		new window.app.views.Modal({
			error: true,
			message: subVars(msg, { field: label}, 'error-field')
		});
	},
	
	render: function() {
		var self = this;
		
		this.pages = {};
		this.pageView = null;
		
		$('title').html(window.app.title());
		

		//this.pageView = new window.app.views.Loading({ $parent: this.$el });
		//this.pageView.show();
	}
});