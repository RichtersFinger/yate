const PointerSize = 75;
const PointerLifeTime = 5000;
const PointerKillDuration = 250;
const pointercolors = ["#00ff00", "#006400", "#ff0000", "#ffd700", "#0060ad", "#00ffff", "#ff00ff", "#aaaaaa"];
const Pointer_arrowscalefactor = 1.0/(46.08 + 44.86);
const Pointer_arrowoutline_r = [44.86, 46.02, 46.0, 45.93, 45.83, 45.7, 45.48, 11.2, 14.32, 17.76, 20.28, 22.11, 23.05, 23.6, 23.97, 24.72, 25.18, 24.49, 25.57, 25.51, 25.32, 45.17, 45.47, 45.63, 45.8, 45.91, 45.98, 46.04, 46.07, 46.08,
								46.07, 46.04, 45.98, 45.91, 45.8, 45.63, 45.47, 45.17, 25.32, 25.51, 25.57, 24.49, 25.18, 24.72, 23.97, 23.6, 23.05, 22.11, 20.28, 17.76, 14.32, 11.2, 45.48, 45.7, 45.83, 45.93, 46.0, 46.02, 44.86];
const Pointer_arrowoutline_phi = [180.0, 167.12, 166.7, 166.49, 166.33, 166.19, 166.06, 102.08, 102.88, 104.29, 105.54, 106.55, 107.09, 107.22, 107.11, 106.38, 105.45, 104.31, 103.46, 102.44, 101.66, 1.98, 1.72, 1.52, 1.22, 0.92, 0.69, 0.38, 0.17, 0.0,
									-0.17, -0.38, -0.69, -0.92, -1.22, -1.52, -1.72, -1.98, -101.66, -102.44, -103.46, -104.31, -105.45, -106.38, -107.11, -107.22, -107.09, -106.55, -105.54, -104.29, -102.88, -102.08, -166.06, -166.19, -166.33, -166.49, -166.7, -167.12, -180.0];
const notificationsoundpath = "sound/_server_/pling.mp3";

class Pointer {
	constructor(someid, parentdiv, someowner, x0, y0, somecolor) {
		this.id = someid;
		var currentdate = new Date();
		this.timestamp = currentdate.getTime();
		this.owner = someowner;
		this.x = x0;
		this.y = y0;
		this.color = somecolor;
		this.size = PointerSize;
		this.thisradius = 1.0;
		this.arrowdirection = 0.0;
		this.offscreen = false;

		this.beingkilled = false;
		this.killtime = 0;

		this.thisdiv = document.createElement('div');
		this.thisdiv.addEventListener('mousedown', e => {
			if (this.owner !== player) {
				this.color = "#cccccc";
				this.thiscanvas.style.opacity = 0.5;
				var prepkillfunction = (function (ref){
								return function(){
									prepareforkill(ref);
								};
						}(this));
				var killfunction = (function (ref){
								return function(){
									killanimation(ref);
								};
						}(this));
				var timer = setTimeout(prepkillfunction, 0);
				var timer2 = setTimeout(killfunction, PointerKillDuration + 50);
			}
		});

		this.thisdiv.style.position = "absolute";
		this.thisdiv.style.zIndex = zcounter + 1;
		parentdiv.appendChild(this.thisdiv);

		this.thiscanvas = document.createElement('canvas');
		this.thiscanvas.style.borderStyle = "none";
		this.thiscanvas.style.display = "block";
		this.thiscanvas.style.opacity = 0.75;
		this.thiscanvas.style.width = this.size + "px";
		this.thiscanvas.style.height = this.size + "px";
		this.ctx = this.thiscanvas.getContext('2d');
		this.ctx.canvas.width = this.size;
		this.ctx.canvas.height = this.size;
		this.thisdiv.appendChild(this.thiscanvas);

		this.setdisplayposition();
		this.redraw();
	}
	redraw() {
		// clear
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		var killfactor = 1.0;
		if (this.beingkilled) {
			var currentdate = new Date();
			var thistime = currentdate.getTime() - this.killtime; // within a cycle
			killfactor = Math.max(0, 1.0 - (thistime)**2 / PointerKillDuration**2);
		} else {
			// draw center point
			var pulsesep = 1000, pulseup = 50, pulsedown = 200;
			var totalduration = pulsesep + pulseup + pulsedown;
			var pulsegoal = 1.2;
			var currentradius = 1.0;
			var currentdate = new Date();
			var thistime = (currentdate.getTime() - this.timestamp) % totalduration; // within a cycle
			this.thisradius = 1.0;
			if (thistime > pulsesep && thistime < pulsesep + pulseup) {
				this.thisradius = 1.0 + (thistime - pulsesep)**2 * (pulsegoal - 1.0) / pulseup**2;
			}
			if (thistime > pulsesep + pulseup) {
				this.thisradius = pulsegoal - (thistime - pulsesep - pulseup)**2 * (pulsegoal - 1.0) / pulsedown**2;
			}
		}

		this.ctx.fillStyle = this.color;
    	this.ctx.beginPath();
		if (this.offscreen) { // draw arrow
			var currentscale = this.size/1.2 * this.thisradius * killfactor * Pointer_arrowscalefactor;
			this.ctx.moveTo(this.ctx.canvas.width/2 + currentscale * Pointer_arrowoutline_r[0] * Math.cos(Pointer_arrowoutline_phi[0] * Math.PI / 180.0 + this.arrowdirection),
									this.ctx.canvas.height/2 + currentscale * Pointer_arrowoutline_r[0] * Math.sin(Pointer_arrowoutline_phi[0] * Math.PI / 180.0 + this.arrowdirection));
			for (var i = 0; i < Pointer_arrowoutline_r.length; i++) {
				this.ctx.lineTo(this.ctx.canvas.width/2 + currentscale * Pointer_arrowoutline_r[i] * Math.cos(Pointer_arrowoutline_phi[i] * Math.PI / 180.0 + this.arrowdirection),
										this.ctx.canvas.height/2 + currentscale * Pointer_arrowoutline_r[i] * Math.sin(Pointer_arrowoutline_phi[i] * Math.PI / 180.0 + this.arrowdirection));
			}
		} else { // draw dot
	 		this.ctx.arc(this.size/2.0, this.size/2.0, this.size/3.0 * this.thisradius * killfactor, 0, 2 * Math.PI);
		}
		this.ctx.closePath();
		this.ctx.fill();
	}
	setdisplayposition() {
		var displayx = zoomvalue * this.x - cameraposx;
		var displayy = zoomvalue * this.y - cameraposy;
		var actualx = displayx, actualy = displayy;
		this.offscreen = false;
		if (displayx > window.innerWidth - this.size/2 || displayx < this.size/2) {
			this.offscreen = true;
			displayx = Math.max(this.size/2, Math.min(window.innerWidth - this.size/2, displayx));
		}
		if (displayy > window.innerHeight - this.size/2 || displayy < this.size/2) {
			this.offscreen = true;
			displayy = Math.max(this.size/2, Math.min(window.innerHeight - this.size/2, displayy));
		}
		if (this.offscreen) {
			this.arrowdirection = Math.atan2(actualy - displayy, actualx - displayx);
			this.ctx.canvas.width = PointerSize;
			this.ctx.canvas.height = PointerSize;
			this.thiscanvas.style.width = PointerSize + "px";
			this.thiscanvas.style.height = PointerSize + "px";
			this.size = PointerSize;
		} else {
			this.ctx.canvas.width = PointerSize/2;
			this.ctx.canvas.height = PointerSize/2;
			this.thiscanvas.style.width = PointerSize/2 + "px";
			this.thiscanvas.style.height = PointerSize/2 + "px";
			this.size = PointerSize/2;
		}
		this.thisdiv.style.left = displayx - this.size/2 + "px";
		this.thisdiv.style.top = displayy - this.size/2 + "px";
	}
}
function prepareforkill(someanimation) {
	if (someanimation) {
		someanimation.beingkilled = true;
		var currentdate = new Date();
		someanimation.killtime = currentdate.getTime();
	}
}
function killanimation(someanimation) {
	if (someanimation) {
		if (someanimation.thisdiv.parentNode) {
			someanimation.thisdiv.parentNode.removeChild(someanimation.thisdiv);
			delete animatedPointer[someanimation.id];
		}
	}
}
