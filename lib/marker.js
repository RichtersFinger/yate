var markerfilenamebases = ["img/_server_/marker_red.png", "img/_server_/marker_black.png", "img/_server_/marker_blue.png", "img/_server_/marker_cyan.png", "img/_server_/marker_green.png", "img/_server_/marker_purple.png", "img/_server_/marker_white.png", "img/_server_/marker_yellow.png"];
var markerfilenamebases_labels = ["Red", "Black", "Blue", "Cyan", "Green", "Purple", "White", "Yellow"];

class Marker {
	constructor(someid, parentframe, parentdiv, x0, y0, somesize, filename) {
		this.id = someid;
		this.owner = [0];

		// used to check whether processed in some loop somewhere
		this.touchedthis = false;

		this.what = ContainerTypes.Marker;

		this.parentframe = parentframe;

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
		this.thisimg = document.createElement('img');
		this.thisdiv.appendChild(this.thisimg);
		this.markercolor = 0;

		this.thisdiv.style.position = "absolute";
		this.x = x0;
		this.y = y0;
		this.displayx = 0;
		this.displayy = 0;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.scale = 1.0;
		this.setpositionandscale();
		this.zIndex = zcounter++;
		this.thisdiv.style.zIndex = this.zIndex;

		this.thisimg.style.display = "none";
		this.thisimg.style.backgroundColor = "transparent";
		this.thisimg.style.borderStyle = "none";

		this.filename = "";
		this.desiredfilename;
		this.size = somesize;
		this.thisimg.style.width = zoomvalue*this.size + "px";
		this.thisimg.style.height = zoomvalue*this.size + "px";

		if (markericonimg[this.markercolor].complete) {
			this.redraw();
		} else {
			markericonimg[this.markercolor].addEventListener('load', e => {
				this.redraw();
			});
		}

		this.hasdescription = true;
		this.descriptionopen = false;
		this.descriptionbeingopened = false;
		this.descriptionisprepared = false;
		this.descriptionpositionoffset = 0.5;
		this.editmode = false;
		this.descname = "somename";
		if (typeof filename !== "undefined") {
			this.descfilename = filename;
		} else {
			this.descfilename = "img/markerdemo.jpg";
		}
		this.desctext = "sometext";
		this.zIndexpredesc = this.zIndex;

	}
	redraw() {
		this.thisimg.style.display = "block";
		this.thisimg.src = markerfilenamebases[this.markercolor];
	}
	setpositionandscale() {
		this.displayx = zoomvalue * this.parentframe.scale * this.x;
		this.displayy = zoomvalue * this.parentframe.scale * this.y;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.thisimg.style.width = zoomvalue*this.scale*this.size + "px";
		this.thisimg.style.height = zoomvalue*this.scale*this.size + "px";
	}
	loadproperties(sometoken) {

	}
	applyimage(filename) {
		this.descfilename = filename;
		this.descimage.src = filename;

		var detailviewfunction = (function(markerreference){
						return function(){
							if (!loadingdescription) {
								var borderwidth = 3;
								detailimagedivimg.style.border = borderwidth+"px solid white";

								// set canvas dimensions + position
								var screenw = window.innerWidth - 2*borderwidth;
								var screenh = window.innerHeight - 2*borderwidth;
								var w;
								var h;
								var scaledwidth = Math.max(screenw, screenh/markerreference.descimage.height*markerreference.descimage.width);
								var scaledheight = Math.max(screenw/markerreference.descimage.width*markerreference.descimage.height, screenh);
								if (scaledwidth > screenw) {
									w = screenw;
									h = screenw * scaledheight / scaledwidth;
									if (h > screenh) {
										h = screenh;
										w = screenh * scaledwidth / scaledheight;
									}
								} else {
									if (scaledheight > screenh) {
										h = screenh;
										w = screenh * scaledwidth / scaledheight;
									} else {
										w = scaledwidth;
										h = scaledheight;
									}
								}
								detailimagedivimg.style.width = w + "px";
								detailimagedivimg.style.height = h + "px";
								detailimagedivimg.style.left = (screenw/2 - w/2) + "px";
								detailimagedivimg.style.top = (screenh/2 - h/2) + "px";

								detailimagedivimg.addEventListener('load', e => {
									detailimagediv.style.zIndex = zcounter + 1;
									detailimagediv.style.visibility = "visible";
								});
								detailimagedivimg.src = markerreference.descfilename;
							}
						};
					}(this));
		if (this.descimage.complete) {
			this.descredraw();
			this.descimg.onclick = detailviewfunction;
			this.descimg.onmousedown = function(e){e.preventDefault();};
			if (this.descriptionbeingopened) this.showdescription();
		} else {
			loaderdivcounter++;
			if (!loaderdiv.classList.contains('loader')) {
				loaderdiv.classList.add('loader');
			}
			this.descimage.addEventListener('load', e => {
				this.descredraw();
				this.descimg.onclick = detailviewfunction;
				this.descimg.onmousedown = function(e){e.preventDefault();};
				if (this.descriptionbeingopened) this.showdescription();
				loaderdivcounter--;
				if (loaderdivcounter < 1) {
					loaderdivcounter = 0;
					loaderdiv.classList.remove('loader');
					loaderdiv.style.visibility = "hidden";
				}
			});
		}
	}
	preparedescription() {
		this.descdiv = document.createElement('div');
		this.thisdiv.parentNode.parentNode.appendChild(this.descdiv);
		this.descdiv.classList.add("thisisadescription");
		this.descdiv.style.border = "4px solid white";
		this.descdiv.style.backgroundColor = "lightgrey";
		this.descdiv.style.width = descriptionwidth + "px";
		this.descdiv.style.padding = 5 + "px";
		this.descdiv.style.position = "absolute";
		this.descdiv.style.visibility = "hidden";
		this.descdiv.style.background = "repeating-linear-gradient("+backgrounddirection+"deg, #444 "+0+"px, #444 "+10+"px, #555 "+10+"px, #555 "+50+"px )";

		// title
		this.descnamelabel = document.createElement('h2');
		this.descnamelabel.style.marginTop = 0.1+"em";
		this.descnamelabel.style.marginBottom = 0.15+"em";
		this.descnamelabel.style.color = "#eeeeee";
		this.descnamelabel.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
		this.descdiv.appendChild(this.descnamelabel);
		this.descnamelabel.innerHTML = this.descname;
		// title edit input
		this.descnamelabeledit = document.createElement('input');
		this.descnamelabeledit.type = "text";
		this.descnamelabeledit.placeholder = "Token Name";
		this.descnamelabeledit.value = this.descname;

		// canvas
		this.descimg = document.createElement('img');
		this.descdiv.appendChild(this.descimg);
		this.descimg.style.display = "none";
		this.descimage = new Image();
		this.descimage.src = this.descfilename;
		// text
		this.desctextparagraph = document.createElement('p');
		this.descdiv.appendChild(this.desctextparagraph);
		this.desctextparagraph.style.fontSize = "13px";
		this.desctextparagraph.style.textAlign = "justify";
		this.desctextparagraph.style.color = "#eeeeee";
		this.desctextparagraph.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
		this.desctextparagraph.innerHTML = this.desctext;
		// text edit input
		this.desctextparagraphedit = document.createElement('textarea');
		this.desctextparagraphedit.rows = "8";
		this.desctextparagraphedit.style.width = descriptionwidth-5 + "px";
		this.desctextparagraphedit.placeholder = "Token Description";
		this.desctextparagraphedit.value = this.desctext;
		this.desctextparagraphedit.style.resize = "none";

		// note: make this so it is executed always and only shown if player===0
		if (player == 0) {
			// make buttons
			this.desceditbutton = document.createElement('button');
			this.desceditbutton.classList.add("fancybutton");
			this.desceditbutton.innerHTML = "Edit";
			this.desceditbutton.style.backgroundColor = "#3562de";
			this.descdiv.appendChild(this.desceditbutton);

			this.desccancelbutton = document.createElement('button');
			this.desccancelbutton.classList.add("fancybutton");
			this.desccancelbutton.style.marginLeft = "5px";
			this.desccancelbutton.innerHTML = "Load";
			this.desccancelbutton.style.backgroundColor = "#3562de";
			this.descdiv.appendChild(this.desccancelbutton);


			var editfunction = (function (markerreference){
							return function(){
								if (markerreference.editmode) {
									markerreference.descname = markerreference.descnamelabeledit.value;
									markerreference.descnamelabel.innerHTML = markerreference.descname;
									markerreference.descdiv.replaceChild(markerreference.descnamelabel, markerreference.descnamelabeledit);
									markerreference.desctext = markerreference.desctextparagraphedit.value.replace(/\r?\n/g, '<br>');
									markerreference.desctextparagraph.innerHTML = markerreference.desctext;
									markerreference.descdiv.replaceChild(markerreference.desctextparagraph, markerreference.desctextparagraphedit);
									markerreference.desceditbutton.style.backgroundColor = "#3562de";
									markerreference.desccancelbutton.style.backgroundColor = "#3562de";
									markerreference.desceditbutton.innerHTML = "Edit";
									markerreference.desccancelbutton.innerHTML = "Load";
								} else {
									markerreference.descnamelabeledit.value = markerreference.descname;
									markerreference.desctextparagraphedit.value = markerreference.desctext.replace(/<br>/g, '\n');
									markerreference.descdiv.replaceChild(markerreference.descnamelabeledit, markerreference.descnamelabel);
									markerreference.descdiv.replaceChild(markerreference.desctextparagraphedit, markerreference.desctextparagraph);
									markerreference.desceditbutton.style.backgroundColor = "#38e038";
									markerreference.desccancelbutton.style.backgroundColor = "#d13824";
									markerreference.desceditbutton.innerHTML = "Apply";
									markerreference.desccancelbutton.innerHTML = "Cancel";
								}
								markerreference.editmode = !markerreference.editmode;
							};
					}(this));
			var cancelfunction = (function (markerreference){
							return function(){
								if (markerreference.editmode) {
									markerreference.editmode = false;
									markerreference.descdiv.replaceChild(markerreference.descnamelabel, markerreference.descnamelabeledit);
									markerreference.descdiv.replaceChild(markerreference.desctextparagraph, markerreference.desctextparagraphedit);
									markerreference.desceditbutton.style.backgroundColor = "#3562de";
									markerreference.desccancelbutton.style.backgroundColor = "#3562de";
									markerreference.desceditbutton.innerHTML = "Edit";
									markerreference.desccancelbutton.innerHTML = "Load";
								} else {
									loadingdescription = true;

									loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
									document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "";
									document.getElementById("loaddescription_bapply").style.visibility = "";
									document.getElementById("loaddescription_bcancel").style.visibility = "";
									document.getElementById("loaddescription_bupdate").style.visibility = "";
									document.getElementById("loaddescription_label").style.visibility = "hidden";
									loaddescriptiondivcontainer.style.visibility = "";
									loaddescriptiondivcontainer.style.zIndex = zcounter + 200;
									loaddescriptiondiv.style.zIndex = zcounter + 220;
									loaddescriptiondiv.style.left = document.body.clientWidth/2 - parseInt(loaddescriptiondiv.style.width.replace("px", ""))/2 + "px";
									loaddescriptiondiv.style.top = "0px";

									document.getElementById("loaddescriptioninput").value = 'data/';
									document.getElementById("loaddescriptioninput").focus();
									document.getElementById("loaddescription_bapply").onclick = function(){
										loaddescriptiondivcontainer.style.visibility = "hidden";
										loaddescriptiondiv.style.zIndex = 0;
										loadingdescription = false;
										asyncLoadFile(document.getElementById("loaddescriptioninput").value, function(contents){
											var words = contents.split(/\r?\n/);
											markerreference.descname = words[0];
											markerreference.descnamelabel.innerHTML = markerreference.descname;
											markerreference.desctext = words[2];
											markerreference.desctextparagraph.innerHTML = markerreference.desctext;

											if (words[1] !== "") {
												$.get(words[1])
													.done(function() {
														markerreference.descfilename = words[1];
														markerreference.applyimage(words[1]);
													}).fail(function() {
														alert("Image not found on server.");
													})
											}
										});

									};
									document.getElementById("loaddescription_bcancel").onclick = function(){
										loaddescriptiondivcontainer.style.visibility = "hidden";
										loaddescriptiondiv.style.zIndex = 0;
										loadingdescription = false;
									};
									document.getElementById("loaddescriptiondivcontainer").onmousedown = function(e){
										if (e.target === document.getElementById("loaddescriptiondivcontainer")) {
											loaddescriptiondivcontainer.style.visibility = "hidden";
											loaddescriptiondiv.style.zIndex = 0;
											loadingdescription = false;
										}
									};
									document.getElementById("loaddescription_bupdate").onclick = function(){
										iosocket.emit('reqresourcelist_data');
									};
									loaddescriptiondiv.ondragenter = function(e){
										e.preventDefault();
										document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "hidden";
										document.getElementById("loaddescription_bapply").style.visibility = "hidden";
										document.getElementById("loaddescription_bcancel").style.visibility = "hidden";
										document.getElementById("loaddescription_bupdate").style.visibility = "hidden";
										document.getElementById("loaddescription_label").style.visibility = "";
										loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #888 0px, #888 10px, #999 10px, #999 50px)";
									};
									loaddescriptiondiv.ondragover = function(e){
										e.preventDefault();
									};
									loaddescriptiondiv.ondragleave = function(e){
										e.preventDefault();
										if (e.toElement.parentNode !== loaddescriptiondiv) {
											document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "";
											document.getElementById("loaddescription_bapply").style.visibility = "";
											document.getElementById("loaddescription_bcancel").style.visibility = "";
											document.getElementById("loaddescription_bupdate").style.visibility = "";
											document.getElementById("loaddescription_label").style.visibility = "hidden";
											loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
										}
									};
									document.getElementById("loaddescription_label").style.pointerEvents = "none";
									var ondropfunction = function(e) {
										e.preventDefault();
										e.stopPropagation();
										if (e.dataTransfer.files[0]) {
											if (e.dataTransfer.files[0].type.substring(0,6) == "") {

												console.log('Using file:', e.dataTransfer.files[0]);

												var reader = new FileReader();
												reader.readAsText(e.dataTransfer.files[0]);
												reader.onload = function (e) {
													var words = e.target.result.split(/\r?\n/);
													if (words.length > 1) {
														loaddescriptiondivcontainer.style.visibility = "hidden";
														loaddescriptiondiv.style.zIndex = 0;
														loadingdescription = false;

														markerreference.descname = words[0];
														markerreference.descnamelabel.innerHTML = markerreference.descname;
														markerreference.desctext = words[2];
														markerreference.desctextparagraph.innerHTML = markerreference.desctext;

														if (words[1] !== "") {
															$.get(words[1])
																.done(function() {
																	markerreference.applyimage(words[1]);
																}).fail(function() {
																	alert("Image not found on server.");
																})
														}
													} else {
														document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "";
														document.getElementById("loaddescription_bapply").style.visibility = "";
														document.getElementById("loaddescription_bcancel").style.visibility = "";
														document.getElementById("loaddescription_bupdate").style.visibility = "";
														document.getElementById("loaddescription_label").style.visibility = "hidden";
														loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
														alert('Not a valid file.');
													}
												};
												reader.onerror = function (error) {
													console.log('Error: ', error);
												};
											} else {
												document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "";
												document.getElementById("loaddescription_bapply").style.visibility = "";
												document.getElementById("loaddescription_bcancel").style.visibility = "";
												document.getElementById("loaddescription_bupdate").style.visibility = "";
												document.getElementById("loaddescription_label").style.visibility = "hidden";
												loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
												alert('Not a valid file.', e.dataTransfer.files[0]);
											}
										} else {
											document.getElementById("loaddescriptionautocompletecontainerdiv").style.visibility = "";
											document.getElementById("loaddescription_bapply").style.visibility = "";
											document.getElementById("loaddescription_bcancel").style.visibility = "";
											document.getElementById("loaddescription_bupdate").style.visibility = "";
											document.getElementById("loaddescription_label").style.visibility = "hidden";
											loaddescriptiondiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
											alert('Not a valid file.');
										}
									}
									loaddescriptiondiv.ondrop = ondropfunction;
									document.getElementById("loaddescription_label").ondrop = ondropfunction;
								}
							};
					}(this));

			this.desceditbutton.onclick = editfunction;
			this.desccancelbutton.onclick = cancelfunction;
		}

		this.applyimage(this.descfilename);
		this.descriptionisprepared = true;
	}
	descredraw() {
		this.descimg.style.display = "block";
		this.descimg.style.width = descriptionwidth + "px";
		this.descimg.style.height = (descriptionwidth*this.descimage.height/this.descimage.width) + "px";
		this.descimg.src = this.descfilename;
	}
	showdescription() {
		if (this.parentframe.visible) {
			this.zIndexpredesc = this.thisdiv.style.zIndex;
			if (!this.descriptionisprepared) {
				this.descriptionbeingopened = true;
				this.preparedescription();
				return;
			}
			this.descnamelabel.innerHTML = this.descname;
			this.desctextparagraph.innerHTML = this.desctext;
			var currentzIndex = maxgameelementzIndex();
			this.thisdiv.style.zIndex = currentzIndex + 1;
			this.descdiv.style.zIndex = currentzIndex + 2;

			var originalleft = this.parentframe.displayx + this.parentframe.thisimg.offsetLeft + zoomvalue * this.parentframe.scale*this.x + this.descriptionpositionoffset*zoomvalue * this.scale*this.size;
			var originaltop = this.parentframe.displayy + this.parentframe.thisimg.offsetTop + zoomvalue * this.parentframe.scale*this.y + this.descriptionpositionoffset*zoomvalue * this.scale*this.size;
			cameraposx = cameraposx + Math.max(0, Math.min(originalleft, originalleft + this.descdiv.offsetWidth - window.innerWidth));
			cameraposy = cameraposy + Math.max(0, Math.min(originaltop, originaltop + this.descdiv.offsetHeight - window.innerHeight));
			repositiongamedivelements();
			setbackground();
			this.descdiv.style.left = (this.parentframe.displayx + this.parentframe.thisimg.offsetLeft + zoomvalue * this.parentframe.scale*this.x + this.descriptionpositionoffset*zoomvalue * this.scale*this.size) + "px";
			this.descdiv.style.top = (this.parentframe.displayy + this.parentframe.thisimg.offsetTop + zoomvalue * this.parentframe.scale*this.y + this.descriptionpositionoffset*zoomvalue * this.scale*this.size) + "px";
			if (!this.descriptionopen) {
				this.descdiv.style.opacity = 0;
				//this.descdiv.style.visibility = "";
				fadein(this.descdiv);
			}
			this.descriptionbeingopened = false;
			this.descriptionopen = true;
		}
	}
	hidedescription() {
		if (this.descriptionopen) {
			fadeout(this.descdiv, (function (markerreference){
							return function(){
								markerreference.descriptionopen = false;
								markerreference.thisdiv.style.zIndex = markerreference.zIndexpredesc;
							};
					}(this)));
		}
	}
}
