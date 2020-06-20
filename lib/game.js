var iosocket;
var player = -1; // 0: GM; >0: player; <0: undefined
var playername = "myName";
var playernames = [""];
var loginoptionsset = false;

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "Marker":4, "FrameLabel":5};

var loaderdivcounter = 0;
var loaderdiv;

var closeupgray = 'rgba(225,225,225,0.9)';

var gamediv;
var lastmousedownframe = null, lastmenuup = null;
var lastwheelframe = null;
var logdivlist;
var detailimagediv, detailimagedivimg;
var colorinputdivcontainer, colorinputdiv;
var loadimagedivcontainer, loadimagediv;
var loaddescriptiondivcontainer, loaddescriptiondiv;
var loadsounddivcontainer, loadsounddiv;
var audio_loop, audio_oneshot, fadeAudio, basevolume = 0.25, akeydown = false;
var editingcolor = false;
var initialcolor = "#00ff00";
var loadingimage = false;
var loadingdescription = false;
var loadingsound = false;
var markersize = 40;
var backgrounddirection = -55.0+180.0, backgroundwidth1 = 20, backgroundwidth2 = 100, backgroundoffset = 0;
var gamedivzoomfactor = 0.9;
var zcounter = 1; // +50 for player-owned token; +99 for dice (all identical); +100 for gui
var idcounter = 1, dieidcounter = 1;
var lastid = "img/map_template.jpg";
var cameraposx = 0, cameraposy = 0, initialcameraposx = 0, initialcameraposy = 0;

var dragcamera = false;
var InitialMouseDownX = 0, InitialMouseDownY = 0;
var zoomvalue = 1.0, zoommax = 3.0, zoommin = 0.05;

var imageframes = new LinkedList();
var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "visible"];
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext"];
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var tokenframes = new LinkedList();
var dieframes = new LinkedList();

var descriptionwidth = 300;
var openeddescriptions = new LinkedList();
var openeddescription = null;
var descriptiontobeopened = null;
var shouldopendescription = false;

var resourcelist = [""], resourcelist_data = [""], resourcelist_sound = [""];

var repositiontokenframe = false, repositionmarkerframe = false, repositionframelabel = false;
var draggedframe;
var draggedrefx, draggedrefy;
var dragframe = false;

// server update
var servertimereference = -1, clienttimereference = -1;
var currenttime;
var lasttime;

var markericonimg;

var gamecontextmenuup = false;


var showeventlog = false;

$(function(){
	document.title = "Pen&Paper";
	
	var currentdate = new Date();
	currenttime = currentdate.getTime();
	lasttime = currenttime;
	rngseed(currenttime);
	
	gamediv = document.getElementById("gamediv");
	setbackground();
	loaderdiv = document.getElementById("loaderdiv");
	
	logdivlist = document.getElementById("logdivlist");
	
	detailimagediv = document.getElementById("gamedivdetailimage");
	detailimagediv.onclick = function(){
					detailimagediv.style.zIndex = 0;
					detailimagediv.style.visibility = "hidden";
				};
	detailimagedivimg = document.getElementById("gamedivdetailimageimg");
	detailimagedivimg.onmousedown = function(e){e.preventDefault();};
	
	colorinputdivcontainer = document.getElementById("colorinputdivcontainer");
	colorinputdiv = document.getElementById("colorinputdiv");
	loadimagedivcontainer = document.getElementById("loadimagedivcontainer");
	loadimagediv = document.getElementById("loadimagediv");
	autocomplete(document.getElementById("loadimageinput"), "resourcelist");
	loaddescriptiondivcontainer = document.getElementById("loaddescriptiondivcontainer");
	loaddescriptiondiv = document.getElementById("loaddescriptiondiv");
	autocomplete(document.getElementById("loaddescriptioninput"), "resourcelist_data");
	loadsounddivcontainer = document.getElementById("loadsounddivcontainer");
	loadsounddiv = document.getElementById("loadsounddiv");
	autocomplete(document.getElementById("loadsoundinput"), "resourcelist_sound");
	
	
	// preload placeholder image
	var placeholderimg = new Image();
	placeholderimg.src = "img/_server_/placeholder.jpg";
	// preload placeholder icon
	var placeholdericonimg = new Image();
	placeholdericonimg.src = "img/_server_/icon_placeholder.png";
	// preload marker icon
	markericonimg = new Image();
	markericonimg.src = "img/_server_/marker.png";
	// preload dice
	var d20preloadimages = new Array();
	d20preloadimages[0] = new Image();
	d20preloadimages[0].src = "img/_server_/dice/d20_highlight.png";
	for (var i = 1; i < 21; i++) {
		d20preloadimages[i] = new Image();
		d20preloadimages[i].src = "img/_server_/dice/d20_"+i+".png";
	}
	// preload dice
	var d6preloadimages = new Array();
	d6preloadimages[0] = new Image();
	d6preloadimages[0].src = "img/_server_/dice/d6_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages[i] = new Image();
		d6preloadimages[i].src = "img/_server_/dice/d6_"+i+".png";
	}
	
	iosocket = io.connect('/welcome');
	
	iosocket.on('servertime', ( sometime ) => {
		servertimereference = sometime;
		var currentdate = new Date();
		clienttimereference = currentdate.getTime();
		//console.log(sometime);
	});
	iosocket.on('alertmsg', ( somemsg ) => {
		alert(somemsg);
	});
	iosocket.on('loginoptions', ( players, playersloggedin ) => {
		playernames = players;
		//console.log("player names: " + players);
		//console.log("logged in:    " + playersloggedin);
		// first set login options
		if (!loginoptionsset) {
			// change availability
			var charoptions = document.getElementById("characterselect");
			var tmplength = charoptions.options.length;
			for (i = tmplength-1; i >= 0; i--) {
				charoptions[i] = null;
			}
			for (var i = 0; i < players.length; i++) {
				var opt = document.createElement('option');
				opt.appendChild( document.createTextNode(players[i]) );
				opt.value = players[i]; 

				// add opt to end of select box (sel)
				charoptions.appendChild(opt);
			}
			loginoptionsset = true;
			document.getElementById("logindialogbutton").addEventListener("click", function(){
				console.log("logging in as ", charoptions.selectedIndex, document.getElementById("loginpasswordinput").value);
				iosocket.emit('userloginattempt', charoptions.selectedIndex, document.getElementById("loginpasswordinput").value);
			});
			document.getElementById("loginpasswordinput").addEventListener("keydown", function(e){
				if (e.which === 13 || e.keyCode === 13) {
					console.log("logging in as ", charoptions.selectedIndex, document.getElementById("loginpasswordinput").value);
					iosocket.emit('userloginattempt', charoptions.selectedIndex, document.getElementById("loginpasswordinput").value);
				}
			});
			// NOTE: MOVE THIS TO GAME UPDATE //
			document.getElementById("gamedivloginoverlay").style.zIndex = zcounter + 100;
			document.getElementById("logindialogdiv").style.zIndex = zcounter + 110;
			// NOTE: UP TO HERE //
		}
		// change availability
		var charoptions2 = document.getElementById("characterselect");
		var setselected = false;
		for (var i = 0; i < charoptions2.options.length; i++) {
			if (!setselected && !playersloggedin[i] && playersloggedin[charoptions2.selectedIndex]) {
				//console.log("set to index " + i);
				charoptions2.selectedIndex = i;
				setselected = true;
			}
			charoptions2.options[i].disabled = playersloggedin[i];
		}
	});
	iosocket.on('failedlogin', ( msg ) => {
		//alert("Login failed: " + msg);
		document.getElementById("loginstatus").innerHTML = msg;
		
	});
	iosocket.on('loginsuccess', ( playerid, playername ) => {
		player = playerid;
		playername = playername;
		console.log("logged in as ", playername);
		document.getElementById("gamedivloginoverlay").style.visibility = "hidden";
		document.getElementById("logindialogdiv").style.visibility = "hidden";
		
		addsomethingtolog("Login success.")
		if (player === 0) 
			logdivlist.parentNode.style.visibility = "";
		
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.visible) {
				current.value.thisdiv.style.opacity = 1.0;
				current.value.thisdiv.style.zIndex = current.value.zIndex;
			} else {
				if (player === 0) {
					current.value.thisdiv.style.zIndex = current.value.zIndex;
					current.value.thisdiv.style.opacity = 0.5;
				} else {
					current.value.thisdiv.style.zIndex = 1;
					current.value.thisdiv.style.opacity = 0.0;
				}
			}
			current = current.next;
		}
		current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.visible) {
				current.value.thisdiv.style.opacity = 1.0;
				current.value.thisdiv.style.zIndex = current.value.zIndex;
			} else {
				if (player === 0) {
					current.value.thisdiv.style.zIndex = current.value.zIndex;
					current.value.thisdiv.style.opacity = 0.5;
				} else {
					current.value.thisdiv.style.zIndex = 1;
					current.value.thisdiv.style.opacity = 0.0;
				}
			}
			current = current.next;
		}
		adjustzCounter();
	});
	iosocket.on('seteeventlog', ( someeventlogsetting ) => {
		showeventlog = someeventlogsetting;
		if (showeventlog || player === 0) {
			logdivlist.parentNode.style.visibility = "";
		} else {
			logdivlist.parentNode.style.visibility = "hidden";
		}
	});
	iosocket.on('printevent', ( somemessage ) => {
		if (showeventlog || player === 0) {
			addsomethingtolog(somemessage);
		}
	});
	iosocket.on('setdievalue', ( someid, somevalue ) => {
		var current = dieframes.head;
		for (var i = 0; i < dieframes.length; i++) {
			if (current.value.id === someid) {
				current.value.value = somevalue;
				current.value.applyimage();
				addsomethingtolog("You rolled a " + current.value.value + ".")
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('resourcelist', ( someresourcelist ) => {
		resourcelist = someresourcelist;
	});
	iosocket.on('resourcelist_data', ( someresourcelist ) => {
		resourcelist_data = someresourcelist;
	});
	iosocket.on('resourcelist_sound', ( someresourcelist ) => {
		resourcelist_sound = someresourcelist;
	});
	iosocket.on('updateimageframe', ( someframe ) => {
		var current = imageframes.head;
		var foundid = false;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id == someframe.id) {
				current.value.loadproperties(someframe);
				foundid = true;
				break;
			}
			current = current.next;
		}
		if (!foundid) {
			imageframes.addToTail(new FrameContainer(idcounter++, gamediv, 0, 0));
			imageframes.tail.value.loadproperties(someframe);
		}
		adjustzCounter();
	});
	iosocket.on('updateimageframeposition', ( someid, newx, newy, newtimestamp ) => {
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id == someid) {
				if (current.value.timestamp < newtimestamp) {
					current.value.timestamp = newtimestamp;
					current.value.x = newx;
					current.value.y = newy;
					current.value.setdisplayposition();
				}
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('updatetokenframe', ( someframe ) => {
		var current = tokenframes.head;
		var foundid = false;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.id == someframe.id) {
				current.value.loadproperties(someframe);
				foundid = true;
				break;
			}
			current = current.next;
		}
		if (!foundid) {
			tokenframes.addToTail(new TokenContainer(idcounter++, gamediv, 0, 0));
			tokenframes.tail.value.loadproperties(someframe);
		}
		adjustzCounter();
	});
	iosocket.on('updatetokenframeposition', ( someid, newx, newy, newtimestamp ) => {
		var current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.id == someid) {
				if (current.value.timestamp < newtimestamp) {
					current.value.timestamp = newtimestamp;
					current.value.x = newx;
					current.value.y = newy;
					current.value.setdisplayposition();
					if (current.value.descriptionopen) {
						current.value.descdiv.style.left = (current.value.displayx + current.value.descriptionpositionoffset*current.value.size) + "px";
						current.value.descdiv.style.top = (current.value.displayy + current.value.descriptionpositionoffset*current.value.size) + "px";
					}
				}
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('deleteimage', ( someid ) => {
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id == someid) {
				current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
				imageframes.moveToTail(current);
				imageframes.removeFromTail(current);
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('deletetoken', ( someid ) => {
		var current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.id == someid) {
				current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
				tokenframes.moveToTail(current);
				tokenframes.removeFromTail(current);
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('deletemarker', ( someframeid, somemarkerid ) => {
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id == someframeid) {
				break;
			}
			current = current.next;
		}
		var theframe = current.value;
		current = theframe.marker.head;
		for (var i = 0; i < theframe.marker.length; i++) {
			if (current.value.id == somemarkerid) {
				current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
				theframe.marker.remove(current);
				//theframe.marker.removeFromTail(current);
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('playsound', ( somesound, looping ) => {
		// audio_loop, audio_oneshot
		if (looping) {
			if (audio_loop) audio_loop.src = '';
			audio_loop = new Audio(somesound);
			audio_loop.pause();
			audio_loop.volume = basevolume;
			audio_loop.loop = true;
			var fadeoutinterval = 2; 
			fadeAudio = setInterval(function () {
					// Only fade if past the fade out point or not at zero already
					if ((audio_loop.currentTime >= audio_loop.duration - fadeoutinterval) && (audio_loop.volume > 0.0)) {
						audio_loop.volume = Math.max(0.0, audio_loop.volume - 0.1);
					}
					if ((audio_loop.currentTime <= fadeoutinterval) && (audio_loop.volume < basevolume)) {
						audio_loop.volume = Math.min(basevolume, audio_loop.volume + 0.1);
					}
				}, 200);
			audio_loop.play();
		} else {
			if (audio_oneshot) audio_oneshot.src = '';
			audio_oneshot = new Audio(somesound);
			audio_oneshot.pause();
			audio_oneshot.volume = basevolume;
			audio_oneshot.play();
		}
	});
	iosocket.on('stopsound', ( ) => {
		if (fadeAudio) clearInterval(fadeAudio);
		if (audio_loop && audio_oneshot) {
			fadeAudio = setInterval(function () {
				// Only fade if past the fade out point or not at zero already
				if ((audio_loop.volume > 0.0)) {
					audio_loop.volume = Math.max(0.0, audio_loop.volume - 0.01);
				}
				if ((audio_oneshot.volume > 0.0)) {
					audio_oneshot.volume = Math.max(0.0, audio_oneshot.volume - 0.01);
				}
				// When volume at zero stop all the intervalling
				if (audio_loop.volume <= 0.0) {
					audio_loop.pause();
				}
				if (audio_oneshot.volume <= 0.0) {
					audio_oneshot.pause();
				}
				if (audio_loop.volume <= 0.0 && audio_oneshot.volume <= 0.0) 
					clearInterval(fadeAudio);
			}, 40);
		} else if (audio_loop) {
			fadeAudio = setInterval(function () {
				// Only fade if past the fade out point or not at zero already
				if ((audio_loop.volume > 0.0)) {
					audio_loop.volume = Math.max(0.0, audio_loop.volume - 0.01);
				}
				// When volume at zero stop all the intervalling
				if (audio_loop.volume <= 0.0) {
					audio_loop.pause();
				}
				if (audio_loop.volume <= 0.0) 
					clearInterval(fadeAudio);
			}, 40);
		} else if (audio_oneshot) {
			fadeAudio = setInterval(function () {
				// Only fade if past the fade out point or not at zero already
				if ((audio_oneshot.volume > 0.0)) {
					audio_oneshot.volume = Math.max(0.0, audio_oneshot.volume - 0.01);
				}
				// When volume at zero stop all the intervalling
				if (audio_oneshot.volume <= 0.0) {
					audio_oneshot.pause();
				}
				if (audio_oneshot.volume <= 0.0) 
					clearInterval(fadeAudio);
			}, 40);
		}
	});
	
	$(document).keydown(function(e){
		if (e.which === 65 || e.keyCode === 65) {
			akeydown = true;
		}
	});
	$(document).keyup(function(e){
		if (e.which === 65 || e.keyCode === 65) {
			akeydown = false;
		}
	});
	$('#gamediv').mousedown(function(e){
		if (!editingcolor && !loadingimage && !loadingdescription && !loadingsound) {
				
			// init drag positions
			if (e.which === 2) {
				e.preventDefault();
				// drag screen/camera
				dragcamera = true;
				InitialMouseDownX = parseInt(e.clientX);
				InitialMouseDownY = parseInt(e.clientY);
				initialcameraposx = cameraposx;
				initialcameraposy = cameraposy;
			} else {
				dragcamera = false;
			}
			
			if (e.target === this) {
				lastmousedownframe = null;
			}
			if (e.which === 1) {
				//if (lastmousedownframe) e.preventDefault();
				InitialMouseDownX = parseInt(e.clientX);
				InitialMouseDownY = parseInt(e.clientY);
				if (openeddescription) {
					if (!(InitialMouseDownX < parseInt(openeddescription.descdiv.style.left.replace("px", "")) 
						|| InitialMouseDownX > parseInt(openeddescription.descdiv.style.left.replace("px", "")) + parseInt(openeddescription.descdiv.style.width.replace("px", ""))
						|| InitialMouseDownY < parseInt(openeddescription.descdiv.style.top.replace("px", "")) 
						|| InitialMouseDownY > parseInt(openeddescription.descdiv.style.top.replace("px", "")) + parseInt(openeddescription.descdiv.style.height.replace("px", "")))){
						return;
					}
				}
				var topframe = lastmousedownframe;
				if (topframe) {
					if (e.shiftKey) {
						if (openeddescription) {
							openeddescription.hidedescription();
							openeddescription = null;
						}
						// icon inside token drag
						if (player === 0) {
							if (topframe.what == ContainerTypes.TokenContainer) {
								draggedframe = topframe;
								draggedframe.highlightcolor = draggedframe.highlightcolor0;
								draggedframe.redraw();
								draggedframe = topframe;
								draggedrefx = draggedframe.offsetx;
								draggedrefy = draggedframe.offsety;
								repositiontokenframe = true;
							} else if (topframe.what === ContainerTypes.Marker) {
								draggedrefx = topframe.displayx;
								draggedrefy = topframe.displayy;
								draggedframe = topframe;
								repositionmarkerframe = true;
							} else if (topframe.what === ContainerTypes.FrameLabel) {
								draggedrefx = topframe.displayx;
								draggedrefy = topframe.displayy;
								draggedframe = topframe;
								repositionframelabel = true;
							}
						}
					} else {
						if (topframe.owner.includes(player))
							if (topframe.what == ContainerTypes.FrameContainer) 
								topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
						if (topframe.owner.includes(player))
							if (topframe.what == ContainerTypes.TokenContainer) {
								topframe.highlightcolor = topframe.highlightcolor0;
								topframe.redraw();
							}
						if (topframe.hasdescription) {
							if (openeddescription !== topframe) {
								shouldopendescription = true;
								descriptiontobeopened = topframe;
							}
						}
						if (openeddescription) {
							openeddescription.highlightcolor = openeddescription.bordercolor;
							openeddescription.redraw();
							openeddescription.hidedescription();
							openeddescription = null;
						}
						if (topframe.what == ContainerTypes.Die) {
							topframe.highlight = true;
							topframe.redraw();
							draggedframe = topframe;
							draggedrefx = draggedframe.displayx;
							draggedrefy = draggedframe.displayy;
							dragframe = true;
						}
						// image/token drag
						if (topframe.what !== ContainerTypes.Marker && topframe.what !== ContainerTypes.FrameLabel) {
							if (topframe.owner.includes(player)) {
								if (!(topframe.what === ContainerTypes.FrameContainer && topframe.fixposition)) {
									if (topframe.streamposition || player === 0) {
										draggedframe = topframe;
										var currentdate = new Date();
										draggedframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
										draggedrefx = draggedframe.displayx;
										draggedrefy = draggedframe.displayy;
										dragframe = true;
									}
								}
							}
						}
					}
				} else {
					if (openeddescription) {
						if (InitialMouseDownX < parseInt(openeddescription.descdiv.style.left.replace("px", "")) 
							|| InitialMouseDownX > parseInt(openeddescription.descdiv.style.left.replace("px", "")) + parseInt(openeddescription.descdiv.style.width.replace("px", ""))
							|| InitialMouseDownY < parseInt(openeddescription.descdiv.style.top.replace("px", "")) 
							|| InitialMouseDownY > parseInt(openeddescription.descdiv.style.top.replace("px", "")) + parseInt(openeddescription.descdiv.style.height.replace("px", ""))){
							openeddescription.hidedescription();
							openeddescription = null;
						}
					}
				}
			}
		}
	});
	$('#gamediv').mousemove(function(e){
		if (dragcamera) {
			e.preventDefault();
			dragcamera = true;
			cameraposx = initialcameraposx + (InitialMouseDownX - parseInt(e.clientX));
			cameraposy = initialcameraposy + (InitialMouseDownY - parseInt(e.clientY));
			repositiongamedivelements();
			setbackground();
			if (openeddescription) {
				if (openeddescription.what === ContainerTypes.TokenContainer) {
					openeddescription.descdiv.style.left = (openeddescription.displayx + openeddescription.descriptionpositionoffset*openeddescription.size) + "px";
					openeddescription.descdiv.style.top = (openeddescription.displayy + openeddescription.descriptionpositionoffset*openeddescription.size) + "px";
				} else if (openeddescription.what === ContainerTypes.Marker) {
					openeddescription.descdiv.style.left = (openeddescription.parentframe.displayx + openeddescription.parentframe.thisimg.offsetLeft + zoomvalue * openeddescription.parentframe.scale*openeddescription.x + openeddescription.descriptionpositionoffset*zoomvalue * openeddescription.scale*openeddescription.size) + "px";
					openeddescription.descdiv.style.top = (openeddescription.parentframe.displayy + openeddescription.parentframe.thisimg.offsetTop + zoomvalue * openeddescription.parentframe.scale*openeddescription.y + openeddescription.descriptionpositionoffset*zoomvalue * openeddescription.scale*openeddescription.size) + "px";
				}
			}
		}
		if (dragframe) {
			draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
			draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
			draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
			draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
			
			if (draggedframe.streamposition) {
				var currentdate = new Date();
				currenttime = currentdate.getTime();
				//if ( currenttime - lasttime >= 1000/60) {
					lasttime = currenttime;
					if (draggedframe.what == ContainerTypes.FrameContainer) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						iosocket.emit('updateimageposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
					} else if (draggedframe.what == ContainerTypes.TokenContainer) {
						draggedframe.x = (cameraposx + draggedframe.size/2 + draggedframe.displayx)/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.size/2 + draggedframe.displayy)/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						if (Math.abs(parseInt(e.clientX) - InitialMouseDownX) > 0 || Math.abs(parseInt(e.clientY) - InitialMouseDownY) > 0) {
							if (openeddescription) {
								openeddescription.hidedescription();
								openeddescription = null;
							} else {
								shouldopendescription = false;
								descriptiontobeopened = null;
							}
						}
						iosocket.emit('updatetokenposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
					}
				//}
			} else if (draggedframe.what == ContainerTypes.TokenContainer) {
				if (Math.abs(parseInt(e.clientX) - InitialMouseDownX) > 0 || Math.abs(parseInt(e.clientY) - InitialMouseDownY) > 0) {
					if (openeddescription) {
						openeddescription.hidedescription();
						openeddescription = null;
					} else {
						shouldopendescription = false;
						descriptiontobeopened = null;
					}
				}
			}
		} else if (lastmousedownframe) {
			if (Math.abs(parseInt(e.clientX) - InitialMouseDownX) > 0 || Math.abs(parseInt(e.clientY) - InitialMouseDownY) > 0) {
				if (lastmousedownframe.what == ContainerTypes.TokenContainer) {
					if (openeddescription) {
						openeddescription.hidedescription();
						openeddescription = null;
					} else {
						shouldopendescription = false;
						descriptiontobeopened = null;
					}
				} else if (lastmousedownframe.what == ContainerTypes.Marker) {
					if (openeddescription) {
						openeddescription.hidedescription();
						openeddescription = null;
					} else {
						shouldopendescription = false;
						descriptiontobeopened = null;
					}
				}
			}
		}
		if (repositiontokenframe) {
			e.preventDefault();
			draggedframe.offsetx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
			draggedframe.offsety = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
			draggedframe.redraw();
		}
		if (repositionmarkerframe) {
			draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
			draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
			draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
			draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
		}
		if (repositionframelabel) {
			draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
			draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
			draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
			draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
		}
	});
	$('#gamediv').mouseup(function(e){
		if (e.which === 2) {
			dragcamera = false;
		}
		if (e.which === 1) {
			if (descriptiontobeopened) {
				if (shouldopendescription) {
					if (openeddescription) {
						openeddescription.hidedescription();
						openeddescription = null;
					} else {
						if (descriptiontobeopened.what === ContainerTypes.TokenContainer && !descriptiontobeopened.owner.includes(player)) {
							descriptiontobeopened.highlightcolor = descriptiontobeopened.highlightcolor0;
							descriptiontobeopened.redraw();
						}
						openeddescription = descriptiontobeopened;
						descriptiontobeopened.showdescription();
					}
					shouldopendescription = false;
					descriptiontobeopened = null;
				}
			} else if (!openeddescription) {
				var current = imageframes.head;
				for (var i = 0; i < imageframes.length; i++) {
					current.value.thisdiv.style.backgroundColor = current.value.backgroundcolor0;
					current = current.next;
				}
				current = tokenframes.head;
				for (var i = 0; i < tokenframes.length; i++) {
					if (current.value.highlightcolor != current.value.bordercolor) {
						current.value.highlightcolor = current.value.bordercolor;
						current.value.redraw();
					}
					current = current.next;
				}
				current = dieframes.head;
				for (var i = 0; i < dieframes.length; i++) {
					current.value.highlight = false;
					current.value.redraw();
					current = current.next;
				}
			}
			if (dragframe) {
				if (draggedframe) {
					if (draggedframe.what == ContainerTypes.FrameContainer) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						//draggedframe.thisdiv.style.backgroundColor = draggedframe.backgroundcolor0;
					} else if (draggedframe.what == ContainerTypes.TokenContainer) {
						draggedframe.x = (cameraposx + draggedframe.size/2 + draggedframe.displayx)/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.size/2 + draggedframe.displayy)/zoomvalue;
						//draggedframe.highlightcolor = draggedframe.bordercolor;
						//draggedframe.redraw();
					}
				}
				draggedframe = null;
				dragframe = false;
			}
			if (repositiontokenframe) {
				draggedframe = null;
				repositiontokenframe = false;
			}
			if (repositionmarkerframe) {
				draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
				draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
				draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
				draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
				draggedframe.x = draggedframe.displayx / (zoomvalue * draggedframe.parentframe.scale);
				draggedframe.y = draggedframe.displayy / (zoomvalue * draggedframe.parentframe.scale);
				repositionmarkerframe = false;
			}
			if (repositionframelabel) {
				draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
				draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
				draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
				draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
				draggedframe.x = draggedframe.displayx / (zoomvalue * draggedframe.parentframe.scale);
				draggedframe.y = draggedframe.displayy / (zoomvalue * draggedframe.parentframe.scale);
				repositionframelabel = false;
			}
			lastmousedownframe = null;
		}
	});
	gamediv.addEventListener('wheel', function(e){
		if (editingcolor || loadingimage || loadingdescription || loadingsound) return false;
		if (dragcamera || dragframe) return false;
		if (e.target === this) {
			lastwheelframe = null;
		}
		if (e.target.parentNode.parentNode === logdivlist || e.target.parentNode.parentNode.parentNode === logdivlist || e.target.parentNode === logdivlist || e.target === logdivlist || e.target === logdivlist.parentNode) {
			return false;
		}
		if (akeydown) {
			if (e.deltaY > 0) {
				basevolume = Math.max(0.0, basevolume - 0.01);
			}
			if (e.deltaY < 0) {
				basevolume = Math.min(1.0, basevolume + 0.01);
			}
			if (audio_loop) audio_loop.volume = basevolume;
			if (audio_oneshot) audio_oneshot.volume = basevolume;
		} else if (e.altKey) {
			//var topframe = gettopframe(parseInt(e.clientX), parseInt(e.clientY));
			var topframe = lastwheelframe;
			if (topframe) {
				if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer) {
					if (e.deltaY < 0 && topframe.zIndex < 2) return false;
					// change layer
					// look for other id
					var correctframe = null;
					var current = imageframes.head;
					for (var i = 0; i < imageframes.length; i++) {
						if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
							correctframe = current.value;
							break;
						}
						current = current.next;
					}
					if (!correctframe) {
						current = tokenframes.head;
						for (var i = 0; i < tokenframes.length; i++) {
							if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
								correctframe = current.value;
								break;
							}
							current = current.next;
						}
					}
					if (!correctframe) {
						current = dieframes.head;
						for (var i = 0; i < dieframes.length; i++) {
							if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
								correctframe = current.value;
								break;
							}
							current = current.next;
						}
					}
					if (correctframe) {
						// swap partners
						var oldzIndex = topframe.zIndex;
						topframe.zIndex = correctframe.zIndex;
						correctframe.zIndex = oldzIndex;
						topframe.thisdiv.style.zIndex = topframe.zIndex;
						correctframe.thisdiv.style.zIndex = correctframe.zIndex;
					} else {
						// no other frame occupies this zIndex
						topframe.zIndex = topframe.zIndex + Math.sign(e.deltaY);
						topframe.thisdiv.style.zIndex = topframe.zIndex;
						adjustzCounter();
					}
				} else if (topframe.what === ContainerTypes.Marker || topframe.what === ContainerTypes.FrameLabel) {
					if (e.deltaY < 0 && topframe.zIndex < 2) return false;
					// change layer
					// look for other id
					var correctframe = null;
					var current = topframe.parentframe.marker.head;
					for (var i = 0; i < topframe.parentframe.marker.length; i++) {
						if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
							correctframe = current.value;
							break;
						}
						current = current.next;
					}
					if (!correctframe) {
						current = topframe.parentframe.label.head;
						for (var i = 0; i < topframe.parentframe.label.length; i++) {
							if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
								correctframe = current.value;
								break;
							}
							current = current.next;
						}
					}
					if (correctframe) {
						// swap partners
						var oldzIndex = topframe.zIndex;
						topframe.zIndex = correctframe.zIndex;
						correctframe.zIndex = oldzIndex;
						topframe.thisdiv.style.zIndex = topframe.zIndex;
						correctframe.thisdiv.style.zIndex = correctframe.zIndex;
					} else {
						// no other frame occupies this zIndex
						topframe.zIndex = topframe.zIndex + Math.sign(e.deltaY);
						topframe.thisdiv.style.zIndex = topframe.zIndex;
						adjustzCounter();
					}
				}
			}
		} else if (e.shiftKey) {
			// scale frame
			//var topframe = gettopframe(parseInt(e.clientX), parseInt(e.clientY));
			var topframe = lastwheelframe;
			if (topframe) {
				if (topframe.what == ContainerTypes.FrameContainer) {
					var relativex = (parseInt(e.clientX) - topframe.displayx)/topframe.displaywidth;
					var relativey = (parseInt(e.clientY) - topframe.displayy)/topframe.displayheight;
					
					if (e.deltaY > 0) {
						topframe.scale *= 0.9;
						topframe.setdisplayscale();
					}
					if (e.deltaY < 0) {
						topframe.scale /= 0.9;
						topframe.setdisplayscale();
					}
					// update scales
					topframe.setdisplayscale();
					// and position
					topframe.displayx = parseInt(e.clientX) - relativex * topframe.displaywidth;
					topframe.displayy = parseInt(e.clientY) - relativey * topframe.displayheight;
					topframe.x = (cameraposx + topframe.displayx)/topframe.scale/zoomvalue;
					topframe.y = (cameraposy + topframe.displayy)/topframe.scale/zoomvalue;
					topframe.thisdiv.style.left = topframe.displayx+"px";
					topframe.thisdiv.style.top = topframe.displayy+"px";
				}
				if (topframe.what == ContainerTypes.TokenContainer) {
					if (e.deltaY > 0) {
						topframe.scale *= 0.9;
					}
					if (e.deltaY < 0) {
						topframe.scale /= 0.9;
					}
					// update scales
					topframe.redraw();
				} else if (topframe.what == ContainerTypes.Marker) {
					if (e.deltaY > 0) {
						topframe.scale *= 0.9;
					}
					if (e.deltaY < 0) {
						topframe.scale /= 0.9;
					}
					// update scales
					topframe.setpositionandscale();
				}  else if (topframe.what == ContainerTypes.FrameLabel) {
					if (e.deltaY > 0) {
						topframe.scale *= 0.9;
					}
					if (e.deltaY < 0) {
						topframe.scale /= 0.9;
					}
					// update scales
					topframe.setpositionandscale();
				} 
			}
			e.preventDefault();
		} else {
			//var topframe = gettopframe(parseInt(e.clientX), parseInt(e.clientY));
			var topframe = lastwheelframe;
			if (topframe) {
				if (topframe.what === ContainerTypes.Die) {
					if (e.deltaY > 0) {
						topframe.down();
					}
					if (e.deltaY < 0) {
						topframe.up();
					}
					return;
				}
			}
			if (e.deltaY > 0) {
				var prevzoomvalue = zoomvalue;
				zoomvalue = Math.max(zoommin, zoomvalue * gamedivzoomfactor);
				cameraposx = zoomvalue/prevzoomvalue*(parseInt(e.clientX) + cameraposx) - parseInt(e.clientX); 
				cameraposy = zoomvalue/prevzoomvalue*(parseInt(e.clientY) + cameraposy) - parseInt(e.clientY);
				
				rescalegamedivelements();
				repositiongamedivelements();
				//console.log('down ' + zoomvalue);
			}
			if (e.deltaY < 0) {
				var prevzoomvalue = zoomvalue;
				zoomvalue = Math.min(zoommax, zoomvalue / gamedivzoomfactor);
				cameraposx = zoomvalue/prevzoomvalue*(parseInt(e.clientX) + cameraposx) - parseInt(e.clientX); 
				cameraposy = zoomvalue/prevzoomvalue*(parseInt(e.clientY) + cameraposy) - parseInt(e.clientY);
				
				
				rescalegamedivelements();
				repositiongamedivelements();
				//console.log('up ' + zoomvalue);
			}
			setbackground();
			if (openeddescription) {
				openeddescription.showdescription();
				if (openeddescription.what === ContainerTypes.TokenContainer) {
					openeddescription.descdiv.style.left = (openeddescription.displayx + openeddescription.descriptionpositionoffset*openeddescription.size) + "px";
					openeddescription.descdiv.style.top = (openeddescription.displayy + openeddescription.descriptionpositionoffset*openeddescription.size) + "px";
				} else if (openeddescription.what === ContainerTypes.Marker) {
					openeddescription.descdiv.style.left = (openeddescription.parentframe.displayx + openeddescription.parentframe.thisimg.offsetLeft + zoomvalue * openeddescription.parentframe.scale*openeddescription.x + openeddescription.descriptionpositionoffset*zoomvalue * openeddescription.scale*openeddescription.size) + "px";
					openeddescription.descdiv.style.top = (openeddescription.parentframe.displayy + openeddescription.parentframe.thisimg.offsetTop + zoomvalue * openeddescription.parentframe.scale*openeddescription.y + openeddescription.descriptionpositionoffset*zoomvalue * openeddescription.scale*openeddescription.size) + "px";
				}
			}
		}
	});
	
	/**************************************************
	* Context-Menu with Sub-Menu / https://swisnl.github.io/jQuery-contextMenu/
	**************************************************/
	$.contextMenu({
		selector: '.game_context_menu', 
		hideOnSecondTrigger: true,
		events: {
			show: function(opt) {
					gamecontextmenuup = true;
					lastmousedownframe = null;
				},
			hide: function(opt) {
					gamecontextmenuup = false;
					if (lastmenuup) {
						if (lastmenuup.what === ContainerTypes.FrameContainer) {
							lastmenuup.thisdiv.style.backgroundColor = lastmenuup.backgroundcolor0;
						} else if (lastmenuup.what === ContainerTypes.TokenContainer) {
							lastmenuup.highlightcolor = lastmenuup.bordercolor;
							lastmenuup.redraw();
						} else if (lastmenuup.what === ContainerTypes.Die) {
							lastmenuup.highlight = false;
							lastmenuup.redraw();
						} else if (lastmenuup.what === ContainerTypes.Marker) {
							//..
						}
					}
				}
		},
		build: function($trigger, e) {
			if (dragframe || dragcamera || repositiontokenframe) return false;
			if (editingcolor) return false;
			
			InitialMouseDownX = parseInt(e.clientX);
			InitialMouseDownY = parseInt(e.clientY);
			
			if (openeddescription) {
				if (!(InitialMouseDownX < parseInt(openeddescription.descdiv.style.left.replace("px", "")) 
					|| InitialMouseDownX > parseInt(openeddescription.descdiv.style.left.replace("px", "")) + parseInt(openeddescription.descdiv.style.width.replace("px", ""))
					|| InitialMouseDownY < parseInt(openeddescription.descdiv.style.top.replace("px", "")) 
					|| InitialMouseDownY > parseInt(openeddescription.descdiv.style.top.replace("px", "")) + parseInt(openeddescription.descdiv.style.height.replace("px", "")))){
					return false;
				} else {
					openeddescription.hidedescription();
					openeddescription = null;
				}
			}
			
			var thismenu = {
				items: {
				}
			};
			var topframe = lastmousedownframe;			   
			if (topframe) {
				if (topframe.what == ContainerTypes.FrameContainer)
					topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
				if (topframe.what == ContainerTypes.TokenContainer) {
					topframe.highlightcolor = topframe.highlightcolor0;
					topframe.redraw();
				}
				if (topframe.what == ContainerTypes.Die) {
					topframe.highlight = true;
					topframe.redraw();
				}
			}
			
			if (player === 0) {
				thismenu.items["createframe"] = {"name": "New Frame", "callback": function(itemKey, opt){
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												imageframes.addToTail(new FrameContainer(idcounter++, gamediv, InitialMouseDownX, InitialMouseDownY));
												adjustzCounter();
											}
							   };
				thismenu.items["createtoken"] = {"name": "New Token", "callback": function(itemKey, opt){
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												tokenframes.addToTail(new TokenContainer(idcounter++, gamediv, InitialMouseDownX, InitialMouseDownY, 100));
												adjustzCounter();
											}
							   };
				if (topframe) {
					if (topframe.what == ContainerTypes.FrameContainer) {
						thismenu.items["createmarker"] = {"name": "New Marker", "callback": function(itemKey, opt){
												var somesize = markersize;
												var somex = InitialMouseDownX - topframe.displayx - topframe.thisimg.offsetLeft-zoomvalue*somesize/2;
												var somey = InitialMouseDownY - topframe.displayy - topframe.thisimg.offsetTop-zoomvalue*somesize/2;
												var current = topframe.marker.head;
												for (var i = 0; i < topframe.marker.length; i++) {
													topframe.markeridcounter = Math.max(topframe.markeridcounter, 1*current.value.id + 1);
													current = current.next;
												}
												topframe.marker.addToTail(new Marker(topframe.markeridcounter++, topframe, topframe.thisdiv, somex/topframe.scale/zoomvalue, somey/topframe.scale/zoomvalue, markersize, "img/_server_/markerdemo.jpg")); 
													}
									   };
						thismenu.items["createlabel"] = {"name": "New Label", "callback": function(itemKey, opt){
												var somex = InitialMouseDownX - topframe.displayx - topframe.thisimg.offsetLeft;
												var somey = InitialMouseDownY - topframe.displayy - topframe.thisimg.offsetTop;
												var current = topframe.label.head;
												for (var i = 0; i < topframe.label.length; i++) {
													topframe.markeridcounter = Math.max(topframe.markeridcounter, 1*current.value.id + 1);
													current = current.next;
												}
												topframe.label.addToTail(new FrameLabel(topframe.labelidcounter++, topframe, topframe.thisdiv, somex/topframe.scale/zoomvalue, somey/topframe.scale/zoomvalue, "Some Label")); 
													}
									   };
					}
				}
			}
			thismenu.items["die"] = { "name": "New Die", "items": {} };
			thismenu.items.die.items["created6"] = {"name": "New D6", "callback": function(itemKey, opt){
											dieframes.addToTail(new Die(dieidcounter++, gamediv, InitialMouseDownX, InitialMouseDownY, 60, 6, "img/_server_/dice/d6_", "png"));
											adjustzCounter();
										}
						   };
			thismenu.items.die.items["created20"] = {"name": "New D20", "callback": function(itemKey, opt){
											dieframes.addToTail(new Die(dieidcounter++, gamediv, InitialMouseDownX, InitialMouseDownY, 80, 20, "img/_server_/dice/d20_", "png"));
											adjustzCounter();
										}
						   };
						   
			if (player === 0) {
				thismenu.items["sound"] = { "name": "Play Sound", "items": {} };
				thismenu.items.sound.items["playsound"] = {"name": "Play Sound", "callback": function(itemKey, opt){
												loadingsound = true;
					
												loadsounddivcontainer.style.visibility = "";
												loadsounddivcontainer.style.zIndex = zcounter + 100;
												loadsounddiv.style.zIndex = zcounter + 120;
												loadsounddiv.style.left = document.body.clientWidth/2 - parseInt(loadsounddiv.style.width.replace("px", ""))/2 + "px";
												loadsounddiv.style.top = "0px";
												
												document.getElementById("loadsoundinput").value = 'sound/';
												document.getElementById("loadsoundinput").focus();
												document.getElementById("loadsound_bapply").onclick = function(){
													loadsounddivcontainer.style.visibility = "hidden";
													loadsounddiv.style.zIndex = 0;
													loadingsound = false;
													iosocket.emit('requestplaysound', document.getElementById("loadsoundinput").value, false);
												};
												document.getElementById("loadsound_bcancel").onclick = function(){
													loadsounddivcontainer.style.visibility = "hidden";
													loadsounddiv.style.zIndex = 0;
													loadingsound = false;
												};
												document.getElementById("loadsounddivcontainer").onmousedown = function(e){
													if (e.target === document.getElementById("loadsounddivcontainer")) {
														loadsounddivcontainer.style.visibility = "hidden";
														loadsounddiv.style.zIndex = 0;
														loadingsound = false;
													}
												};
												document.getElementById("loadsound_bupdate").onclick = function(){
													iosocket.emit('reqresourcelist_sound');
												};
											}
							   };
				thismenu.items.sound.items["playsoundloop"] = {"name": "Play Looping Sound", "callback": function(itemKey, opt){
												loadingsound = true;
					
												loadsounddivcontainer.style.visibility = "";
												loadsounddivcontainer.style.zIndex = zcounter + 100;
												loadsounddiv.style.zIndex = zcounter + 120;
												loadsounddiv.style.left = document.body.clientWidth/2 - parseInt(loadsounddiv.style.width.replace("px", ""))/2 + "px";
												loadsounddiv.style.top = "0px";
												
												
												document.getElementById("loadsoundinput").value = 'sound/';
												document.getElementById("loadsoundinput").focus();
												
												
												document.getElementById("loadsound_bapply").onclick = function(){
													loadsounddivcontainer.style.visibility = "hidden";
													loadsounddiv.style.zIndex = 0;
													loadingsound = false;
													iosocket.emit('requestplaysound', document.getElementById("loadsoundinput").value, true);
												};
												document.getElementById("loadsound_bcancel").onclick = function(){
													loadsounddivcontainer.style.visibility = "hidden";
													loadsounddiv.style.zIndex = 0;
													loadingsound = false;
												};
												document.getElementById("loadsounddivcontainer").onmousedown = function(e){
													if (e.target === document.getElementById("loadsounddivcontainer")) {
														loadsounddivcontainer.style.visibility = "hidden";
														loadsounddiv.style.zIndex = 0;
														loadingsound = false;
													}
												};
												document.getElementById("loadsound_bupdate").onclick = function(){
													iosocket.emit('reqresourcelist_sound');
												};
											}
							   };
				thismenu.items.sound.items["stopsound"] = {"name": "Stop Sound", "callback": function(itemKey, opt){
												iosocket.emit('requeststopsound');
											}
							   };
				//thismenu.items.sound.items["sep0"] = "---------";
			}
			if (topframe) {
				if (topframe.what === ContainerTypes.Die) {
					thismenu.items["sep1"] = "---------";
					thismenu.items["rolldie"] = {"name": "Roll", "callback": function(itemKey, opt){
													topframe.roll();
												}
								   };
					thismenu.items["deletedie"] = {"name": "Delete", "callback": function(itemKey, opt){
													var current = dieframes.head;
													for (var i = 0; i < dieframes.length; i++) {
														if (current.value.id === topframe.id) {
															current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
															dieframes.remove(current);
															break;
														}
														current = current.next;
													}
												}
								   };
					return thismenu;
				}
			}
			if (player === 0 && topframe) {
				thismenu.items["sep2"] = "---------";
				
				var thisname = "";
				if (topframe.what=== ContainerTypes.FrameContainer) {
					thisname = "Frame";
				} else if (topframe.what === ContainerTypes.TokenContainer) {
					thisname = "Token";
				} else if (topframe.what === ContainerTypes.Marker) {
					thisname = "Marker";
				} else if (topframe.what === ContainerTypes.FrameLabel) {
					thisname = "Label";
				}
				thismenu.items["topframeinfo"] = { "name": thisname + " " + topframe.id, "disabled": true };
				// Container Specific
				// Push this
				// Owner
				// load image
				// details: streamposition, fixposition, has descr., tokensize, tokencolor
				// reload
				// push delete this

				if (topframe.what === ContainerTypes.TokenContainer)
					thismenu.items["copytoken"] = {"name": "Copy Token", "callback": function(itemKey, opt){
													var current = imageframes.head;
													for (var i = 0; i < imageframes.length; i++) {
														idcounter = Math.max(idcounter, 1*current.value.id + 1);
														current = current.next;
													}
													current = tokenframes.head;
													for (var i = 0; i < tokenframes.length; i++) {
														idcounter = Math.max(idcounter, 1*current.value.id + 1);
														current = current.next;
													}
													var tokencopy = new TokenContainer(idcounter++, gamediv, 0, 0, topframe.size);
													var idbackup = tokencopy.id;
													tokencopy.loadproperties(topframe);
													tokencopy.id = idbackup;
													tokencopy.x = topframe.x + 25;
													tokencopy.y = topframe.y + 25;
													tokencopy.setdisplayposition();
													tokenframes.addToTail(tokencopy);
													adjustzCounter();
												}
								   };
				
				
				
				// build owner submenu+callback
				thismenu.items["ownersubmenu"] = { "name": "Set Owner", "items": {} };
				for (var i = 0; i < playernames.length; i++) {
					if (topframe.owner.includes(i))
						thismenu.items.ownersubmenu.items["ownersubmenukey"+i] = {"name": playernames[i], "callback": function(itemKey, opt){
																var thisplayer =  parseInt(itemKey.replace("ownersubmenukey", ""));
																if (topframe.owner.includes(thisplayer)) {
																	topframe.owner.splice(topframe.owner.indexOf(thisplayer), 1);
																	opt.items.ownersubmenu.items[itemKey].$node[0].classList.add("disabledtext"); 
																} else {
																	topframe.owner.push(thisplayer);
																	opt.items.ownersubmenu.items[itemKey].$node[0].classList.remove("disabledtext"); 
																}
																return false;}};//
					else
						thismenu.items.ownersubmenu.items["ownersubmenukey"+i] = {"name": playernames[i], "className": "disabledtext", "callback": function(itemKey, opt){
																var thisplayer =  parseInt(itemKey.replace("ownersubmenukey", ""));
																if (topframe.owner.includes(thisplayer)) {
																	topframe.owner.splice(topframe.owner.indexOf(thisplayer), 1);
																	opt.items.ownersubmenu.items[itemKey].$node[0].classList.add("disabledtext"); 
																} else {
																	topframe.owner.push(thisplayer);
																	opt.items.ownersubmenu.items[itemKey].$node[0].classList.remove("disabledtext"); 
																}
																return false;}};
				}
				thismenu.items["pushthis"] = {"name": "Push This", "callback": function(itemKey, opt){
												// send to server for broadcast
												var currentdate = new Date();
												var actualframe = topframe;
												if (topframe.what == ContainerTypes.Marker || topframe.what == ContainerTypes.FrameLabel) {
													actualframe = topframe.parentframe;
												}
												actualframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
												if (actualframe.what == ContainerTypes.FrameContainer) {
													// make dummy to avoid sending self referencing object
													var tempframe = {};
													for (var i = 0; i < relevantdata_imageframe.length; i++) {
														tempframe[relevantdata_imageframe[i]] = actualframe[relevantdata_imageframe[i]];
													}
													var tempMarkers = new Array();
													var current = actualframe.marker.head;
													for (var i = 0; i < actualframe.marker.length; i++) {
														var tempmarker = {};
														for (var j = 0; j < relevantdata_markerframe.length; j++) {
															tempmarker[relevantdata_markerframe[j]] = current.value[relevantdata_markerframe[j]];
														}
														tempMarkers[i] = tempmarker;
														current = current.next;
													}
													var tempLabels = new Array();
													current = actualframe.label.head;
													for (var i = 0; i < actualframe.label.length; i++) {
														var templabel = {};
														for (var j = 0; j < relevantdata_framelabel.length; j++) {
															templabel[relevantdata_framelabel[j]] = current.value[relevantdata_framelabel[j]];
														}
														tempLabels[i] = templabel;
														current = current.next;
													}
													
													iosocket.emit('pushimage', tempframe, tempMarkers, tempLabels);
												} else if (actualframe.what == ContainerTypes.TokenContainer) {
													iosocket.emit('pushtoken', actualframe);
												}
											}
							   };
				thismenu.items["loadimage"] = {"name": "Load Image", "callback": function(itemKey, opt){
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
																if (topframe.what == ContainerTypes.FrameContainer) {
																	topframe.applyimage(newimage);
																} else if (topframe.what == ContainerTypes.TokenContainer) {
																	topframe.applyimage(newimage);
																} if (topframe.what == ContainerTypes.Marker) {
																	if (topframe.descriptionisprepared) {
																		topframe.descfilename = newimage;
																		topframe.applyimage(newimage);
																	} else {
																		topframe.descfilename = newimage;
																	}
																}
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
												
												// note: continue here.
											}
							   };
				thismenu.items["framedetails"] = { "name": "Details", "items": {} };
				if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer) {
					if (topframe.what === ContainerTypes.FrameContainer) {
						thismenu.items.framedetails.items["thiszindex"] = {"name": "Rearrange This Layering", "callback": function(itemKey, opt){
														topframe.adjustzIndices();
													}
									   };
					}
					if (topframe.streamposition)
						thismenu.items.framedetails.items["positionstreamtoggle"] = {"name": "Position Streaming: On", "callback": function(itemKey, opt){
																if (topframe.streamposition) {
																	topframe.streamposition = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Position Streaming: Off</span>";
																} else {
																	topframe.streamposition = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Position Streaming: On</span>"; 
																}
																return false;}};
					else
						thismenu.items.framedetails.items["positionstreamtoggle"] = {"name": "Position Streaming: Off", "callback": function(itemKey, opt){
																if (topframe.streamposition) {
																	topframe.streamposition = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Position Streaming: Off</span>";
																} else {
																	topframe.streamposition = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Position Streaming: On</span>"; 
																}
																return false;}};
					if (topframe.visible)
						thismenu.items.framedetails.items["visibletoggle"] = {"name": "Visible: Yes", "callback": function(itemKey, opt){
																if (topframe.visible) {
																	topframe.visible = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Visible: No</span>"; 
																} else {
																	topframe.visible = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Visible: Yes</span>";
																}
																if (topframe.visible) {
																	topframe.thisdiv.style.opacity = 1.0;
																}
																else {
																	if (player === 0) {
																		topframe.thisdiv.style.opacity = 0.5;
																	} else {
																		topframe.thisdiv.style.opacity = 0.0;
																	}
																}
																return false;}};
					else
						thismenu.items.framedetails.items["visibletoggle"] = {"name": "Visible: No", "callback": function(itemKey, opt){
																if (topframe.visible) {
																	topframe.visible = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Visible: No</span>";
																} else {
																	topframe.visible = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Visible: Yes</span>"; 
																}
																if (topframe.visible) {
																	topframe.thisdiv.style.opacity = 1.0;
																}
																else {
																	if (player === 0) {
																		topframe.thisdiv.style.opacity = 0.5;
																	} else {
																		topframe.thisdiv.style.opacity = 0.0;
																	}
																}
																return false;}};
				}
				if (topframe.what === ContainerTypes.FrameContainer) {
					if (topframe.fixposition)
						thismenu.items.framedetails.items["positionlocktoggle"] = {"name": "Lock: On", "callback": function(itemKey, opt){
																if (topframe.fixposition) {
																	topframe.fixposition = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Lock: Off</span>";
																} else {
																	topframe.fixposition = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Lock: On</span>";
																}
																return false;}};
					else
						thismenu.items.framedetails.items["positionlocktoggle"] = {"name": "Lock: Off", "callback": function(itemKey, opt){
																if (topframe.fixposition) {
																	topframe.fixposition = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Lock: Off</span>";
																} else {
																	topframe.fixposition = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Lock: On</span>";
																}
																return false;}};
				}
				if (topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.Marker) {
					if (topframe.hasdescription)
						thismenu.items.framedetails.items["hasdescriptiontoggle"] = {"name": "Description: On", "callback": function(itemKey, opt){
																if (topframe.hasdescription) {
																	topframe.hasdescription = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Description: Off</span>";
																} else {
																	topframe.hasdescription = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Description: On</span>";
																}
																return false;}};
					else
						thismenu.items.framedetails.items["hasdescriptiontoggle"] = {"name": "Description: Off", "callback": function(itemKey, opt){
																if (topframe.hasdescription) {
																	topframe.hasdescription = false;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Description: Off</span>";
																} else {
																	topframe.hasdescription = true;
																	opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Description: On</span>";
																}
																return false;}};
				}
				if (topframe.what === ContainerTypes.TokenContainer) 
						thismenu.items.framedetails.items["changetokensize"] = {"name": "Set Token Size", "callback": function(itemKey, opt){
																var newsize = prompt("Enter Size.", topframe.size);
																if (newsize) {
																	if (!isNaN(parseInt(newsize)) && parseInt(newsize) > 0) {
																		topframe.size = parseInt(newsize);
																		topframe.redraw();
																		topframe.thiscanvas.style.width = topframe.size + "px";
																		topframe.thiscanvas.style.height = topframe.size + "px";
																	} else {
																		alert("Non-integer/negative input invalid.")
																	}
																}
																}};
				if (topframe.what === ContainerTypes.TokenContainer) 
						thismenu.items.framedetails.items["changetokencolor"] = {"name": "Set Color", "callback": function(itemKey, opt){
																editingcolor = true;
																initialcolor = topframe.bordercolor;
																colorinput.jscolor.fromString(topframe.bordercolor);
																colorinputdivcontainer.style.visibility = "";
																colorinputdivcontainer.style.zIndex = zcounter + 100;
																topframe.thisdiv.style.zIndex = zcounter + 110;
																colorinputdiv.style.zIndex = zcounter + 120;
																colorinputdiv.style.left = (topframe.displayx + topframe.descriptionpositionoffset*topframe.size) + "px";
																colorinputdiv.style.top = (topframe.displayy + topframe.descriptionpositionoffset*topframe.size) + "px";
																
																// whyever this is needed..
																colorinput.onclick = function(){
																	colorinput.jscolor.show();
																};
																colorinput.onchange = function(){
																	topframe.bordercolor = colorinput.value;
																	topframe.highlightcolor = topframe.bordercolor;
																	topframe.redraw();
																};
																
																document.getElementById("colorinput_bapply").onclick = function(){
																	colorinputdivcontainer.style.visibility = "hidden";
																	colorinput.jscolor.hide();
																	colorinputdivcontainer.style.zIndex = 0;
																	topframe.thisdiv.style.zIndex = topframe.zIndex;
																	colorinputdiv.style.zIndex = 0;
																	editingcolor = false;
																	topframe.bordercolor = colorinput.value;
																	topframe.highlightcolor = topframe.bordercolor;
																	topframe.redraw();
																};
																document.getElementById("colorinput_bcancel").onclick = function(){
																	colorinputdivcontainer.style.visibility = "hidden";
																	colorinput.jscolor.hide();
																	colorinputdivcontainer.style.zIndex = 0;
																	topframe.thisdiv.style.zIndex = topframe.zIndex;
																	colorinputdiv.style.zIndex = 0;
																	editingcolor = false;
																	topframe.bordercolor = initialcolor;
																	topframe.highlightcolor = initialcolor;
																	topframe.redraw();
																};
																document.getElementById("colorinputdivcontainer").onmousedown = function(e){
																	if (e.target === document.getElementById("colorinputdivcontainer")) {
																		colorinputdivcontainer.style.visibility = "hidden";
																		colorinput.jscolor.hide();
																		colorinputdivcontainer.style.zIndex = 0;
																		topframe.thisdiv.style.zIndex = topframe.zIndex;
																		colorinputdiv.style.zIndex = 0;
																		editingcolor = false;
																		topframe.bordercolor = initialcolor;
																		topframe.highlightcolor = initialcolor;
																		topframe.redraw();
																	}
																};
																}};
				
				if (topframe.what === ContainerTypes.FrameLabel) {
						thismenu.items.framedetails.items["setlabeltext"] = {"name": "Set Text", "callback": function(itemKey, opt){
														var newtext = prompt("Enter Text.", topframe.currenttext);
														if (newtext) {
															topframe.currenttext = newtext;
															topframe.thislabel.innerHTML = newtext;
															topframe.setArc(topframe.ctradius, topframe.ctdir);
														}
													}
									   };
						thismenu.items.framedetails.items["setlabelarc"] = {"name": "Set Arc", "callback": function(itemKey, opt){
														var newarc = prompt("Enter Arc Radius (negative for inverse; 0 for no arc).", topframe.ctdir*topframe.ctradius);
														if (newarc) {
															if (!isNaN(parseInt(newarc))) {
																topframe.setArc(Math.abs(parseInt(newarc)),  Math.sign(parseInt(newarc)));
															} else {
																alert("Invalid input.")
															}
														}
													}
									   };
						thismenu.items.framedetails.items["setlabelangle"] = {"name": "Set Angle", "callback": function(itemKey, opt){
														var newangle = prompt("Enter Size.", topframe.angle);
														if (newangle) {
															if (!isNaN(parseFloat(newangle))) {
																topframe.angle = parseFloat(newangle);
																topframe.thisdiv.style.transform = "rotate("+topframe.angle+"deg)";
															} else {
																alert("Invalid input.")
															}
														}
													}
									   };
						thismenu.items.framedetails.items["setlabelcolor"] = {"name": "Set Color", "callback": function(itemKey, opt){
														editingcolor = true;
														initialcolor = topframe.textcolor;
														colorinput.jscolor.fromString(topframe.textcolor);
														colorinputdivcontainer.style.visibility = "";
														colorinputdivcontainer.style.zIndex = zcounter + 100;
														topframe.parentframe.thisdiv.style.zIndex = zcounter + 110;
														colorinputdiv.style.zIndex = zcounter + 120;
														colorinputdiv.style.left = "0px";
														colorinputdiv.style.top = "0px";
														
														// whyever this is needed..
														colorinput.onclick = function(){
															colorinput.jscolor.show();
														};
														colorinput.onchange = function(){
															topframe.thislabel.style.color = colorinput.value;
														};
														
														document.getElementById("colorinput_bapply").onclick = function(){
															colorinputdivcontainer.style.visibility = "hidden";
															colorinput.jscolor.hide();
															colorinputdivcontainer.style.zIndex = 0;
															topframe.parentframe.thisdiv.style.zIndex = topframe.parentframe.zIndex;
															colorinputdiv.style.zIndex = 0;
															editingcolor = false;
															topframe.textcolor = colorinput.value;
															topframe.thislabel.style.color = topframe.textcolor;
														};
														document.getElementById("colorinput_bcancel").onclick = function(){
															colorinputdivcontainer.style.visibility = "hidden";
															colorinput.jscolor.hide();
															colorinputdivcontainer.style.zIndex = 0;
															topframe.parentframe.thisdiv.style.zIndex = topframe.parentframe.zIndex;
															colorinputdiv.style.zIndex = 0;
															editingcolor = false;
															topframe.textcolor = initialcolor;
															topframe.thislabel.style.color = topframe.textcolor;
														};
														document.getElementById("colorinputdivcontainer").onmousedown = function(e){
															if (e.target === document.getElementById("colorinputdivcontainer")) {
																colorinputdivcontainer.style.visibility = "hidden";
																colorinput.jscolor.hide();
																colorinputdivcontainer.style.zIndex = 0;
																topframe.parentframe.thisdiv.style.zIndex = topframe.parentframe.zIndex;
																colorinputdiv.style.zIndex = 0;
																editingcolor = false;
																topframe.textcolor = initialcolor;
																topframe.thislabel.style.color = topframe.textcolor;
															}
														};
													}
									   };
				}
				if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer) {
					thismenu.items["restore"] = {"name": "Restore", "callback": function(itemKey, opt){
													if (topframe.what == ContainerTypes.FrameContainer) {
														iosocket.emit('requestrestoreimage', topframe.id);
													} else if (topframe.what == ContainerTypes.TokenContainer) {
														iosocket.emit('requestrestoretoken', topframe.id);
													}
												}
								   };
				}
				thismenu.items["pushdelete"] = {"name": "Push Delete", "callback": function(itemKey, opt){
												if (topframe.what == ContainerTypes.FrameContainer) {
													iosocket.emit('pushdeleteimage', topframe.id);
													topframe = null;
												} else if (topframe.what == ContainerTypes.TokenContainer) {
													iosocket.emit('pushdeletetoken', topframe.id);;
													topframe = null;
												} else if (topframe.what == ContainerTypes.Marker) {
													iosocket.emit('pushdeletemarker', topframe.parentframe.id, topframe.id);
													topframe = null;
												}
											}
							   };
				
				
				
			}
			if (player === 0 && !topframe) {
				thismenu.items["sep3"] = "---------";
				// Game Specific
				// arrange z
				// push all
				// save
				// load
				// reload
				// tokensize
				
				thismenu.items["arrangez"] = {"name": "Rearrange Layering", "callback": function(itemKey, opt){
												adjustzIndices();
											}
							   };
				thismenu.items["pushall"] = {"name": "Push All", "callback": function(itemKey, opt){
												var currentdate = new Date();
												// make dummy to avoid sending self referencing object
												var tempframe = {};
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													current.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
													for (var j = 0; j < relevantdata_imageframe.length; j++) {
														tempframe[relevantdata_imageframe[j]] = current.value[relevantdata_imageframe[j]];
													}
													var tempMarkers = new Array();
													var current2 = current.value.marker.head;
													for (var j = 0; j < current.value.marker.length; j++) {
														var tempmarker = {};
														for (var k = 0; k < relevantdata_markerframe.length; k++) {
															tempmarker[relevantdata_markerframe[k]] = current2.value[relevantdata_markerframe[k]];
														}
														tempMarkers[j] = tempmarker;
														current2 = current2.next;
													}
													var tempLabels = new Array();
													current2 = current.value.label.head;
													for (var j = 0; j < current.value.label.length; j++) {
														var templabel = {};
														for (var k = 0; k < relevantdata_framelabel.length; k++) {
															templabel[relevantdata_framelabel[k]] = current2.value[relevantdata_framelabel[k]];
														}
														tempLabels[j] = templabel;
														current2 = current2.next;
													}
													iosocket.emit('pushimage', tempframe, tempMarkers, tempLabels);
													current = current.next;
												}
												var current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													current.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
													iosocket.emit('pushtoken', current.value);
													current = current.next;
												}
											}
							   };
				thismenu.items["changetokensizeall"] = {"name": "Set Global Token Size", "callback": function(itemKey, opt){
												var newsize = prompt("Enter Size.", 100);
												if (newsize) {
													if (!isNaN(parseInt(newsize)) && parseInt(newsize) > 0) {
														newsize = parseInt(newsize);
														var current = tokenframes.head;
														for (var i = 0; i < tokenframes.length; i++) {
															current.value.size = newsize;
															current.value.redraw();
															current.value.thiscanvas.style.width = current.value.size + "px";
															current.value.thiscanvas.style.height = current.value.size + "px";
															current = current.next;
														}
													} else {
														alert("Non-integer/negative input invalid.")
													}
												}
											}
							   };
				thismenu.items["changemarkersizeall"] = {"name": "Set Global Marker Size", "callback": function(itemKey, opt){
												var newsize = prompt("Enter Size.", markersize);
												if (newsize) {
													if (!isNaN(parseInt(newsize)) && parseInt(newsize) > 0) {
														newsize = parseInt(newsize);
														markersize = newsize;
														var current = imageframes.head;
														for (var i = 0; i < imageframes.length; i++) {
															var currentmarker = current.value.marker.head;
															for (var j = 0; j < current.value.marker.length; j++) {
																currentmarker.value.size = newsize;
																//current.value.redraw();
																currentmarker.value.thisimg.style.width = zoomvalue*currentmarker.value.scale*currentmarker.value.size + "px";
																currentmarker.value.thisimg.style.height = zoomvalue*currentmarker.value.scale*currentmarker.value.size + "px";
																currentmarker = currentmarker.next;
															}
															current = current.next;
														}
													} else {
														alert("Non-integer/negative input invalid.")
													}
												}
											}
							   };
				thismenu.items["savegame"] = {"name": "Save Game", "callback": function(itemKey, opt){
												var currentdate = new Date();
												var timestamp = currentdate.getTime() - clienttimereference + servertimereference;
												var filename = "savestates/savestate"+timestamp+".dat";
												iosocket.emit('requestsavestate', filename);
											}
							   };
				thismenu.items["savegameas"] = {"name": "Save Game As", "callback": function(itemKey, opt){
												var filename = prompt("Enter filepath.", "savestates/");
												if (filename) {
													if (filename === "") {
														var currentdate = new Date();
														var timestamp = currentdate.getTime() - clienttimereference + servertimereference;
														filename = "savestates/savestate"+timestamp+".dat";
													}
													iosocket.emit('requestsavestate', filename);
												}
											}
							   };
				thismenu.items["loadgame"] = {"name": "Load Game", "callback": function(itemKey, opt){
												$("#fileinputdialog").trigger('click');
												
												document.getElementById("fileinputdialog").onchange = function(){
													
													//console.log(this.files[0]);
													asyncLoadLocalFile(this.files[0], function(contents){
															var words = contents.split(/\r?\n/);
															var counter = 3;
															do {
																//console.log(parseInt(words[counter]));
																switch (parseInt(words[counter++])) {
																  case ContainerTypes.FrameContainer:
																	var tempframe = {};
																	for (var i = 0; i < relevantdata_imageframe.length; i++) {
																		if (relevantdata_imageframe[i] === "streamposition" || 
																		     relevantdata_imageframe[i] === "fixposition" || 
																		     relevantdata_imageframe[i] === "visible") {
																			if (words[counter].toLowerCase() === "true") 
																				words[counter] = true;
																			else if (words[counter].toLowerCase() === "false") 
																				words[counter] = false;
																		}
																		tempframe[relevantdata_imageframe[i]] = words[counter];
																		counter++;
																	}
																	tempframe["marker"] = new Array();
																	tempframe["label"] = new Array();
																	imageframes.addToTail(new FrameContainer(idcounter++, gamediv, 0, 0));
																	imageframes.tail.value.loadproperties(tempframe);
																	// parse owner-array
																	var tmpowners = imageframes.tail.value.owner.split(",");
																	for (var j = 0; j < tmpowners.length; j++)
																		tmpowners[j] = parseInt(tmpowners[j]);
																	imageframes.tail.value.owner = tmpowners;
																	var currentdate = new Date();
																	imageframes.tail.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
																    break;
																  case ContainerTypes.Marker:
																	var tempmarker = {};
																	for (var i = 0; i < relevantdata_markerframe.length; i++) {
																		if (relevantdata_markerframe[i] === "hasdescription") {
																			if (words[counter].toLowerCase() === "true") 
																				words[counter] = true;
																			else if (words[counter].toLowerCase() === "false") 
																				words[counter] = false;
																		}
																		tempmarker[relevantdata_markerframe[i]] = words[counter];
																		counter++;
																	}
																	imageframes.tail.value.marker.addToTail(new Marker(tempmarker.id, imageframes.tail.value, imageframes.tail.value.thisdiv, tempmarker.x, tempmarker.y, tempmarker.size, tempmarker.descfilename));
																	for (var i = 0; i < relevantdata_markerframe.length; i++) {
																		imageframes.tail.value.marker.tail.value[relevantdata_markerframe[i]] = tempmarker[relevantdata_markerframe[i]];
																	}
																	imageframes.tail.value.marker.tail.value.setpositionandscale();
																	imageframes.tail.value.marker.tail.value.thisdiv.style.zIndex = tempmarker.zIndex;
																    break;
																  case ContainerTypes.FrameLabel:
																	var templabel = {};
																	for (var i = 0; i < relevantdata_framelabel.length; i++) {
																		templabel[relevantdata_framelabel[i]] = words[counter];
																		counter++;
																	}
																	imageframes.tail.value.label.addToTail(new FrameLabel(templabel.id, imageframes.tail.value, imageframes.tail.value.thisdiv, tempmarker.x, tempmarker.y, tempmarker.currenttext));
																	for (var i = 0; i < relevantdata_framelabel.length; i++) {
																		imageframes.tail.value.label.tail.value[relevantdata_framelabel[i]] = templabel[relevantdata_framelabel[i]];
																	}
																	imageframes.tail.value.label.tail.value.setpositionandscale();
																	// angle is set automatically in setArc
																	imageframes.tail.value.label.tail.value.setArc(templabel.ctradius, templabel.ctdir);
																	imageframes.tail.value.label.tail.value.thislabel.style.color = templabel.textcolor;
																	imageframes.tail.value.label.tail.value.thisdiv.style.zIndex = templabel.zIndex;
																    break;
																  case ContainerTypes.TokenContainer:
																	var tempframe = {};
																	for (var i = 0; i < relevantdata_tokenframe.length; i++) {
																		if (relevantdata_tokenframe[i] === "streamposition" || 
																		     relevantdata_tokenframe[i] === "hasdescription" || 
																		     relevantdata_tokenframe[i] === "visible") {
																			if (words[counter].toLowerCase() === "true") 
																				words[counter] = true;
																			else if (words[counter].toLowerCase() === "false") 
																				words[counter] = false;
																		}
																		tempframe[relevantdata_tokenframe[i]] = words[counter];
																		counter++;
																	}
																	tokenframes.addToTail(new TokenContainer(idcounter++, gamediv, 0, 0));
																	tokenframes.tail.value.loadproperties(tempframe);
																	// parse owner-array
																	var tmpowners = tokenframes.tail.value.owner.split(",");
																	for (var j = 0; j < tmpowners.length; j++)
																		tmpowners[j] = parseInt(tmpowners[j]);
																	tokenframes.tail.value.owner = tmpowners;
																	var currentdate = new Date();
																	tokenframes.tail.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
																    break;
																}
																counter++;
															} while (counter <= words.length);
															adjustzIndices();
														});
													
												};
											}
							   };
				thismenu.items["restoreall"] = {"name": "Restore All", "callback": function(itemKey, opt){
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													iosocket.emit('requestrestoreimage', current.value.id);
													current = current.next;
												}
												current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													iosocket.emit('requestrestoretoken', current.value.id);
													current = current.next;
												}
											}
							   };
						
			}
			var eventlogtogglelabel;
			if (showeventlog)
				eventlogtogglelabel = "Show Log: On";
			else
				eventlogtogglelabel = "Show Log: Off";
			if (player === 0)
				thismenu.items["eventlogtoggle"] = {"name": eventlogtogglelabel, "callback": function(itemKey, opt){
														var eventlogtogglelabel2;
														if (showeventlog)
															eventlogtogglelabel2 = "Show Log: Off";
														else
															eventlogtogglelabel2 = "Show Log: On";
														iosocket.emit('requesttoggleeventlog');
														opt.items[itemKey].$node[0].innerHTML = "<span>" + eventlogtogglelabel2 + "</span>";
														return false;}};
			//if (player !== 0) {
				thismenu.items["logout"] = {"name": "Logout", "callback": function(itemKey, opt){
											document.getElementById("gamedivloginoverlay").style.zIndex = zcounter + 100;
											document.getElementById("logindialogdiv").style.zIndex = zcounter + 110;
											document.getElementById("gamedivloginoverlay").style.visibility = "";
											document.getElementById("logindialogdiv").style.visibility = "";
											iosocket.emit('userlogout');
										}
							   };
			//}
			
			return thismenu;
			}
	}); 
	
})

function repositiongamedivelements() {
	var current = imageframes.head;
	for (var i = 0; i < imageframes.length; i++) {
		current.value.setdisplayposition();
		current = current.next;
	}
	current = tokenframes.head;
	for (var i = 0; i < tokenframes.length; i++) {
		current.value.setdisplayposition();
		current = current.next;
	}
}

function rescalegamedivelements() {
	var current = imageframes.head;
	for (var i = 0; i < imageframes.length; i++) {
		current.value.setdisplayscale();
		current = current.next;
	}
}

function setbackground() {
	var shift = - cameraposx*Math.cos((backgrounddirection-90.0)*Math.PI/180.0) - cameraposy*Math.sin((backgrounddirection-90.0)*Math.PI/180.0);
	gamediv.style.background = "repeating-linear-gradient("+backgrounddirection+"deg, #222 "+shift+"px, #222 "+(shift+backgroundwidth1*zoomvalue)+"px, #333 "+(shift+backgroundwidth1*zoomvalue)+"px, #333 "+(shift+backgroundwidth1*zoomvalue+backgroundwidth2*zoomvalue)+"px )";		
}

function gettopframe(x0, y0) {
	var currenttop = null;
	var current = imageframes.head;
	for (var i = 0; i < imageframes.length; i++) {
		if (x0 > current.value.displayx && x0 < current.value.displayx + current.value.displaywidth
		 && y0 > current.value.displayy && y0 < current.value.displayy + current.value.displayheight) {
			if (currenttop) {
				if (currenttop.thisdiv.style.zIndex < current.value.thisdiv.style.zIndex) {
					currenttop = current.value;
				}
			} else {
				currenttop = current.value;
			}
		}
		current = current.next;
	}
	current = tokenframes.head;
	for (var i = 0; i < tokenframes.length; i++) {
		if (x0 > current.value.displayx && x0 < current.value.displayx + current.value.size
		 && y0 > current.value.displayy && y0 < current.value.displayy + current.value.size) {
			if (currenttop) {
				if (currenttop.thisdiv.style.zIndex < current.value.thisdiv.style.zIndex) {
					currenttop = current.value;
				}
			} else {
				currenttop = current.value;
			}
		}
		current = current.next;
	}
	current = dieframes.head;
	for (var i = 0; i < dieframes.length; i++) {
		if (x0 > current.value.displayx && x0 < current.value.displayx + current.value.size
		 && y0 > current.value.displayy && y0 < current.value.displayy + current.value.size) {
			if (currenttop) {
				if (currenttop.thisdiv.style.zIndex < current.value.thisdiv.style.zIndex) {
					currenttop = current.value;
				}
			} else {
				currenttop = current.value;
			}
		}
		current = current.next;
	}
	return currenttop;
}

function something() {
	
}

function adjustzCounter() {
	var current;
	// find values
	var minzforimages = 0;
	var maxzforimages = 0;
	if (imageframes.length > 0) {
		minzforimages = imageframes.head.value.zIndex;
		maxzforimages = imageframes.head.value.zIndex;
		current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			minzforimages = Math.min(current.value.zIndex, minzforimages);
			maxzforimages = Math.max(current.value.zIndex, maxzforimages);
			current = current.next;
		}
	}
	var minzfortokens = 0;
	var maxzfortokens = 0;
	if (tokenframes.length > 0) {
		minzfortokens = tokenframes.head.value.zIndex;
		maxzfortokens = tokenframes.head.value.zIndex;
		current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			minzfortokens = Math.min(current.value.zIndex, minzfortokens);
			maxzfortokens = Math.max(current.value.zIndex, maxzfortokens);
			current = current.next;
		}
	}
	zcounter = Math.max(maxzforimages, maxzfortokens) + 1;
	if (tokenframes.length > 0 && player > 0) {
		current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.owner.includes(player)) current.value.thisdiv.style.zIndex = zcounter + 50 + current.value.zIndex - maxzforimages;
			current = current.next;
		}
		current = dieframes.head;
		for (var i = 0; i < dieframes.length; i++) {
			current.value.thisdiv.style.zIndex = zcounter + 99;
			current = current.next;
		}
	}
	
	logdivlist.parentNode.style.zIndex = zcounter + 98;
}

function adjustzIndices() {
	
	var current = imageframes.head;
	for (var j = 0; j < imageframes.length; j++) {
		current.value.touchedthis = false;
		current = current.next;
	}
	var largestzIndex = 1;
	for (var i = 0; i < imageframes.length; i++) {
		var currenttarget = null; 
		var currentindex = i + 1;
		current = imageframes.head;
		for (var j = 0; j < imageframes.length; j++) {
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
	
	var largestzIndex_imageframes = largestzIndex;
	current = tokenframes.head;
	for (var j = 0; j < tokenframes.length; j++) {
		current.value.touchedthis = false;
		current = current.next;
	}
	for (var i = 0; i < tokenframes.length; i++) {
		var currenttarget = null; 
		var currentindex = largestzIndex_imageframes + i + 1;
		current = tokenframes.head;
		for (var j = 0; j < tokenframes.length; j++) {
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
	adjustzCounter();
}
function fadein(element) {
    var op = 0.1;  // initial opacity
    element.style.visibility = "visible";
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op *= 1.2;
    }, 10);
}

function fadeout(element, somecallback) {
    var op = 0.9;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.visibility = "hidden";
	  somecallback();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op /= 3.5;
    }, 50);
}

function asyncLoadLocalFile(filePath, somecallback) {
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		somecallback(contents);
	};
	reader.readAsText(filePath);
}

function asyncLoadFile(filePath, somecallback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", filePath, true);
	xhr.onload = function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				somecallback(xhr.responseText);
			} else {
				console.error(xhr.statusText);
			}
		}
	};
	xhr.onerror = function (e) {
		console.error(xhr.statusText);
	};
	xhr.send(null);
}

function addsomethingtolog(something) {
	var now = new Date();
	
	var nowstring = padwithzeros(now.getHours(), 2) + ":" + padwithzeros(now.getMinutes(), 2) + ":" + padwithzeros(now.getSeconds(), 2);
	
	var newentry = document.createElement("li");
	newentry.style.marginBottom = "-8px";
	var newparagraph = document.createElement("p");
	newparagraph.style.color = "white";
	newparagraph.style.font = "13px Arial, sans-serif";
	newparagraph.style.marginTop = "0px";
	newparagraph.style.marginBottom = "0px";
	newparagraph.innerHTML = '<span style="color:green;">['+ nowstring + ']</span> ' + something;
	newentry.appendChild(newparagraph);
	logdivlist.appendChild(newentry);
	logdivlist.parentNode.scrollTop = logdivlist.parentNode.scrollHeight;
}

function padwithzeros(num, size) {
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}

function loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
		result = xmlhttp.responseText;
	}
	return result;
}

function somefunction() {
	iosocket.emit('message');
}

