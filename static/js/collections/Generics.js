window.app.collections.Generics = Backbone.Collection.extend({
	model: window.app.models.Generic,
	initialize: function(models, options) {
		if (options) {
			this.ownerID = options.ownerID;
		}
	},
	
	load: function(searchInfo, pageInfo) {
		if (searchInfo) { this.searchInfo = searchInfo; }
		if (pageInfo) { this.pageInfo = pageInfo; }
		
		this.fetch({ reset: true });
	}
});