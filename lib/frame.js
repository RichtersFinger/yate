
class FrameContainer {
	constructor(someid, parentdiv, x0, y0, filename) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.FrameContainer;
		
		this.markeridcounter = 0;
		this.marker = new LinkedList();
		this.labelidcounter = 0;
		this.label = new LinkedList();
		
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
		var current = this.marker.head;
		for (var i = 0; i < this.marker.length; i++) {
			current.value.setpositionandscale();
			current = current.next;
		}
	}
	setlabelpositionsandscales() {
		var current = this.label.head;
		for (var i = 0; i < this.label.length; i++) {
			current.value.setpositionandscale();
			current = current.next;
		}
	}
	loadproperties2(someframe, somemarkers, somelabels) {
		var frameproperties = Object.keys(someframe);
		for (var i = 0; i < frameproperties.length; i++) {
			this[frameproperties[i]] = someframe[frameproperties[i]];
		}
		if (somemarkers) {
			for (var j = 0; j < somemarkers.length; j++) {
				var markerproperties = Object.keys(somemarkers[j]);
				this.marker.addToTail(new Marker(somemarkers[j].id, this, this.thisdiv, somemarkers[j].x, somemarkers[j].y, somemarkers[j].size, somemarkers[j].descfilename));
				for (var i = 0; i < markerproperties.length; i++) {
					this.marker.tail.value[markerproperties[i]] = somemarkers[j][markerproperties[i]];
				}
				this.marker.tail.value.setpositionandscale();
				this.marker.tail.value.thisdiv.style.zIndex = somemarkers[j].zIndex;
			}
			this.markeridcounter = somemarkers.length + 1;
		}
		if (somelabels) {
			for (var j = 0; j < somelabels.length; j++) {
				var labelproperties = Object.keys(somelabels[j]);
				this.label.addToTail(new FrameLabel(somelabels[j].id, this, this.thisdiv, somelabels[j].x, somelabels[j].y, somelabels[j].currenttext));
				for (var i = 0; i < labelproperties.length; i++) {
					this.label.tail.value[labelproperties[i]] = somelabels[j][labelproperties[i]];
				}
				this.label.tail.value.setpositionandscale();
				this.label.tail.value.setArc(somelabels[j].ctradius, somelabels[j].ctdir);
				this.label.tail.value.thislabel.style.color = somelabels[j].textcolor;
				this.label.tail.value.thisdiv.style.zIndex = somelabels[j].zIndex;
			}
			this.labelidcounter = somelabels.length + 1;
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

