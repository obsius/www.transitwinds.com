// script to initialize all thirdparty plugins and perform app setup
function appIni() {

// only fade screen once
$(document).on('show.bs.modal', '.modal', function() {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function() {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});

$(document).on('click', '[data-link]', function(e) {
	e.stopPropagation();
	window.app.navTo($(this).data('link'));
});

// check for session timeout
$(document).ajaxError(function(e, xhr, settings, error) {
	if (xhr.status == 401 || xhr.status == 403) {
		window.location.href = window.location.href;
	}
});

// template parsing
_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,     // print value: {{ value_name }}
	evaluate: /\{%([\s\S]+?)%\}/g,     // excute code: {% code_to_execute %}
	escape: /\{%-([\s\S]+?)%\}/g       // excape HTML: {%- <script> %} prints &lt;script&gt
};

// backbone overloads

Backbone.View.prototype.resize = function() {

	// if it's not being shown, don't resize
	if (!this.$el.parent().length) { return; }

	if (this.views) {
		_.each(this.views, function(view) {
			if (view.$el.parent().length) {
				if (view.$el.parent().width() > 0 && view.$el.parent().height() > 0) {
					view.resize();
				}
			}
		});
	}
};

Backbone.View.prototype.show = function() {

	this.$parent.append(this.$el);
	this.resize();

	if (this.currentView) {
		this.currentView.show();
	}
};

Backbone.View.prototype.reload = function() {

	this.hide();
	
	this.$el.empty();
	this.$el = $(this.el);
	
	this.show();
	
	this.render();
	this.delegateEvents();
};

Backbone.View.prototype.hide = function() {
	
	if (this.currentView) {
		this.currentView.hide();
	}
	
	this.$el.detach();
};

Backbone.View.prototype.route = function() {
	this.show();
};

}