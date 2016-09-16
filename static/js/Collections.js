window.app.Collections = function(collections) {
	var self = this;
	
	this.collections = collections;
	
	for (var name in this.collections) {
		var collection = this.collections[name];
		
		this[name] = (function(name) {
			return self.collections[name];
		})(name);
	
		collection.on('add', function() { self.fireTrigger('add', arguments); });
		collection.on('remove', function() { self.fireTrigger('remove', arguments); });
		collection.on('loaded', function() { self.fireTrigger('loaded', arguments); });
	}
	
	Object.defineProperty(this, 'models', {
		get: function() {
			return self.getModels();
		}
	});
	
	this.loaded = true;

};

window.app.Collections.prototype = _.extend({
	fireTrigger: function(type, args) {
		var arguments = _.union([type], args);
		this.trigger.apply(this, arguments);
	},
	
	getModels: function() {
		var models = [];
		_.each(this.collections, function(collection) {
			models = _.union(models, collection.models);
		});

		return models;
	},
	
	get: function(id) {
		var model = null;
		_.each(this.collections, function(collection) {
			collection.get(id);
		});
		
		return model;
	},
	
	length: function() {
		return this.models.length;
	},
	
	clone: function() { 
		return this;
	},
	
	reset: function() {}
	
}, Backbone.Events);