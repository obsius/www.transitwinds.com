/***************************************
	Graphics Namespace
***************************************/
var Graphics = new function() {

function Coord(x, y) {
	this.x = x || 0;
	this.y = y || 0;
	
	this.applyVector = function(vector) {
		this.x += vector.x;
		this.y += vector.y;
	}
	
	this.distanceTo = function(coord) {
		return Math.sqrt(Math.pow(this.x - coord.x, 2) + Math.pow(this.y - coord.y, 2));
	}
}

function Vector(angle, magnitude) {
	this.angle = angle || 0;
	this.magnitude = magnitude || 0;
	
	this.x = Math.cos(this.angle) * this.magnitude;
	this.y = Math.sin(this.angle) * this.magnitude;
	
	this.add = function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		
		this.angle = Math.atan2(this.y, this.x);
		this.magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}
}

function Particle(coords, velocity, size, color) {
	this.coords = coords;
	
	this.velocity = velocity;
	
	this.size = size;
	this.color = color;
	
	this.run = function() {
		this.coords.applyVector(this.velocity);
	}
	
	this.applyPointForce = function(force) {
		this.velocity.add(new Vector(Math.atan2(this.coords.y - force.coords.y, this.coords.x - force.coords.x), force.magnitude));
	}
	
	this.applyGravityForce = function(force) {
		var forceMagnitude = (me.GRAVITATIONAL_CONSTANT * force.magnitude) / Math.max(Math.pow(this.coords.distanceTo(force.coords), 2), 10);
		this.velocity.add(new Vector(Math.atan2(this.coords.y - force.coords.y, this.coords.x - force.coords.x), forceMagnitude));
	}
	
	this.applyAngleForce = function(force) {
		this.velocity.add(new Vector(force.angle, force.magnitude));
	}			
}

function Color(r, g, b, a) {
	this.r = Math.min(r, 255);
	this.g = Math.min(g, 255);
	this.b = Math.min(b, 255);
	this.a = Math.min(a, 255);
}

this.Color = function(r, g, b, a) { return new Color(r, g, b, a); }

function PointForce(coords, magnitude) {
	this.coords = coords;
	this.magnitude = magnitude;
}

function AngleForce(angle, magnitude) {
	this.angle = angle;
	this.magnitude = magnitude;
}

function drawPixel(canvasData, coords, size, color, wrap) {

	if (!!!wrap) {
		if (coords.x < 0 || coords.x >= canvasData.width ||
			coords.y < 0 || coords.y >= canvasData.height) {
			return;
		}
	}

	var i = (Math.floor(coords.x) + Math.floor(coords.y) * canvasData.width) * 4;

	canvasData.data[i + 0] = color.r;
	canvasData.data[i + 1] = color.g;
	canvasData.data[i + 2] = color.b;
	canvasData.data[i + 3] = color.a;
}

this.SpaceEffect = function(canvas) {

	this.NUM_STARS = 60;

	this.COLOR_CHANGE_RATE = .025;
	
	this.canvas = canvas;

	
	this.particles = [];
	this.origin = new Coord(this.canvas.width / 2, this.canvas.height / 2);
	this.theForce = new AngleForce(0, .1);
	this.colorIndex = 0;
	
	
	this.spawn = function(x, y) {
		return new Particle(new Coord(x + (2 - (Math.random() * 4)), y + (2 - (Math.random() * 4))), new Vector(0, 0), 1, new Color(128 + Math.cos(this.colorIndex) * (255 - 174), 128 + Math.cos(this.colorIndex +  2 * Math.PI / 3) * 127, 128 + Math.cos(this.colorIndex + 4 * Math.PI / 3) * 127, 255));
	}
	
	this.spawnStar = function(x, y) {
		return new Particle(new Coord(Math.random() * this.canvas.width, 0), new Vector(Math.random() * .5 * Math.PI + .2 * Math.PI, Math.random() * 5 + 5), 1, new Color(128 + Math.cos(this.colorIndex) * (255 - 174), 128 + Math.cos(this.colorIndex +  2 * Math.PI / 3) * 127, 128 + Math.cos(this.colorIndex + 4 * Math.PI / 3) * 127, 255));
	}
	
	this.star = this.spawnStar();
	
	this.nextAlpha = 0;
	for (var i = 0; i < this.NUM_STARS; ++i) {
		this.nextAlpha = (this.nextAlpha + (255 / this.NUM_STARS)) % 255;
		this.particles[i] = new Particle(new Coord(this.star.coords.x + (2 - (Math.random() * 4)), this.star.coords.y + (2 - (Math.random() * 4))), new Vector(0, 0), 1, new Color(128 + Math.cos(this.colorIndex) * (255 - 174), 128 + Math.cos(this.colorIndex +  2 * Math.PI / 3) * 127, 128 + Math.cos(this.colorIndex + 4 * Math.PI / 3) * 127, this.nextAlpha));
	}
	
	this.render = function(ctx) {
		
		if (this.star.coords.x < 0 || this.star.coords.x >= this.canvas.width ||
			this.star.coords.y < 0 || this.star.coords.y >= this.canvas.height) {
		
			this.star = this.spawnStar();
		}
	
		//Lets blend the particle with the BG
		ctx.globalCompositeOperation = "lighter";
		
		this.star.run();

		for (var i in this.particles) {
			var particle = this.particles[i];
			
			particle.color.a -= 10;
			
			if (this.particles[i].color.a <= 0) {
				this.particles[i] = this.spawn(this.star.coords.x, this.star.coords.y);
			} else {
				//drawPixel(canvasData, this.particles[i].coords, this.particles[i].size, this.particles[i].color);
				ctx.beginPath();
				//ctx.globalAlpha = particle.color.a;
				//Time for some colors
				var gradient = ctx.createRadialGradient(particle.coords.x, particle.coords.y, 0, particle.coords.x, particle.coords.y, 10);
				
				gradient.addColorStop(0, 'rgba(' + parseInt(particle.color.r) + ',' + parseInt(particle.color.g) + ',' + parseInt(particle.color.b) + ',' + (particle.color.a / 255) + ')');
				gradient.addColorStop(1, 'rgba(' + parseInt(particle.color.r) + ',' + parseInt(particle.color.g) + ',' + parseInt(particle.color.b) + ',0)');
				
				ctx.fillStyle = gradient;
				//ctx.fillStyle = 'rgba(' + parseInt(particle.color.r) + ',' + parseInt(particle.color.g) + ',' + parseInt(particle.color.b) + ',' + (particle.color.a / 255) + ')';
				//ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
				ctx.arc(particle.coords.x, particle.coords.y, 10, Math.PI*2, false);
				ctx.fill();
			
			ctx.closePath();
			}
		}
		
		//drawPixel(canvasData, this.star.coords, this.star.size, this.star.color);
		
		this.colorIndex += this.COLOR_CHANGE_RATE;
		
		return true;
	}
}

this.Twinkle = function(canvas) {

	this.NUM_SATS = 100;

	this.COLOR_CHANGE_RATE = .025;
	
	this.canvas = canvas;

	this.particles = [];
	this.origin = new Coord(this.canvas.width / 2, this.canvas.height / 2);
	this.theForce = new PointForce(new Coord(this.origin.x, this.origin.y), .1);
	this.colorIndex = 0;
	
	for (var i = 0; i < this.NUM_SATS; ++i) {
		this.particles[i] = new Particle(new Coord(Math.random() * this.canvas.width, Math.random() * this.canvas.height), new Vector(0, Math.random() * 10), 1, new Color(255, 255, 255, 255));
	}
	
	this.wrap = function(point) {
		point.run();
		point.coords.x = point.coords.x.mod(this.canvas.width);
		point.coords.y = point.coords.y.mod(this.canvas.height);
	}
	
	this.render = function(ctx) {
	
		//Lets blend the particle with the BG
		ctx.globalCompositeOperation = "lighter";
		//var canvasData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

		for (var i in this.particles) {
			var particle = this.particles[i];
			this.wrap(particle);
		//	particle.applyPointForce(this.theForce);
		//	particle.color.a -= 10;
			
			if (this.particles[i].color.a <= 0) {
				//this.particles[i] = this.spawn(this.star.coords.x, this.star.coords.y);
			} else {
				//console.log(this.particles);
				
				ctx.beginPath();
				//ctx.globalAlpha = particle.color.a;
				//Time for some colors

				//ctx.fillStyle = 'rgba(' + parseInt(particle.color.r) + ',' + parseInt(particle.color.g) + ',' + parseInt(particle.color.b) + ',' + (particle.color.a / 255) + ')';
				ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
				ctx.arc(particle.coords.x, particle.coords.y, 1, Math.PI*2, false);
				ctx.fill();
			
			ctx.closePath();
				
				
			//	drawPixel(canvasData, particle.coords, particle.size, particle.color, true);
			}
		}
		
		
		//ctx.putImageData(canvasData, 0, 0);
		
		this.colorIndex += this.COLOR_CHANGE_RATE;
		
		return true;
	}
}

this.GraphicsEngine = function(canvas, image) {

	var me = this;
	
	this.RENDER_SLEEP_TIME = 25;
	
	this.STATE_RUNNING = 1;
	this.STATE_STOPPED = 0;
	
	this.canvas = canvas;
	this.image = image || null;
	if (!!image) { this.image = (new Image()).src = image; }
	
	this.context = this.canvas.getContext("2d");
	
	this.bufferCanvas = document.createElement('canvas');
	this.bufferCanvas.style.width = this.canvas.style.width;
	this.bufferCanvas.style.height = this.canvas.style.height;
	this.bufferCanvas.width = this.canvas.width;
	this.bufferCanvas.height = this.canvas.height;
	
	this.bufferContext = this.bufferCanvas.getContext("2d");
	
	if (!!this.image) {
		this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);
	}
	
	this.events = new EventManager();
	this.effects = new Array();
	
	this.lastRender = 0;
	
	this.state = this.STATE_STOPPED;
}

this.GraphicsEngine.prototype = {

	_render: function() {
	
		var me = this;

		var diff = performance.now() - this.lastRender;

		if (diff  <= 40) { setTimeout(function() { me._render(); }, diff); return; }
		this.lastRender = performance.now();
		
	
		if (this.state != this.STATE_RUNNING) { return; }
		
		this.clearCanvas();
		
		this.bufferCanvas.width = this.canvas.width;
		this.bufferCanvas.height = this.canvas.height;
		
		//this.bufferContext.putImageData(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
		//this.bufferContext.drawImage(this.canvas, 0, 0);
		
		for (var i = 0; i < this.effects.length; ++i) {
			if (!this.effects[i].render(this.context)) {
				this.removeEffect(this.effects[i]);
			}
		}
	//	this.bufferContext.putImageData(this.getCanvasData(this.bufferContext), 0, 0);
	//	this.setCanvasData(this.bufferCanvas);
		
		//setTimeout(function () { me._render() }, me.RENDER_SLEEP_TIME);
		
		window.requestAnimationFrame(function () { me._render() });
	},

	getCanvasData: function(context) {
		return context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	},
	
	setCanvasData: function(canvasData) {
		//this.context.putImageData(canvasData, 0, 0);
		this.context.drawImage(canvasData, 0, 0);
	},

	clearCanvas: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (!!this.image) { this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height); }
	},
	
	stop: function() {
		this.state = this.STATE_STOPPED;
		this.clearCanvas();
	},
	
	run: function() {
		if (this.state == this.STATE_STOPPED) {
			this.state = this.STATE_RUNNING;
			this._render();
		}
	},
	
	addEffect: function(effect) {
		this.effects.push(effect);
	},

	removeEffect: function(effect) {
		for (var i = 0; i < this.effects.length; ++i) {
			if (this.effects[i] === effect) {
				this.effects.splice(i, 1);
				i--;
			}
		}
	},
	
	clear: function() {
		this.stop();
		this.effects = new Array();
	}
};
} // end graphics namespace

/***************************************
	Event Manager
***************************************/
function EventManager() {

	this.listeners = {};
	this.singleListeners = {};
}
	
EventManager.prototype = {
	registerListener: function(event, callback) {
		if (!!!this.listeners[event]) {
			this.listeners[event] = new Array();
		}
		this.listeners[event].push(callback);
	},
	
	registerListenerOnce: function(event, callback) {
		if (!!!this.listeners[event]) {
			this.singleListeners[event] = new Array();
		}
		this.singleListeners[event].push(callback);
	},
	
	fireEvent: function(event, arg) {
	
		if (event in this.listeners) {
			var numListeners = this.listeners[event].length;
			for (var i = 0; i < numListeners; ++i) {
				this.listeners[event][i](arg);
			}
		}
		
		if (event in this.singleListeners) {
			var numSingleListeners = this.singleListeners[event].length;
			for (var i = 0; i < numSingleListeners; ++i) {
				this.singleListeners[event][i](arg);
			}
			
			this.singleListeners[event] = new Array();
		}
	}
}