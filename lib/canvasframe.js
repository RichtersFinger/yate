
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
		this.streamposition = true;
		this.streamcontent = true;

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
						for (var canvasframe in canvasframes) {
							if (canvasframes[canvasframe].drawingmode !== "") {
								canvasframes[canvasframe].drawingmode = "";
								canvasframes[canvasframe].fabriccanvas.selection = false;
								var everything = canvasframes[canvasframe].fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									everything[i].selectable = false;
								}
								canvasframes[canvasframe].fabriccanvas.isDrawingMode = false;
								canvasframes[canvasframe].fabriccanvas.deactivateAll().renderAll();
								canvasframes[canvasframe].thisdiv.style.backgroundColor = "white";
								canvasframes[canvasframe].controlsdiv.style.display = "none";
								canvasframes[canvasframe].thisdiv.style.zIndex = canvasframes[canvasframe].zIndex;
							}
						}

						adjustzCounter();
						var raisedzindex = 0;
						for (var imageframe in imageframes) {
							raisedzindex = Math.max(imageframes[imageframe].zIndex, raisedzindex);
						}
						for (var canvasframe in canvasframes) {
							raisedzindex = Math.max(canvasframes[canvasframe].zIndex, raisedzindex);
						}
						this.resethistory();

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
						this.thisdiv.style.zIndex = raisedzindex;
						this.controlsdiv.style.zIndex = zcounter + 1;
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
		this.controlsdiv.style.position = "absolute";
		this.controlsdiv.style.right = 0 + "px";
		this.controlsdiv.style.top = 0 + "px";
		this.controlsdiv.style.backgroundColor = "#cccccc";
		//this.controlsdiv.style.cssFloat = "right";
		this.controlsdiv.style.padding = "3px";
		this.controlsdiv.style.borderLeft = "1px solid white";
		this.controlsdiv.style.borderBottom = "1px solid white";
		//this.controlsdiv.style.height = "100%";

		var pushafterchangefunction = (function (canvasreference){
						return function(){
							var currentdate = new Date();
							canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
							// > 800KB for standard maxHttpBufferSize: 1e6
							// > 8MB for maxHttpBufferSize: 1e7 in socket.io config in file 'index.js'
							if (new Blob([canvasreference.content]).size > 8500000) {
								alert('This will possibly cause a connection error for canvas content size being too large.');
							}
							iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
						}
				}(this));

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
							pushafterchangefunction();
							canvasreference.thisdiv.style.zIndex = canvasreference.zIndex;
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
		var onmouseoverfunction = (function (someelement){
						return function(){
							someelement.classList.add('classWithShadow');
						};
				}(this.controlsundobutton));
		var onmouseoutfunction = (function (someelement){
						return function(){
							someelement.classList.remove('classWithShadow');
						};
				}(this.controlsundobutton));
		this.controlsundobutton.onmouseover = onmouseoverfunction;
		this.controlsundobutton.onmouseout = onmouseoutfunction;

		this.changinghistory = false;
		//this.resethistory = false;
		var undofunction = (function (canvasreference){
						return function(){
							if (canvasreference.currenthistory && canvasreference.currenthistory.next) {
								canvasreference.currenthistory = canvasreference.currenthistory.next;
							}

							if (canvasreference.currenthistory) {
								canvasreference.changinghistory = true;
								canvasreference.initfromJSON(canvasreference.currenthistory.value, pushafterchangefunction);

								if (canvasreference.streamcontent) {
									var currentdate = new Date();
									canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
									// > 800KB for standard maxHttpBufferSize: 1e6
									// > 8MB for maxHttpBufferSize: 1e7 in socket.io config in file 'index.js'
									if (new Blob([canvasreference.content]).size > 8500000) {
										alert('This will possibly cause a connection error for canvas content size being too large.');
									}
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
		var onmouseoverfunction = (function (someelement){
						return function(){
							someelement.classList.add('classWithShadow');
						};
				}(this.controlsredobutton));
		var onmouseoutfunction = (function (someelement){
						return function(){
							someelement.classList.remove('classWithShadow');
						};
				}(this.controlsredobutton));
		this.controlsredobutton.onmouseover = onmouseoverfunction;
		this.controlsredobutton.onmouseout = onmouseoutfunction;

		var redofunction = (function (canvasreference){
						return function(){
							if (canvasreference.currenthistory && canvasreference.currenthistory.prev) {
								canvasreference.currenthistory = canvasreference.currenthistory.prev;
							}

							if (canvasreference.currenthistory) {
								canvasreference.changinghistory = true;
								canvasreference.initfromJSON(canvasreference.currenthistory.value, pushafterchangefunction);
							}
						};
				}(this));
		this.controlsredobutton.onclick = redofunction;


		this.controlsresetbutton = document.createElement('button');
		this.controlsresetbutton.classList.add("fancybutton");
		this.controlsresetbutton.style.padding = "0px";
		this.controlsresetbutton.style.float = "right";
		this.controlsresetbutton.style.margin = "3px";
		this.controlsresetbutton.style.width = "40px";
		this.controlsresetbutton.style.height = "40px";
		this.controlsresetbutton.style.background = "url('img/_server_/reset.png')";
		this.controlsresetbutton.style.backgroundSize = "40px 40px";
		var onmouseoverfunction = (function (someelement){
						return function(){
							someelement.classList.add('classWithShadow');
						};
				}(this.controlsresetbutton));
		var onmouseoutfunction = (function (someelement){
						return function(){
							someelement.classList.remove('classWithShadow');
						};
				}(this.controlsresetbutton));
		this.controlsresetbutton.onmouseover = onmouseoverfunction;
		this.controlsresetbutton.onmouseout = onmouseoutfunction;

		var resetfunction = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.clear();
							var rect = new fabric.Rect({
							  left: 0,
							  top: 0,
							  fill: canvasreference.backgroundcolorinputcolor,
							  width: canvasreference.width,
							  height: canvasreference.height
							});
							rect.selectable = false;
							canvasreference.fabriccanvas.add(rect);
							pushafterchangefunction();
						};
				}(this));
		this.controlsresetbutton.onclick = resetfunction;


		this.backgroundcolorlabel = document.createElement('label');
		this.backgroundcolorlabel.innerHTML = "Background Color:";
		this.backgroundcolorlabel.style.font = "13px Arial, sans-serif";
		this.backgroundcolorinput = document.createElement('input');
		this.backgroundcolorinput.type = "color";
		this.backgroundcolorinputcolor = "#dddddd";
		this.backgroundcolorinput.value = this.backgroundcolorinputcolor;
		this.backgroundcolorinput.style.width = "30px";
		this.backgroundcolorinput.style.height = "30px";
		var changebackgroundcolor = (function (canvasreference){
						return function(){
							var everything = canvasreference.fabriccanvas.getObjects();
							for (var i = 0; i < everything.length; i++) {
								if (everything[i].type == "rect") {
									canvasreference.backgroundcolorinputcolor = canvasreference.backgroundcolorinput.value;
									everything[i].fill = canvasreference.backgroundcolorinputcolor;
									break;
								}
							}
							canvasreference.fabriccanvas.renderAll();
						};
				}(this));
		var streamcurrent =  (function (canvasreference){
						return function(){
							if (canvasreference.streamcontent) {
								canvasreference.getJSON();
								var currentdate = new Date();
								canvasreference.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
								// > 800KB for standard maxHttpBufferSize: 1e6
								// > 8MB for maxHttpBufferSize: 1e7 in socket.io config in file 'index.js'
								if (new Blob([canvasreference.content]).size > 8500000) {
									alert('This will possibly cause a connection error for canvas content size being too large.');
								}
								iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
							}
						};
				}(this));
		this.backgroundcolorinput.onchange = function(){changebackgroundcolor();streamcurrent();};
		this.backgroundcolorinput.onclick = function(){changebackgroundcolor();streamcurrent();};
		this.backgroundcolorinput.oninput = changebackgroundcolor;

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
		this.brushcolorinput1color = "#000000";
		this.brushcolorinput1.value = this.brushcolorinput1color;
		this.brushcolorinput1.style.width = "30px";
		this.brushcolorinput1.style.height = "30px";
		var changebrushcolor1 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput1.value;
						};
				}(this));
		this.brushcolorinput1.onchange = changebrushcolor1;
		this.brushcolorinput1.onclick = changebrushcolor1;
		this.brushcolorinput1.oninput = changebrushcolor1;

		this.brushcolorinput2 = document.createElement('input');
		this.brushcolorinput2.type = "color";
		this.brushcolorinput2color = "#eb1717";
		this.brushcolorinput2.value = this.brushcolorinput2color;
		this.brushcolorinput2.style.width = "30px";
		this.brushcolorinput2.style.height = "30px";
		var changebrushcolor2 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput2.value;
						};
				}(this));
		this.brushcolorinput2.onchange = changebrushcolor2;
		this.brushcolorinput2.onclick = changebrushcolor2;
		this.brushcolorinput2.oninput = changebrushcolor2;

		this.brushcolorinput3 = document.createElement('input');
		this.brushcolorinput3.type = "color";
		this.brushcolorinput3color = "#4287f5";
		this.brushcolorinput3.value = this.brushcolorinput3color;
		this.brushcolorinput3.style.width = "30px";
		this.brushcolorinput3.style.height = "30px";
		var changebrushcolor3 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput3.value;
						};
				}(this));
		this.brushcolorinput3.onchange = changebrushcolor3;
		this.brushcolorinput3.onclick = changebrushcolor3;
		this.brushcolorinput3.oninput = changebrushcolor3;

		this.brushcolorinput4 = document.createElement('input');
		this.brushcolorinput4.type = "color";
		this.brushcolorinput4color = "#42f55a";
		this.brushcolorinput4.value = this.brushcolorinput4color;
		this.brushcolorinput4.style.width = "30px";
		this.brushcolorinput4.style.height = "30px";
		var changebrushcolor4 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput4.value;
						};
				}(this));
		this.brushcolorinput4.onchange = changebrushcolor4;
		this.brushcolorinput4.onclick = changebrushcolor4;
		this.brushcolorinput4.oninput = changebrushcolor4;

		this.brushcolorinput5 = document.createElement('input');
		this.brushcolorinput5.type = "color";
		this.brushcolorinput5color = "#f5ef42";
		this.brushcolorinput5.value = this.brushcolorinput5color;
		this.brushcolorinput5.style.width = "30px";
		this.brushcolorinput5.style.height = "30px";
		var changebrushcolor5 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput5.value;
						};
				}(this));
		this.brushcolorinput5.onchange = changebrushcolor5;
		this.brushcolorinput5.onclick = changebrushcolor5;
		this.brushcolorinput5.oninput = changebrushcolor5;

		this.brushcolorinput6 = document.createElement('input');
		this.brushcolorinput6.type = "color";
		this.brushcolorinput6color = "#ffffff";
		this.brushcolorinput6.value = this.brushcolorinput6color;
		this.brushcolorinput6.style.width = "30px";
		this.brushcolorinput6.style.height = "30px";
		var changebrushcolor6 = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.freeDrawingBrush.color = canvasreference.brushcolorinput6.value;
						};
				}(this));
		this.brushcolorinput6.onchange = changebrushcolor6;
		this.brushcolorinput6.onclick = changebrushcolor6;
		this.brushcolorinput6.oninput = changebrushcolor6;

		this.elementslabel = document.createElement('label');
		this.elementslabel.innerHTML = "Add Elements:";
		this.elementslabel.style.font = "13px Arial, sans-serif";

		this.controlsaddimgbutton = document.createElement('button');
		this.controlsaddimgbutton.classList.add("fancybutton");
		this.controlsaddimgbutton.style.backgroundColor = "#3562de";
		this.controlsaddimgbutton.innerHTML = "Image";
		this.controlsaddimgbutton.style.width = "100px";
		this.controlsaddimgbutton.style.height = "40px";
		this.controlsaddimgbutton.style.padding = "8px 16px";
		var addimgfunction = (function (canvasreference){
						return function(){
						loadingimage = true;

						loadimagediv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
						loadimagedivcontainer.style.visibility = "";
						document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "";
						document.getElementById("loadimage_bapply").style.visibility = "";
						document.getElementById("loadimage_bcancel").style.visibility = "";
						document.getElementById("loadimage_bupdate").style.visibility = "";
						document.getElementById("loadimage_label").style.visibility = "hidden";
						loadimagedivcontainer.style.zIndex = zcounter + 1;
						loadimagediv.style.zIndex = zcounter + 2;
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
						loadimagediv.ondragenter = function(e){
							return false;
						};
						loadimagediv.ondragover = function(e){
							return false;
						};
						loadimagediv.ondragleave = function(e){
							return false;
						};
						loadimagediv.ondrop = function(e){
							return false;
						};
						document.getElementById("loaddescription_label").ondrop = function(e){
							return false;
						};

						};
				}(this));
		this.controlsaddimgbutton.onclick = addimgfunction;

		this.controlsaddtxtbutton = document.createElement('button');
		this.controlsaddtxtbutton.classList.add("fancybutton");
		this.controlsaddtxtbutton.style.backgroundColor = "#3562de";
		this.controlsaddtxtbutton.innerHTML = "Text";
		this.controlsaddtxtbutton.style.width = "100px";
		this.controlsaddtxtbutton.style.height = "40px";
		this.controlsaddtxtbutton.style.padding = "8px 16px";
		var addtxtfunction = (function (canvasreference){
						return function(){
							canvasreference.fabriccanvas.add(new fabric.IText('I love fabricjs.'));
						};
				}(this));
		this.controlsaddtxtbutton.onclick = addtxtfunction;

		this.contentslabel = document.createElement('label');
		this.contentslabel.innerHTML = "Copy/Load Contents:";
		this.contentslabel.style.font = "13px Arial, sans-serif";
		this.controlscopyJSONbutton = document.createElement('button');
		this.controlscopyJSONbutton.classList.add("fancybutton");
		this.controlscopyJSONbutton.style.backgroundColor = "#3562de";
		this.controlscopyJSONbutton.innerHTML = "Get";
		this.controlscopyJSONbutton.style.width = "100px";
		this.controlscopyJSONbutton.style.height = "40px";
		this.controlscopyJSONbutton.style.padding = "8px 16px";
		var copyJSONfunction = (function (canvasreference){
						return function(){
							var sometextArea = document.createElement("textarea");
							sometextArea.value = canvasreference.getJSON();
							sometextArea.style.top = "100%";
							sometextArea.style.position = "fixed";
							document.body.appendChild(sometextArea);
							sometextArea.focus();
							sometextArea.select();
							document.execCommand('copy');
							canvasreference.controlscopyJSONbutton.innerHTML = "Copied!";
							document.body.removeChild(sometextArea);
						};
				}(this));
		this.controlscopyJSONbutton.onclick = copyJSONfunction;

		this.controlsloadJSONbutton = document.createElement('button');
		this.controlsloadJSONbutton.classList.add("fancybutton");
		this.controlsloadJSONbutton.style.backgroundColor = "#3562de";
		this.controlsloadJSONbutton.innerHTML = "Set";
		this.controlsloadJSONbutton.style.width = "100px";
		this.controlsloadJSONbutton.style.height = "40px";
		this.controlsloadJSONbutton.style.padding = "8px 16px";
		var loadJSONfunction = (function (canvasreference){
						return function(){
							var newcontent = prompt("Enter JSON content.", "");
							if (newcontent) {
								canvasreference.changinghistory = true;
								canvasreference.initfromJSON(newcontent, pushafterchangefunction);
							}
						};
				}(this));
		this.controlsloadJSONbutton.onclick = loadJSONfunction;


		this.controlsdiv.appendChild(this.controlsundobutton);
		this.controlsdiv.appendChild(this.controlsredobutton);
		this.controlsdiv.appendChild(this.controlsresetbutton);

		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.backgroundcolorlabel);
		this.controlsdiv.appendChild(this.backgroundcolorinput);

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
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.brushcolorinput4);
		this.controlsdiv.appendChild(this.brushcolorinput5);
		this.controlsdiv.appendChild(this.brushcolorinput6);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.elementslabel);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.controlsaddimgbutton);
		this.controlsdiv.appendChild(this.controlsaddtxtbutton);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.contentslabel);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.controlscopyJSONbutton);
		this.controlsdiv.appendChild(this.controlsloadJSONbutton);
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(document.createElement('br'));
		this.controlsdiv.appendChild(this.controlsexitbutton);
		this.controlsdiv.appendChild(this.controlstogglebutton);
		gamediv.appendChild(this.controlsdiv);
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
		  fill: this.backgroundcolorinputcolor,
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
								canvasreference.controlscopyJSONbutton.innerHTML = "Get";
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
									//canvasreference.changinghistory = true;
									// > 800KB for standard maxHttpBufferSize: 1e6
									// > 8MB for maxHttpBufferSize: 1e7 in socket.io config in file 'index.js'
									if (new Blob([canvasreference.content]).size > 8500000) {
										alert('This will possibly cause a connection error for canvas content size being too large.');
									}
									iosocket.emit('requpdatecanvascontent', canvasreference.id, canvasreference.content, canvasreference.timestamp);
								}
							}
						};
				}(this));
		this.fabriccanvas.on('object:added', streamupdatefunction);
		this.fabriccanvas.on('object:removed', streamupdatefunction);
		this.fabriccanvas.on('object:modified', streamupdatefunction);
		this.fabriccanvas.on('text:changed', streamupdatefunction);
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
		this.fabriccanvas.setWidth(this.displaywidth);
		this.fabriccanvas.setHeight(this.displayheight);
		this.fabriccanvas.setZoom(this.scale * zoomvalue);
	}
	getJSON() {
		this.content = JSON.stringify(this.fabriccanvas);
		return this.content;
	}
	initfromJSON(someJSON, somecallback0) {
		this.content = someJSON;
		var streamcontent0 = this.streamcontent;
		this.streamcontent = false;
		var somecallback = (function (canvasreference, somecallback1){
						return function() {
							if (canvasreference.drawingmode === "" || canvasreference.drawingmode === "d") {
								canvasreference.fabriccanvas.selection = false;
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									everything[i].selectable = false;
									if (everything[i].type == "rect") {
										canvasreference.backgroundcolorinputcolor = everything[i].fill;
										canvasreference.backgroundcolorinput.value = canvasreference.backgroundcolorinputcolor;
									}
								}
							} else if (canvasreference.drawingmode === "e") {
								var everything = canvasreference.fabriccanvas.getObjects();
								for (var i = 0; i < everything.length; i++) {
									if (everything[i].type == "rect") {
										everything[i].selectable = false;
										canvasreference.backgroundcolorinputcolor = everything[i].fill;
										canvasreference.backgroundcolorinput.value = canvasreference.backgroundcolorinputcolor;
										break;
									}
								}
							}
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
							canvasreference.streamcontent = streamcontent0;
							canvasreference.changinghistory = false;
							canvasreference.fabriccanvas.renderAll();
							canvasreference.controlscopyJSONbutton.innerHTML = "Get";
							if (somecallback1) somecallback1();
						};
				}(this, somecallback0));
		this.fabriccanvas.loadFromJSON(someJSON, somecallback);
	}
	resethistory() {
		this.changinghistory = true;
		this.history = new LinkedList();
		this.history.addToHead(this.content);
		this.currenthistory = this.history.head;
		this.changinghistory = false;
	}
	loadproperties2(somecanvas) {
		for (var currentproperty in somecanvas) {
			this[currentproperty] = somecanvas[currentproperty];
		}
		this.setdisplayposition();
		this.setdisplayscale();
		this.thisdiv.style.zIndex = this.zIndex;
		this.changinghistory = true;
		this.initfromJSON(this.content);
	}
}
