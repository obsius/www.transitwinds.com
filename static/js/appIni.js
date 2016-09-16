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

$.ajaxSetup({
	cache: false,
    beforeSend: function(xhr, settings)
    {
		if (settings.url && (!settings.headers || !settings.headers['Authorization'])) {
			if (settings.url.match(/reporting[^\.]*\.zoscomm.com/) || 
				settings.url.match(/restapi[^\.]*\.zoscomm.com/)) {
					
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(window.app.data.session.apiKey + ':' + window.app.data.session.apiPassword));
			}
			if (settings.url.match(/dashboard[^\.]*\.zoscomm.com/)) {
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(getParameterByName('key') + ':'));
			}
			if (settings.url.match(/localhost/)) {
				xhr.setRequestHeader('Authorization', 'Basic ' + btoa(getParameterByName('key') + ':'));
			}
		}
    }
});

// template parsing
_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,		// print value: {{ value_name }}
	evaluate: /\{%([\s\S]+?)%\}/g,		// excute code: {% code_to_execute %}
	escape: /\{%-([\s\S]+?)%\}/g		// excape HTML: {%- <script> %} prints &lt;script&gt
};

/*
 * Backbone overloads
 */

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

Backbone.View.prototype.error = function(e) {
	console.error('Failed to communicate with the server:', e);
	
	var errorMsg = 'Failed to communicate with the server.';
	
	if (!!this.loadingView) { this.loadingView.hide(); }
	if (!!this.errorView) { this.errorView.hide(); }
	
	this.errorView = new window.app.views.Error({ $parent: this.$parent, errorMessage: errorMsg });
};


// todo: error handling
Backbone.Collection.prototype.save = function(options) {
	
	_.each(this.addedModels, function(model) {
		model.save();
	});
	
	_.each(this.changedModels, function(model) {
		model.save();
	});
	
	_.each(this.removedModels, function(model) {
		model.destroy();
	});
}

Backbone.Model.prototype.isMatch = function(againstModel) {
	return _.isMatch(againstModel.toJSON(), this.toJSON());
}


Backbone.Collection.prototype.parse = Backbone.Model.prototype.parse = function(resp, options) {

	if ($.isXMLDoc(resp) || typeof resp != 'object') {
		return;
	}
	
	return resp;
}


// just like fetch, but if data is already loaded somewhere
Backbone.Collection.prototype.build = function(data, options) {
	options = _.extend({parse: true}, options);

	var method = options.reset ? 'reset' : 'set';
	
	this[method](data, options);
	this.loaded = true;
	this.trigger('sync', this, data, options);
	
	return this;
};
Backbone.Model.prototype.build = function(data, options) {

	options = options || {};

	var method = options.reset ? 'reset' : 'set';
	
	this.set(this.parse(data, options), options);
	
	//this.loaded = true;
	//this.trigger('sync', this, data, options);
	
	return this;
};

Backbone.sync = function(method, model, options) {
	var type = methodMap[method];
	
	// trigger loading
	if (type == 'GET') {
		model.loaded = false;
		model.trigger('loading');
	}

	// Default options, unless specified.
	_.defaults(options || (options = {}), {
		emulateHTTP: Backbone.emulateHTTP,
		emulateJSON: Backbone.emulateJSON
	});

	// Default JSON-request options.
	var params = {type: type, dataType: 'json'};

	if (!options.url) {
		params.url = _.result(model, 'url');
	}

	// Ensure that we have the appropriate request data.
	if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
		params.contentType = 'application/json';
		params.data = JSON.stringify(options.attrs || model.toJSON(options));
	}

	// For older servers, emulate JSON by encoding the request into an HTML-form.
	if (options.emulateJSON) {
		params.contentType = 'application/x-www-form-urlencoded';
		params.data = params.data ? {model: params.data} : {};
	}

	// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	// And an `X-HTTP-Method-Override` header.
	if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
		params.type = 'POST';
		if (options.emulateJSON) params.data._method = type;
			var beforeSend = options.beforeSend;
			options.beforeSend = function(xhr) {
				xhr.setRequestHeader('X-HTTP-Method-Override', type);
				if (beforeSend) return beforeSend.apply(this, arguments);
		};
	}

	// Don't process data on a non-GET request.
	if (params.type !== 'GET' && !options.emulateJSON) {
		params.processData = false;
	}
	
	if (params.type != 'GET') {
		window.app.syncView.show(model.cid);
	}
	
	// Pass along `textStatus` and `errorThrown` from jQuery.
	var error = options.error;
	options.error = function(xhr, textStatus, errorThrown) {
		options.textStatus = textStatus;
		options.errorThrown = errorThrown;

		window.app.displayAppError('A server API error has occured: ' + errorThrown);
		
		if (error) error.call(options.context, xhr, textStatus, errorThrown);
	};
	
	var complete = options.complete;
	var context = options.context;
	options.complete = function(e, xhr, options) {
		window.app.syncView.hide(model.cid);
		
		model.loaded = true;
		model.trigger('loaded');
		
		if (complete) complete.call(context, e, xhr, options);
	};

	// Make the request, allowing the user to override any Ajax options.
	var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
	
	model.trigger('request', model, xhr, options);
	
	return xhr;
};

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
	'create': 'POST',
	'update': 'PUT',
	'patch':  'PATCH',
	'delete': 'DELETE',
	'read':   'GET'
};

}