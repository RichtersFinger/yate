
class FrameContainer {
	constructor(someid, parentdiv, x0, y0, filename) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.FrameContainer;
		
		this.markeridcounter = 0;
		this.marker = {};
		this.labelidcounter = 0;
		this.label = {};
		
		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			if (e.target === this.thisimg) {
				e.preventDefault();
				lastmousedownframe = this;
				if (e.which === 3) lastmenuup = this;
			}
		});
		this.thisdiv.addEventListener('wheel', e => {
			if (e.target === this.thisimg)
				lastwheelframe = this;
		});
		this.thisimg = document.createElement('img');
		this.thisdiv.appendChild(this.thisimg);
		
		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "white";
		this.backgroundcolorhighlight = "red";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.streamposition = false;
		this.fixposition = false;
		this.displayx = x0;
		this.displayy = y0;
		this.x = (this.displayx + cameraposx)/zoomvalue;
		this.y = (this.displayy + cameraposy)/zoomvalue;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
		this.thisdiv.style.padding = "0.2%";
		this.zIndex = zcounter++
		this.thisdiv.style.zIndex = this.zIndex;
		this.visible = true;
		if (this.visible) {
			this.thisdiv.style.opacity = 1.0;
		} else {
			if (player === 0) {
				this.thisdiv.style.opacity = 0.5;
			} else {
				this.thisdiv.style.opacity = 0.0;
			}
		}
		
		this.scale = 1.0;
		this.thisimg.style.display = "none";
		this.image = new Image();
		this.filename = "";
		this.width = 50;
		this.height = 50;
		this.displaywidth = 50;
		this.displayheight = 50;
		this.thisimg.style.width = this.displaywidth+"px";
		this.thisimg.style.height = this.displayheight+"px";
		loaderdiv.style.zIndex = zcounter+100;
		loaderdiv.style.visibility = "";
		
		if (typeof filename !== "undefined") {
			loaderdivcounter++;
			if (!loaderdiv.classList.contains('loader')) {
				loaderdiv.classList.add('loader');
			}
			this.applyimage(filename);
		} else {
			loaderdivcounter++;
			if (!loaderdiv.classList.contains('loader')) {
				loaderdiv.classList.add('loader');
			}
			this.applyimage("img/_server_/placeholder.jpg");
		}
		
		// testing
	}
	applyimage(filename) {
		this.filename = filename;
		this.image.src = filename;

		this.image.addEventListener('load', e => {
			this.thisimg.style.display = "block";
			this.width = this.image.width;
			this.height = this.image.height;
			this.displaywidth = this.scale * zoomvalue * this.image.width;
			this.displayheight = this.scale * zoomvalue * this.image.height;
			this.thisimg.style.width = this.displaywidth+"px";
			this.thisimg.style.height = this.displayheight+"px";
			this.thisimg.src = this.filename;
			
			loaderdivcounter--;
			if (loaderdivcounter < 1) {
				loaderdivcounter = 0;
				loaderdiv.classList.remove('loader');
				loaderdiv.style.visibility = "hidden";
				loaderdiv.style.zIndex = 0;
			}
		});
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
		this.thisimg.style.width = this.displaywidth+"px";
		this.thisimg.style.height = this.displayheight+"px";
		this.setmarkerpositionsandscales();
		this.setlabelpositionsandscales();
	}
	setmarkerpositionsandscales() {
		for (var marker in this["marker"]) {
			this["marker"][marker].setpositionandscale();
		}
	}
	setlabelpositionsandscales() {
		for (var label in this["label"]) {
			this["label"][label].setpositionandscale();
		}
	}
	loadproperties2(someframe, somemarkers, somelabels) {
		for (var currentproperty in someframe) {
			if (currentproperty === "marker") continue;
			if (currentproperty === "label") continue;
			this[currentproperty] = someframe[currentproperty];
		}
		if (somemarkers) {
			for (var somemarker in somemarkers) {
				if (!this.marker[somemarker]) this.marker[somemarker] = new Marker(somemarkers[somemarker].id, this, this.thisdiv, somemarkers[somemarker].x, somemarkers[somemarker].y, somemarkers[somemarker].size, somemarkers[somemarker].descfilename);
				for (currentproperty in somemarkers[somemarker]) {
					this.marker[somemarker][currentproperty] = somemarkers[somemarker][currentproperty];
				}
				this.marker[somemarker].setpositionandscale();
				this.marker[somemarker].thisdiv.style.zIndex = somemarkers[somemarker].zIndex;
			}
		}
		if (somelabels) {
			for (var somelabel in somelabels) {
				if (!this.label[somelabel]) this.label[somelabel] = new FrameLabel(somelabels[somelabel].id, this, this.thisdiv, somelabels[somelabel].x, somelabels[somelabel].y, somelabels[somelabel].currenttext);
				for (currentproperty in somelabels[somelabel]) {
					this.label[somelabel][currentproperty] = somelabels[somelabel][currentproperty];
				}
				this.label[somelabel].setpositionandscale();
				this.label[somelabel].setArc(somelabels[somelabel].ctradius, somelabels[somelabel].ctdir);
				this.label[somelabel].thislabel.style.color = somelabels[somelabel].textcolor;
				this.label[somelabel].thisdiv.style.zIndex = somelabels[somelabel].zIndex;
			}
		}
		
		this.setdisplayposition();
		this.setdisplayscale();
		this.applyimage(this.filename);
		if (this.visible) {
			this.thisdiv.style.opacity = 1.0;
			this.thisdiv.style.zIndex = this.zIndex;
		} else {
			if (player === 0) {
				this.thisdiv.style.zIndex = this.zIndex;
				this.thisdiv.style.opacity = 0.5;
			} else {
				this.thisdiv.style.zIndex = 1;
				this.thisdiv.style.opacity = 0.0;
			}
		}
	}
}

