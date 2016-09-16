window.app.views.Object = Backbone.View.extend({
	events: {
		'click .nav-search-header': 'openViewList',
		'click .nav-view-list-header': 'openView',
		'click .nav-action-list-header': 'openActionList',
		'click .nav-action-list-item': 'openActionView'
	},
	
	route: function(page, path) {
		if (page) {
			if (this.views[page]) {
				this.navAcc.accordion({ active: 2 });
				this.openActionView(null, page);
			} else if (isGUIDLike(page)) {
				this.openObject(page);
				if (path) {
					this.views.viewList.fireTrigger(page, path);
				}
			}
		}
	},
	
	openObject: function(guid, object) {
		var self = this;
		var viewID = 'details_' + guid;

		if (!object) {
			object = new window.app.models[this.modelType]({ 
				id: guid
			});
		}
		
		// add the object to the collection
		this.collection.add(object);

		// update the search accordion
		this.navAcc.accordion({ active: 1 });
		
		// check if the view is already rendered
		if (!this.views[viewID]) {
			this.views[viewID] = new window.app.views[this.viewType]({
				$parent: this.$('.view-pane'),
				model: object
			});
			
			this.views[viewID].on('editToggled', function() { self.views.viewList.toggleEditing(guid, 'details'); });
		}
		
		// update the view list
		this.views.viewList.addViewItem(guid, object.get('name'), this.viewListOptions, true);
		
		// change view (via force on the view list)
		this.views.viewList.fireTrigger();
	},
	
	changeView: function(newView) {
		if (newView && newView != this.currentView) {
			if (this.currentView) { this.currentView.hide(); }

			this.currentView = newView;
			this.currentView.show();
		}
	},
	
	removeView: function(id) {
		var self = this;
		
		if (this.viewListOptions) {
			_.each(this.viewListOptions, function(option) {
				var viewName = option.id + '_' + id;
				
				if (self.views[viewName]) {
					self.views[viewName].hide();
					delete self.views[viewName];
				}
			});
		} else {
			if (this.views[id]) {
				this.views[id].hide();
				delete this.views[id];
			}
		}
	},
	
	openViewList: function() {
		this.changeView(this.views.list);
	},
	
	openView: function() {
		this.views.viewList.fireTrigger();
	},
	
	openActionList: function(e) {
		var $listContainer = $(e.currentTarget).next();
		var $item = $listContainer.find('.nav-action-list-item.active');
		
		if (!$item.length) {
			$item = $listContainer.find('.nav-action-list-item:first');
		}
		
		this.openActionView(null, $item.data('view'));
	},
	
	openActionView: function(e, viewName) {
	
		var $item;
		
		if (!viewName) {
			$item = $(e.currentTarget);
		} else {
			$item = this.$('[data-view="' + viewName + '"]');
		}
		
		$item.parent().find('.nav-action-list-item.active').removeClass('active');
		$item.addClass('active');
		
		this.changeView(this.views[$item.data('view')]);
	}
});