const hourglass_filepath = "img/_server_/hourglass_casing.png", hourglass_highlight_filepath = "img/_server_/hourglass_highlight.png";
const hourglass_width0 = 266, hourglass_height0 = 416;

const timer_scale = 3.2;
const timer_outletlength = 4.2;
const timer_glassheight = 105.0;
const timer_glasswidth = 66.0;
const timer_totalvolume_factor = 0.75;
const timer_glassslope = Math.tan(59.54 * Math.PI / 180.0);

class TimerElement {
	constructor(someid, parentdiv, x0, y0) {
		this.id = someid;
		this.owner = [0];
		this.viewingrights = [0];
		this.timestamp = -1;

		this.touchedthis = false;

		this.what = ContainerTypes.Timer;

		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			e.preventDefault();
			lastmousedownframe = this;
			if (e.which === 3) lastmenuup = this;
		});
		this.thisdiv.addEventListener('wheel', e => {
			lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (e.target === this.thiscanvas || e.target === this.thislabel || e.target === this.thisdiv) {
				//if (this.autorestart && (this.running || this.restarting)) {
				//	if (player === 0)
				//		iosocket.emit('reqtimerstop', this.id);
				//} else {
					if (this.owner.includes(player)) {
						iosocket.emit('reqtimerrestart', this.id);
					}
				//}
			}
		});

		this.streamposition = true;
		this.fixposition = false;
		this.animated = true;
		this.autorestart = false;
		this.lotterylink = -1;

		this.playsfx = false;
		this.sfxfile = "";
		this.sfxvolume = 0.5;
		this.timeoutaudio;

		this.isurgent = false;
		this.playurgentsfx = false;
		this.urgentsfxfile = "";
		this.urgentsfxvolume = 0.5;
		this.urgentaudio;

		this.restarting = false;
		this.restart_time0 = 0;
		this.restart_duration = 0;
		this.running = false;
		this.timer_duration = 5000;
		// this is used for unpushed changes to timer duration not being lost on timer start
		this.timer_thisduration = 5000;
		this.timer_start = 0;

		this.showlabel = false;
		this.thislabel = document.createElement('label');
		this.thislabel.style.visibility = "hidden";
		this.thisdiv.appendChild(this.thislabel);
		this.thislabel.innerHTML = "";
		this.thislabel.style.position = "absolute";
		this.thislabel.style.bottom = "0px";
		this.thislabel.style.width = "100%";
		this.thislabel.style.textAlign = "center";
		this.thislabel.style.webkitTextStroke = "1.5px black";

		this.thiscanvas = document.createElement('canvas');
		this.thisdiv.appendChild(this.thiscanvas);

		this.thisdiv.style.position = "absolute";
		this.thisdiv.style.borderStyle = "solid";
		this.thisdiv.style.borderWidth = "2px";
		this.thisdiv.style.borderColor = "transparent";
		this.backgroundcolor0 = "transparent";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.zIndex = zcounter++;
		this.thisdiv.style.zIndex = this.zIndex;

		this.thiscanvas.style.display = "none";
		this.thiscanvas.style.backgroundColor = this.backgroundcolor0;
		this.thiscanvas.style.borderStyle = "none";
		this.ctx = this.thiscanvas.getContext('2d');

		this.image = new Image();
		this.image.src = hourglass_filepath;
		this.highlight = false;
		this.imagehighlight = new Image();
		this.imagehighlight.src = hourglass_highlight_filepath;
		this.scale = 0.33;
		this.displaywidth = this.scale * zoomvalue * hourglass_width0;
		this.displayheight = this.scale * zoomvalue * hourglass_height0;
		this.displayx = x0 - this.displaywidth/2;
		this.displayy = y0 - this.displayheight/2;
		this.x = (this.displayx + cameraposx + this.displaywidth/2)/zoomvalue/this.scale;
		this.y = (this.displayy + cameraposy + this.displayheight/2)/zoomvalue/this.scale;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.thiscanvas.style.width = this.displaywidth + "px";
		this.thiscanvas.style.height = this.displayheight + "px";
		this.redrawfunction = (function (timerreference){
										return function(){
											timerreference.redraw();
										};
								}(this));
		this.setdisplayscale();
		this.redraw();
	}
	redraw() {
		if (this.image.complete && this.imagehighlight.complete) {
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this.ctx.canvas.width = hourglass_width0;
			this.ctx.canvas.height = hourglass_height0;
			this.ctx.fillStyle = '#f0cf9b';

			var sand_dropduration = 200;
			// this is used to have the volume flow at a constant rate
			// using the total volume of trapezoid V = slope * x * (outlet + x), where (outlet + 2*x) is the upper ledge of the trapezoid in the upper chamber
			// the differential equation V' = const is solved by x(t) = a + sqrt(b + const*t)
			var thisrate = -1.0/this.timer_thisduration;
			var currentdate = new Date();
			var thisvalue = (currentdate.getTime() - this.timer_start);
			var thisvalue_top = Math.max(0.0, -timer_outletlength/2.0 + Math.sqrt((timer_outletlength/2.0 + 1.0)**2 - (timer_outletlength + 1.0)/this.timer_thisduration * thisvalue));
			var thisvalue_bottom = 1.0 - Math.max(0.0, -timer_outletlength/2.0 + Math.sqrt((timer_outletlength/2.0 + 1.0)**2 - (timer_outletlength + 1.0)/this.timer_thisduration * thisvalue));


			if (currentdate.getTime() > this.timer_start + this.timer_thisduration + sand_dropduration) {
				this.running = false;
			}

			if (this.running) {
				//console.log(thisvalue_top);
				var streamtop = Math.max(0.0, 1.0 - (this.timer_start + this.timer_thisduration + sand_dropduration - currentdate.getTime()) / sand_dropduration);
				var streambottom = Math.min(1.0, (currentdate.getTime() - this.timer_start) / sand_dropduration);

				// center, stream of sand
		    	this.ctx.beginPath();
				this.ctx.moveTo(this.ctx.canvas.width/2 + timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 * streamtop);
				this.ctx.lineTo(this.ctx.canvas.width/2 + timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 * streambottom);
				this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 * streambottom);
				this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 * streamtop);
				this.ctx.closePath();
				this.ctx.fill();

				// upper chamber
		    	this.ctx.beginPath();
				this.ctx.moveTo(this.ctx.canvas.width/2 + timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2);
				this.ctx.lineTo(this.ctx.canvas.width/2 + timer_scale * timer_outletlength / 2 + timer_scale * timer_glasswidth / 2 * thisvalue_top * timer_totalvolume_factor,
										this.ctx.canvas.height/2 - timer_scale * timer_glasswidth / 2 * thisvalue_top * timer_totalvolume_factor * timer_glassslope);
				this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_outletlength / 2 - timer_scale * timer_glasswidth / 2 * thisvalue_top * timer_totalvolume_factor,
										this.ctx.canvas.height/2 - timer_scale * timer_glasswidth / 2 * thisvalue_top * timer_totalvolume_factor * timer_glassslope);
				this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_outletlength / 2, this.ctx.canvas.height/2);
				this.ctx.closePath();
				this.ctx.fill();
			} else {
				thisvalue_bottom = 1.0;
			}

			// lower chamber
			this.ctx.beginPath();
			this.ctx.moveTo(this.ctx.canvas.width/2 + timer_scale * timer_glasswidth / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2);
			this.ctx.lineTo(this.ctx.canvas.width/2 + timer_scale * timer_glasswidth / 2 - timer_scale * timer_glasswidth / 2 * thisvalue_bottom * timer_totalvolume_factor,
									this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 - timer_scale * timer_glasswidth / 2 * thisvalue_bottom * timer_totalvolume_factor * timer_glassslope);
			this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_glasswidth / 2 + timer_scale * timer_glasswidth / 2 * thisvalue_bottom * timer_totalvolume_factor,
									this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2 - timer_scale * timer_glasswidth / 2 * thisvalue_bottom * timer_totalvolume_factor * timer_glassslope);
			this.ctx.lineTo(this.ctx.canvas.width/2 - timer_scale * timer_glasswidth / 2, this.ctx.canvas.height/2 + timer_scale * timer_glassheight / 2);
			this.ctx.closePath();
			this.ctx.fill();

			if (this.highlight && this.imagehighlight.complete) {
				this.ctx.drawImage(this.imagehighlight, 0, 0);
			}
			this.ctx.drawImage(this.image, 0, 0);
			this.thiscanvas.style.display = "block";
			if (currentdate.getTime() - this.timer_start > Math.min(this.timer_thisduration - 10000, 0.9*this.timer_thisduration)) {
				if (!this.isurgent) {
					this.isurgent = true;
					if (this.playurgentsfx && this.urgentsfxfile !== "" && this.viewingrights.includes(player)) {
						if (this.urgentaudio) this.urgentaudio.src = '';
						this.urgentaudio = new Audio(this.urgentsfxfile);
						this.urgentaudio.pause();
						this.urgentaudio.volume = basevolume * this.urgentsfxvolume;
						this.urgentaudio.play();
					}
				}
			}
		} else {
			this.image.addEventListener('load', this.redrawfunction);
			this.imagehighlight.addEventListener('load', this.redrawfunction);
		}
		this.updatetimerlabel();
	}
	setdisplayposition() {
		this.displayx = this.scale * zoomvalue * this.x - cameraposx - this.displaywidth/2;
		this.displayy = this.scale * zoomvalue * this.y - cameraposy - this.displayheight/2;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
	}
	setdisplayscale() {
		this.displaywidth = this.scale * zoomvalue * hourglass_width0;
		this.displayheight = this.scale * zoomvalue * hourglass_height0;
		this.thiscanvas.style.width = this.displaywidth + "px";
		this.thiscanvas.style.height = this.displayheight + "px";
		this.thislabel.style.fontSize = (100 * this.scale * zoomvalue) + "px";
		this.thislabel.style.webkitTextStroke = (3 * this.scale * zoomvalue) + "px black";
	}
	updatetimerlabel(){
		if (this.showlabel && !this.restarting) {
			this.thislabel.style.visibility = "";
			if (this.running) {
				var currentdate = new Date();
				var thisvalue = Math.max(0, Math.floor((this.timer_thisduration - (currentdate.getTime() - this.timer_start))/1000));
				this.thislabel.innerHTML = Math.floor(thisvalue/60) + ":" + padwithzeros(thisvalue%60, 2);
				if (this.isurgent) {
					this.thislabel.style.color = "#ff0000";
				} else {
					this.thislabel.style.color = "#ffffff";
				}
			} else {
				var thisvalue = Math.floor(this.timer_duration/1000);
				this.thislabel.innerHTML = Math.floor(thisvalue/60) + ":" + padwithzeros(thisvalue%60, 2);
				this.thislabel.style.color = "#ffffff";
			}/*	*/
		} else {
			this.thislabel.style.visibility = "hidden";
		}
	}
	handletimeout(){
		if (this.playsfx && this.sfxfile !== "" && this.viewingrights.includes(player)) {
			if (this.timeoutaudio) this.timeoutaudio.src = '';
			this.timeoutaudio = new Audio(this.sfxfile);
			this.timeoutaudio.pause();
			this.timeoutaudio.volume = basevolume * this.sfxvolume;
			this.timeoutaudio.play();
		}
	}
	loadproperties2(someframe) {
		for (var currentproperty in someframe) {
			this[currentproperty] = someframe[currentproperty];
		}
		if (this.viewingrights.includes(player)) {
			this.thisdiv.style.visibility = "visible";
		} else {
			if (player === 0) {
				this.thisdiv.style.visibility = "visible";
			} else {
				this.thisdiv.style.visibility = "hidden";
			}
		}
		this.setdisplayscale();
		this.setdisplayposition();
		this.redraw();
		this.thisdiv.style.zIndex = this.zIndex;
	}
}
