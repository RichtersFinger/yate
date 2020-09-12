
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
	loadproperties(someframe) {
		console.log(someframe);
		for (var i = 0; i < relevantdata_imageframe.length; i++) {
			this[relevantdata_imageframe[i]] = someframe[relevantdata_imageframe[i]];
		}
		for (var i = 0; i < someframe.marker.length; i++) {
			var correctmarker = null;
			var current = this.marker.head;
			for (var j = 0; j < this.marker.length; j++) {
				if (current.value.id === someframe.marker[i].id) {
					correctmarker = current.value;
					break;
				}
				current = current.next;
			}
			if (!correctmarker) {
				this.marker.addToTail(new Marker(someframe.marker[i].id, this, this.thisdiv, someframe.marker[i].x, someframe.marker[i].y, someframe.marker[i].size, someframe.marker[i].descfilename));
				correctmarker = this.marker.tail.value;
				for (var j = 0; j < relevantdata_markerframe.length; j++) {
					correctmarker[relevantdata_markerframe[j]] = someframe.marker[i][relevantdata_markerframe[j]];
				}
			} else {
				for (var j = 0; j < relevantdata_markerframe.length; j++) {
					correctmarker[relevantdata_markerframe[j]] = someframe.marker[i][relevantdata_markerframe[j]];
				}
				correctmarker.setpositionandscale();
				if (correctmarker.descriptionisprepared) {
					correctmarker.descnamelabel.innerHTML = correctmarker.descname;
					correctmarker.desctextparagraph.innerHTML = correctmarker.desctext;
					correctmarker.applyimage(correctmarker.descfilename);
				}
			}
			correctmarker.thisdiv.style.zIndex = correctmarker.zIndex;
			if (!correctmarker.parentframe.visible) {
				correctmarker.hidedescription();
			}
		}
		this.labelidcounter = someframe.marker.length + 1;
		for (var i = 0; i < someframe.label.length; i++) {
			var correctlabel = null;
			var current = this.label.head;
			for (var j = 0; j < this.label.length; j++) {
				if (current.value.id === someframe.label[i].id) {
					correctlabel = current.value;
					break;
				}
				current = current.next;
			}
			if (!correctlabel) {
				this.label.addToTail(new FrameLabel(someframe.label[i].id, this, this.thisdiv, someframe.label[i].x, someframe.label[i].y, someframe.label[i].currenttext));
				correctlabel = this.label.tail.value;
				for (var j = 0; j < relevantdata_framelabel.length; j++) {
					correctlabel[relevantdata_framelabel[j]] = someframe.label[i][relevantdata_framelabel[j]];
				}
				correctlabel.thislabel.style.color = correctlabel.textcolor;
			} else {
				for (var j = 0; j < relevantdata_framelabel.length; j++) {
					correctlabel[relevantdata_framelabel[j]] = someframe.label[i][relevantdata_framelabel[j]];
				}
				correctlabel.setpositionandscale();
				correctlabel.thislabel.style.color = correctlabel.textcolor;
			}
			correctlabel.thisdiv.style.zIndex = correctlabel.zIndex;
			// angle is set inside setArc
			correctlabel.setArc(correctlabel.ctradius, correctlabel.ctdir);
		}
		this.labelidcounter = someframe.label.length + 1;
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
	adjustzIndices() {
		var current = this.label.head;
		for (var j = 0; j < this.label.length; j++) {
			current.value.touchedthis = false;
			current = current.next;
		}
		var largestzIndex = 1;
		for (var i = 0; i < this.label.length; i++) {
			var currenttarget = null; 
			var currentindex = i + 1;
			current = this.label.head;
			for (var j = 0; j < this.label.length; j++) {
				if (!current.value.touchedthis) {
					if (currenttarget) {
						if (currenttarget.zIndex > current.value.zIndex) {
							currenttarget = current.value;
						}
					} else {
						currenttarget = current.value;
					}
				}
				current = current.next;
			}
			if (currenttarget) {
				largestzIndex = Math.max(largestzIndex, currentindex);
				currenttarget.zIndex = currentindex;
				currenttarget.touchedthis = true;
				currenttarget.thisdiv.style.zIndex = currenttarget.zIndex;
			} else {
				alert("Something went wrong during zIndex adjustment.")
			}
		}
		
		var largestzIndex_markers = largestzIndex;
		current = this.marker.head;
		for (var j = 0; j < this.marker.length; j++) {
			current.value.touchedthis = false;
			current = current.next;
		}
		for (var i = 0; i < this.marker.length; i++) {
			var currenttarget = null; 
			var currentindex = largestzIndex_markers + i + 1;
			current = this.marker.head;
			for (var j = 0; j < this.marker.length; j++) {
				if (!current.value.touchedthis) {
					if (currenttarget) {
						if (currenttarget.zIndex > current.value.zIndex) {
							currenttarget = current.value;
						}
					} else {
						currenttarget = current.value;
					}
				}
				current = current.next;
			}
			if (currenttarget) {
				largestzIndex = Math.max(largestzIndex, currentindex);
				currenttarget.zIndex = currentindex;
				currenttarget.touchedthis = true;
				currenttarget.thisdiv.style.zIndex = currenttarget.zIndex;
			} else {
				alert("Something went wrong during zIndex adjustment.")
			}
		}
	}
}

