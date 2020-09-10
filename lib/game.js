var iosocket;
var player = -1; // 0: GM; >0: player; <0: undefined
var playername = "myName";
var playernames = [""];
var loginoptionsset = false;

var gameoptions = [];

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "Marker":4, "FrameLabel":5, "Card":6, "CanvasFrame":7};

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
var texteditdivcontainer, texteditdiv;
var loadsounddivcontainer, loadsounddiv;
var audio_loop, audio_oneshot, fadeAudio, basevolume = 0.25, akeydown = false;
var editingcolor = false;
var initialcolor = "#00ff00";
var loadingimage = false;
var textediting = false;
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

var multiselect = false, multiselected = false;
var multiselectdiv;
var multiselectlist = new LinkedList();
var boxx, boxy, boxw, boxh;

var imageframes = new LinkedList();
var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "visible"];
var relevantdata_imageframe_types = {"id":"number", "owner":"numberarray", "streamposition":"boolean", "fixposition":"boolean", "timestamp":"number", "x":"number", "y":"number", "width":"number", "height":"number", "scale":"number", "filename":"string", "zIndex":"number", "markeridcounter":"number", "visible":"boolean"};
var relevantdata_canvasframe = ["id", "owner", "streamposition", "streamcontent", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "content", "zIndex"];
var relevantdata_canvasframe_types = {"id": "number", "owner":"numberarray", "streamposition":"boolean", "streamcontent":"boolean", "fixposition":"boolean", "timestamp": "number", "x": "number", "y": "number", "width": "number", "height": "number", "scale": "number", "content":"string", "zIndex": "number"};
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext"];
var relevantdata_markerframe_types = {"id": "number", "hasdescription": "boolean", "x": "number", "y": "number", "size": "number", "scale": "number", "zIndex": "number", "descfilename":"string", "descname":"string", "desctext":"string"};
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_framelabel_types = {"id": "number", "x": "number", "y": "number", "scale": "number", "zIndex": "number", "currenttext":"string", "textcolor":"string", "angle": "number", "ctradius": "number", "ctdir": "number"};
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var relevantdata_tokenframe_types = {"id": "number", "owner":"numberarray", "streamposition": "boolean", "hasdescription": "boolean", "timestamp": "number", "x": "number", "y": "number", "size": "number", "offsetx": "number", "offsety": "number", "scale": "number", "bordercolor":"string", "filename":"string", "zIndex": "number", "descname":"string", "descfilename":"string", "desctext":"string", "visible": "boolean"};
var relevantdata_card = ["deckid", "cardid", "owner", "viewingrights", "streamposition", "timestamp", "x", "y", "angle", "faceup", "width", "height", "scale", "bordercolor", "filenamefront", "filenameback", "zIndex"];
var relevantdata_card_types = {"deckid": "number", "cardid": "number", "owner":"numberarray", "viewingrights":"numberarray", "streamposition": "boolean", "timestamp": "number", "x": "number", "y": "number", "angle": "number", "faceup": "boolean", "width": "number", "height": "number", "scale": "number", "bordercolor":"string", "filenamefront":"string", "filenameback":"string", "zIndex": "number"};
var tokenframes = new LinkedList();
var dieframes = new LinkedList();
var decks = new LinkedList();
var canvasframes = new LinkedList();

var randomizeangleamplitude = 4;

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
	
	fabric.Image.prototype.toObject = 
				(function(toObject) {
					return function() {
						//console.log(this);
						return fabric.util.object.extend(toObject.call(this), {
						src: this._element.src.replace(this._element.baseURI, "")
						});
					};
				})(fabric.Image.prototype.toObject);

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
	texteditdivcontainer = document.getElementById("texteditdivcontainer");
	texteditdiv = document.getElementById("texteditdiv");
	loadsounddivcontainer = document.getElementById("loadsounddivcontainer");
	loadsounddiv = document.getElementById("loadsounddiv");
	autocomplete(document.getElementById("loadsoundinput"), "resourcelist_sound");
	
	
	// preload logo image
	var placeholderimg = new Image();
	placeholderimg.src = "img/_server_/logo3.png";
	// preload handicon image
	var placeholderimg = new Image();
	placeholderimg.src = "img/_server_/handicon.png";
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
	d20preloadimages[21] = new Image();
	d20preloadimages[21].src = "img/_server_/dice/d20_qm.png";
	// preload dice
	var d6preloadimages = new Array();
	d6preloadimages[0] = new Image();
	d6preloadimages[0].src = "img/_server_/dice/d6_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages[i] = new Image();
		d6preloadimages[i].src = "img/_server_/dice/d6_"+i+".png";
	}
	d6preloadimages[7] = new Image();
	d6preloadimages[7].src = "img/_server_/dice/d6_qm.png";
	d6preloadimages[8] = new Image();
	d6preloadimages[8].src = "img/_server_/dice/d6_hugo.png";
	
	// multiselect preparation stuff
	multiselectdiv = document.createElement('div');
	multiselectdiv.style.display = "none";
	multiselectdiv.style.position = "absolute";
	multiselectdiv.style.width = 50+"px";
	multiselectdiv.style.height = 50+"px";
	multiselectdiv.style.background = "rgba(0, 60, 200, 0.5)";
	multiselectdiv.style.borderRadius = 10+"px";
	multiselectdiv.style.borderWidth = 3+"px";
	multiselectdiv.style.borderStyle = "dashed";
	gamediv.appendChild(multiselectdiv);
	
	
	iosocket = io.connect('/welcome');
	
	iosocket.on('servertime', ( sometime ) => {
		servertimereference = sometime;
		var currentdate = new Date();
		clienttimereference = currentdate.getTime();
		//console.log(sometime);
	});
	iosocket.on('alertmsg', ( somemsg ) => {
		alert(somemsg);
		addsomethingtolog("ALERT: " + somemsg);
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
	iosocket.on('gameoptions_update', (gameoptions0) => {
		gameoptions = gameoptions0;
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
				current.value.justrolled = false;
				current.value.value = somevalue;
				current.value.applyimage();
				var verbatimresult = current.value.value;
				if (gameoptions.includes('hugo')) {
					if (current.value.maxvalue === 6 && somevalue === 6) 
						verbatimresult = "hugo";
				}
				if (current.value.tokenlink) {
					addsomethingtolog("You (" + current.value.tokenlink.descname + ") rolled a " + verbatimresult + ".");
				} else {
					addsomethingtolog("You rolled a " + verbatimresult + ".");
				}
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
	iosocket.on('updatecanvasframeposition', ( someid, newx, newy, newtimestamp ) => {
		var current = canvasframes.head;
		for (var i = 0; i < canvasframes.length; i++) {
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
	iosocket.on('updatecanvasframe', ( someframe ) => {
		var current = canvasframes.head;
		var foundid = false;
		for (var i = 0; i < canvasframes.length; i++) {
			if (current.value.id == someframe.id) {
				current.value.loadproperties(someframe);
				foundid = true;
				break;
			}
			current = current.next;
		}
		if (!foundid) {
			canvasframes.addToTail(new CanvasFrameContainer(idcounter++, gamediv, someframe.x, someframe.y, someframe.width, someframe.height));
			canvasframes.tail.value.loadproperties(someframe);
			
		}
		adjustzCounter();
	});
	iosocket.on('updatecanvascontent', ( someid, someJSON, newtimestamp ) => {
		var current = canvasframes.head;
		for (var i = 0; i < canvasframes.length; i++) {
			if (current.value.id === someid) {
				if (current.value.timestamp < newtimestamp) {
					current.value.timestamp = newtimestamp;
					current.value.changinghistory = true;
					current.value.initfromJSON(someJSON);
					break;
				}
			}
			current = current.next;
		}
	});
	iosocket.on('updatetokenframe', ( someframe ) => {
		var current = tokenframes.head;
		var foundid = false;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.id === someframe.id) {
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
			if (current.value.id === someid) {
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
	iosocket.on('updatecard', ( somecard ) => {
		// look for card in data; start with looking for correct deck
		var currentdeck = decks.head;
		var correctdeck = null;
		for (var i = 0; i < decks.length; i++) {
			// intended not to occur; no deckid defined
			// if (currentdeck.value.length > 0) { .. }
			if (currentdeck.value.head.value.deckid === somecard.deckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		// if deck already exists -> continue for look into deck; else make new deck
		if (!correctdeck) {
			decks.addToTail(new LinkedList());
			correctdeck = decks.tail.value;
		}
		var currentcard = correctdeck.head;
		var correctcard = null;
		for (var i = 0; i < correctdeck.length; i++) {
			if (currentcard.value.cardid === somecard.cardid) {
				correctcard = currentcard.value;
				break;
			}
			currentcard = currentcard.next;
		}
		// if card already exists -> update; else make new card
		if (correctcard) {
			//console.log("GM updated card " + somecard.deckid + "." + somecard.cardid + ".");
			correctcard.loadproperties(somecard);
			if (correctcard.onhand && !correctcard.faceup && correctcard.viewingrights.includes(player)) {
				correctcard.thishandicon.style.display = "";
				correctcard.onhand = true;
				correctcard.thisimgfront.style.display = "block";
				correctcard.thisimgback.style.display = "none";
				correctcard.thisdiv.style.background = correctcard.backgroundfront;
			} else {
				correctcard.thishandicon.style.display = "none";
				correctcard.onhand = false;
			}
		} else {
			console.log("GM pushed new card " + somecard.deckid + "." + somecard.cardid + ".");
			correctdeck.addToTail(new Card(somecard.deckid, somecard.cardid, correctdeck, gamediv, somecard.x, somecard.y, somecard.width, somecard.height, somecard.filenamefront, somecard.filenameback));
			correctdeck.tail.value.loadproperties(somecard);
		}
		adjustzCounter();
	});
	iosocket.on('forcediscard', ( ) => {
		var currentdeck = decks.head;
		for (var i = 0; i < decks.length; i++) {
			var current = currentdeck.value.head;
			for (var j = 0; j < currentdeck.value.length; j++) {
				current.value.discard();
				current = current.next;
			}
			currentdeck = currentdeck.next;
		}
	});
	iosocket.on('changedeckid', ( oldid, newid ) => {
		var currentdeck = decks.head;
		for (var i = 0; i < decks.length; i++) {
			if (currentdeck.value.head.value.deckid === oldid) {
				var current = currentdeck.value.head;
				for (var j = 0; j < currentdeck.value.length; j++) {
					current.value.deckid = newid;
					current = current.next;
				}
				break;
			}
			currentdeck = currentdeck.next;
		}
	});
	iosocket.on('updatecardposition', ( somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp ) => {
		// look for card in data; start with looking for correct deck
		var currentdeck = decks.head;
		var correctdeck = null;
		for (var i = 0; i < decks.length; i++) {
			// intended not to occur; no deckid defined
			// if (currentdeck.value.length > 0) { .. }
			if (currentdeck.value.head.value.deckid === somedeckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		if (correctdeck) {
			var currentcard = correctdeck.head;
			for (var i = 0; i < correctdeck.length; i++) {
				if (currentcard.value.cardid === somecardid) {
					if (currentcard.value.timestamp < newtimestamp) {
						currentcard.value.timestamp = newtimestamp;
						currentcard.value.x = newx;
						currentcard.value.y = newy;
						currentcard.value.setdisplayposition();
						currentcard.value.angle = newangle;
						currentcard.value.thisdiv.style.transform = "rotate("+currentcard.value.angle+"deg)";
						if (newfaceup !== currentcard.value.faceup) {
							if (newfaceup) {
								currentcard.value.thisimgfront.style.display = "block";
								currentcard.value.thisimgback.style.display = "none";
								currentcard.value.thisdiv.style.background = currentcard.value.backgroundfront;
							} else {
								currentcard.value.thisimgfront.style.display = "none";
								currentcard.value.thisimgback.style.display = "block";
								currentcard.value.thisdiv.style.background = currentcard.value.backgroundback;
							}
							currentcard.value.faceup = newfaceup;
						}
						if (currentcard.value.onhand && !currentcard.value.faceup && currentcard.value.viewingrights.includes(player)) {
							currentcard.value.thishandicon.style.display = "";
							currentcard.value.thisimgfront.style.display = "block";
							currentcard.value.thisimgback.style.display = "none";
							currentcard.value.thisdiv.style.background = currentcard.value.backgroundfront;
						} else {
							currentcard.value.thishandicon.style.display = "none";
							currentcard.value.onhand = false;
						}
					}
					break;
				}
				currentcard = currentcard.next;
			}
		}
		
	});
	iosocket.on('changecardzIndex', ( somedeckid, somecardid, newzIndex, newtimestamp ) => {
		// look for card in data; start with looking for correct deck
		var currentdeck = decks.head;
		var correctdeck = null;
		for (var i = 0; i < decks.length; i++) {
			if (currentdeck.value.head.value.deckid === somedeckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		if (correctdeck) {
			var currentcard = correctdeck.head;
			for (var i = 0; i < correctdeck.length; i++) {
				if (currentcard.value.cardid === somecardid) {
					//if (currentcard.value.timestamp <= newtimestamp) {
						currentcard.value.timestamp = newtimestamp;
						currentcard.value.zIndex = newzIndex;
						currentcard.value.thisdiv.style.zIndex = newzIndex;
					//}
					break;
				}
				currentcard = currentcard.next;
			}
		}
	});
	iosocket.on('deleteimage', ( someid ) => {
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id === someid) {
				current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
				imageframes.moveToTail(current);
				imageframes.removeFromTail(current);
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('deletecanvas', ( someid ) => {
		var current = canvasframes.head;
		for (var i = 0; i < canvasframes.length; i++) {
			if (current.value.id === someid) {
				current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
				canvasframes.moveToTail(current);
				canvasframes.removeFromTail(current);
				break;
			}
			current = current.next;
		}
	});
	iosocket.on('deletetoken', ( someid ) => {
		var current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.id === someid) {
				if (current.value.dielink) current.value.dielink.tokenlink = null;
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
			if (current.value.id === someframeid) {
				break;
			}
			current = current.next;
		}
		if (current) {
			var theframe = current.value;
			current = theframe.marker.head;
			for (var i = 0; i < theframe.marker.length; i++) {
				if (current.value.id === somemarkerid) {
					current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
					theframe.marker.moveToTail(current);
					theframe.marker.removeFromTail(current);
					break;
				}
				current = current.next;
			}
		}
	});
	iosocket.on('deletelabel', ( someframeid, somelabelid ) => {
		var current = imageframes.head;
		for (var i = 0; i < imageframes.length; i++) {
			if (current.value.id === someframeid) {
				break;
			}
			current = current.next;
		}
		if (current) {
			var theframe = current.value;
			current = theframe.label.head;
			for (var i = 0; i < theframe.label.length; i++) {
				if (current.value.id === somelabelid) {
					current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
					theframe.label.moveToTail(current);
					theframe.label.removeFromTail(current);
					break;
				}
				current = current.next;
			}
		}
	});
	iosocket.on('deletecard', function (somedeckid, somecardid) {
		var currentdeck = decks.head;
		var correctdeck = null;
		for (var i = 0; i < decks.length; i++) {
			if (currentdeck.value.head.value.deckid === somedeckid) {
				correctdeck = currentdeck;
				break;
			}
			currentdeck = currentdeck.next;
		}
		// if deck already exists -> continue for look into deck
		if (correctdeck) {
			// search deck
			var currentcard = correctdeck.value.head;
			for (var i = 0; i < correctdeck.value.length; i++) {
				if (currentcard.value.cardid === somecardid) {
					currentcard.value.thisdiv.parentNode.removeChild(currentcard.value.thisdiv);
					correctdeck.value.moveToTail(currentcard);
					correctdeck.value.removeFromTail(currentcard);
					
					if (correctdeck.value.length === 0) {
						decks.moveToTail(correctdeck);
						decks.removeFromTail(correctdeck);
					}
					break;
				}
				currentcard = currentcard.next;
			}
		}
	});
	iosocket.on('deletedeck', function (somedeckid) {
		var currentdeck = decks.head;
		for (var i = 0; i < decks.length; i++) {
			if (currentdeck.value.head.value.deckid === somedeckid) {
				var currentcard = currentdeck.value.head;
				for (var j = 0; j < currentdeck.value.length; j++) {
					currentcard.value.thisdiv.parentNode.removeChild(currentcard.value.thisdiv);
					currentcard = currentcard.next;
				}
				decks.moveToTail(currentdeck);
				decks.removeFromTail(currentdeck);
				break;
			}
			currentdeck = currentdeck.next;
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
		if (e.which === 46 || e.keyCode === 46) {
			var current = canvasframes.head;
			for (var i = 0; i < canvasframes.length; i++) {
				if (current.value.drawingmode === "e") {
					if (current.value.fabriccanvas.getActiveObject()) current.value.fabriccanvas.getActiveObject().remove();
					if (current.value.fabriccanvas.getActiveGroup()) {
						for (var j = 0; j < current.value.fabriccanvas.getActiveGroup()._objects.length; j++) {
							current.value.fabriccanvas.getActiveGroup()._objects[j].remove();
						}
					}
					current.value.fabriccanvas.discardActiveObject().discardActiveGroup().renderAll();
					break;
				}
				current = current.next;
			}
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
		if (!editingcolor && !loadingimage && !textediting && !loadingdescription && !loadingsound) {
				
			// init drag positions
			if (e.which === 2) {
				if (!multiselect) {
					e.preventDefault();
					// drag screen/camera
					dragcamera = true;
					InitialMouseDownX = parseInt(e.clientX);
					InitialMouseDownY = parseInt(e.clientY);
					initialcameraposx = cameraposx;
					initialcameraposy = cameraposy;
				}
			} else {
				dragcamera = false;
			}
			
			if (e.target === this) {
				lastmousedownframe = null;
				if (!e.ctrlKey) {
					multiselected = false;
					var current = multiselectlist.head;
					for (var i = 0; i < multiselectlist.length; i++) {
						current.value.thisdiv.style.borderColor = cardbordercolor;
						current = current.next;
					}
					multiselectlist = new LinkedList();
				}
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
					if (multiselected && topframe.what !== ContainerTypes.Card){
						multiselected = false;
						var current = multiselectlist.head;
						for (var i = 0; i < multiselectlist.length; i++) {
							current.value.thisdiv.style.borderColor = cardbordercolor;
							current = current.next;
						}
						multiselectlist = new LinkedList();
					}/**/
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
					} else if (e.ctrlKey) {
						if (topframe.what === ContainerTypes.Card) {
							//if (topframe.owner.includes(player)) {
								multiselect = true;
								boxx = InitialMouseDownX;
								boxy = InitialMouseDownY;
								boxw = 0;
								boxh = 0;
								multiselectdiv.style.left = boxx+"px";
								multiselectdiv.style.top = boxy+"px";
								multiselectdiv.style.width = boxw+"px";
								multiselectdiv.style.height = boxh+"px";
								multiselectdiv.style.zIndex = zcounter + 1000;
								multiselectdiv.style.display = "block";
							//}
						}
					} else {
						if (e.detail === 1) {
							if (topframe.owner.includes(player)) {
								if (topframe.what === ContainerTypes.FrameContainer) 
									topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
								if (topframe.what === ContainerTypes.TokenContainer) {
									topframe.highlightcolor = topframe.highlightcolor0;
									topframe.redraw();
								}
								if (topframe.what === ContainerTypes.Card) {
									topframe.thisdiv.style.borderColor = cardbordercolorhighlight;
								}
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
							if (topframe.what === ContainerTypes.Die) {
								topframe.highlight = true;
								topframe.redraw();
								draggedframe = topframe;
								draggedrefx = draggedframe.displayx;
								draggedrefy = draggedframe.displayy;
								dragframe = true;
							}
							// image/token/card/canvas drag
							if (topframe.what !== ContainerTypes.Marker && topframe.what !== ContainerTypes.FrameLabel) {
								if (topframe.owner.includes(player)) {
									if (!((topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame) && topframe.fixposition)) {
										if (topframe.streamposition || player === 0) {
											draggedframe = topframe;
											var currentdate = new Date();
											draggedframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
											draggedrefx = draggedframe.displayx;
											draggedrefy = draggedframe.displayy;
											dragframe = true;
											if (topframe.what === ContainerTypes.CanvasFrame) {
												if (topframe.preventdrag) {
													draggedframe = null;
													dragframe = false;
												}
											}
										}
									}
								}
							}
							if (multiselected) {
								if (topframe.what === ContainerTypes.Card) {
									if (iscardinstack(multiselectlist, topframe.deckid, topframe.cardid)) {
										// build zIndex-sorted list
										var current = multiselectlist.head;
										for (var j = 0; j < multiselectlist.length; j++) {
											current.value.touchedthis = false;
											current = current.next;
										}
										var sortedlist = new LinkedList();
										for (var i = 0; i < multiselectlist.length; i++) {
											var currentlowest = null;
											current = multiselectlist.head;
											for (var j = 0; j < multiselectlist.length; j++) {
												if (currentlowest) {
													if (!current.value.touchedthis) {
														if (currentlowest.zIndex > current.value.zIndex) {
															currentlowest = current.value;
														}
													}
												} else {
													if (!current.value.touchedthis) {
														currentlowest = current.value;
													}
												}
												current = current.next;
											}
											currentlowest.touchedthis = true;
											sortedlist.addToTail(currentlowest);
										}
										var currentdate = new Date();
										var currenttime = currentdate.getTime();
										
										var current = sortedlist.head;
										for (var i = 0; i < sortedlist.length; i++) {
											current.value.displayxref = current.value.displayx;
											current.value.displayyref = current.value.displayy;
											current.value.timestamp = currenttime - clienttimereference + servertimereference;
											if (gameoptions.includes("d"+current.value.deckid+"dragtotop")) {
												iosocket.emit('dragcardtotop', current.value.deckid, current.value.cardid, current.value.timestamp);
											}
											current = current.next;
										}
									} else {
										multiselected = false;
										var current = multiselectlist.head;
										for (var i = 0; i < multiselectlist.length; i++) {
											current.value.thisdiv.style.borderColor = cardbordercolor;
											current = current.next;
										}
										multiselectlist = new LinkedList();
									}
								}
							} else {
								if (topframe.what === ContainerTypes.Card) {
									if (gameoptions.includes("d"+draggedframe.deckid+"dragtotop")) {
										iosocket.emit('dragcardtotop', draggedframe.deckid, draggedframe.cardid, draggedframe.timestamp);
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
					if (e.ctrlKey) {
						multiselect = true;
						boxx = InitialMouseDownX;
						boxy = InitialMouseDownY;
						boxw = 0;
						boxh = 0;
						multiselectdiv.style.left = boxx+"px";
						multiselectdiv.style.top = boxy+"px";
						multiselectdiv.style.width = boxw+"px";
						multiselectdiv.style.height = boxh+"px";
						multiselectdiv.style.zIndex = zcounter + 10;
						multiselectdiv.style.display = "block";
					} else {
						multiselect = false;
						multiselectdiv.style.display = "none";
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
			if (draggedframe.what === ContainerTypes.Card && multiselected) {
				var current = multiselectlist.head;
				for (var i = 0; i < multiselectlist.length; i++) {
					current.value.displayx = current.value.displayxref + (parseInt(e.clientX) - InitialMouseDownX);
					current.value.displayy = current.value.displayyref + (parseInt(e.clientY) - InitialMouseDownY);
					current.value.thisdiv.style.left = current.value.displayx + "px";
					current.value.thisdiv.style.top = current.value.displayy + "px";
					current = current.next;
				}
			} else {
				draggedframe.displayx = draggedrefx + (parseInt(e.clientX) - InitialMouseDownX);
				draggedframe.displayy = draggedrefy + (parseInt(e.clientY) - InitialMouseDownY);
				draggedframe.thisdiv.style.left = draggedframe.displayx + "px";
				draggedframe.thisdiv.style.top = draggedframe.displayy + "px";
			}
			
			if (draggedframe.streamposition) {
				var currentdate = new Date();
				currenttime = currentdate.getTime();
				//if ( currenttime - lasttime >= 1000/60) {
					lasttime = currenttime;
					if (draggedframe.what === ContainerTypes.FrameContainer) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						iosocket.emit('updateimageposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
					} else if (draggedframe.what === ContainerTypes.CanvasFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						iosocket.emit('updatecanvasposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
					} else if (draggedframe.what === ContainerTypes.Card) {
						if (multiselected) {
							var current = multiselectlist.head;
							for (var i = 0; i < multiselectlist.length; i++) {
								if (current.value.owner.includes(player)) {
									current.value.x = (cameraposx + current.value.displayx)/current.value.scale/zoomvalue;
									current.value.y = (cameraposy + current.value.displayy)/current.value.scale/zoomvalue;
									current.value.timestamp = currenttime - clienttimereference + servertimereference;
									iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
								}
								current = current.next;
							}
						} else {
							draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
							draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
							draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
							iosocket.emit('updatecardposition', draggedframe.deckid, draggedframe.cardid, draggedframe.x, draggedframe.y, draggedframe.angle, draggedframe.faceup, draggedframe.timestamp);
						}
						//iosocket.emit('updateimageposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
					} else if (draggedframe.what === ContainerTypes.TokenContainer) {
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
			} else if (draggedframe.what === ContainerTypes.TokenContainer) {
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
			draggedframe.offsetx = Math.max(-draggedframe.scale * draggedframe.size, Math.min(draggedframe.scale * draggedframe.size, draggedrefx + (parseInt(e.clientX) - InitialMouseDownX)));
			draggedframe.offsety = Math.max(-draggedframe.scale * draggedframe.size * draggedframe.image.height/draggedframe.image.width, Math.min(draggedframe.scale * draggedframe.size * draggedframe.image.height/draggedframe.image.width, draggedrefy + (parseInt(e.clientY) - InitialMouseDownY)));
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
		if (multiselect) {
			e.preventDefault();
			multiselect = true;
			var hwidth = parseInt(e.clientX) - InitialMouseDownX;
			var hheight = parseInt(e.clientY) - InitialMouseDownY;
			if (hwidth < 0) 
				boxx = parseInt(e.clientX);
			else
				boxx = InitialMouseDownX;
			if (hheight < 0) 
				boxy = parseInt(e.clientY);
			else
				boxy = InitialMouseDownY;
			boxw = Math.abs(parseInt(e.clientX) - InitialMouseDownX);
			boxh = Math.abs(parseInt(e.clientY) - InitialMouseDownY);
			multiselectdiv.style.left = boxx+"px";
			multiselectdiv.style.top = boxy+"px";
			multiselectdiv.style.width = boxw+"px";
			multiselectdiv.style.height = boxh+"px";
			var current = decks.head;
			for (var i = 0; i < decks.length; i++) {
				var currentcard = current.value.head;
				for (var j = 0; j < current.value.length; j++) {
					var divBB = currentcard.value.thisdiv.getBoundingClientRect();
					//console.log(boxx, boxx + boxw, boxy + boxh, boxy);
					//console.log(divBB);
					if (doboxescollide(boxx, boxx + boxw, boxy + boxh, boxy, divBB.left, divBB.right, divBB.bottom, divBB.top) ||
						iscardinstack(multiselectlist, currentcard.value.deckid, currentcard.value.cardid)) {
						if (currentcard.value.owner.includes(player)) {
							currentcard.value.thisdiv.style.borderColor = cardbordercolorhighlight;
						}
					} else {
						currentcard.value.thisdiv.style.borderColor = cardbordercolor;
					}
					currentcard = currentcard.next;
				}
				current = current.next;
			}
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
				current = decks.head;
				for (var i = 0; i < decks.length; i++) {
					var currentcard = current.value.head;
					for (var j = 0; j < current.value.length; j++) {
						currentcard.value.thisdiv.style.borderColor = cardbordercolor;
						currentcard = currentcard.next;
					}
					current = current.next;
				}
				if (multiselected) {
					current = multiselectlist.head;
					for (var i = 0; i < multiselectlist.length; i++) {
						current.value.thisdiv.style.borderColor = cardbordercolorhighlight;
						current = current.next;
					}
				}
				current = dieframes.head;
				for (var i = 0; i < dieframes.length; i++) {
					current.value.highlight = false;
					current.value.redraw();
					current = current.next;
				}
				current = canvasframes.head;
				for (var i = 0; i < canvasframes.length; i++) {
					if (current.value.drawingmode === "")
						current.value.thisdiv.style.backgroundColor = current.value.backgroundcolor0;
					current = current.next;
				}
				
			}
			if (dragframe) {
				if (draggedframe) {
					if (draggedframe.what == ContainerTypes.FrameContainer) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						//draggedframe.thisdiv.style.backgroundColor = draggedframe.backgroundcolor0;
					} else if (draggedframe.what == ContainerTypes.CanvasFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						//draggedframe.thisdiv.style.backgroundColor = draggedframe.backgroundcolor0;
					} else if (draggedframe.what == ContainerTypes.Card)  {
						if (multiselected) {
							var current = multiselectlist.head;
							for (var i = 0; i < multiselectlist.length; i++) {
								current.value.x = (cameraposx + current.value.displayx)/current.value.scale/zoomvalue;
								current.value.y = (cameraposy + current.value.displayy)/current.value.scale/zoomvalue;
								current = current.next;
							}
						} else {
							draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
							draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
							if (player !== 0) {
								if (gameoptions.includes("d"+draggedframe.deckid+"randomizeangles")) {
									draggedframe.angle = draggedframe.angle + randomizeangleamplitude * 2.0 * (random() - 0.5);
									draggedframe.thisdiv.style.transform = "rotate("+draggedframe.angle+"deg)";
									var currentdate = new Date();
									currenttime = currentdate.getTime();
									draggedframe.timestamp = currenttime - clienttimereference + servertimereference + 1;
									iosocket.emit('updatecardposition', draggedframe.deckid, draggedframe.cardid, draggedframe.x, draggedframe.y, draggedframe.angle, draggedframe.faceup, draggedframe.timestamp);
								}
							}
						}
					} else if (draggedframe.what == ContainerTypes.TokenContainer) {
						draggedframe.x = (cameraposx + draggedframe.size/2 + draggedframe.displayx)/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.size/2 + draggedframe.displayy)/zoomvalue;
						//draggedframe.highlightcolor = draggedframe.bordercolor;
						//draggedframe.redraw();
					}
				}
				draggedframe = null;
				dragframe = false;
				//multiselected = false;
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
			if (multiselect) {
				multiselect = false;
				multiselectdiv.style.display = "none";
				// collect
				if (!multiselected) {
					multiselectlist = new LinkedList();
				}
				
				var current = decks.head;
				for (var i = 0; i < decks.length; i++) {
					var currentcard = current.value.head;
					for (var j = 0; j < current.value.length; j++) {
						var divBB = currentcard.value.thisdiv.getBoundingClientRect();
						if (!iscardinstack(multiselectlist, currentcard.value.deckid, currentcard.value.cardid)) {
							if (doboxescollide(boxx, boxx + boxw, boxy + boxh, boxy, divBB.left, divBB.right, divBB.bottom, divBB.top)) {
								if (currentcard.value.owner.includes(player)) {
									currentcard.value.thisdiv.style.borderColor = cardbordercolorhighlight;
									multiselectlist.addToTail(currentcard.value);
								}
							} else {
								currentcard.value.thisdiv.style.borderColor = cardbordercolor;
							}
						}
						currentcard = currentcard.next;
					}
					current = current.next;
				}
				if (multiselectlist.length > 0)
					multiselected = true;
				else
					multiselected = false;
					
			}
			lastmousedownframe = null;
		}
	});
	gamediv.addEventListener('wheel', function(e){
		if (editingcolor || loadingimage || textediting || loadingdescription || loadingsound) return false;
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
			if (player === 0) {
				var topframe = lastwheelframe;
				if (topframe) {
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.TokenContainer) {
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
							current = canvasframes.head;
							for (var i = 0; i < canvasframes.length; i++) {
								if (current.value.zIndex == topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = current.value;
									break;
								}
								current = current.next;
							}
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
			}
			
		} else if (e.shiftKey) {
			if (player === 0) {
				// scale frame
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
					if (topframe.what == ContainerTypes.CanvasFrame) {
						if (topframe.drawingmode === "") {
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
			}
		} else if (e.ctrlKey) {
		
		} else {
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
					if (opt.items["changevolume"]) {
						opt.items["changevolume"].$label[0].style.marginLeft = "25px";
						
						var volumeinput = document.createElement("input");
						volumeinput.setAttribute("type", "range");
						volumeinput.min = "0";
						volumeinput.max = "1";
						volumeinput.step = "0.01";
						volumeinput.value = "" + basevolume;
						opt.items["changevolume"].$input[0].parentNode.insertBefore(volumeinput, opt.items["changevolume"].$input[0]);
						opt.items["changevolume"].$input[0].remove();
						
						volumeinput.parentNode.insertBefore(document.createElement('br'), volumeinput);
						
						
						volumeinput.addEventListener('input', e => {
							basevolume = volumeinput.valueAsNumber;
							if (audio_loop) audio_loop.volume = basevolume;
						});
					}
					if (opt.items.sound) {
						if (opt.items.sound.items["changevolume"]) {
							opt.items.sound.items["changevolume"].$label[0].style.marginLeft = "25px";
							
							var volumeinput = document.createElement("input");
							volumeinput.setAttribute("type", "range");
							volumeinput.min = "0";
							volumeinput.max = "1";
							volumeinput.step = "0.01";
							volumeinput.value = "" + basevolume;
							opt.items.sound.items["changevolume"].$input[0].parentNode.insertBefore(volumeinput, opt.items.sound.items["changevolume"].$input[0]);
							opt.items.sound.items["changevolume"].$input[0].remove();
							
							volumeinput.parentNode.insertBefore(document.createElement('br'), volumeinput);
							
							
							volumeinput.addEventListener('input', e => {
								console.log(basevolume);
								basevolume = volumeinput.valueAsNumber;
								if (audio_loop) audio_loop.volume = basevolume;
							});
						}
					}
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
						} else if (lastmenuup.what === ContainerTypes.Card) {
							if (multiselected) {
								if (!iscardinstack(multiselectlist, lastmenuup.deckid, lastmenuup.cardid)) {
									lastmenuup.thisdiv.style.borderColor = cardbordercolor;
								}
							} else {
								lastmenuup.thisdiv.style.borderColor = cardbordercolor;
							}
						} else if (lastmenuup.what === ContainerTypes.CanvasFrame) {
							if (lastmenuup.drawingmode === "") 
								lastmenuup.thisdiv.style.backgroundColor = lastmenuup.backgroundcolor0;
						}
					}
				}
		},
		build: function($trigger, e) {
			if (dragframe || dragcamera || repositiontokenframe || multiselect) return false;
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
				if (topframe.what === ContainerTypes.FrameContainer)
					topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
				if (topframe.what === ContainerTypes.TokenContainer) {
					topframe.highlightcolor = topframe.highlightcolor0;
					topframe.redraw();
				}
				if (topframe.what === ContainerTypes.Die) {
					topframe.highlight = true;
					topframe.redraw();
				}
				if (topframe.what === ContainerTypes.Card) {
					topframe.thisdiv.style.borderColor = cardbordercolorhighlight;
					if (multiselected) {
						if (!iscardinstack(multiselectlist, topframe.deckid, topframe.cardid)) {
							multiselected = false;
							var current = multiselectlist.head;
							for (var i = 0; i < multiselectlist.length; i++) {
								current.value.thisdiv.style.borderColor = cardbordercolor;
								current = current.next;
							}
							multiselectlist = new LinkedList();
							
						}
					}
				}
				if (topframe.what === ContainerTypes.CanvasFrame) {
					if (!topframe.hitoutsidecanvas) {
						if (topframe.drawingmode === "d") {
							return false;
						} else if (topframe.drawingmode === "e") {
							var menutextdel = "";
							var menutexttop = "";
							var menutextbottom = "";
							if (topframe.fabriccanvas.getActiveObject()) {
								menutextdel = "Delete";
								menutexttop = "Move To Front";
								menutextbottom = "Move To Back";
							}
							if (topframe.fabriccanvas.getActiveGroup()) {
								menutextdel = "Delete Group";
								menutexttop = "Move Group Front";
								menutextbottom = "Move Group Back";
							}
							if (menutextdel !== "") {
								thismenu.items["deleteselected"] = {"name": menutextdel, "callback": function(itemKey, opt){
															if (topframe.fabriccanvas.getActiveObject()) topframe.fabriccanvas.getActiveObject().remove();
															if (topframe.fabriccanvas.getActiveGroup()) {
																for (var i = 0; i < topframe.fabriccanvas.getActiveGroup()._objects.length; i++) {
																	topframe.fabriccanvas.getActiveGroup()._objects[i].remove();
																}
															}
															topframe.fabriccanvas.discardActiveObject().discardActiveGroup().renderAll();
														}
										   };
								thismenu.items["totopselected"] = {"name": menutexttop, "callback": function(itemKey, opt){
															if (topframe.fabriccanvas.getActiveObject()) topframe.fabriccanvas.bringToFront(topframe.fabriccanvas.getActiveObject());
															if (topframe.fabriccanvas.getActiveGroup()) {
																for (var i = 0; i < topframe.fabriccanvas.getActiveGroup()._objects.length; i++) {
																	topframe.fabriccanvas.bringToFront(topframe.fabriccanvas.getActiveGroup()._objects[i]);
																}
															}
															if (topframe.streamcontent) {
																topframe.getJSON();
																var currentdate = new Date();
																topframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
																iosocket.emit('requpdatecanvascontent', topframe.id, topframe.content, topframe.timestamp);
															}
															topframe.fabriccanvas.renderAll();
														}
										   };
								thismenu.items["tobottomselected"] = {"name": menutextbottom, "callback": function(itemKey, opt){
															if (topframe.fabriccanvas.getActiveObject()) topframe.fabriccanvas.sendToBack(topframe.fabriccanvas.getActiveObject());
															if (topframe.fabriccanvas.getActiveGroup()) {
																for (var i = 0; i < topframe.fabriccanvas.getActiveGroup()._objects.length; i++) {
																	topframe.fabriccanvas.sendToBack(topframe.fabriccanvas.getActiveGroup()._objects[i]);
																}
															}
															var everything = topframe.fabriccanvas.getObjects();
															for (var i = 0; i < everything.length; i++) {
																if (everything[i].type == "rect") {
																	topframe.fabriccanvas.sendToBack(everything[i]);
																	break;
																}
															}
															if (topframe.streamcontent) {
																topframe.getJSON();
																var currentdate = new Date();
																topframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
																iosocket.emit('requpdatecanvascontent', topframe.id, topframe.content, topframe.timestamp);
															}
															topframe.fabriccanvas.renderAll();
														}
										   };
								return thismenu;
							}
							return false;
						} else {
							topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
						}
					}
				}
			}
			
			if (player === 0) {
				thismenu.items["createcanvas"] = {"name": "New Canvas", "callback": function(itemKey, opt){
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												current = canvasframes.head;
												for (var i = 0; i < canvasframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												canvasframes.addToTail(new CanvasFrameContainer(idcounter++, gamediv, InitialMouseDownX, InitialMouseDownY, 400, 400));
												adjustzCounter();
												console.log(canvasframes.tail.value);
												canvasframes.tail.value.resethistory();
												//canvasframes.tail.value.history = new LinkedList();
												//canvasframes.tail.value.history.addToHead(canvasframes.tail.value.content);
												//canvasframes.tail.value.currenthistory = canvasframes.tail.value.history.head;
											}
							   };
				thismenu.items["createframe"] = {"name": "New Frame", "callback": function(itemKey, opt){
												var current = imageframes.head;
												for (var i = 0; i < imageframes.length; i++) {
													idcounter = Math.max(idcounter, 1*current.value.id + 1);
													current = current.next;
												}
												current = canvasframes.head;
												for (var i = 0; i < canvasframes.length; i++) {
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
												current = canvasframes.head;
												for (var i = 0; i < canvasframes.length; i++) {
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
				thismenu.items["createdeck"] = {"name": "New Deck", "callback": function(itemKey, opt){
							$("#fileinputdialog").trigger('click');							
							document.getElementById("fileinputdialog").onchange = function(){
								
								asyncLoadLocalFile(this.files[0], function(contents){
										var words = contents.split(/\r?\n/);
										var newdeckid = 0;
										var currentdeck = decks.head;
										for (var i = 0; i < decks.length; i++) {
											newdeckid = Math.max(newdeckid, currentdeck.value.head.value.deckid);
											currentdeck = currentdeck.next;
										}
										newdeckid += 1;
										var newdeck = new LinkedList();
										var cardcounter = -1;
										for (var i = 1; i < words.length; i++) {
											var thiscarddata = words[i].split(/\t/);
											if (thiscarddata.length === 4) {
												// thiscarddata[0-4] = width, height, frontfile, backfile("-" for empty)
												var newcard = new Card(newdeckid, ++cardcounter, newdeck, gamediv, InitialMouseDownX+cardcounter*Math.min(1*thiscarddata[0], 1*thiscarddata[1])/20.0, InitialMouseDownY+cardcounter*Math.min(1*thiscarddata[0], 1*thiscarddata[1])/20.0, 1*thiscarddata[0], 1*thiscarddata[1], thiscarddata[2], thiscarddata[3]);
												newdeck.addToTail(newcard);
											}
										}
										decks.addToTail(newdeck);
									});
								
							};
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
			var makenewdiemenu = true;
			if (topframe) {
				if (topframe.what === ContainerTypes.Card) {
					makenewdiemenu = false;
				}
			}
			if (makenewdiemenu) {
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
			}
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
				thismenu.items.sound.items["changevolume"] = {"name": "Volume", "type": "text"};
			}
			if (topframe) {
				if (topframe.what === ContainerTypes.Die) {
					thismenu.items["sep1"] = "---------";
					thismenu.items["rolldie"] = {"name": "Roll", "callback": function(itemKey, opt){
													topframe.roll();
												}
								   };
					var current = tokenframes.head;
					var legaltokens = [];	
					for (var i = 0; i < tokenframes.length; i++) {
						if (current.value.owner.includes(player)) {
							legaltokens.push(current.value);
						}
						current = current.next;
					}
					if (legaltokens.length > 0) {
						thismenu.items["linktotokenmenu"] = { "name": "Link to Token", "items": {} };
						var linked = "";
						for (var i = 0; i < legaltokens.length; i++) {
							if (topframe.tokenlink) {
								if (topframe.tokenlink.id === legaltokens[i].id) 
									linked = "→ ";
								else 
									linked = "";
							}
							thismenu.items.linktotokenmenu.items["linktotokenmenu"+i] = {"name": linked+legaltokens[i].descname, "callback": function(itemKey, opt){
															var index = parseInt(itemKey.slice(15));
															//console.log(index);
															legaltokens[index].dielink = topframe;
															topframe.tokenlink = legaltokens[index];
														}
										   };
						}
					}
					thismenu.items["deletedie"] = {"name": "Delete", "callback": function(itemKey, opt){
													var current = dieframes.head;
													for (var i = 0; i < dieframes.length; i++) {
														if (current.value.id === topframe.id) {
															if (current.value.tokenlink) current.value.tokenlink.dielink = null;
															current.value.thisdiv.parentNode.removeChild(current.value.thisdiv);
															dieframes.moveToTail(current);
															dieframes.removeFromTail(current);
															break;
														}
														current = current.next;
													}
												}
								   };
					return thismenu;
				}
			}
			if (topframe) {
				if (player !== 0) { 
					if (topframe.what === ContainerTypes.TokenContainer) {
						if (topframe.dielink) {
							thismenu.items["rolldielink"] = {"name": "Roll", "callback": function(itemKey, opt){
															topframe.dielink.roll();
														}
										   };
						}
					}
				}
			}
			if (topframe) {
				if (topframe.what === ContainerTypes.Card ) {
				       if (player !== 0) { // rights+options incomplete
					if (!topframe.faceup && topframe.viewingrights.includes(player)) {//topframe.filenameback === logopath && 
						var currentcardlist;
						var drawfunction = function() {
									var current = currentcardlist.head;
									for (var i = 0; i < currentcardlist.length; i++) {
										current.value.draw();
										current = current.next;
									}
								};
						var discardfunction = function() {
									var current = currentcardlist.head;
									for (var i = 0; i < currentcardlist.length; i++) {
										current.value.discard();
										current = current.next;
									}
								};
						if (!topframe.onhand) {
							if (multiselected) {
								thismenu.items["draw"] = {"name": "Draw Selected", "callback": function(){
																currentcardlist = multiselectlist;
																drawfunction();
															}
											   };
							} else {
								thismenu.items["draw"] = {"name": "Draw", "callback": function(){
																currentcardlist = new LinkedList();
																currentcardlist.addToTail(topframe);
																drawfunction();
															}
											   };
							}
						} else {
							if (multiselected) {
								thismenu.items["discard"] = {"name": "Discard Selected", "callback": function(){
																currentcardlist = multiselectlist;
																discardfunction();
															}
											   };
							} else {
								thismenu.items["discard"] = {"name": "Discard", "callback": function(){
																currentcardlist = new LinkedList();
																currentcardlist.addToTail(topframe);
																discardfunction();
															}
											   };
							}
						}
					}
					var viewfunction = function (currentimage) {
						var borderwidth = 3;
						detailimagedivimg.style.border = borderwidth+"px solid white";
						
						// set canvas dimensions + position
						var screenw = window.innerWidth - 2*borderwidth;
						var screenh = window.innerHeight - 2*borderwidth;
						var w;
						var h;
						if (currentimage.width > screenw) {
							w = screenw;
							h = screenw * currentimage.height / currentimage.width;
							if (h > screenh) {
								h = screenh;
								w = screenh * currentimage.width / currentimage.height;
							}
						} else {
							if (currentimage.height > screenh) {
								h = screenh;
								w = screenh *currentimage.width / currentimage.height;
							} else {
								w = currentimage.width;
								h = currentimage.height;
							}
						}
						detailimagedivimg.style.width = w + "px";
						detailimagedivimg.style.height = h + "px";
						detailimagedivimg.style.left = (screenw/2 - w/2) + "px";
						detailimagedivimg.style.top = (screenh/2 - h/2) + "px";
						detailimagedivimg.src = currentimage.src;
						
						detailimagediv.style.zIndex = zcounter + 100;
						detailimagediv.style.visibility = "visible";
					};
					if (topframe.filenameback !== logopath) {
						// two-sided card
						thismenu.items["viewcardfront"] = {"name": "View Front", "callback": function(itemKey, opt){
														if (topframe.faceup) 
															viewfunction(topframe.imagefront);
														else
															viewfunction(topframe.imageback);
													}
									   };
						thismenu.items["viewcardback"] = {"name": "View Back", "disabled": !topframe.viewingrights.includes(player), "callback": function(itemKey, opt){
														if (topframe.faceup) 
															viewfunction(topframe.imageback);
														else
															viewfunction(topframe.imagefront);
													}
									   };
					} else {
						// one-sided card
						thismenu.items["viewcardfront"] = {"name": "View", "disabled": !topframe.faceup && !topframe.viewingrights.includes(player), "callback": function(itemKey, opt){
														viewfunction(topframe.imagefront);
													}
									   };
					}
					if (multiselected) {
						thismenu.items["sep2"] = "---------";			   
						thismenu.items["shuffle"] = {"name": "Shuffle", "callback": function(itemKey, opt){
														var shufflelist = [];
														var current = multiselectlist.head;
														for (var i = 0; i < multiselectlist.length; i++) {
															shufflelist.push(current.value.deckid + "." + current.value.cardid);
															current = current.next;
														}
														iosocket.emit('reqshuffle', shufflelist);
													}
												};
							
						thismenu.items["collect"] = {"name": "Collect", "callback": function(itemKey, opt){
														var currentdate = new Date();
														var currenttime = currentdate.getTime();
														var current = multiselectlist.head;
														for (var i = 0; i < multiselectlist.length; i++) {
															current.value.x = topframe.x;
															current.value.y = topframe.y;
															current.value.setdisplayposition();
															current.value.timestamp = currenttime - clienttimereference + servertimereference;
															iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
															current = current.next;
														}
													}
												};
												
						thismenu.items["arrangenicely"] = {"name": "Arrange", "callback": function(itemKey, opt){
														// build zIndex-sorted list
														var current = multiselectlist.head;
														for (var j = 0; j < multiselectlist.length; j++) {
															current.value.touchedthis = false;
															current = current.next;
														}
														var sortedlist = new LinkedList();
														for (var i = 0; i < multiselectlist.length; i++) {
															var currentlowest = null;
															current = multiselectlist.head;
															for (var j = 0; j < multiselectlist.length; j++) {
																if (currentlowest) {
																	if (!current.value.touchedthis) {
																		if (currentlowest.zIndex > current.value.zIndex) {
																			currentlowest = current.value;
																		}
																	}
																} else {
																	if (!current.value.touchedthis) {
																		currentlowest = current.value;
																	}
																}
																current = current.next;
															}
															currentlowest.touchedthis = true;
															sortedlist.addToTail(currentlowest);
														}
														// apply
														var currentdate = new Date();
														var currenttime = currentdate.getTime();
														var current = sortedlist.head;
														var refx = sortedlist.head.value.x;
														var refy = sortedlist.head.value.y;
														for (var i = 0; i < sortedlist.length; i++) {
															current.value.x = refx + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
															current.value.y = refy + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
															current.value.setdisplayposition();
															current.value.timestamp = currenttime - clienttimereference + servertimereference;
															iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
															current = current.next;
														}
													}
												};
					}
				       }
				}
			} else {
				if (player !== 0) {
					// discard all
					thismenu.items["discardall"] = {"name": "Discard All", "callback": function(itemKey, opt){
													var currentdeck = decks.head;
													for (var i = 0; i < decks.length; i++) {
														var current = currentdeck.value.head;
														for (var i = 0; i < currentdeck.value.length; i++) {
															current.value.discard();
															current = current.next;
														}
														currentdeck = currentdeck.next;
													}
												}
								   };
					thismenu.items["changevolume"] = {"name": "Volume", "type": "text"};
				}
				
			}
			if (player === 0 && topframe) {
				thismenu.items["sep2"] = "---------";
				
				var thisname = "";
				if (topframe.what=== ContainerTypes.Card) {
					thismenu.items["topframeinfo"] = { "name": "Card " + topframe.deckid + "." + topframe.cardid, "disabled": true };
				} else {
					if (topframe.what=== ContainerTypes.FrameContainer) {
						thisname = "Frame";
					} else if (topframe.what === ContainerTypes.TokenContainer) {
						thisname = "Token";
					} else if (topframe.what === ContainerTypes.Marker) {
						thisname = "Marker";
					} else if (topframe.what === ContainerTypes.FrameLabel) {
						thisname = "Label";
					} else if (topframe.what === ContainerTypes.CanvasFrame) {
						thisname = "Canvas";
					}
					thismenu.items["topframeinfo"] = { "name": thisname + " " + topframe.id, "disabled": true };
				}
				// Container Specific
				// Push this
				// Owner
				// load image
				// details: streamposition, fixposition, has descr., tokensize, tokencolor
				// reload
				// push delete this

				if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.Marker || topframe.what === ContainerTypes.FrameLabel || topframe.what === ContainerTypes.CanvasFrame) {
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
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.CanvasFrame) {
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
					}
					thismenu.items["pushthis"] = {"name": "Push This", "callback": function(itemKey, opt){
													// send to server for broadcast
													var currentdate = new Date();
													var actualframe = topframe;
													if (topframe.what === ContainerTypes.Marker || topframe.what === ContainerTypes.FrameLabel) {
														actualframe = topframe.parentframe;
													}
													actualframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
													if (actualframe.what === ContainerTypes.FrameContainer) {
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
													} else if (actualframe.what === ContainerTypes.TokenContainer) {
														var tmpbackup = actualframe.dielink;
														actualframe.dielink = null;
														iosocket.emit('pushtoken', actualframe);
														actualframe.dielink = tmpbackup;
													} else if (actualframe.what === ContainerTypes.CanvasFrame) {
														var tempframe = {};
														actualframe.getJSON();
														for (var i = 0; i < relevantdata_canvasframe.length; i++) {
															tempframe[relevantdata_canvasframe[i]] = actualframe[relevantdata_canvasframe[i]];
														}
														actualframe.changinghistory = true;
														iosocket.emit('pushcanvas', tempframe);
													}
												}
								   };
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.Marker) {
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
																		topframe.offsetx = 0;
																		topframe.offsety = 0;
																		topframe.scale = 1.0;
																		topframe.applyimage(newimage);
																	} else if (topframe.what == ContainerTypes.Marker) {
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
					}
					thismenu.items["framedetails"] = { "name": "Details", "items": {} };
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.CanvasFrame) {
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
						if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer) {
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
						if (topframe.what === ContainerTypes.CanvasFrame) {
							if (topframe.streamcontent)
								thismenu.items.framedetails.items["contentstreamtoggle"] = {"name": "Content Streaming: On", "callback": function(itemKey, opt){
																		if (topframe.streamcontent) {
																			topframe.streamcontent = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Content Streaming: Off</span>";
																		} else {
																			topframe.streamcontent = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Content Streaming: On</span>"; 
																		}
																		return false;}};
							else
								thismenu.items.framedetails.items["contentstreamtoggle"] = {"name": "Content Streaming: Off", "callback": function(itemKey, opt){
																		if (topframe.streamcontent) {
																			topframe.streamcontent = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Content Streaming: Off</span>";
																		} else {
																			topframe.streamcontent = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Content Streaming: On</span>"; 
																		}
																		return false;}};
						}
					}
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame) {
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
					if (topframe.what === ContainerTypes.CanvasFrame) {
							thismenu.items.framedetails.items["changecanvassize"] = {"name": "Set Canvas Size", "callback": function(itemKey, opt){
																	var newsize = prompt("Enter Size.", "" + topframe.width + "x" + topframe.height);
																	if (newsize) {
																		var xysize = newsize.split('x');
																		if (!isNaN(parseInt(xysize[0])) && parseInt(xysize[0]) > 0) {
																			topframe.width = parseInt(xysize[0]);
																		} else {
																			alert("Non-integer/negative input invalid.")
																		}
																		if (!isNaN(parseInt(xysize[1])) && parseInt(xysize[1]) > 0) {
																			topframe.height = parseInt(xysize[1]);
																		} else {
																			alert("Non-integer/negative input invalid.")
																		}
																	}
																	topframe.fabriccanvas.setWidth(topframe.width);
																	topframe.fabriccanvas.setHeight(topframe.height);
																	topframe.fabriccanvas.calcOffset();
																	// rect
																	var streamcontent0 = topframe.streamcontent;
																	topframe.streamcontent = false;
																	var everything = topframe.fabriccanvas.getObjects();
																	for (var i = 0; i < everything.length; i++) {
																		if (everything[i].type == "rect") {
																			everything[i].remove();
																			// create a rectangle object
																			var rect = new fabric.Rect({
																			  left: 0,
																			  top: 0,
																			  fill: 'white',
																			  width: topframe.width,
																			  height: topframe.height
																			});
																			rect.selectable = false;
																			topframe.fabriccanvas.add(rect);
																			rect.moveTo(0);
																		}
																	}
																	topframe.fabriccanvas.renderAll();
																	topframe.streamcontent = streamcontent0;
																	topframe.setdisplayscale();
																	}};
					}
					if (topframe.what === ContainerTypes.TokenContainer) {
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
							thismenu.items.framedetails.items["resettokenimage"] = {"name": "Reset Token Image", "callback": function(itemKey, opt){
																	topframe.offsetx = 0;
																	topframe.offsety = 0;
																	topframe.scale = 1.0;
																	topframe.redraw();
																	}};
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
					}
					if (topframe.what === ContainerTypes.FrameLabel) {
							thismenu.items.framedetails.items["setlabeltext"] = {"name": "Set Text", "callback": function(itemKey, opt){
															textediting = true;
																	
															texteditdivcontainer.style.visibility = "";
															texteditdivcontainer.style.zIndex = zcounter + 100;
															texteditdiv.style.zIndex = zcounter + 120;
															texteditdiv.style.left = document.body.clientWidth/2 - parseInt(texteditdiv.style.width.replace("px", ""))/2 + "px";
															texteditdiv.style.top = "0px";
															
															document.getElementById("texteditinput").value = topframe.thislabel.innerHTML.replace(/<br>/g, '\n');
															document.getElementById("texteditinput").focus();
															
															var thelabel = topframe;
															document.getElementById("textedit_bapply").onclick = function(){
																texteditdivcontainer.style.visibility = "hidden";
																texteditdiv.style.zIndex = 0;
																textediting = false;
																thelabel.currenttext = document.getElementById("texteditinput").value.replace(/\r?\n/g, '<br>');
																thelabel.setArc(thelabel.ctradius, thelabel.ctdir);
																
															};
															document.getElementById("textedit_bcancel").onclick = function(){
																texteditdivcontainer.style.visibility = "hidden";
																texteditdiv.style.zIndex = 0;
																textediting = false;
															};
															document.getElementById("texteditdivcontainer").onmousedown = function(e){
																if (e.target === document.getElementById("texteditdivcontainer")) {
																	texteditdivcontainer.style.visibility = "hidden";
																	texteditdiv.style.zIndex = 0;
																	textediting = false;
																}
															};
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
													} else if (topframe.what == ContainerTypes.FrameLabel) {
														iosocket.emit('pushdeletelabel', topframe.parentframe.id, topframe.id);
														topframe = null;
													} else if (topframe.what == ContainerTypes.CanvasFrame) {
														iosocket.emit('pushdeletecanvas', topframe.id);
														topframe = null;
													}
												}
								   };
				} else if (topframe.what === ContainerTypes.Card)	{
					thismenu.items["cardsinglesubmenu"] = { "name": "Card", "items": {} };
					thismenu.items["cardstacksubmenu"] = { "name": "Stack ("+multiselectlist.length+" cards)", "disabled": !multiselected, "items": {} };
					thismenu.items["carddecksubmenu"] = { "name": "Deck ("+topframe.deck.length+" cards)", "items": {} };
					
					
					var currentcardlist = null;
					var pushfunction = function(itemKey, opt) {
								// send to server for broadcast
								var currentdate = new Date();
								var currenttime = currentdate.getTime();
								var current = currentcardlist.head;
								for (var i = 0; i < currentcardlist.length; i++) {
									var currentdeck = current.value.deck;
									current.value.deck = null;
									current.value.timestamp = currenttime - clienttimereference + servertimereference;
									iosocket.emit('pushcard', current.value);
									current.value.deck = currentdeck;
									current = current.next;
								}
							};
					thismenu.items.cardsinglesubmenu.items["pushthis"] = {"name": "Push", "callback": function(itemKey, opt){
													currentcardlist = new LinkedList();
													currentcardlist.addToTail(topframe);
													pushfunction(itemKey, opt);
												}
								   };
					thismenu.items.cardstacksubmenu.items["pushthisstack"] = {"name": "Push", "callback": function(itemKey, opt){
													currentcardlist = multiselectlist;
													pushfunction(itemKey, opt);
												}
								   };	
					thismenu.items.carddecksubmenu.items["pushthisdeck"] = {"name": "Push", "callback": function(itemKey, opt){
													var current = decks.head;
													for (var i = 0; i < decks.length; i++) {
														if (topframe.deckid === current.value.head.value.deckid) {
															currentcardlist = current.value;
															break;
														}
														current = current.next;
													}
													pushfunction(itemKey, opt);
												}
								   };
					var togglemovingrights = function(someplayer, somesubmenu) {
									var isincluded = topframe.owner.includes(someplayer);
									if (isincluded) 
										somesubmenu.$node[0].classList.add("disabledtext"); 
									else
										somesubmenu.$node[0].classList.remove("disabledtext"); 
									var current = currentcardlist.head;
									for (var i = 0; i < currentcardlist.length; i++) {
										if (isincluded) { // remove entry
											if (current.value.owner.includes(someplayer))
												current.value.owner.splice(current.value.owner.indexOf(someplayer), 1);
										} else { // add entry
											if (!current.value.owner.includes(someplayer))
												current.value.owner.push(someplayer);
										}
										current = current.next;
									}
								};
					var toggleviewingrights = function(someplayer, somesubmenu) {
									var isincluded = topframe.viewingrights.includes(someplayer);
									if (isincluded) 
										somesubmenu.$node[0].classList.add("disabledtext"); 
									else
										somesubmenu.$node[0].classList.remove("disabledtext"); 
									var current = currentcardlist.head;
									for (var i = 0; i < currentcardlist.length; i++) {
										if (isincluded) { // remove entry
											if (current.value.viewingrights.includes(someplayer))
												current.value.viewingrights.splice(current.value.viewingrights.indexOf(someplayer), 1);
										} else { // add entry
											if (!current.value.viewingrights.includes(someplayer))
												current.value.viewingrights.push(someplayer);
										}
										current = current.next;
									}
								};
					var doesthispropertydiffer = function(somelist, someproperty, somevalue) { // tests whether somevalue is included in all someproperties of somelist
						if (somelist) {
							if (somelist.length > 0) {
								var current = somelist.head;
								var isincludedinhead = current.value[someproperty].includes(somevalue);
								current = current.next;
								for (var i = 1; i < somelist.length; i++) {
									if (current.value[someproperty].includes(somevalue) !== isincludedinhead) {
										return " ??";
									}
									current = current.next;
								}
							}
						}
						return "";
					};
					// build owner+view submenu+callback
					thismenu.items.cardsinglesubmenu.items["movingsubmenu"] = { "name": "Moving Rights", "items": {} };
					thismenu.items.cardstacksubmenu.items["movingsubmenus"] = { "name": "Moving Rights", "items": {} };
					thismenu.items.carddecksubmenu.items["movingsubmenud"] = { "name": "Moving Rights", "items": {} };
					for (var i = 0; i < playernames.length; i++) {
						var isdisabledtext;
						if (topframe.owner.includes(i))
							isdisabledtext = "";
						else
							isdisabledtext = "disabledtext";
						thismenu.items.cardsinglesubmenu.items.movingsubmenu.items["movingsubmenukey"+i] = {"name": playernames[i], "className": isdisabledtext, "callback": function(itemKey, opt){
																currentcardlist = new LinkedList();
																currentcardlist.addToTail(topframe);
																var thisplayer =  parseInt(itemKey.replace("movingsubmenukey", ""));
																togglemovingrights(thisplayer, opt.items.cardsinglesubmenu.items.movingsubmenu.items[itemKey]);
																return false;}
														};
						thismenu.items.cardstacksubmenu.items.movingsubmenus.items["movingsubmenukey"+i] = {"name": ""+playernames[i]+doesthispropertydiffer(multiselectlist, "owner", i), "className": isdisabledtext, "callback": function(itemKey, opt){
																currentcardlist = multiselectlist;
																var thisplayer =  parseInt(itemKey.replace("movingsubmenukey", ""));
																togglemovingrights(thisplayer, opt.items.cardstacksubmenu.items.movingsubmenus.items[itemKey]);
																return false;}
														};
						thismenu.items.carddecksubmenu.items.movingsubmenud.items["movingsubmenukey"+i] = {"name": ""+playernames[i]+doesthispropertydiffer(topframe.deck, "owner", i), "className": isdisabledtext, "callback": function(itemKey, opt){
																var current = decks.head;
																for (var i = 0; i < decks.length; i++) {
																	if (topframe.deckid === current.value.head.value.deckid) {
																		currentcardlist = current.value;
																		break;
																	}
																	current = current.next;
																}
																var thisplayer =  parseInt(itemKey.replace("movingsubmenukey", ""));
																togglemovingrights(thisplayer, opt.items.carddecksubmenu.items.movingsubmenud.items[itemKey]);
																return false;}
														};
					}
					thismenu.items.cardsinglesubmenu.items["viewingsubmenu"] = { "name": "Viewing Rights", "items": {} };
					thismenu.items.cardstacksubmenu.items["viewingsubmenus"] = { "name": "Viewing Rights", "items": {} };
					thismenu.items.carddecksubmenu.items["viewingsubmenud"] = { "name": "Viewing Rights", "items": {} };
					for (var i = 0; i < playernames.length; i++) {
						var isdisabledtext;
						if (topframe.viewingrights.includes(i))
							isdisabledtext = "";
						else
							isdisabledtext = "disabledtext";
						thismenu.items.cardsinglesubmenu.items.viewingsubmenu.items["viewingsubmenukey"+i] = {"name": playernames[i], "className": isdisabledtext, "callback": function(itemKey, opt){
																currentcardlist = new LinkedList();
																currentcardlist.addToTail(topframe);
																var thisplayer = parseInt(itemKey.replace("viewingsubmenukey", ""));
																toggleviewingrights(thisplayer, opt.items.cardsinglesubmenu.items.viewingsubmenu.items[itemKey]);
																return false;}
														};
						thismenu.items.cardstacksubmenu.items.viewingsubmenus.items["viewingsubmenukey"+i] = {"name": ""+playernames[i]+doesthispropertydiffer(multiselectlist, "viewingrights", i), "className": isdisabledtext, "callback": function(itemKey, opt){
																currentcardlist = multiselectlist;
																var thisplayer =  parseInt(itemKey.replace("viewingsubmenukey", ""));
																toggleviewingrights(thisplayer, opt.items.cardstacksubmenu.items.viewingsubmenus.items[itemKey]);
																return false;}
														};
						thismenu.items.carddecksubmenu.items.viewingsubmenud.items["viewingsubmenukey"+i] = {"name": ""+playernames[i]+doesthispropertydiffer(topframe.deck, "viewingrights", i), "className": isdisabledtext, "callback": function(itemKey, opt){
																var current = decks.head;
																for (var i = 0; i < decks.length; i++) {
																	if (topframe.deckid === current.value.head.value.deckid) {
																		currentcardlist = current.value;
																		break;
																	}
																	current = current.next;
																}
																var thisplayer =  parseInt(itemKey.replace("viewingsubmenukey", ""));
																toggleviewingrights(thisplayer, opt.items.carddecksubmenu.items.viewingsubmenud.items[itemKey]);
																return false;}
														};
					}
					
					thismenu.items.cardstacksubmenu.items["faceups"] = {"name": "Turn Face Up", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = multiselectlist.head;
																for (var i = 0; i < multiselectlist.length; i++) {
																	if (!current.value.faceup) { 
																		current.value.turncard();
																		current.value.timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	}
																	current = current.next;
																}
															}
														};
					thismenu.items.cardstacksubmenu.items["facedowns"] = {"name": "Turn Face Down", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = multiselectlist.head;
																for (var i = 0; i < multiselectlist.length; i++) {
																	if (current.value.faceup) { 
																		current.value.turncard();
																		current.value.timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	}
																	current = current.next;
																}
															}
														};
					thismenu.items.carddecksubmenu.items["faceupd"] = {"name": "Turn Face Up", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = topframe.deck.head;
																for (var i = 0; i < topframe.deck.length; i++) {
																	if (!current.value.faceup) { 
																		current.value.turncard();
																		current.value.timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	}
																	current = current.next;
																}
															}
														};
					thismenu.items.carddecksubmenu.items["facedownd"] = {"name": "Turn Face Down", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = topframe.deck.head;
																for (var i = 0; i < topframe.deck.length; i++) {
																	if (current.value.faceup) { 
																		current.value.turncard();
																		current.value.timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	}
																	current = current.next;
																}
															}
														};
					var changescalefunction = function() {
						var newscale = prompt("Enter Scale.", topframe.scale);
						if (newscale) {
							newscale = parseFloat(newscale);
							if (!isNaN(newscale) && newscale > 0.0) {
								var currentdate = new Date();
								var currenttime = currentdate.getTime();
								var current = currentcardlist.head;
								for (var i = 0; i < currentcardlist.length; i++) {
									current.value.scale = newscale;
									current.value.x = (current.value.displayx + cameraposx) / current.value.scale / zoomvalue;
									current.value.y = (current.value.displayy + cameraposy) / current.value.scale / zoomvalue;
									current.value.timestamp = currenttime - clienttimereference + servertimereference;
									var tmpdeck = current.value.deck;
									current.value.deck = null;
									iosocket.emit('pushcard', current.value);
									current.value.deck = tmpdeck;
									current = current.next;
								}
							} else {
								alert("Non-float/Non-positive input invalid.")
							}
						}
					}		
					thismenu.items.cardsinglesubmenu.items["changecardscale"] = {"name": "Change Scale", "callback": function(itemKey, opt){
													currentcardlist = new LinkedList();
													currentcardlist.addToTail(topframe);
													changescalefunction();
												}
								   };
					thismenu.items.cardstacksubmenu.items["changecardscales"] = {"name": "Change Scale", "callback": function(itemKey, opt){
													currentcardlist = multiselectlist;
													changescalefunction();
												}
								   };	
					thismenu.items.carddecksubmenu.items["changecardscaled"] = {"name": "Change Scale", "callback": function(itemKey, opt){
													var current = decks.head;
													for (var i = 0; i < decks.length; i++) {
														if (topframe.deckid === current.value.head.value.deckid) {
															currentcardlist = current.value;
															break;
														}
														current = current.next;
													}
													changescalefunction();
												}
								   };							
					thismenu.items.cardstacksubmenu.items["collects"] = {"name": "Collect", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = multiselectlist.head;
																for (var i = 0; i < multiselectlist.length; i++) {
																	current.value.x = topframe.x;
																	current.value.y = topframe.y;
																	current.value.setdisplayposition();
																	current.value.timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	current = current.next;
																}
															}
														};
					thismenu.items.carddecksubmenu.items["collectd"] = {"name": "Collect", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = topframe.deck.head;
																for (var i = 0; i < topframe.deck.length; i++) {
																	current.value.x = topframe.x;
																	current.value.y = topframe.y;
																	current.value.setdisplayposition();
																	current.value.timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	current = current.next;
																}
															}
														};
														
					thismenu.items.cardstacksubmenu.items["arrangenicelys"] = {"name": "Arrange", "callback": function(itemKey, opt){
																// build zIndex-sorted list
																var current = multiselectlist.head;
																for (var j = 0; j < multiselectlist.length; j++) {
																	current.value.touchedthis = false;
																	current = current.next;
																}
																var sortedlist = new LinkedList();
																for (var i = 0; i < multiselectlist.length; i++) {
																	var currentlowest = null;
																	current = multiselectlist.head;
																	for (var j = 0; j < multiselectlist.length; j++) {
																		if (currentlowest) {
																			if (!current.value.touchedthis) {
																				if (currentlowest.zIndex > current.value.zIndex) {
																					currentlowest = current.value;
																				}
																			}
																		} else {
																			if (!current.value.touchedthis) {
																				currentlowest = current.value;
																			}
																		}
																		current = current.next;
																	}
																	currentlowest.touchedthis = true;
																	sortedlist.addToTail(currentlowest);
																}
																// apply
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = sortedlist.head;
																var refx = sortedlist.head.value.x;
																var refy = sortedlist.head.value.y;
																for (var i = 0; i < sortedlist.length; i++) {
																	current.value.x = refx + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
																	current.value.y = refy + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
																	current.value.setdisplayposition();
																	current.value.timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	current = current.next;
																}
															}
														};
					thismenu.items.carddecksubmenu.items["arrangenicelyd"] = {"name": "Arrange", "callback": function(itemKey, opt){
																// build zIndex-sorted list
																var current = topframe.deck.head;
																for (var j = 0; j < topframe.deck.length; j++) {
																	current.value.touchedthis = false;
																	current = current.next;
																}
																var sortedlist = new LinkedList();
																for (var i = 0; i < topframe.deck.length; i++) {
																	var currentlowest = null;
																	current = topframe.deck.head;
																	for (var j = 0; j < topframe.deck.length; j++) {
																		if (currentlowest) {
																			if (!current.value.touchedthis) {
																				if (currentlowest.zIndex > current.value.zIndex) {
																					currentlowest = current.value;
																				}
																			}
																		} else {
																			if (!current.value.touchedthis) {
																				currentlowest = current.value;
																			}
																		}
																		current = current.next;
																	}
																	currentlowest.touchedthis = true;
																	sortedlist.addToTail(currentlowest);
																}
																// apply
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																var current = sortedlist.head;
																var refx = sortedlist.head.value.x;
																var refy = sortedlist.head.value.y;
																for (var i = 0; i < sortedlist.length; i++) {
																	current.value.x = refx + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
																	current.value.y = refy + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/20.0;
																	current.value.setdisplayposition();
																	current.value.timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', current.value.deckid, current.value.cardid, current.value.x, current.value.y, current.value.angle, current.value.faceup, current.value.timestamp);
																	current = current.next;
																}
															}
														};
					thismenu.items.carddecksubmenu.items["setdeckid"] = {"name": "Set Deck ID", "callback": function(itemKey, opt){ // use this to change deck layering order
															var newid = prompt("Enter new ID.", topframe.deckid);
															if (newid) {
																if (!isNaN(parseInt(newid)) && parseInt(newid) > 0) {
																	var currentdeck = decks.head;
																	for (var i = 0; i < decks.length; i++) {
																		if (parseInt(newid) === currentdeck.value.head.value.deckid) {
																			alert("New ID already in use.");
																			return;
																		}
																		currentdeck = currentdeck.next;
																	}
																	iosocket.emit('reqchangedeckid', topframe.deckid, parseInt(newid));
																} else {
																	alert("Non-integer/negative input invalid.")
																}
															}
															}};
					thismenu.items.cardstacksubmenu.items["shuffles"] = {"name": "Shuffle", "callback": function(itemKey, opt){
																var shufflelist = [];
																var current = multiselectlist.head;
																for (var i = 0; i < multiselectlist.length; i++) {
																	shufflelist.push(current.value.deckid + "." + current.value.cardid);
																	current = current.next;
																}
																iosocket.emit('reqshuffle', shufflelist);
															}
														};
					thismenu.items.carddecksubmenu.items["shuffled"] = {"name": "Shuffle", "callback": function(itemKey, opt){
																var shufflelist = [];
																var current = topframe.deck.head;
																for (var i = 0; i < topframe.deck.length; i++) {
																	shufflelist.push(current.value.deckid + "." + current.value.cardid);
																	current = current.next;
																}
																iosocket.emit('reqshuffle', shufflelist);
															}
														};
														
					var deletefunction = function(itemKey, opt) {
								var current = currentcardlist.head;
								for (var i = 0; i < currentcardlist.length; i++) {
									iosocket.emit('pushdeletecard', current.value.deckid, current.value.cardid);
									current = current.next;
								}
							};
					thismenu.items.cardsinglesubmenu.items["pushdeletethis"] = {"name": "Delete", "callback": function(itemKey, opt){
													currentcardlist = new LinkedList();
													currentcardlist.addToTail(topframe);
													deletefunction(itemKey, opt);
												}
								   };
					thismenu.items.cardstacksubmenu.items["pushdeletethisstack"] = {"name": "Delete", "callback": function(itemKey, opt){
													currentcardlist = multiselectlist;
													deletefunction(itemKey, opt);
												}
								   };	
					thismenu.items.carddecksubmenu.items["pushdeletethisdeck"] = {"name": "Delete", "callback": function(itemKey, opt){
													iosocket.emit('pushdeletedeck', topframe.deckid);
												}
								   };
																	
				}
				
				
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
				
				thismenu.items["gameoptionsubmenu"] = { "name": "Game Options", "items": {} };
				thismenu.items.gameoptionsubmenu.items["addoption"] = {"name": "Add Option", "callback": function(itemKey, opt){
												var newoption = prompt("Current settings: " + gameoptions.join(' ') + "; supported d<deckid>dragtotop, d<deckid>randomizeangles, ...", "");
												if (newoption) {
													iosocket.emit('gameoptions_add', newoption);
												}
											}
							   };
				thismenu.items.gameoptionsubmenu.items["removeoption"] = {"name": "Remove Option", "callback": function(itemKey, opt){
												var oldoption = prompt("Current settings: " + gameoptions.join(' '), gameoptions.join(' '));
												if (oldoption) {
													iosocket.emit('gameoptions_remove', oldoption);
												}
											}
							   };
				var eventlogtogglelabel;
				if (showeventlog)
					eventlogtogglelabel = "Show Log: On";
				else
					eventlogtogglelabel = "Show Log: Off";
				thismenu.items.gameoptionsubmenu.items["sep5"] = "---------";
				thismenu.items.gameoptionsubmenu.items["eventlogtoggle"] = {"name": eventlogtogglelabel, "callback": function(itemKey, opt){
														var eventlogtogglelabel2;
														if (showeventlog)
															eventlogtogglelabel2 = "Show Log: Off";
														else
															eventlogtogglelabel2 = "Show Log: On";
														iosocket.emit('requesttoggleeventlog');
														opt.items.gameoptionsubmenu.items[itemKey].$node[0].innerHTML = "<span>" + eventlogtogglelabel2 + "</span>";
														return false;}};
														
				thismenu.items.gameoptionsubmenu.items["changetokensizeall"] = {"name": "Set Global Token Size", "callback": function(itemKey, opt){
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
				thismenu.items.gameoptionsubmenu.items["changemarkersizeall"] = {"name": "Set Global Marker Size", "callback": function(itemKey, opt){
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
												current = tokenframes.head;
												for (var i = 0; i < tokenframes.length; i++) {
													current.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
													var tmpbackup = current.value.dielink;
													current.value.dielink = null;
													iosocket.emit('pushtoken', current.value);
													current.value.dielink = tmpbackup;
													current = current.next;
												}
												var currentdeck = decks.head;
												for (var i = 0; i < decks.length; i++) {
													current = currentdeck.value.head;
													for (var j = 0; j < currentdeck.value.length; j++) {
														current.value.deck = null;
														current.value.timestamp = currenttime - clienttimereference + servertimereference;
														iosocket.emit('pushcard', current.value);
														current.value.deck = currentdeck.value;
														
														current = current.next;
													}
													currentdeck = currentdeck.next;
												}
												var current = canvasframes.head;
												for (var i = 0; i < canvasframes.length; i++) {
													current.value.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
													current.value.getJSON();
													for (var j = 0; j < relevantdata_canvasframe.length; j++) {
														tempframe[relevantdata_canvasframe[j]] = current.value[relevantdata_canvasframe[j]];
													}
													current.value.changinghistory = true;
													iosocket.emit('pushcanvas', tempframe);
													current = current.next;
												}
											}
							   };
				thismenu.items["fdiscardall"] = {"name": "Force Discard All", "callback": function(itemKey, opt){
												iosocket.emit('reqforcediscard');
											}
							   };
				thismenu.items["sep4"] = "---------";
				thismenu.items["saveloadsubmenu"] = { "name": "Save/Load", "items": {} };
				thismenu.items.saveloadsubmenu.items["savegame"] = {"name": "Save Game", "callback": function(itemKey, opt){
												var currentdate = new Date();
												var timestamp = currentdate.getTime() - clienttimereference + servertimereference;
												var filename = "savestates/savestate"+timestamp+".xml";
												iosocket.emit('requestsavestate', filename);
											}
							   };
				thismenu.items.saveloadsubmenu.items["savegameas"] = {"name": "Save Game As", "callback": function(itemKey, opt){
												var filename = prompt("Enter filepath.", "savestates/");
												if (filename) {
													if (filename === "") {
														var currentdate = new Date();
														var timestamp = currentdate.getTime() - clienttimereference + servertimereference;
														filename = "savestates/savestate"+timestamp+".xml";
													}
													iosocket.emit('requestsavestate', filename);
												}
											}
							   };
				thismenu.items.saveloadsubmenu.items["loadgame"] = {"name": "Load Game", "callback": function(itemKey, opt){
												$("#fileinputdialog").trigger('click');
												
												document.getElementById("fileinputdialog").onchange = function(){
													
													asyncLoadLocalFile(this.files[0], function(contents){
															loadfromxml(contents);
															return;
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
			thismenu.items["sep6"] = "---------";
			thismenu.items["logout"] = {"name": "Return to Login", "callback": function(itemKey, opt){
										// discard all cards
										var currentdeck = decks.head;
										for (var i = 0; i < decks.length; i++) {
											var current = currentdeck.value.head;
											for (var i = 0; i < currentdeck.value.length; i++) {
												current.value.discard();
												current = current.next;
											}
											currentdeck = currentdeck.next;
										}
										document.getElementById("gamedivloginoverlay").style.zIndex = zcounter + 100;
										document.getElementById("logindialogdiv").style.zIndex = zcounter + 110;
										document.getElementById("gamedivloginoverlay").style.visibility = "";
										document.getElementById("logindialogdiv").style.visibility = "";
										var charoptions2 = document.getElementById("characterselect");
										charoptions2.selectedIndex = Math.min(charoptions2.options.length-1, Math.max(0, player));
										iosocket.emit('userlogout');
									}
						   };
			
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
	current = decks.head;
	for (var i = 0; i < decks.length; i++) {
		var currentcard = current.value.head;
		for (var j = 0; j < current.value.length; j++) {
			currentcard.value.setdisplayposition();
			currentcard = currentcard.next;
		}
		current = current.next;
	}
	current = canvasframes.head;
	for (var i = 0; i < canvasframes.length; i++) {
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
	current = decks.head;
	for (var i = 0; i < decks.length; i++) {
		var currentcard = current.value.head;
		for (var j = 0; j < current.value.length; j++) {
			currentcard.value.setdisplayscale();
			currentcard = currentcard.next;
		}
		current = current.next;
	}
	current = canvasframes.head;
	for (var i = 0; i < canvasframes.length; i++) {
		current.value.setdisplayscale();
		current = current.next;
	}
}

function setbackground() {
	var shift = - cameraposx*Math.cos((backgrounddirection-90.0)*Math.PI/180.0) - cameraposy*Math.sin((backgrounddirection-90.0)*Math.PI/180.0);
	gamediv.style.background = "repeating-linear-gradient("+backgrounddirection+"deg, #222 "+shift+"px, #222 "+(shift+backgroundwidth1*zoomvalue)+"px, #333 "+(shift+backgroundwidth1*zoomvalue)+"px, #333 "+(shift+backgroundwidth1*zoomvalue+backgroundwidth2*zoomvalue)+"px )";		
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
	var minzforcanvas = 0;
	var maxzforcanvas = 0;
	if (canvasframes.length > 0) {
		minzforcanvas = canvasframes.head.value.zIndex;
		maxzforcanvas = canvasframes.head.value.zIndex;
		current = canvasframes.head;
		for (var i = 0; i < canvasframes.length; i++) {
			minzforcanvas = Math.min(current.value.zIndex, minzforcanvas);
			maxzforcanvas = Math.max(current.value.zIndex, maxzforcanvas);
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
	zcounter = Math.max(Math.max(maxzforcanvas, maxzforimages), maxzfortokens) + 1;
	var zcounter2 = 0;
	if (tokenframes.length > 0 && player > 0) {
		current = tokenframes.head;
		for (var i = 0; i < tokenframes.length; i++) {
			if (current.value.owner.includes(player)) current.value.thisdiv.style.zIndex = zcounter + zcounter2++;
			current = current.next;
		}
		current = dieframes.head;
		for (var i = 0; i < dieframes.length; i++) {
			current.value.thisdiv.style.zIndex = zcounter + zcounter2++;
			current = current.next;
		}
	}
	
	logdivlist.parentNode.style.zIndex = zcounter + zcounter2++;
}

function adjustzIndices() {
	
	var fulllist = new LinkedList();
	
	// process imageframes
	var imageandcanvasframes = new LinkedList();
	var current = imageframes.head;
	for (var j = 0; j < imageframes.length; j++) {
		current.value.touchedthis = false;
		imageandcanvasframes.addToTail(current.value);
		current = current.next;
	}
	current = canvasframes.head;
	for (var j = 0; j < canvasframes.length; j++) {
		current.value.touchedthis = false;
		imageandcanvasframes.addToTail(current.value);
		current = current.next;
	}
	for (var i = 0; i < imageandcanvasframes.length; i++) {
		var currenttarget = null;
		current = imageandcanvasframes.head;
		for (var j = 0; j < imageandcanvasframes.length; j++) {
			if (currenttarget) { // this ifelse is needed for the case of identical zIndices
				if (!current.value.touchedthis) {
					if (current.value.zIndex < currenttarget.value.zIndex) {
						currenttarget = current;
					}	
				}
			} else if (!current.value.touchedthis) {
				currenttarget = current;
			}
			current = current.next;
		}
		currenttarget.value.touchedthis = true;
		fulllist.addToTail(currenttarget.value);
	}
	
	// process cards - select deck order by deckid (add to fulldecklist in correct order)
	var fulldecklist = new LinkedList();
	current = decks.head;
	for (var j = 0; j < decks.length; j++) {
		current.value.head.value.touchedthis = false;
		current = current.next;
	}
	for (var i = 0; i < decks.length; i++) {
		var currenttarget = null;
		current = decks.head;
		for (var j = 0; j < decks.length; j++) {
			if (currenttarget) {
				if (!current.value.head.value.touchedthis) {
					if (current.value.head.value.deckid < currenttarget.value.head.value.deckid) {
						currenttarget = current;
					}	
				}
			} else if (!current.value.head.value.touchedthis) {
				currenttarget = current;
			}
			current = current.next;
		}
		currenttarget.value.head.value.touchedthis = true;
		fulldecklist.addToTail(currenttarget.value);
	}
	var currentdeck = fulldecklist.head;
	for (var k = 0; k < fulldecklist.length; k++) {
		current = currentdeck.value.head;
		for (var j = 0; j < currentdeck.value.length; j++) {
			current.value.touchedthis = false;
			current = current.next;
		}
		for (var i = 0; i < currentdeck.value.length; i++) {
			var currenttarget = null;
			current = currentdeck.value.head;
			for (var j = 0; j < currentdeck.value.length; j++) {
				if (currenttarget) {
					if (!current.value.touchedthis) {
						if (current.value.zIndex < currenttarget.value.zIndex) {
							currenttarget = current;
						}	
					}
				} else if (!current.value.touchedthis) {
					currenttarget = current;
				}
				current = current.next;
			}
			currenttarget.value.touchedthis = true;
			fulllist.addToTail(currenttarget.value);
		}
		currentdeck = currentdeck.next;
	}
	
	// process tokenframes
	current = tokenframes.head;
	for (var j = 0; j < tokenframes.length; j++) {
		current.value.touchedthis = false;
		current = current.next;
	}
	for (var i = 0; i < tokenframes.length; i++) {
		var currenttarget = null;
		current = tokenframes.head;
		for (var j = 0; j < tokenframes.length; j++) {
			if (currenttarget) { // this ifelse is needed for the case of identical zIndices
				if (!current.value.touchedthis) {
					if (current.value.zIndex < currenttarget.value.zIndex) {
						currenttarget = current;
					}	
				}
			} else if (!current.value.touchedthis) {
				currenttarget = current;
			}
			current = current.next;
		}
		currenttarget.value.touchedthis = true;
		fulllist.addToTail(currenttarget.value);
	}
	
	
	// perform rearrangement
	current = fulllist.head;
	for (var j = 0; j < fulllist.length; j++) {
		current.value.zIndex = j + 1;
		current.value.thisdiv.style.zIndex = current.value.zIndex;
		current = current.next;
	}
	adjustzCounter();
}

function doboxescollide(l0, r0, b0, t0, l1, r1, b1, t1) {
	var q1 = ((l1 >= l0 && l1  < r0) || (r1 >= l0 && r1  < r0));
	var q2 = ((b1  < b0 && b1 >= t0) || (t1  < b0 && t1 >= t0));
	var q3 = ((l0 >= l1 && l0  < r1) || (r0 >= l1 && r0  < r1));
	var q4 = ((b0  < b1 && b0 >= t1) || (t0  < b1 && t0 >= t1));
	return (q1 && q2) || (q3 && q4) || (q1 && q4) || (q2 && q3);
}

function iscardinstack(somestack, somedeckid, somecardid) {
	var isit = false;
	var current = somestack.head;
	for (var i = 0; i < somestack.length; i++) {
		if (current.value.deckid === somedeckid && current.value.cardid === somecardid) {
			isit = true;
			break;
		}
		current = current.next;
	}
	return isit;
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

function loadfromxml(somexml) {
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(somexml,"text/xml");
	var someversion = xmlDoc.getElementsByTagName("version")[0].childNodes[0].nodeValue;
	console.log("version", someversion);
	var somegameoptions = [];
	if (xmlDoc.getElementsByTagName("gameoptions")[0].childNodes[0]) somegameoptions = xmlDoc.getElementsByTagName("gameoptions")[0].childNodes[0].nodeValue.split(',');
	for (var i = 0; i < somegameoptions.length; i++) {
		iosocket.emit('gameoptions_add', somegameoptions[i]);
	}
	console.log('added game settings:', somegameoptions);
	
	// do imageframes
	var someimageframes = xmlDoc.getElementsByTagName("imageframe");
	for (var i = 0; i < someimageframes.length; i++) {
		var tempframe = {};
		var tempframemarkers = new Array();
		var tempframelabels = new Array();
		for (var j = 0; j < someimageframes[i].childNodes.length; j++) {
			if (someimageframes[i].childNodes[j].nodeName == "#text") continue;
			if (someimageframes[i].childNodes[j].nodeName.toLowerCase() === "marker") {
				var markercontents = someimageframes[i].childNodes[j];
				var tempmarker = {};
				for (var k = 0; k < markercontents.childNodes.length; k++) {
					if (markercontents.childNodes[k].nodeName == "#text") continue;
					if (markercontents.childNodes[k].firstChild) {
						tempmarker[markercontents.childNodes[k].nodeName] = parsesomething(relevantdata_markerframe_types[markercontents.childNodes[k].nodeName], markercontents.childNodes[k].firstChild.nodeValue);
					} else {
						tempmarker[markercontents.childNodes[k].nodeName] = "";
					}
				}
				tempframemarkers.push(tempmarker);
			} else if (someimageframes[i].childNodes[j].nodeName.toLowerCase() === "label") {
				var labelcontents = someimageframes[i].childNodes[j];
				var templabel = {};
				for (var k = 0; k < labelcontents.childNodes.length; k++) {
					if (labelcontents.childNodes[k].nodeName == "#text") continue;
					if (labelcontents.childNodes[k].firstChild) {
						templabel[labelcontents.childNodes[k].nodeName] = parsesomething(relevantdata_framelabel_types[labelcontents.childNodes[k].nodeName], labelcontents.childNodes[k].firstChild.nodeValue);
					} else {
						templabel[labelcontents.childNodes[k].nodeName] = "";
					}
				}
				tempframelabels.push(templabel);
			} else {
				if (someimageframes[i].childNodes[j].firstChild) {
					tempframe[someimageframes[i].childNodes[j].nodeName] = parsesomething(relevantdata_imageframe_types[someimageframes[i].childNodes[j].nodeName], someimageframes[i].childNodes[j].firstChild.nodeValue);
				} else {
					tempframe[someimageframes[i].childNodes[j].nodeName] = "";
				}
			}
		}
		tempframe["id"] = idcounter++;
		var currentdate = new Date();
		tempframe["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		imageframes.addToTail(new FrameContainer(tempframe["id"], gamediv, 0, 0));
		imageframes.tail.value.loadproperties2(tempframe, tempframemarkers, tempframelabels);
	}
	var sometokenframes = xmlDoc.getElementsByTagName("tokenframe");
	for (var i = 0; i < sometokenframes.length; i++) {
		var temptoken = {};
		for (var j = 0; j < sometokenframes[i].childNodes.length; j++) {
			if (sometokenframes[i].childNodes[j].nodeName == "#text") continue;
			if (sometokenframes[i].childNodes[j].firstChild) {
				temptoken[sometokenframes[i].childNodes[j].nodeName] = parsesomething(relevantdata_tokenframe_types[sometokenframes[i].childNodes[j].nodeName], sometokenframes[i].childNodes[j].firstChild.nodeValue);
			} else {
				temptoken[sometokenframes[i].childNodes[j].nodeName] = "";
			}
		}
		temptoken["id"] = idcounter++;
		var currentdate = new Date();
		temptoken["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		tokenframes.addToTail(new TokenContainer(temptoken["id"], gamediv, 0, 0));
		tokenframes.tail.value.loadproperties2(temptoken);
	}
	var somecanvasframes = xmlDoc.getElementsByTagName("canvasframe");
	for (var i = 0; i < somecanvasframes.length; i++) {
		var tempcanvas = {};
		for (var j = 0; j < somecanvasframes[i].childNodes.length; j++) {
			if (somecanvasframes[i].childNodes[j].nodeName == "#text") continue;
			if (somecanvasframes[i].childNodes[j].firstChild) {
				tempcanvas[somecanvasframes[i].childNodes[j].nodeName] = parsesomething(relevantdata_canvasframe_types[somecanvasframes[i].childNodes[j].nodeName], somecanvasframes[i].childNodes[j].firstChild.nodeValue);
			} else {
				tempcanvas[somecanvasframes[i].childNodes[j].nodeName] = "";
			}
		}
		tempcanvas["id"] = idcounter++;
		var currentdate = new Date();
		tempcanvas["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		canvasframes.addToTail(new CanvasFrameContainer(tempcanvas["id"], gamediv, 0, 0, tempcanvas["width"], tempcanvas["height"]));
		canvasframes.tail.value.loadproperties2(tempcanvas);
		canvasframes.tail.value.resethistory();
	}
	var somecards = xmlDoc.getElementsByTagName("card");
	for (var i = 0; i < somecards.length; i++) {
		var tempcard = {};
		for (var j = 0; j < somecards[i].childNodes.length; j++) {
			if (somecards[i].childNodes[j].nodeName == "#text") continue;
			if (somecards[i].childNodes[j].firstChild) {
				tempcard[somecards[i].childNodes[j].nodeName] = parsesomething(relevantdata_card_types[somecards[i].childNodes[j].nodeName], somecards[i].childNodes[j].firstChild.nodeValue);
			} else {
				tempcard[somecards[i].childNodes[j].nodeName] = "";
			}
		}
		var currentdeck = decks.head;
		var correctdeck = null;
		for (var j = 0; j < decks.length; j++) {
			if (currentdeck.value.head.value.deckid === tempcard.deckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		// if deck already exists -> continue; else make new deck
		if (!correctdeck) {
			decks.addToTail(new LinkedList());
			correctdeck = decks.tail.value;
		}
		var newcard = new Card(tempcard.deckid, tempcard.cardid, correctdeck, gamediv, tempcard.x, tempcard.y, tempcard.width, tempcard.height, tempcard.filenamefront, tempcard.filenameback);
		var currentdate = new Date();
		tempcard["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		newcard.loadproperties2(tempcard);
		correctdeck.addToTail(newcard);
	}
}

function parsesomething(sometype, somevalue) {
	switch (sometype) {
	  case "boolean":
	  if (somevalue.toLowerCase() === "true") {
	     return true;
	  } else if (somevalue.toLowerCase() === "false") {
	     return false;
	  } else {
	     return undefined;
	  }
	  break;
	case "number":
	  return Number(somevalue);
	  break;
	case "string":
	  return somevalue;
	  break;
	case "numberarray":
	  var tmparray = somevalue.split(',');
	  for (var i = 0; i < tmparray.length; i++) {
		 tmparray[i] = Number(tmparray[i]); 
	  }
	  return tmparray;
	  break;
	}
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

