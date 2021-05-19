var tokencolors = ["#00ff00", "#006400", "#ff0000", "#ffd700", "#0060ad", "#00ffff", "#ff00ff", "#aaaaaa"];
var tokencolors_labels = ["Lime", "Darkgreen", "Red", "Yellow", "Blue", "Aqua", "Fuchsia", "Gray"];
class TokenContainer {
	constructor(someid, parentdiv, x0, y0, somesize, filename) {
		this.id = someid;
		this.owner = [0];
		this.dielink = null;
		this.timestamp = -1;

		// used to check whether processed in some loop somewhere
		this.touchedthis = false;

		this.what = ContainerTypes.TokenContainer;

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
		this.thiscanvas = document.createElement('canvas');
		this.thisdiv.appendChild(this.thiscanvas);

		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "transparent";
		this.unpushedbordercolor = "transparent";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.bordercolor = tokencolors[0];
		this.bordercolorrgbaarray = [];
		this.highlightcolor0 = "red";
		this.highlightcolor = this.bordercolor;
		this.offsetx = 0;
		this.offsety = 0;
		this.displayx = x0 - somesize/2;
		this.displayy = y0 - somesize/2;
		this.streamposition = true;
		this.x = (this.displayx + cameraposx + somesize/2)/zoomvalue;
		this.y = (this.displayy + cameraposy + somesize/2)/zoomvalue;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.zIndex = zcounter++;
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
		this.thiscanvas.style.display = "none";
		this.thiscanvas.style.backgroundColor = this.backgroundcolor0;
		this.thiscanvas.style.borderStyle = "none";
		this.ctx = this.thiscanvas.getContext('2d');
		this.image = new Image();
		this.filename = "";
		this.desiredfilename;
		this.size = somesize;
		this.ctx.canvas.width = this.size;
		this.ctx.canvas.height = this.size;
		this.thiscanvas.style.width = this.size + "px";
		this.thiscanvas.style.height = this.size + "px";

		this.hasdescription = true;
		this.descriptionopen = false;
		this.descriptionbeingopened = false;
		this.descriptionisprepared = false;
		this.descriptionpositionoffset = 0.78;
		this.editmode = false;

		this.descname = "Token " + this.id;
		this.descfilename = this.filename;
		this.desctext = "Token Description";
		this.zIndexpredesc = this.zIndex;

		//this.preparedescription();

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
			this.applyimage("img/_server_/icon_placeholder.png");
		}
	}
	applyimage(filename) {
		this.filename = filename;
		this.image.src = filename;
		if (this.image.complete) {
			this.redraw();

			loaderdivcounter--;
			if (loaderdivcounter < 1) {
				loaderdivcounter = 0;
				loaderdiv.classList.remove('loader');
				loaderdiv.style.visibility = "hidden";
			}
		} else {
			this.image.addEventListener('load', e => {
				this.redraw();

				loaderdivcounter--;
				if (loaderdivcounter < 1) {
					loaderdivcounter = 0;
					loaderdiv.classList.remove('loader');
					loaderdiv.style.visibility = "hidden";
				}
			});
		}
		this.descfilename = this.filename;
		//if (!this.descimage) this.descimage = new Image();
		//if (this.descimg) {
		if (this.descriptionbeingopened || this.descriptionisprepared) {
			this.descimage.src = filename;

			var detailviewfunction = (function(tokenreference){
							return function(){
								if (!loadingdescription) {
									var borderwidth = 3;
									detailimagedivimg.style.border = borderwidth+"px solid white";

									// set canvas dimensions + position
									var screenw = window.innerWidth - 2*borderwidth;
									var screenh = window.innerHeight - 2*borderwidth;
									var w;
									var h;
									var scaledwidth = Math.max(screenw, screenh/tokenreference.descimage.height*tokenreference.descimage.width);
									var scaledheight = Math.max(screenw/tokenreference.descimage.width*tokenreference.descimage.height, screenh);
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
									detailimagedivimg.src = tokenreference.descfilename;

									detailimagediv.style.zIndex = zcounter + 1;
									detailimagediv.style.visibility = "visible";
								}
							};
						}(this));
			if (this.descimage.complete) {
				this.descredraw();
				this.descimg.onclick = detailviewfunction;
				this.descimg.onmousedown = function(e) {e.preventDefault();};
				if (this.descriptionbeingopened) this.showdescription();
			} else {
				this.descimage.addEventListener('load', e => {
					this.descredraw();
					this.descimg.onclick = detailviewfunction;
					this.descimg.onmousedown = function(e){e.preventDefault();};
					if (this.descriptionbeingopened) this.showdescription();
				});
			}
		}
	}
	redraw() {
		this.thiscanvas.style.display = "block";
		this.ctx.canvas.width = this.size;
		this.ctx.canvas.height = this.size;

		this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.beginPath();
		this.ctx.arc(this.size/2, this.size/2, this.size/2-0.05*this.size, 0, 2.0*Math.PI);
		this.ctx.clip();
		this.ctx.closePath();
		this.ctx.drawImage(this.image, this.offsetx, this.offsety, this.scale * this.size, this.scale * this.image.height/this.image.width * this.size);

		this.ctx.beginPath();
		this.ctx.arc(this.size/2, this.size/2, this.size/2-0.03*this.size, 0, 2.0*Math.PI);
		this.ctx.clip();
		this.ctx.strokeStyle = this.bordercolor;
		this.ctx.lineWidth = 0.15*this.size;
		this.ctx.stroke();
		this.ctx.closePath();

		this.ctx.beginPath();
		this.ctx.arc(this.size/2, this.size/2, this.size/2-0.05*this.size, 0, 2.0*Math.PI);
		this.ctx.strokeStyle = this.highlightcolor;
		this.ctx.lineWidth = 0.075*this.size;
		this.ctx.stroke();
		this.ctx.closePath();

	}
	setdisplayposition() {
		this.displayx = zoomvalue * this.x - cameraposx - this.size/2;
		this.displayy = zoomvalue * this.y - cameraposy - this.size/2;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
	}
	loadproperties2(sometoken) {
		for (var currentproperty in sometoken) {
			this[currentproperty] = sometoken[currentproperty];
		}
		if (this.descriptionisprepared) {
			this.descnamelabel.innerHTML = this.descname;
			this.desctextparagraph.innerHTML = this.desctext;
		}
		this.setdisplayposition();
		this.highlightcolor = this.bordercolor;
		this.applyimage(this.filename);
		if (this.descriptionopen) {
			var currentzIndex = maxgameelementzIndex();
			this.thisdiv.style.zIndex = currentzIndex + 1;
			this.descdiv.style.zIndex = currentzIndex + 2;
		} else {
			this.thisdiv.style.zIndex = this.zIndex;
		}
		if (this.visible) {
			this.thisdiv.style.opacity = 1.0;
			this.thisdiv.style.visibility = "visible";
			this.thisdiv.style.zIndex = this.zIndex;
		} else {
			if (player === 0) {
				this.thisdiv.style.zIndex = this.zIndex;
				this.thisdiv.style.visibility = "visible";
				this.thisdiv.style.opacity = 0.5;
			} else {
				this.thisdiv.style.zIndex = 1;
				this.thisdiv.style.visibility = "hidden";
				this.thisdiv.style.opacity = 0.0;
				this.hidedescription();
			}
		}
	}
	preparedescription() {
		this.descdiv = document.createElement('div');
		this.thisdiv.parentNode.appendChild(this.descdiv);
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
		this.desctextparagraph.style.fontSize = "15px";
		this.desctextparagraph.style.textAlign = "justify";
		this.desctextparagraph.style.color = "#eeeeee";
		this.desctextparagraph.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
		this.desctextparagraph.innerHTML = this.desctext;
		this.desctextparagraph.style.overflow = "hidden auto";
		this.desctextparagraph.style.maxHeight = "150px";
		this.desctextparagraph.classList.add("hyphenated");
		// text edit input
		this.desctextparagraphedit = document.createElement('textarea');
		this.desctextparagraphedit.rows = "8";
		this.desctextparagraphedit.style.width = descriptionwidth-5 + "px";
		this.desctextparagraphedit.placeholder = "Token Description";
		this.desctextparagraphedit.value = this.desctext;
		this.desctextparagraphedit.style.resize = "none";

		if (player == 0) {
			// make buttons
			this.getrandomfacebutton = document.createElement('button');
			this.getrandomfacebutton.classList.add("fancybutton");
			this.getrandomfacebutton.innerHTML = "Random Face";
			this.getrandomfacebutton.style.backgroundColor = "#3562de";
			this.getrandomfacebutton.style.visibility = "hidden";
			this.descdiv.appendChild(this.getrandomfacebutton);
			this.getrandomfacebutton.style.padding = "10px 16px";
			this.getrandomfacebutton.style.position = "absolute";
			this.getrandomfacebutton.style.left = "4px";

			var randomfacefunction = (function (tokenreference){
							return function(){
								if (!alreadyrequestedrandomface) {
									latesttokenreqrandomface = tokenreference;
									alreadyrequestedrandomface = true;
									iosocket.emit('requesttokenrandomimg');
								} else {
									alert('Already requested a random face - still waiting for response.')
								}
							};
					}(this));
			this.getrandomfacebutton.onclick = randomfacefunction;

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

			var editfunction = (function (tokenreference){
							return function(){
								if (tokenreference.editmode) {
									tokenreference.getrandomfacebutton.style.visibility = "hidden";
									tokenreference.descname = tokenreference.descnamelabeledit.value;
									tokenreference.descnamelabel.innerHTML = tokenreference.descname;
									tokenreference.descdiv.replaceChild(tokenreference.descnamelabel, tokenreference.descnamelabeledit);
									tokenreference.desctext = tokenreference.desctextparagraphedit.value.replace(/\r?\n/g, '<br>');
									tokenreference.desctextparagraph.innerHTML = tokenreference.desctext;
									tokenreference.descdiv.replaceChild(tokenreference.desctextparagraph, tokenreference.desctextparagraphedit);
									tokenreference.desceditbutton.style.backgroundColor = "#3562de";
									tokenreference.desccancelbutton.style.backgroundColor = "#3562de";
									tokenreference.desceditbutton.innerHTML = "Edit";
									tokenreference.desccancelbutton.innerHTML = "Load";
								} else {
									tokenreference.descnamelabeledit.value = tokenreference.descname;
									tokenreference.desctextparagraphedit.value = tokenreference.desctext.replace(/<br>/g, '\n');
									tokenreference.descdiv.replaceChild(tokenreference.descnamelabeledit, tokenreference.descnamelabel);
									tokenreference.descdiv.replaceChild(tokenreference.desctextparagraphedit, tokenreference.desctextparagraph);
									tokenreference.desceditbutton.style.backgroundColor = "#38e038";
									tokenreference.desccancelbutton.style.backgroundColor = "#d13824";
									tokenreference.desceditbutton.innerHTML = "Apply";
									tokenreference.desccancelbutton.innerHTML = "Cancel";
									tokenreference.getrandomfacebutton.style.visibility = "";
									tokenreference.getrandomfacebutton.style.top = (tokenreference.desctextparagraphedit.offsetTop - tokenreference.getrandomfacebutton.offsetHeight - 3) +"px";
								}
								tokenreference.editmode = !tokenreference.editmode;
							};
					}(this));
			var cancelfunction = (function (tokenreference){
							return function(){
								if (tokenreference.editmode) {
									tokenreference.editmode = false;
									tokenreference.descdiv.replaceChild(tokenreference.descnamelabel, tokenreference.descnamelabeledit);
									tokenreference.descdiv.replaceChild(tokenreference.desctextparagraph, tokenreference.desctextparagraphedit);
									tokenreference.desceditbutton.style.backgroundColor = "#3562de";
									tokenreference.desccancelbutton.style.backgroundColor = "#3562de";
									tokenreference.desceditbutton.innerHTML = "Edit";
									tokenreference.desccancelbutton.innerHTML = "Load";
									tokenreference.getrandomfacebutton.style.visibility = "hidden";
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
											tokenreference.descname = words[0];
											tokenreference.descnamelabel.innerHTML = tokenreference.descname;
											tokenreference.desctext = words[2];
											tokenreference.desctextparagraph.innerHTML = tokenreference.desctext;

											if (words[1] !== "") {
												$.get(words[1])
													.done(function() {
														tokenreference.applyimage(words[1]);
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

														tokenreference.descname = words[0];
														tokenreference.descnamelabel.innerHTML = tokenreference.descname;
														tokenreference.desctext = words[2];
														tokenreference.desctextparagraph.innerHTML = tokenreference.desctext;

														if (words[1] !== "") {
															$.get(words[1])
																.done(function() {
																	tokenreference.applyimage(words[1]);
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
		this.descriptionisprepared = true;
		if (this.descriptionbeingopened) this.applyimage(this.descfilename);
	}
	descredraw() {
		this.descimg.style.display = "block";
		this.descimg.style.width = descriptionwidth + "px";
		this.descimg.style.height = (descriptionwidth*this.descimage.height/this.descimage.width) + "px";


		this.descimg.src = this.descfilename;
	}
	showdescription() {
		this.zIndexpredesc = this.thisdiv.style.zIndex;
		if (!this.descriptionisprepared) {
			this.descriptionbeingopened = true;
			this.preparedescription();
			return;
		}
		this.descnamelabel.innerHTML = this.descname;
		this.desctextparagraph.innerHTML = this.desctext;
		this.thisdiv.style.zIndex = zcounter + 110;
		this.descdiv.style.zIndex = zcounter + 100;

		var originalleft = this.displayx + this.descriptionpositionoffset*this.size;
		var originaltop = this.displayy + this.descriptionpositionoffset*this.size;
		cameraposx = cameraposx + Math.max(0, Math.min(originalleft, originalleft + this.descdiv.offsetWidth - window.innerWidth));
		cameraposy = cameraposy + Math.max(0, Math.min(originaltop, originaltop + this.descdiv.offsetHeight - window.innerHeight));
		repositiongamedivelements();
		setbackground();
		this.descdiv.style.left = (this.displayx + this.descriptionpositionoffset*this.size) + "px";
		this.descdiv.style.top = (this.displayy + this.descriptionpositionoffset*this.size) + "px";

		if (!this.descriptionopen) {
			this.descdiv.style.opacity = 0;
			//this.descdiv.style.visibility = "";
			fadein(this.descdiv);
		}
		this.descriptionbeingopened = false;
		this.descriptionopen = true;
	}
	hidedescription() {
		if (this.descriptionopen) {
			latesttokenreqrandomface = null;
			fadeout(this.descdiv, (function (tokenreference){
							return function(){
								tokenreference.thisdiv.style.zIndex = tokenreference.zIndexpredesc;
								tokenreference.highlightcolor = tokenreference.bordercolor;
								tokenreference.redraw();
								tokenreference.descriptionopen = false;
							};
					}(this)));
		}
	}
}
