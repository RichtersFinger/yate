
const paperpath = "img/_server_/paper.png";

class LotteryFrame {
	constructor(someid, parentdiv, x0, y0, wordlist0) {
		this.id = someid;
		this.owner = [0]; //movingrights
		this.viewingrights = [0];
		this.timestamp = -1;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.LotteryFrame;
		
		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.innerdiv = document.createElement('div');
		this.thisdiv.appendChild(this.innerdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			if (e.target === this.innerdiv || e.target === this.thistext) {
				e.preventDefault();
				lastmousedownframe = this;
				if (e.which === 3) lastmenuup = this;
			}
		});
		this.thisdiv.addEventListener('wheel', e => {
			if (e.target === this.innerdiv || e.target === this.thistext)
				lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (e.target === this.innerdiv || e.target === this.thistext) {
				var currentdate = new Date();
				iosocket.emit('reqlotterypick', this.id, currentdate.getTime() - clienttimereference + servertimereference);
			}
		});
		
		
		this.thistext = document.createElement('label');
		this.thistext.innerHTML = "";
		this.thistext.style.cursor = "default";
		this.thistext.classList.add("noselect");
		this.thistext.classList.add("nowrap");
		this.thistext.style.position = "absolute";
		this.thistext.style.fontWeight = "bold";
		this.innerdiv.appendChild(this.thistext);
		
		this.innerdiv.style.backgroundColor = "transparent";
		this.innerdiv.style.backgroundImage = "url('" + paperpath + "')";
		
		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "transparent";
		this.backgroundcolorhighlight = "red";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.streamposition = true;
		this.displayx = x0;
		this.displayy = y0;
		this.x = (this.displayx + cameraposx)/zoomvalue;
		this.y = (this.displayy + cameraposy)/zoomvalue;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
		this.thisdiv.style.padding = "0.2%";
		this.zIndex = zcounter++
		this.thisdiv.style.zIndex = this.zIndex;
		
		this.selectatrandom = false;
		this.playsound = false;
		this.publicresult = true;
		this.isturnindicator = true;
		
		this.currentindex = 0;
		if (typeof wordlist0 !== "undefined") {
			this.options = wordlist0;
		} else {
			this.options = ["Empty Lottery"];
		}
		this.pick(0);
		
		
		this.scale = 1.0;
		this.width0 = 330;
		this.height0 = 97;
		
		this.setdisplayscale();
	}
	setdisplayposition() {
		this.displayx = this.scale * zoomvalue * this.x - cameraposx;
		this.displayy = this.scale * zoomvalue * this.y - cameraposy;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
	}
	setdisplayscale() {
		this.thistext.style.top = zoomvalue*this.scale*35 + "px";
		this.thistext.style.fontSize = (zoomvalue*this.scale*25)+"px";
		this.innerdiv.style.paddingLeft = zoomvalue*this.scale*5 + "px";
		this.innerdiv.style.paddingRight = zoomvalue*this.scale*5 + "px";
		this.innerdiv.style.height = zoomvalue*this.scale*this.height0 + "px";
		this.innerdiv.style.backgroundSize = zoomvalue*this.scale*this.width0 + "px " + zoomvalue*this.scale*this.height0 + "px";
		this.thisdiv.style.width = 1.004 * (2*zoomvalue*this.scale*5 + Math.max(200*zoomvalue*this.scale, this.thistext.clientWidth)) + "px";
	}
	pick(newindex) {
		if (newindex < this.options.length) {
			this.currentindex = newindex;
			this.thistext.innerHTML = this.options[this.currentindex];
			this.setdisplayscale();
		}
	}
	loadproperties2(someframe) {
		for (var currentproperty in someframe) {
			this[currentproperty] = someframe[currentproperty];
		}
		if (this.viewingrights.includes(player)) {
			this.thisdiv.style.opacity = 1.0;
		} else {
			if (player === 0) {
				this.thisdiv.style.opacity = 1.0;
			} else {
				this.thisdiv.style.opacity = 0.0;
			}
		}
		this.setdisplayposition();
		this.pick(this.currentindex);
	}
}

