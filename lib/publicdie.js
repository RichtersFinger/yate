var pd6filenamebases = ["img/_server_/dice/d6_", "img/_server_/dice/d6red_", "img/_server_/dice/d6green_", "img/_server_/dice/d6blue_", "img/_server_/dice/d6white_"];
var pd6filenamebases_labels = ["Black", "Red", "Green", "Blue", "White"];
var pd20filenamebases = ["img/_server_/dice/d20_", "img/_server_/dice/d20red_", "img/_server_/dice/d20green_", "img/_server_/dice/d20blue_", "img/_server_/dice/d20white_"];
var pd20filenamebases_labels = ["Black", "Red", "Green", "Blue", "White"];

var diceroll_current = 0;
var dicerollsounds_files = ["sound/_server_/diceroll_0.mp3", "sound/_server_/diceroll_1.mp3", "sound/_server_/diceroll_2.mp3", "sound/_server_/diceroll_3.mp3", "sound/_server_/diceroll_4.mp3", "sound/_server_/diceroll_5.mp3", "sound/_server_/diceroll_6.mp3", "sound/_server_/diceroll_7.mp3", "sound/_server_/diceroll_8.mp3", "sound/_server_/diceroll_9.mp3", "sound/_server_/diceroll_10.mp3", "sound/_server_/diceroll_11.mp3", "sound/_server_/diceroll_12.mp3", "sound/_server_/diceroll_13.mp3", "sound/_server_/diceroll_14.mp3", "sound/_server_/diceroll_15.mp3", "sound/_server_/diceroll_16.mp3", "sound/_server_/diceroll_17.mp3", "sound/_server_/diceroll_18.mp3"];

class PublicDie {
	constructor(someid, parentdiv, x0, y0, somesize, dwhat, filenamebase, filenametype) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;

		this.touchedthis = false;

		this.what = ContainerTypes.PublicDieFrame;

		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			e.preventDefault();
			lastmousedownframe = this;
			if (e.which === 3) lastmenuup = this;
		});
		/**/this.thisdiv.addEventListener('wheel', e => {
			lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (e.target === this.thiscanvas || e.target === this.thisdiv) {
				if (this.owner.includes(player)) {
					if (!this.justrolled)
						this.roll();
				}
			}
		});

		this.streamposition = true;
		this.fixposition = false;
		this.setable = false;
		this.animated = true;

		this.thiscanvas = document.createElement('canvas');
		this.thisdiv.appendChild(this.thiscanvas);

		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "transparent";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.highlight = false;
		this.displayx = x0 - somesize/2;
		this.displayy = y0 - somesize/2;
		this.x = (this.displayx + cameraposx + somesize/2)/zoomvalue;
		this.y = (this.displayy + cameraposy + somesize/2)/zoomvalue;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.zIndex = zcounter++;
		this.thisdiv.style.zIndex = this.zIndex;

		this.justrolled = false;

		this.thiscanvas.style.display = "none";
		this.thiscanvas.style.backgroundColor = this.backgroundcolor0;
		this.thiscanvas.style.borderStyle = "none";
		this.ctx = this.thiscanvas.getContext('2d');
		this.image = new Image();
		this.filenamebase = filenamebase;
		this.maxvalue = dwhat;
		this.value = 1;
		this.filenametype = filenametype;
		this.imagehighlight = new Image();
		this.imagehighlight.src = this.filenamebase+"highlight."+this.filenametype;
		this.scale = 1.0;
		this.size = somesize;
		this.displaysize = this.scale * zoomvalue * this.size;
		this.thiscanvas.style.width = this.displaysize + "px";
		this.thiscanvas.style.height = this.displaysize + "px";
		this.redrawfunction = (function (diereference){
										return function(){
											diereference.redraw();
										};
								}(this));
		this.applyimage();
	}
	applyimage() {
		var filevalue = this.value;
		if (gameoptions.includes('hugo')) {
			if (this.maxvalue === 6 && this.value === 6)
				filevalue = "hugo";
		}

		this.image.src = this.filenamebase+filevalue+"."+this.filenametype;
		if (this.image.complete) {
			this.redraw();
		} else {
			this.image.addEventListener('load', this.redrawfunction);
		}
	}
	redraw() {
		this.thiscanvas.style.display = "block";
		this.ctx.canvas.width = this.image.width;
		this.ctx.canvas.height = this.image.height;
		if (this.highlight && this.imagehighlight.complete) {
			this.ctx.drawImage(this.imagehighlight, 0, 0);
		}
		this.ctx.drawImage(this.image, 0.04 * this.image.width, 0.04 * this.image.width, 0.92 * this.image.width, 0.92 * this.image.width);
	}
	setdisplayposition() {
		this.displayx = this.scale * zoomvalue * this.x - cameraposx - this.displaysize/2;
		this.displayy = this.scale * zoomvalue * this.y - cameraposy - this.displaysize/2;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
	}
	setdisplayscale() {
		this.displaysize = this.scale * zoomvalue * this.size;
		this.thiscanvas.style.width = this.displaysize + "px";
		this.thiscanvas.style.height = this.displaysize + "px";
	}
	up() {
		if (!this.justrolled) {
			this.value = Math.min(this.value + 1, this.maxvalue);
			this.applyimage();
			var currentdate = new Date();
			this.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
			iosocket.emit('reqpublicdieset', this.id, this.value, this.timestamp);
		}
	}
	down() {
		if (!this.justrolled) {
			this.value = Math.max(this.value - 1, 1);
			this.applyimage();
			var currentdate = new Date();
			this.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
			iosocket.emit('reqpublicdieset', this.id, this.value, this.timestamp);
		}
	}
	roll() {
		this.justrolled = true;
		var delay = 0;
		var diereference = this;
		if (animatedie && this.animated) {

			iosocket.emit('reqpublicdiceanimation', diereference.id);
			delay = 1000;
		} else {
			this.image.src = this.filenamebase+"qm."+this.filenametype;

			if (this.image.complete) {
				if (this.justrolled) {
					this.redraw();
					this.justrolled = false;
				}
			} else {
				this.image.addEventListener('load', e => {
					if (this.justrolled) {
						this.redraw();
					this.justrolled = false;
					}
				});
			}
		}
		setTimeout(function () {
			var currentdate = new Date();
			diereference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
			iosocket.emit('reqpublicdiceroll', diereference.id, diereference.timestamp);
		}, delay);


	}
	loadproperties2(someframe) {
		for (var currentproperty in someframe) {
			this[currentproperty] = someframe[currentproperty];
		}
		this.applyimage();
		this.setdisplayscale();
		this.setdisplayposition();
		this.thisdiv.style.zIndex = this.zIndex;
	}
}
