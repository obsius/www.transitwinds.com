window.app.views.Modal = Backbone.View.extend({
	el: '<div></div>',
	events: {
		'click #modal-action': 'action'
	},
	
	initialize: function(options) {
		var self = this;
		
		this.template = window.app.loadTemplate('modal/modal');
		
		if (!!options) {
		    this.message = options.message;
			this.$innerEl = options.$innerEl;
			
		    this.actionButtonText = options.actionButtonText || 'Ok';
			this.closeButtonText = options.closeButtonText || 'Close';
			
		    this.viewOptions = options.viewOptions;
			
		    this.onAction = options.onAction;
			this.onIni = options.onIni;
			this.onResize = options.onResize;
			
			this.title = options.title;
			this.mode = options.mode || window.app.views.Modal.CLOSE;
			this.modalCSS = options.modalCSS;
			this.bodyClass = options.bodyClass;
			
			this.error = !!options.error;
			this.success = !!options.success;
			
			if (this.error) {
				this.title = "Error";
				this.mode = window.app.views.Modal.CLOSE;
			}
			
			if (this.success) {
				this.title = "Success";
				this.mode = window.app.views.Modal.CLOSE;
			}
		}
		
		// add event to unbind :: $(window).on('resize', function() { self.resize(); });
		$(window).on('resize', function() { self.resize(); });
		
		this.$el.html(this.template($.extend({
			title: this.title,
			mode: this.mode,
			message: this.message,
			actionButtonText: this.actionButtonText,
			closeButtonText: this.closeButtonText
		}, window.app.data)));

		this.render();
	},
	
	show: function() {
		this.render();
	},
	// TODO add loading sreen
	render: function() {
		var self = this;
		
		$('#container').append(this.$el);
		
		this.$('#modal-window').on('shown.bs.modal', function() {
			if (self.$innerEl) { self.$('#modal-body').append(self.$innerEl); }
			if (self.onIni ) { self.onIni(); }
			self.resize();
		});
		
		if (this.modalCSS) {
			this.$('.modal-dialog').addClass(this.modalCSS);
			this.$('.modal-body').addClass(this.modalCSS);
		}
		
		if (this.bodyClass) { this.$('.modal-body').addClass(this.bodyClass); }
		
		if (this.error) { this.$('.modal-header').addClass('error'); }
		if (this.success) { this.$('.modal-header').addClass('success'); }
		
		this.$('#modal-window').on('hidden.bs.modal', function(){ self.$el.detach(); });
		this.$('#modal-window').modal('show');
	},
	
	action: function() {
		if (this.onAction) {
		    if (this.onAction()) {
		        this.$('#modal-window').modal('hide');
		    } else {
			
			}
		} else {
			this.$('#modal-window').modal('hide');
		}
	},
	
	resize: function() {
		if (this.onResize) { this.onResize(); }
	}
});

window.app.views.Modal.CLOSE =	    0x0;
window.app.views.Modal.ACTION = 	0x1;