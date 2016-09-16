window.app = {
    views: {},
    models: {},
    collections: {},
    templates: {},
	router: {},
	
	// local storage of re-usable models/collections
	localData: {
		models: {},
		collections: {}
	},
	
	errorView: null,
	displayAppError: function(errorMsg) {
		var self = this;
		
		if (this.errorView) {
			//errorView.addError(errorMsg);
		} else {
			self.errorView = new window.app.views.Modal({
				error: true,
				message: errorMsg,
				onAction: function() {
					self.errorView = null;
				}
			});
		}
	},
	
	dataPorts: {}, 
	
	codes: {},
	
	// for blocking usage during critical server sync events
	syncView: {},

    name: 'ngc6822',
    version: '1.0',
    date: '08/12/2016',

    compiled: false,

	rootPath: '',
    relPath: 'static/js',
    tplPath: 'static/tpls',
	localesPath: 'locales',

    dataSource: 'AppData.json',

    nextUID: 0,

    // some rest services respond with http error codes (4xx), but not because of a failure
    validHTTPErrorResponses: [404],

    title: function () {
        return this.name;
    },

    urlParams: function(couples) {

        if (couples == null) { couples = {}; }

        var queryString = '?';
        for (var i in couples) {
            queryString += i + '=' + couples[i] + '&';
        }

        return queryString;
    },
	
	reload: function(callback) {
		var self = this;
		
		this.localData = {
			models: {},
			collections: {}
		};
		
		$.ajax({
			url: '/AppData',
			async: true,
			success: function(json) {
				self.data = json;

				self.views.App.render();
			
				// refire the router (buggy redir twice)
				var hash = window.location.hash;
				var pageArray = hash.match(/(#App\/[^\/]*)/gm);
				if (pageArray) {
					var page = pageArray[0];

					self.router.navigate('#', {trigger: false, replace: true});
					self.router.navigate(page, {trigger: true, replace: true});
				} else {
					self.views.App.route('Devices');
				}
				
				callback();
			}
		});
	},

    initialize: function () {
        var self = this;
		
		// run out ini script
		appIni();
				
		// load the master template file if this build is compiled
		if (self.compiled) {
			$.ajax({
				url: concatURLs(self.rootPath, self.tplPath, self.data.build.tplSource),
				dataType: 'text',
				async: false,
				error: function () {
					console.error('Unable to load compiled template file.');
				},
				success: function (data) {
					$('body').append(data);
					self.initializationComplete();
				}
			});
		} else {
			SourceDependencies.loadSources(self.data.sources, function() { self.initializationComplete(); });
		}

        /* not done yet (the initializationComplete function will be called after the scripts load) */
    },

    initializationComplete: function() {
        var self = this;

        // show framework view
        this.views.App = new this.views.App();

        //define router class
        var AppRouter = Backbone.Router.extend({
            routes: {
                'App/:p': 'appRouter',
                'App/:p/*path': 'appRouter'
            },

            appRouter: function (page, path) {
                self.views.App.route(page, path);
            }
        });

        // start routing requests
        this.router = new AppRouter();
        Backbone.history.start();

		// sync view singleton
		this.syncView = new this.views.Sync();
		
		// important global stuff
		this.$domPhantom = $('body').append('<div id="dom-phantom" style="display:none"></div>');
		
		// let there be light!
		$(this).trigger('initialized');

		console.log('all scripts loaded in ' + ((new Date()).getTime() - window.beginLoadTime.getTime()) + ' ms');

		// load the default page in the absence of one
		if (!location.hash) {
			self.views.App.route('Home');
		}
    },
	
	navTo: function(urlHash) {
		this.router.navigate('#', {trigger: false, replace: false});
		this.router.navigate(urlHash, {trigger: true, replace: true});
	},
	
	globalVarUpdate: function(name, ref, value) {
		$('[data-var-name="' + name + '"][data-ref="' + ref + '"]').html(value);
	},
	

    // return a view (and check for admin views)
    getView: function(name) {

        if (!!this.views[name]) {
            return this.views[name];
        }

        return null;
    },

    getUID: function() {
        return 'uid-' + this.nextUID++;
    },

    // load a html template
    loadTemplate: function(name, data) {

        var retTemplate = null;

        if (!this.templates[name]) {
            var templateString;

            if (this.compiled) {
                var templateName = '';
                if (name.lastIndexOf('/') > 0) {
                    templateName += name.substr(name.lastIndexOf('/') + 1);
                } else {
                    templateName += name;
                }
				
                templateString = $('#' + templateName).html();
				
				if (!templateString) {
					console.error('failed to load template: ' + templateName);
				}
            } else {
                $.ajax({
                    url: concatURLs(this.rootPath, this.tplPath, name) + '.html',
                    dataType: 'text',
                    method: 'GET',
                    async: false,
                    success: function (data) {
                        if (/^\w*<script/i.test(data)) {
                            var matches = /^\w*<script[^>]*>([\S\s]*)<\/script>/i.exec(data);
                            data = matches[1];
                        }
                        templateString = data;
                    }
                });
            }

            this.templates[name] = _.template(templateString);
        }

        if (!!data) {
            retTemplate = this.templates[name](data);
        } else {
            retTemplate = this.templates[name];
        }

        return retTemplate;
    }
};

/* common global namespace stuff */

function keyValueToArray(kv, keyName, valName) {

	var retArray = [];
	
	if (!keyName) { keyName = 'key'; }
	if (!valName) { valName = 'value'; }
	
	for (var key in kv) {
		var item = {};
		item[keyName] = key;
		item[valName] = kv[key];
		retArray.push(item);
	}

	return retArray;
}

// real mod function
Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function concatURLs() {
    var retURL = '';

    if (!arguments || arguments.length === 0) {
        return '';
    }

    try {
        retURL += String(arguments[0]);

        for (var i = 1; i < arguments.length; ++i) {

			var lengthBefore = retURL.length;
		
            var arg = String(arguments[i]);

            if (arg.length == 0) {
                continue;
            }

            if (retURL.charAt(retURL.length - 1) == '/') {
                if (arg.charAt(0) == '/') {
                    retURL += arg.substr(1, arg.length - 1);
                } else {
                    retURL += arg;
                }
            } else {
                if (arg.charAt(0) == '/' || lengthBefore == 0) {
                    retURL += arg;
                } else {
                    retURL += '/' + arg;
                }
            }
        }
    } catch (e) {
        return '';
    }

    return retURL;
}


// data ports
function DataPort() {
	this.data = [];
	this.callback = null;
}
DataPort.prototype = {
	read: function() {
		if (this.data.length) {
			return this.data.splice(this.data.length - 1, 1)[0];
		}
		
		return null;
	},
	
	write: function(data) {
		this.data.push(data);
		if (this.callback) { this.callback.call(this); }
	},
	
	listen: function(callback) {
		this.callback = callback;
		if (this.data.length) { this.callback.call(this); }
	}
};

// loads sources and handles in referenced order
function SourceDependencies() { }
SourceDependencies.loadSources = function(sources, callback) {

    var sourceDependencies = new SourceDependencies();

    sourceDependencies.sources = sources;
    sourceDependencies.callback = callback || new function() { };

    sourceDependencies._orderSources(sources);
    sourceDependencies._load(0);
};
SourceDependencies.prototype = {

    _orderSources: function () {

        this.orderedSources = [];

        for (var i = 0; i < Object.keys(this.sources).length; ++i) {

            var cleanRun = true;
            for (var source in this.sources) {
                var dependsOn = this.sources[source];
                var indexSource = this.orderedSources.indexOf(source);

                if (!!dependsOn && dependsOn.length) {

                    var maxIndexDependency = -1;
                    for (var index in dependsOn) {

                        var dependencyIndex = this.orderedSources.indexOf(dependsOn[index]);

                        if (dependencyIndex > maxIndexDependency) {
                            maxIndexDependency = dependencyIndex;
                        }
                    }

                    if (indexSource == -1 && maxIndexDependency == -1) {
                        this.orderedSources.push(source); cleanRun = false;
                    } else {
                        if (indexSource == -1) {
                            this.orderedSources.splice(maxIndexDependency + 1, 0, source); cleanRun = false;
                        } else if (indexSource < dependencyIndex) {
                            this.orderedSources.splice(indexSource, 1);
                            this.orderedSources.splice(maxIndexDependency, 0, source); cleanRun = false;
                        }
                    }
                } else if (indexSource == -1) {

                    this.orderedSources.push(source); cleanRun = false;
                }
            }

            if (cleanRun) {
                break;
            }

            if (i == this.sources.length - 1 && !cleanRun) {
                throw exception('circular dependencies');
            }
        }
    },

    _load: function(i) {
        var self = this;

        $.ajax({
            crossDomain: true,
            dataType: 'script',
            url: self.orderedSources[i],
            cache: true,
            async: true,
            success: function () {
                if (i == self.orderedSources.length) {
                    self.callback();
                } else {
                    self._load(i + 1);
                }
            },
            error: function () {
                console.log('failed to load script: ' + this.url);
            }
        });
    }
};

function getFile(source, credentials, callback) {
    var xmlHTTP = new XMLHttpRequest();

    xmlHTTP.onreadystatechange = function() {
        if (xmlHTTP.readyState == 4) {
			// check for zero for localhost loads
            if (xmlHTTP.status == 200 || xmlHTTP.status == 0) {
                callback(xmlHTTP.responseText);
            }
        }
    }
	
    xmlHTTP.open('get', source, false);
	if (credentials) { xmlHTTP.setRequestHeader('Authorization', 'Basic ' + btoa(credentials)); }
    xmlHTTP.send();
}

/* pre-load thirdparty scripts, then call main() */
(function() {
    var loadRemainingCount = 0;

	// manual flag for data
	getFile(concatURLs(window.app.rootPath, window.app.relPath, window.app.dataSource), null, function (response) {
    //getFile('/v2/AppData', getParameterByName('key') + ':', function (response) {

        window.app.data = JSON.parse(response);
		
		window.app.rootPath = window.app.data.build.rootPath;
		window.app.compiled = window.app.data.build.compiled;

		if (window.app.compiled) {
			signal();
			return;
		}
		
        var sources = window.app.data['thirdpartySources'];
		
        loadRemainingCount = sources.length;
        for (var i = 0; i < sources.length; ++i) {
            var script = document.createElement('script');
            script.src = sources[i];
            script.async = false;

            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.onreadystatechange = null;
                        signal();
                    }
                };
            } else {
                script.onload = function () {
                    signal();
                };
            }

            document.head.appendChild(script);
        }
    });

    function signal() {
        if (--loadRemainingCount <= 0) {
            window.app.initialize();
        }
    }
})();