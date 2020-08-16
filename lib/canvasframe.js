
class CanvasFrameContainer {
	constructor(someid, parentdiv, x0, y0, w0, h0) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;
		
		this.what = ContainerTypes.CanvasFrame;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.scale = 1.0;
		this.displayx = x0;
		this.displayy = y0;
		this.x = (this.displayx + cameraposx)/this.scale / zoomvalue;
		this.y = (this.displayy + cameraposy)/this.scale / zoomvalue;
		this.width = w0;
		this.height = h0;
		this.displaywidth = this.scale * zoomvalue * this.width;
		this.displayheight = this.scale * zoomvalue * this.height;	

		this.fixposition = false;
		this.streamposition = false;	
		this.streamcontent = false;		
		
		this.thisdiv = document.createElement('div');
		this.thisdiv.style.position = "absolute";
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.backgroundcolor0 = "white";
		this.backgroundcolorhighlight = "red";
		this.backgroundedithighlight = "blue";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.thisdiv.style.padding = "5px";
		this.zIndex = zcounter++
		this.thisdiv.style.zIndex = this.zIndex;
		parentdiv.appendChild(this.thisdiv);
		
		this.preventdrag = false;
		this.hitoutsidecanvas = false;
		
		this.thisdiv.addEventListener('mousedown', e => {
			this.preventdrag = false;
			this.hitoutsidecanvas = false;
			if (e.target === this.thisdiv || e.target === this.fabriccanvas.upperCanvasEl || e.target === this.controlsdiv) {
				e.preventDefault();
				lastmousedownframe = this;
				if (e.which === 3) lastmenuup = this;
				if (this.drawingmode !== "" && e.target === this.fabriccanvas.upperCanvasEl) {
					this.preventdrag = true;
				}
				if (this.drawingmode !== "" && e.target !== this.fabriccanvas.upperCanvasEl) {
					this.hitoutsidecanvas = true;
				}
			}	
		});
		this.thisdiv.addEventListener('wheel', e => {
			if (e.target === this.thisdiv || e.target === this.fabriccanvas.upperCanvasEl || e.target === this.controlsdiv) 
				lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (this.owner.includes(player)) {
				if (e.target === this.thisdiv || e.target === this.fabriccanvas.upperCanvasEl || e.target === this.controlsdiv) {
					if (this.drawingmode === "") {
						this.drawingmode = "d";
						this.fabriccanvas.selection = true;
						var everything = this.fabriccanvas.getObjects();
						for (var i = 0; i < everything.length; i++) {
							everything[i].selectable = true;
						}
						this.fabriccanvas.isDrawingMode = true;
						this.controlstogglebutton.innerHTML = "Edit";
						this.thisdiv.style.backgroundColor = this.backgroundedithighlight;
						this.controlsdiv.style.display = "";
					}
					if (e.target !== this.fabriccanvas.upperCanvasEl) {
						if (this.drawingmode !== "") {
							this.drawingmode = "";
							this.fabriccanvas.selection = false;
							var everything = this.fabriccanvas.getObjects();
							for (var i = 0; i < everything.length; i++) {
								everything[i].selectable = false;
							}
							this.fabriccanvas.isDrawingMode = false;
							this.fabriccanvas.deactivateAll().renderAll();
							this.thisdiv.style.backgroundColor = "white";
							this.controlsdiv.style.display = "none";
						}
					}
				}
			}
		});
					
		this.thiscanvas = document.createElement('canvas');
		this.thiscanvas.id = "somecanvas"+someid;
		this.thisdiv.appendChild(this.thiscanvas);
		
		
		this.controlsdiv = document.createElement('div');
		this.controlsdiv.style.backgroundColor = "#cccccc";
		//this.controlsdiv.style.display = 'none';
		this.controlsdiv.style.width = "100%";
		
		this.controlsexitbutton = document.createElement('button');
		this.controlsexitbutton.classList.add("fancybutton");
		this.controlsexitbutton.style.backgroundColor = "#38e038";
		this.controlsexitbutton.innerHTML = "Apply";
		this.controlsexitbutton.style.width = "100px";
		this.controlsexitbutton.style.padding = "8px 16px";
		var applyfunction = (function (canvasreference){
						return function(){	
							canvasreference.drawingmode = "";
							canvasreference.fabriccanvas.selection = false;
							var everything = canvasreference.fabriccanvas.getObjects();
							for (var i = 0; i < everything.length; i++) {
								everything[i].selectable = false;
							}
							canvasreference.fabriccanvas.isDrawingMode = false;
							canvasreference.fabriccanvas.deactivateAll().renderAll();
							canvasreference.thisdiv.style.backgroundColor = "white";
							canvasreference.controlsdiv.style.display = "none";
							//var someJSON = prompt("Enter JSON.", "");
							//canvasreference.initfromJSON(someJSON);
						};
				}(this));
		this.controlsexitbutton.onclick = applyfunction;
		
		this.controlstogglebutton = document.createElement('button');
		this.controlstogglebutton.classList.add("fancybutton");
		this.controlstogglebutton.style.backgroundColor = "#3562de";
		this.controlstogglebutton.innerHTML = "Edit";
		this.controlstogglebutton.style.width = "100px";
		this.controlstogglebutton.style.padding = "8px 16px";
		var somefunction = (function (canvasreference){
						return function(){	
							if (canvasreference.drawingmode === "d") {
								canvasreference.drawingmode = "e";
								canvasreference.controlstogglebutton.innerHTML = "Draw";
								canvasreference.fabriccanvas.isDrawingMode = false;
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									if (everything[i].type == "rect") {
										everything[i].selectable = false;
										break;
									}
								}
							} else {
								canvasreference.drawingmode = "d";
								canvasreference.controlstogglebutton.innerHTML = "Edit";
								canvasreference.fabriccanvas.isDrawingMode = true;
								canvasreference.fabriccanvas.deactivateAll().renderAll();
							}
						};
				}(this));
		this.controlstogglebutton.onclick = somefunction;
		
		this.controlssomebutton = document.createElement('button');
		this.controlssomebutton.classList.add("fancybutton");
		this.controlssomebutton.style.backgroundColor = "#00e038";
		this.controlssomebutton.innerHTML = "Something";
		this.controlssomebutton.style.width = "100px";
		this.controlssomebutton.style.padding = "8px 16px";
		var somefunction = (function (canvasreference){
						return function(){	
							console.log(canvasreference.getJSON());
						};
				}(this));
		this.controlssomebutton.onclick = somefunction;
		
		this.controlsdiv.appendChild(this.controlsexitbutton);
		this.controlsdiv.appendChild(this.controlstogglebutton);
		this.controlsdiv.appendChild(this.controlssomebutton);
		this.thisdiv.appendChild(this.controlsdiv);
		this.controlsdiv.style.display = "none";
		
		this.drawingmode = ""; // empty, d (draw), e (edit)
		
		this.fabriccanvas = new fabric.Canvas("somecanvas"+someid);
		this.fabriccanvas.setWidth(this.width);
		this.fabriccanvas.setHeight(this.height);
		this.fabriccanvas.calcOffset();
		
		this.fabriccanvas.isDrawingMode = false;
		this.fabriccanvas.freeDrawingBrush.width = 5;
		this.fabriccanvas.freeDrawingBrush.color = "#000000";
		
	
		// create a rectangle object
		var rect = new fabric.Rect({
		  left: 0,
		  top: 0,
		  fill: 'white',
		  width: w0,
		  height: h0
		});
		rect.selectable = false;
		this.fabriccanvas.add(rect);
		this.fabriccanvas.selection = false;
		
		this.content = "";
		this.getJSON();
		
		var streamupdatefunction = (function (canvasreference){
						return function(){	
							if (canvasreference.owner.includes(player)) {
								if (canvasreference.streamcontent) {
									canvasreference.getJSON();
									var currentdate = new Date();
									canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
									iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
								}
							} 
						};
				}(this));
		this.fabriccanvas.on('object:added', streamupdatefunction);
		this.fabriccanvas.on('object:removed', streamupdatefunction);
		this.fabriccanvas.on('object:modified', streamupdatefunction);
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
		//this.thiscanvas.style.width = this.displaywidth+"px";
		//this.thiscanvas.style.height = this.displayheight+"px";
		this.fabriccanvas.setWidth(this.displaywidth);
		this.fabriccanvas.setHeight(this.displayheight);
		this.fabriccanvas.setZoom(this.scale * zoomvalue);
	}
	getJSON() {
		this.content = JSON.stringify(this.fabriccanvas);
		return this.content;
	}
	initfromJSON(someJSON) {
		console.log('asd');
		var streamcontent0 = this.streamcontent;
		this.streamcontent = false;
		var somecallback = (function (canvasreference){
						return function(){	
							// restore background - i.e. make it non-selectable
							var everything = canvasreference.fabriccanvas.getObjects();
							for (var i = 0; i < everything.length; i++) {
								if (everything[i].type == "rect") {
									everything[i].remove();
									// create a rectangle object
									var rect = new fabric.Rect({
									  left: 0,
									  top: 0,
									  fill: 'white',
									  width: canvasreference.width,
									  height: canvasreference.height
									});
									rect.selectable = false;
									canvasreference.fabriccanvas.add(rect);
									rect.moveTo(0);
								}
							}
							canvasreference.fabriccanvas.renderAll();
						};
				}(this));
		this.fabriccanvas.loadFromJSON(someJSON, somecallback);
		if (this.drawingmode === "" || this.drawingmode === "d") {
			this.fabriccanvas.selection = false;
			var everything = this.fabriccanvas.getObjects();
			for (var i = 0; i < everything.length; i++) {
				everything[i].selectable = false;
			}
		} else if (this.drawingmode === "e") {
			var everything = this.fabriccanvas.getObjects();
			for (var i = 0; i < everything.length; i++) {
				if (everything[i].type == "rect") {
					everything[i].selectable = false;
					break;
				}
			}
		}
		this.streamcontent = streamcontent0;
	}
	loadproperties(somecanvas) {
		for (var i = 0; i < relevantdata_canvasframe.length; i++) {
			this[relevantdata_canvasframe[i]] = somecanvas[relevantdata_canvasframe[i]];
		}
		this.setdisplayposition();
		this.setdisplayscale();
		this.initfromJSON(this.content);
	}
}

