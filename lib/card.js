
var logopath = "img/_server_/logo3.png";
var logox = 998, logoy = 999;
var cardbordercolor = "white";
var cardbordercolorhighlight = "red";

class Card {
	constructor(somedeckid, somecardid, somedeck, parentdiv, x0, y0, w0, h0, frontfilename, backfilename) {
		this.deckid = somedeckid;
		this.cardid = somecardid;
		this.deck = somedeck;
		
		this.owner = [0]; //movingrights
		this.viewingrights = [0];
		this.timestamp = -1;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.Card;
		
		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			if (e.target === this.thisimgfront || e.target === this.thisimgback || e.target === this.thisdiv) {
				e.preventDefault();
				lastmousedownframe = this;
				if (e.which === 3) lastmenuup = this;
			}
		});
		this.thisdiv.addEventListener('wheel', e => {
			if (draggedframe === this) {
				if (multiselected) {
					var currentdate = new Date();
					var currenttime = currentdate.getTime();
					var current = multiselectlist.head;
					for (var i = 0; i < multiselectlist.length; i++) {
						if (current.value.owner.includes(player)) {
							if (e.deltaY > 0.0) {
								current.value.angle = (current.value.angle + 90)%360;
							} else {
								current.value.angle = (current.value.angle - 90 + 360)%360;
							}
							current.value.thisdiv.style.transform = "rotate("+current.value.angle+"deg)";
							
							current.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
							iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
						}
						current = current.next;
					}
				} else {
					if (e.deltaY > 0.0) {
						this.angle = (this.angle + 90)%360;
					} else {
						this.angle = (this.angle - 90 + 360)%360;
					}
					this.thisdiv.style.transform = "rotate("+this.angle+"deg)";
					
					var currentdate = new Date();
					this.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
					iosocket.emit('updatecardposition', this.deckid, this.cardid, this.x, this.y, this.angle, this.faceup, this.timestamp);
				}
			}
			if (e.target === this.thisimgfront || e.target === this.thisimgback)
				lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (e.target === this.thisimgfront || e.target === this.thisimgback || e.target === this.thisdiv) {
				if (this.owner.includes(player)) {
					if (multiselected) {
						if (iscardinstack(multiselectlist, this.deckid, this.cardid)) {
							var currentdate = new Date();
							var currenttime = currentdate.getTime();
							var current = multiselectlist.head;
							for (var i = 0; i < multiselectlist.length; i++) {
								if (current.value.owner.includes(player)) {
									current.value.turncard();
									current.value.timestamp = currenttime - clienttimereference + servertimereference;
									iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
								}
								current = current.next;
							}
						} else {
						
						}
					} else {
						this.turncard();
						var currentdate = new Date();
						this.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
						iosocket.emit('updatecardposition', this.deckid, this.cardid, this.x, this.y, this.angle, this.faceup, this.timestamp);
					}
				}
			}
		});
		
		this.thishandicon = document.createElement('img');
		this.thisdiv.appendChild(this.thishandicon);
		this.thishandicon.style.display = "none";
		this.thishandicon.src = "img/_server_/handicon.png";
		
		this.thisimgfront = document.createElement('img');
		this.thisimgback = document.createElement('img');
		this.thisdiv.appendChild(this.thisimgfront);
		this.thisdiv.appendChild(this.thisimgback);
		
		/*this.thisimgfront.style.position = "absolute";
		this.thisimgback.style.position = "absolute";
		this.thisimgfront.style.left = 0+"px";
		this.thisimgfront.style.top = 0+"px";
		this.thisimgback.style.left = 0+"px";
		this.thisimgback.style.top = 0+"px";*/

		this.thisdiv.style.position = "absolute";
		this.thisdiv.style.padding = 0+"px";
		this.backgroundfront = "transparent";
		this.backgroundback = "repeating-linear-gradient("+backgrounddirection+"deg, #444 "+0+"px, #444 "+(0+backgroundwidth1*zoomvalue/2)+"px, #555 "+(0+backgroundwidth1*zoomvalue/2)+"px, #555 "+(0+backgroundwidth1*zoomvalue+backgroundwidth2*zoomvalue/2)+"px )";		
		
		this.streamposition = true;
		this.angle = 0;
		this.displayx = x0;
		this.displayy = y0;
		this.displayxref = x0;
		this.displayyref = y0;
		this.x = (this.displayx + cameraposx)/zoomvalue;
		this.y = (this.displayy + cameraposy)/zoomvalue;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
		this.zIndex = zcounter++
		this.thisdiv.style.zIndex = this.zIndex;
		this.faceup = true;
		
		this.scale = 1.0;
		if (this.faceup) {
			this.thisimgfront.style.display = "block";
			this.thisimgback.style.display = "none";
			this.thisdiv.style.background = this.backgroundfront;
		} else {
			this.thisimgfront.style.display = "none";
			this.thisimgback.style.display = "block";
			this.thisdiv.style.background = this.backgroundback;
		}
		this.imagefront = new Image();
		this.imageback = new Image();
		this.filenamefront = "";
		this.filenameback = "";
		this.width = w0;
		this.height = h0;
		this.displaywidth = w0;
		this.displayheight = h0;
		this.thisdiv.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		this.thisdiv.style.borderStyle = "solid";
		this.thisdiv.style.borderColor = cardbordercolor;
		this.displaywidth = this.scale * zoomvalue * this.width;
		this.displayheight = this.scale * zoomvalue * this.height;
		this.thisdiv.style.width = this.displaywidth+"px";
		this.thisdiv.style.height = this.displayheight+"px";
		this.thisimgfront.style.width = this.displaywidth+"px";
		this.thisimgfront.style.height = this.displayheight+"px";
		this.thisimgfront.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		//this.thisimgback.style.width = this.displaywidth/3+"px";
		//this.thisimgback.style.height = this.displaywidth/3*logoy/logox+"px";
		loaderdiv.style.zIndex = zcounter+200;
		loaderdiv.style.visibility = "";
		
		if (typeof frontfilename !== "undefined") {
			this.applyfrontimage(frontfilename);
		} else {
			this.applyfrontimage("img/_server_/placeholdercard.jpg");
		}
		if (typeof backfilename !== "undefined" && backfilename !== "-") {
			this.applybackimage(backfilename);
		} else {
			this.applybackimage(logopath);
		}
		
		this.onhand = false;
		this.thishandicon.style.position = "absolute";
		this.thishandicon.style.left = 0+"px";
		this.thishandicon.style.top = 0+"px";
		this.thishandicon.style.zIndex = 5;
		if (this.width < this.height) {
			this.thishandicon.style.width = Math.min(this.displaywidth, 0.24*this.width)+"px";
			this.thishandicon.style.height = Math.min(this.displaywidth, 0.24*this.width)+"px";
		} else {
			this.thishandicon.style.width = Math.min(this.displayheight, 0.24*this.height)+"px";
			this.thishandicon.style.height = Math.min(this.displayheight, 0.24*this.height)+"px";
		}
	}
	draw() {
		if (this.viewingrights.includes(player)) {
			if (!this.onhand) {
				if (!this.faceup) {
					this.onhand = true;
					this.thishandicon.style.display = "";
					this.thisimgfront.style.display = "block";
					this.thisimgback.style.display = "none";
					this.thisdiv.style.background = this.backgroundfront;
				}
			}
		}
	}
	discard() {
		if (this.onhand) {
			if (!this.faceup) {
				this.onhand = false;
				this.thishandicon.style.display = "none";
				
				this.thisimgfront.style.display = "none";
				this.thisimgback.style.display = "block";
				this.thisdiv.style.background = this.backgroundback;
			}
		}
	}
	turncard() {
		this.faceup = !this.faceup;
		if (this.faceup) {
			this.onhand = false;
			this.thishandicon.style.display = "none";
			
			this.thisimgfront.style.display = "block";
			this.thisimgback.style.display = "none";
			this.thisdiv.style.background = this.backgroundfront;
		} else {
			this.thisimgfront.style.display = "none";
			this.thisimgback.style.display = "block";
			this.thisdiv.style.background = this.backgroundback;
		}
	}
	applyfrontimage(filename) {
		loaderdivcounter++;
		if (!loaderdiv.classList.contains('loader')) {
			loaderdiv.classList.add('loader');
		}
		this.filenamefront = filename;
		this.imagefront.addEventListener('load', e => {
			this.thisimgfront.src = this.filenamefront;
			
			loaderdivcounter--;
			if (loaderdivcounter < 1) {
				loaderdivcounter = 0;
				loaderdiv.classList.remove('loader');
				loaderdiv.style.visibility = "hidden";
				loaderdiv.style.zIndex = 0;
			}
		});
		this.imagefront.src = filename;
	}
	applybackimage(filename) {
		loaderdivcounter++;
		if (!loaderdiv.classList.contains('loader')) {
			loaderdiv.classList.add('loader');
		}
		if (filename === logopath) {
			this.thisimgback.style.marginLeft = "auto";
			this.thisimgback.style.marginRight = "auto";
			this.thisimgback.style.width = this.displaywidth/3+"px";
			this.thisimgback.style.height = this.displaywidth/3*logoy/logox+"px";
			this.thisimgback.style.marginLeft = "auto";
			this.thisimgback.style.marginRight = "auto";
			this.thisimgback.style.paddingTop = (this.displayheight-this.displaywidth/3*logoy/logox)/2+"px";
		} else {
			this.thisimgback.style.width = this.displaywidth+"px";
			this.thisimgback.style.height = this.displayheight+"px";
			this.thisimgback.style.marginLeft = "";
			this.thisimgback.style.marginRight = "";
			this.thisimgback.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		}
		this.filenameback = filename;
		this.imageback.addEventListener('load', e => {
			this.thisimgback.src = this.filenameback;
			
			loaderdivcounter--;
			if (loaderdivcounter < 1) {
				loaderdivcounter = 0;
				loaderdiv.classList.remove('loader');
				loaderdiv.style.visibility = "hidden";
				loaderdiv.style.zIndex = 0;
			}
		});
		this.imageback.src = filename;
	}
	setdisplayposition() {
		this.displayx = this.scale * zoomvalue * this.x - cameraposx;
		this.displayy = this.scale * zoomvalue * this.y - cameraposy;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
	}
	setdisplayscale() {
		this.displaywidth = this.scale * zoomvalue * this.width;
		this.displayheight = this.scale * zoomvalue * this.height;
		this.thisdiv.style.width = this.displaywidth+"px";
		this.thisdiv.style.height = this.displayheight+"px";
		this.thisimgfront.style.width = this.displaywidth+"px";
		this.thisimgfront.style.height = this.displayheight+"px";
		if (this.filenameback === logopath) {
			this.thisimgback.style.width = this.displaywidth/3+"px";
			this.thisimgback.style.height = this.displaywidth/3*logoy/logox+"px";
			this.thisimgback.style.paddingTop = (this.displayheight-this.displaywidth/3*logoy/logox)/2+"px";
		} else {
			this.thisimgback.style.width = this.displaywidth+"px";
			this.thisimgback.style.height = this.displayheight+"px";
			this.thisimgback.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		}
		this.thisdiv.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		this.thisimgfront.style.borderRadius = 0.02*Math.sqrt(this.displaywidth*this.displaywidth+this.displayheight*this.displayheight)+"px";
		this.backgroundback = "repeating-linear-gradient("+backgrounddirection+"deg, #444 "+0+"px, #444 "+(0+backgroundwidth1*zoomvalue/2)+"px, #555 "+(0+backgroundwidth1*zoomvalue/2)+"px, #555 "+(0+backgroundwidth1*zoomvalue+backgroundwidth2*zoomvalue/2)+"px )";		
		if (!this.faceup)
			this.thisdiv.style.background = this.backgroundback;
		if (this.width < this.height) {
			this.thishandicon.style.width = Math.min(this.displaywidth, 0.24*this.width)+"px";
			this.thishandicon.style.height = Math.min(this.displaywidth, 0.24*this.width)+"px";
		} else {
			this.thishandicon.style.width = Math.min(this.displayheight, 0.24*this.height)+"px";
			this.thishandicon.style.height = Math.min(this.displayheight, 0.24*this.height)+"px";
		}
	}
	loadproperties(somecard) {
		for (var i = 0; i < relevantdata_card.length; i++) {
			this[relevantdata_card[i]] = somecard[relevantdata_card[i]];
		}
		this.setdisplayposition();
		if (this.faceup) {
			this.thisimgfront.style.display = "block";
			this.thisimgback.style.display = "none";
			this.thisdiv.style.background = this.backgroundfront;
		} else {
			this.thisimgfront.style.display = "none";
			this.thisimgback.style.display = "block";
			this.thisdiv.style.background = this.backgroundback;
		}
		this.thisdiv.style.transform = "rotate("+this.angle+"deg)";
		this.applyfrontimage(this.filenamefront);
		this.applybackimage(this.filenameback);
		this.setdisplayscale();
		this.thisdiv.style.zIndex = this.zIndex;
	}
}

