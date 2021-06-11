var d6filenamebases = ["img/_server_/dice/d6_", "img/_server_/dice/d6red_", "img/_server_/dice/d6green_", "img/_server_/dice/d6blue_", "img/_server_/dice/d6white_"];
var d6filenamebases_labels = ["Black", "Red", "Green", "Blue", "White"];
var d20filenamebases = ["img/_server_/dice/d20_", "img/_server_/dice/d20red_", "img/_server_/dice/d20green_", "img/_server_/dice/d20blue_", "img/_server_/dice/d20white_"];
var d20filenamebases_labels = ["Black", "Red", "Green", "Blue", "White"];
class Die {
	constructor(someid, parentdiv, x0, y0, somesize, dwhat, filenamebase, filenametype) {
		this.id = someid;
		this.owner = [0];
		this.tokenlink = null;
		this.timestamp = -1;

		this.what = ContainerTypes.Die;

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
			if (e.target === this.thiscanvas || e.target === this.thisdiv) {
				if (!this.justrolled)
					this.roll();
			}
		});

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
		this.zIndex = zcounter + 99;
		this.thisdiv.style.zIndex = this.zIndex;
		this.thisdiv.style.opacity = 0.75;

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
		this.size = somesize;
		this.scale = 1.0;
		this.thiscanvas.style.width = this.size + "px";
		this.thiscanvas.style.height = this.size + "px";
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
		this.displayx = zoomvalue * this.x - cameraposx - this.size/2;
		this.displayy = zoomvalue * this.y - cameraposy - this.size/2;
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
		}
	}
	down() {
		if (!this.justrolled) {
			this.value = Math.max(this.value - 1, 1);
			this.applyimage();
		}
	}
	roll() {
		this.justrolled = true;
		var delay = 0;
		var diereference = this;
		if (animatedie) {
			var firsttimeout = 10 + 40*random();
			if (!gameoptions.includes('disableDieSound')) {
				setTimeout(function(){
					var dicerollaudio = new Audio(dicerollsounds_files[diceroll_current++ % dicerollsounds_files.length]);
					dicerollaudio.pause();
					dicerollaudio.volume = basevolume;
					dicerollaudio.play();
				}, firsttimeout);
			}

			var somecounter = -1;
			var animationfunction = function() {
							if (!diereference.justrolled) {
								diereference.applyimage();
								return;
							}

							var randomresult = diereference.value;
							while (randomresult === diereference.value) {
								randomresult = Math.floor(1 + diereference.maxvalue * random());
							}
							diereference.value = randomresult;

							diereference.applyimage();

                		setTimeout(animationfunction, 20 + 40*random()*somecounter++);
			        };
			setTimeout(animationfunction, firsttimeout);
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
			if (diereference.tokenlink) {
				iosocket.emit('reqdiceroll_linked', diereference.tokenlink.descname, diereference.id, diereference.maxvalue);
			} else {
				iosocket.emit('reqdiceroll', diereference.id, diereference.maxvalue);
			}
		}, delay);
	}
}
