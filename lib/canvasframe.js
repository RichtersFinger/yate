
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
		
		this.history = new LinkedList();
		this.currenthistory = null;
		
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
						// close other canvas editors
						var current = canvasframes.head;
						for (var i = 0; i < canvasframes.length; i++) {
							if (current.value.drawingmode !== "") {
								current.value.drawingmode = "";
								current.value.fabriccanvas.selection = false;
								var everything = current.value.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									everything[i].selectable = false;
								}
								current.value.fabriccanvas.isDrawingMode = false;
								current.value.fabriccanvas.deactivateAll().renderAll();
								current.value.thisdiv.style.backgroundColor = "white";
								current.value.controlsdiv.style.display = "none";
								current.value.thisdiv.style.zIndex = current.value.zIndex;
							}
							current = current.next;
						}
						
						this.drawingmode = "d";
						this.fabriccanvas.selection = true;
						var everything = this.fabriccanvas.getObjects();
						for (var i = 0; i < everything.length; i++) {
							everything[i].selectable = true;
						}
						this.fabriccanvas.isDrawingMode = true;
						this.controlstogglebutton.innerHTML = "Edit";
						this.thisdiv.style.backgroundColor = this.backgroundedithighlight;
						this.controlsaddimgbutton.disabled = player !== 0;
						if (player === 0) {
							this.controlsaddimgbutton.style.backgroundColor = "#3562de";
						} else {
							this.controlsaddimgbutton.style.backgroundColor = "#777777";
						}
						this.controlsdiv.style.display = "";
						this.thisdiv.style.zIndex = zcounter + 1;
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
							this.thisdiv.style.zIndex = this.zIndex;
						}
					}
				}
			}
		});
					
		this.thiscanvas = document.createElement('canvas');
		this.thiscanvas.id = "somecanvas"+someid;
		this.thiscanvasdiv = document.createElement('div');
		this.thiscanvasdiv.style.cssFloat = "left";
		this.thiscanvasdiv.appendChild(this.thiscanvas);
		this.thiscanvasdiv.style.padding = "0px";
		this.thisdiv.appendChild(this.thiscanvasdiv);
		
		
		this.controlsdiv = document.createElement('div');
		this.controlsdiv.style.backgroundColor = "#cccccc";
		this.controlsdiv.style.cssFloat = "left";
		this.controlsdiv.style.padding = "3px";
		//this.controlsdiv.style.display = 'none';
		//this.controlsdiv.style.width = "100%";
		this.controlsdiv.style.height = "100%";
		//this.controlsdiv.style.width = "300px";
		
		this.controlsexitbutton = document.createElement('button');
		this.controlsexitbutton.classList.add("fancybutton");
		this.controlsexitbutton.style.backgroundColor = "#38e038";
		this.controlsexitbutton.innerHTML = "Apply";
		this.controlsexitbutton.style.width = "100px";
		this.controlsexitbutton.style.height = "40px";
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
		this.controlstogglebutton.style.height = "40px";
		this.controlstogglebutton.style.padding = "8px 16px";
		var togglefunction = (function (canvasreference){
						return function(){	
							if (canvasreference.drawingmode === "d") {
								canvasreference.drawingmode = "e";
								canvasreference.controlstogglebutton.innerHTML = "Draw";
								canvasreference.fabriccanvas.isDrawingMode = false;
								canvasreference.fabriccanvas.selection = true;
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									if (everything[i].type == "rect") {
										everything[i].selectable = false;
									} else {
										everything[i].selectable = true;
									}
								}
							} else {
								canvasreference.drawingmode = "d";
								canvasreference.controlstogglebutton.innerHTML = "Edit";
								canvasreference.fabriccanvas.isDrawingMode = true;
								canvasreference.fabriccanvas.selection = false;
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									everything[i].selectable = false;
								}
								canvasreference.fabriccanvas.deactivateAll().renderAll();
							}
						};
				}(this));
		this.controlstogglebutton.onclick = togglefunction;
		
		this.controlsundobutton = document.createElement('button');
		this.controlsundobutton.classList.add("fancybutton");
		this.controlsundobutton.style.padding = "0px";
		this.controlsundobutton.style.margin = "3px";
		//this.controlsundobutton.style.border = "2px solid #FFFFFF";
		this.controlsundobutton.style.width = "40px";
		this.controlsundobutton.style.height = "40px";
		this.controlsundobutton.style.background = "url('img/_server_/undo.png')"; 
		this.controlsundobutton.style.backgroundSize = "40px 40px";
		
		this.changinghistory = false;
		this.resethistory = false;
		var undofunction = (function (canvasreference){
						return function(){
							if (canvasreference.currenthistory && canvasreference.currenthistory.next) {
								canvasreference.currenthistory = canvasreference.currenthistory.next;
							}
							
							if (canvasreference.currenthistory) {
								canvasreference.changinghistory = true;
								canvasreference.initfromJSON(canvasreference.currenthistory.value);
								canvasreference.changinghistory = false;
								if (canvasreference.streamcontent) {
									var currentdate = new Date();
									canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
									iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
								}
							}
						};
				}(this));
		this.controlsundobutton.onclick = undofunction;
		
		this.controlsredobutton = document.createElement('button');
		this.controlsredobutton.classList.add("fancybutton");
		this.controlsredobutton.style.padding = "0px";
		this.controlsredobutton.style.margin = "3px";
	//	this.controlsredobutton.style.border = "2px solid #FFFFFF";
		this.controlsredobutton.style.width = "40px";
		this.controlsredobutton.style.height = "40px";
		this.controlsredobutton.style.background = "url('img/_server_/redo.png')"; 
		this.controlsredobutton.style.backgroundSize = "40px 40px";
		
		var redofunction = (function (canvasreference){
						return function(){
							if (canvasreference.currenthistory && canvasreference.currenthistory.prev) {
								canvasreference.currenthistory = canvasreference.currenthistory.prev;
							}
							
							if (canvasreference.currenthistory) {
								canvasreference.changinghistory = true;
								canvasreference.initfromJSON(canvasreference.currenthistory.value);
								canvasreference.changinghistory = false;
								if (canvasreference.streamcontent) {
									var currentdate = new Date();
									canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
									iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
								}
							}
						};
				}(this));
		this.controlsredobutton.onclick = redofunction;
		
		this.brushthicknesslabel = document.createElement('label');
		this.brushthicknesslabel.innerHTML = "Brush Size:";
		this.brushthicknesslabel.style.font = "13px Arial, sans-serif";
		this.brushthicknessinput = document.createElement('input');
		this.brushthicknessinput.type = "range";
		this.brushthicknessinput.min = "1";
		this.brushthicknessinput.max = "100";
		this.brushthicknessinput.value = "5";
		var changebrushsize = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.width = parseInt(canvasreference.brushthicknessinput.value);
						};
				}(this));
		this.brushthicknessinput.onchange = changebrushsize;
		
		this.brushcolorlabel = document.createElement('label');
		this.brushcolorlabel.innerHTML = "Brush Color:";
		this.brushcolorlabel.style.font = "13px Arial, sans-serif";
		this.brushcolorlabel.style.marginRight = "3px";
		this.brushcolorinput1 = document.createElement('input');
		this.brushcolorinput1.type = "color";
		this.brushcolorinput1.value = "#000000";
		this.brushcolorinput1.style.width = "30px";
		this.brushcolorinput1.style.height = "30px";
		var changebrushcolor1 = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput1.value;
						};
				}(this));
		this.brushcolorinput1.onchange = changebrushcolor1;
		this.brushcolorinput1.onclick = changebrushcolor1;
		
		this.brushcolorinput2 = document.createElement('input');
		this.brushcolorinput2.type = "color";
		this.brushcolorinput2.value = "#000000";
		this.brushcolorinput2.style.width = "30px";
		this.brushcolorinput2.style.height = "30px";
		var changebrushcolor2 = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput2.value;
						};
				}(this));
		this.brushcolorinput2.onchange = changebrushcolor2;
		this.brushcolorinput2.onclick = changebrushcolor2;
		
		this.brushcolorinput3 = document.createElement('input');
		this.brushcolorinput3.type = "color";
		this.brushcolorinput3.value = "#000000";
		this.brushcolorinput3.style.width = "30px";
		this.brushcolorinput3.style.height = "30px";
		var changebrushcolor3 = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput3.value;
						};
				}(this));
		this.brushcolorinput3.onchange = changebrushcolor3;
		this.brushcolorinput3.onclick = changebrushcolor3;
		
		this.brushcolorinput4 = document.createElement('input');
		this.brushcolorinput4.type = "color";
		this.brushcolorinput4.value = "#000000";
		this.brushcolorinput4.style.width = "30px";
		this.brushcolorinput4.style.height = "30px";
		var changebrushcolor4 = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput4.value;
						};
				}(this));
		this.brushcolorinput4.onchange = changebrushcolor4;
		this.brushcolorinput4.onclick = changebrushcolor4;
		
		this.brushcolorinput5 = document.createElement('input');
		this.brushcolorinput5.type = "color";
		this.brushcolorinput5.value = "#000000";
		this.brushcolorinput5.style.width = "30px";
		this.brushcolorinput5.style.height = "30px";
		var changebrushcolor5 = (function (canvasreference){
						return function(){	
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput5.value;
						};
				}(this));
		this.brushcolorinput5.onchange = changebrushcolor5;
		this.brushcolorinput5.onclick = changebrushcolor5;
		
		
		this.controlsaddimgbutton = document.createElement('button');
		this.controlsaddimgbutton.classList.add("fancybutton");
		this.controlsaddimgbutton.style.backgroundColor = "#3562de";
		this.controlsaddimgbutton.innerHTML = "Add image";
		this.controlsaddimgbutton.style.width = "120px";
		this.controlsaddimgbutton.style.height = "40px";
		this.controlsaddimgbutton.style.padding = "8px 16px";
		var addimgfunction = (function (canvasreference){
						return function(){	
						loadingimage = true;
						
						loadimagedivcontainer.style.visibility = "";
						loadimagedivcontainer.style.zIndex = zcounter + 100;
						loadimagediv.style.zIndex = zcounter + 120;
						loadimagediv.style.left = document.body.clientWidth/2 - parseInt(loadimagediv.style.width.replace("px", ""))/2 + "px";
						loadimagediv.style.top = "0px";
						
						document.getElementById("loadimageinput").value = 'img/';
						document.getElementById("loadimageinput").focus();
						
						document.getElementById("loadimage_bapply").onclick = function(){
							loadimagedivcontainer.style.visibility = "hidden";
							loadimagediv.style.zIndex = 0;
							loadingimage = false;
							var newimage = document.getElementById("loadimageinput").value;
							if (newimage) {
								$.get(newimage)
									.done(function() {
										fabric.Image.fromURL(newimage, function(oImg) {               
															//oImg.scale(1.0);
															oImg.set({'left':0});
															oImg.set({'top':0});
															canvasreference.fabriccanvas.add(oImg);
														}
										);
									}).fail(function() { 
										alert("Image not found on server.");
									})
							}
						};
						document.getElementById("loadimage_bcancel").onclick = function(){
							loadimagedivcontainer.style.visibility = "hidden";
							loadimagediv.style.zIndex = 0;
							loadingimage = false;
						};
						document.getElementById("loadimagedivcontainer").onmousedown = function(e){
							if (e.target === document.getElementById("loadimagedivcontainer")) {
								loadimagedivcontainer.style.visibility = "hidden";
								loadimagediv.style.zIndex = 0;
								loadingimage = false;
							}
						};
						document.getElementById("loadimage_bupdate").onclick = function(){
							iosocket.emit('reqresourcelist');
						};
						
						
						
						};
				}(this));
		this.controlsaddimgbutton.onclick = addimgfunction;
		
		
		this.controlsdiv.appendChild(this.controlsundobutton);
		this.controlsdiv.appendChild(this.controlsredobutton);
		
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.brushthicknesslabel);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.brushthicknessinput);
		
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.brushcolorlabel);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.brushcolorinput1);
		this.controlsdiv.appendChild(this.brushcolorinput2);
		this.controlsdiv.appendChild(this.brushcolorinput3);
		this.controlsdiv.appendChild(this.brushcolorinput4);
		this.controlsdiv.appendChild(this.brushcolorinput5);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.controlsaddimgbutton);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.controlsexitbutton);
		this.controlsdiv.appendChild(this.controlstogglebutton);
		this.thisdiv.appendChild(this.controlsdiv);
		this.controlsdiv.style.display = "none";
		
		this.drawingmode = ""; // empty, d (draw), e (edit)
		
		this.fabriccanvas = new fabric.Canvas("somecanvas"+someid);
		//this.fabriccanvas.preserveObjectStacking = true;
		this.fabriccanvas.setWidth(this.width);
		this.fabriccanvas.setHeight(this.height);
		this.fabriccanvas.calcOffset();
		
		this.fabriccanvas.isDrawingMode = false;
		this.fabriccanvas.freeDrawingBrush.width = parseInt(this.brushthicknessinput.value);
		this.fabriccanvas.freeDrawingBrush.color = this.brushcolorinput1.value;
		
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
		//this.history.addToHead(this.content);
		//this.currenthistory = this.history.head;
		
		var streamupdatefunction = (function (canvasreference){
						return function(){	
							if (canvasreference.owner.includes(player)) {
								canvasreference.getJSON();
								if (!canvasreference.changinghistory) {
									if (canvasreference.currenthistory) {
										var olength = canvasreference.history.length;
										var current = canvasreference.currenthistory.prev;
										for (var i = 0; i < olength; i++) {
											if (!current) break;
											var toberemoved = current;
											current = current.prev;
											canvasreference.history.moveToHead(toberemoved);
											canvasreference.history.removeFromHead();
										}
									}
									var olength = canvasreference.history.length - 20;
									var current = canvasreference.history.tail;
									for (var i = 0; i < olength; i++) {
										if (!current) break;
										var toberemoved = current;
										current = current.prev;
										canvasreference.history.removeFromTail();
									}
									canvasreference.history.addToHead(canvasreference.content);
									canvasreference.currenthistory = canvasreference.history.head;
								}
								if (canvasreference.streamcontent) {
									var currentdate = new Date();
									canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
									canvasreference.changinghistory = true;
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
		this.content = someJSON;
		var streamcontent0 = this.streamcontent;
		this.streamcontent = false;
		//this.changinghistory = true;
		var somecallback = (function (canvasreference){
						return function() {
							if (canvasreference.drawingmode === "" || canvasreference.drawingmode === "d") {
								canvasreference.fabriccanvas.selection = false;
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									everything[i].selectable = false;
								}
							} else if (canvasreference.drawingmode === "e") {
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									if (everything[i].type == "rect") {
										everything[i].selectable = false;
										break;
									}
								}
							}
							canvasreference.streamcontent = streamcontent0;
							if (canvasreference.resethistory) {
								canvasreference.history = new LinkedList();
								canvasreference.history.addToHead(canvasreference.content);
								canvasreference.currenthistory = canvasreference.history.head;
								canvasreference.resethistory = false;
							}
							canvasreference.changinghistory = false;
							canvasreference.fabriccanvas.renderAll();
						};
				}(this));
		this.fabriccanvas.loadFromJSON(someJSON, somecallback);
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

