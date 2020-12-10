var iosocket;
var player = -1; // 0: GM; >0: player; <0: undefined
var playername = "myName";
var playernames = [""];
var loginoptionsset = false;

var gameoptions = [];

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "FrameLabel":5, "Card":6, "CanvasFrame":7, "LotteryFrame":8, "PublicDieFrame":9};

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
var editingnotes = false, changednotes = false, notesvisible = false;
var notesdiv, notesdiv_characterselect, notesdiv_textdisplaydiv, notesdiv_textinputdiv, notesdiv_textinput;
var currentnoteedit = -1;
var currentnotes = {};
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
var serveraddress = "0";


var lastnumberofcardsfromstack = 5;

var dragcamera = false;
var InitialMouseDownX = 0, InitialMouseDownY = 0;
var zoomvalue = 1.0, zoommax = 3.0, zoommin = 0.05;

var multiselect = false, multiselected = false;
var multiselectdiv;
var multiselectlist = new LinkedList();
var boxx, boxy, boxw, boxh;


var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "backgroundcolor0", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "labelidcounter", "visible"];
var relevantdata_imageframe_types = {"id":"number", "owner":"numberarray", "streamposition":"boolean", "fixposition":"boolean", "backgroundcolor0":"string", "timestamp":"number", "x":"number", "y":"number", "width":"number", "height":"number", "scale":"number", "filename":"string", "zIndex":"number", "markeridcounter":"number", "visible":"boolean"};
var relevantdata_canvasframe = ["id", "owner", "streamposition", "streamcontent", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "content", "zIndex"];
var relevantdata_canvasframe_types = {"id": "number", "owner":"numberarray", "streamposition":"boolean", "streamcontent":"boolean", "fixposition":"boolean", "timestamp": "number", "x": "number", "y": "number", "width": "number", "height": "number", "scale": "number", "content":"string", "zIndex": "number"};
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext", "markercolor"];
var relevantdata_markerframe_types = {"id": "number", "hasdescription": "boolean", "x": "number", "y": "number", "size": "number", "scale": "number", "zIndex": "number", "descfilename":"string", "descname":"string", "desctext":"string", "markercolor":"number"};
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_framelabel_types = {"id": "number", "x": "number", "y": "number", "scale": "number", "zIndex": "number", "currenttext":"string", "textcolor":"string", "angle": "number", "ctradius": "number", "ctdir": "number"};
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var relevantdata_tokenframe_types = {"id": "number", "owner":"numberarray", "streamposition": "boolean", "hasdescription": "boolean", "timestamp": "number", "x": "number", "y": "number", "size": "number", "offsetx": "number", "offsety": "number", "scale": "number", "bordercolor":"string", "filename":"string", "zIndex": "number", "descname":"string", "descfilename":"string", "desctext":"string", "visible": "boolean"};
var relevantdata_card = ["deckid", "cardid", "owner", "viewingrights", "streamposition", "cardbordercolor", "timestamp", "x", "y", "angle", "faceup", "width", "height", "scale", "bordercolor", "filenamefront", "filenameback", "zIndex"];
var relevantdata_card_types = {"deckid": "number", "cardid": "number", "owner":"numberarray", "viewingrights":"numberarray", "streamposition": "boolean", "cardbordercolor":"string", "timestamp": "number", "x": "number", "y": "number", "angle": "number", "faceup": "boolean", "width": "number", "height": "number", "scale": "number", "bordercolor":"string", "filenamefront":"string", "filenameback":"string", "zIndex": "number"};
var relevantdata_lotteryframe = ["id", "owner", "viewingrights", "timestamp", "x", "y", "currentindex", "options", "streamposition", "fixposition", "selectatrandom", "playsound", "publicresult", "isturnindicator", "scale", "zIndex"];
var relevantdata_lotteryframe_types = {"id":"number", "owner":"numberarray", "viewingrights":"numberarray", "timestamp":"number", "x":"number", "y":"number", "currentindex":"number", "options":"stringarray", "streamposition":"boolean", "fixposition":"boolean", "selectatrandom":"boolean", "playsound":"boolean", "publicresult":"boolean", "isturnindicator":"boolean", "scale":"number", "zIndex":"number"};
var relevantdata_publicdieframe = ["id", "owner", "timestamp", "x", "y", "value", "maxvalue", "filenamebase", "filenametype", "fixposition", "setable","animated", "size", "scale", "zIndex"];
var relevantdata_publicdieframe_types = {"id":"number", "owner":"numberarray", "timestamp":"number", "x":"number", "y":"number", "value":"number", "maxvalue":"number", "filenamebase":"string", "filenametype":"string", "fixposition":"boolean", "setable":"boolean","animated":"boolean", "size":"number", "scale":"number", "zIndex":"number"};
var imageframes = {};
var tokenframes = {};
var dieframes = {};
var publicdieframes = {};
var decks = {};
var canvasframes = {};
var lotteryframes = {};

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

var markericonimg = [];

var gamecontextmenuup = false;

var userLang;
var ttsvoice = null;
var ttslang = "de-DE";
var lastmsg = "Some Message";
var voices;

var showeventlog = false;
var animatedie = true;

$(function(){
	
	document.title = "Yet Another Tabletop Experience";
	
	// select browser language tts voice if possible
	if ('speechSynthesis' in window) {
		userLang = navigator.language || navigator.userLanguage; 
		console.log('looking for tts language', userLang);
		ttslang = userLang;
		window.speechSynthesis.onvoiceschanged = function(e) {
			voices = speechSynthesis.getVoices();
			for (var i = 0; i < voices.length; i++) {
				if (voices[i].lang === ttslang) {
					console.log('selected tts :', voices[i].name);
					ttsvoice = voices[i];
					break;
				}
			}
			if (!ttsvoice) {
				if (voices[0]) {
					console.log('falling back to tts :', voices[0].name);
					ttsvoice = voices[0];
				} else {
					console.log('No tts voices found.');
				}
			} else {
				window.speechSynthesis.onvoiceschanged = null;
			}
		};
		speechSynthesis.getVoices(); // trigger onvoiceschanged after voices loaded
	} else {
		console.log('No tts support.');
	}
	
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
	placeholderimg.src = "img/_server_/placeholder.png";
	// preload placeholder icon
	var placeholdericonimg = new Image();
	placeholdericonimg.src = "img/_server_/icon_placeholder.png";
	// preload marker icon
	for (var i = 0; i < markerfilenamebases.length; i++) {
		markericonimg[i] = new Image();
		markericonimg[i].src = markerfilenamebases[i];
	}
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
	var d20preloadimages2 = new Array();
	d20preloadimages2[0] = new Image();
	d20preloadimages2[0].src = "img/_server_/dice/d20blue_highlight.png";
	for (var i = 1; i < 21; i++) {
		d20preloadimages2[i] = new Image();
		d20preloadimages2[i].src = "img/_server_/dice/d20blue_"+i+".png";
	}
	d20preloadimages2[21] = new Image();
	d20preloadimages2[21].src = "img/_server_/dice/d20blue_qm.png";
	var d20preloadimages3 = new Array();
	d20preloadimages3[0] = new Image();
	d20preloadimages3[0].src = "img/_server_/dice/d20green_highlight.png";
	for (var i = 1; i < 21; i++) {
		d20preloadimages3[i] = new Image();
		d20preloadimages3[i].src = "img/_server_/dice/d20green_"+i+".png";
	}
	d20preloadimages3[21] = new Image();
	d20preloadimages3[21].src = "img/_server_/dice/d20green_qm.png";
	var d20preloadimages4 = new Array();
	d20preloadimages4[0] = new Image();
	d20preloadimages4[0].src = "img/_server_/dice/d20red_highlight.png";
	for (var i = 1; i < 21; i++) {
		d20preloadimages4[i] = new Image();
		d20preloadimages4[i].src = "img/_server_/dice/d20red_"+i+".png";
	}
	d20preloadimages4[21] = new Image();
	d20preloadimages4[21].src = "img/_server_/dice/d20red_qm.png";
	var d20preloadimages5 = new Array();
	d20preloadimages5[0] = new Image();
	d20preloadimages5[0].src = "img/_server_/dice/d20white_highlight.png";
	for (var i = 1; i < 21; i++) {
		d20preloadimages5[i] = new Image();
		d20preloadimages5[i].src = "img/_server_/dice/d20white_"+i+".png";
	}
	d20preloadimages5[21] = new Image();
	d20preloadimages5[21].src = "img/_server_/dice/d20white_qm.png";
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
	var d6preloadimages2 = new Array();
	d6preloadimages2[0] = new Image();
	d6preloadimages2[0].src = "img/_server_/dice/d6blue_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages2[i] = new Image();
		d6preloadimages2[i].src = "img/_server_/dice/d6blue_"+i+".png";
	}
	d6preloadimages2[7] = new Image();
	d6preloadimages2[7].src = "img/_server_/dice/d6blue_qm.png";
	var d6preloadimages3 = new Array();
	d6preloadimages3[0] = new Image();
	d6preloadimages3[0].src = "img/_server_/dice/d6green_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages3[i] = new Image();
		d6preloadimages3[i].src = "img/_server_/dice/d6green_"+i+".png";
	}
	d6preloadimages3[7] = new Image();
	d6preloadimages3[7].src = "img/_server_/dice/d6green_qm.png";
	var d6preloadimages4 = new Array();
	d6preloadimages4[0] = new Image();
	d6preloadimages4[0].src = "img/_server_/dice/d6red_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages4[i] = new Image();
		d6preloadimages4[i].src = "img/_server_/dice/d6red_"+i+".png";
	}
	d6preloadimages4[7] = new Image();
	d6preloadimages4[7].src = "img/_server_/dice/d6red_qm.png";
	var d6preloadimages5 = new Array();
	d6preloadimages5[0] = new Image();
	d6preloadimages5[0].src = "img/_server_/dice/d6white_highlight.png";
	for (var i = 1; i < 7; i++) {
		d6preloadimages5[i] = new Image();
		d6preloadimages5[i].src = "img/_server_/dice/d6white_"+i+".png";
	}
	d6preloadimages5[7] = new Image();
	d6preloadimages5[7].src = "img/_server_/dice/d6white_qm.png";
	
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
	
	notesdiv = document.getElementById("notesdiv");
	if (!notesvisible) notesdiv.style.visibility = "hidden";
	notesdiv_characterselect = document.getElementById("notesdiv_characterselect");
	notesdiv_characterselect.style.visibility = "hidden";
	notesdiv.addEventListener('mouseenter', e => {
		if (!editingnotes) notesdiv_characterselect.style.visibility = "";
	});
	notesdiv.addEventListener('mouseleave', e => {
		if (!editingnotes) notesdiv_characterselect.style.visibility = "hidden";
	});
	notesdiv_characterselect.addEventListener('input', e => {
		currentnoteedit = parseInt(e.target.value);
		if (!currentnotes[currentnoteedit]) currentnotes[currentnoteedit] = "";
		if (editingnotes) {
			notesdiv_textinput.value = currentnotes[currentnoteedit].replace(/<br>/g, '\n');
			changednotes = false;
			document.getElementById("notesdiv_bapply").innerHTML = "Applied";
			document.getElementById("notesdiv_bapply").style.backgroundColor = "#cccccc";
			document.getElementById("notesdiv_bapply").disabled = true;
			notesdiv_textinput.focus();
		} else {
			notesdiv_textdisplaydiv.innerHTML = currentnotes[currentnoteedit];
		}
	});
	
	notesdiv_textdisplaydiv = document.getElementById("notesdiv_textdisplaydiv");
	notesdiv_textinputdiv = document.getElementById("notesdiv_textinputdiv");
	notesdiv_textinput = document.getElementById("notesdiv_textinput");
	notesdiv_textdisplaydiv.addEventListener('dblclick', e => {
		editingnotes = true;
		notesdiv_characterselect.style.visibility = "";
		
		notesdiv_textdisplaydiv.style.visibility = "hidden";
		notesdiv_textinputdiv.style.visibility = "";
		
		if (!currentnotes[currentnoteedit]) 
			currentnotes[currentnoteedit] = "";
		
		notesdiv_textinput.value = currentnotes[currentnoteedit].replace(/<br>/g, '\n');
		changednotes = false;
		document.getElementById("notesdiv_bapply").innerHTML = "Applied";
		document.getElementById("notesdiv_bapply").style.backgroundColor = "#cccccc";
		document.getElementById("notesdiv_bapply").disabled = true;
		notesdiv_textinput.focus();
	});
	notesdiv_textinput.addEventListener('input', e => {
		changednotes = true;
		document.getElementById("notesdiv_bapply").innerHTML = "Apply";
		document.getElementById("notesdiv_bapply").style.backgroundColor = "#38e038";
		document.getElementById("notesdiv_bapply").disabled = false;
	});
	notesdiv_textinput.addEventListener('change', e => {
		changednotes = true;
		document.getElementById("notesdiv_bapply").innerHTML = "Apply";
		document.getElementById("notesdiv_bapply").style.backgroundColor = "#38e038";
		document.getElementById("notesdiv_bapply").disabled = false;
	});
	document.getElementById("notesdiv_bapply").addEventListener('click', e => {
		currentnotes[currentnoteedit] = notesdiv_textinput.value.replace(/\r?\n/g, '<br>');
		iosocket.emit('submitplayernotes', currentnoteedit, currentnotes[currentnoteedit]);
		notesdiv_textinput.focus();
	});
	document.getElementById("notesdiv_bclose").addEventListener('click', e => {
		var r = true;
		if (changednotes)
			r = confirm("Discard all changes?");
		if (r) {
			editingnotes = false;
			notesdiv_textdisplaydiv.style.visibility = "";
			notesdiv_textinputdiv.style.visibility = "hidden";
			notesdiv_textdisplaydiv.innerHTML = currentnotes[currentnoteedit];
		}
	});
	// drop-down select for GM;
	
	
	iosocket = io.connect('/welcome');
	iosocket.on('servertime', ( sometime ) => {
		servertimereference = sometime;
		var currentdate = new Date();
		clienttimereference = currentdate.getTime();
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
		
		currentnoteedit = player;
		// add player options for notes
		var tmplength = notesdiv_characterselect.options.length;
		for (i = tmplength-1; i >= 0; i--) {
			notesdiv_characterselect[i] = null;
		}
		if (player === 0) {
			for (var i = 0; i < playernames.length; i++) {
				var opt = document.createElement('option');
				opt.appendChild( document.createTextNode(playernames[i]) );
				opt.value = i;

				notesdiv_characterselect.appendChild(opt);
			}
		} else {
			var opt = document.createElement('option');
			opt.appendChild( document.createTextNode(playernames[player]) );
			opt.value = player;

			notesdiv_characterselect.appendChild(opt);
		}
			
		for (var imageframe in imageframes) {
			if (imageframes[imageframe].visible) {
				imageframes[imageframe].thisdiv.style.opacity = 1.0;
				imageframes[imageframe].thisdiv.style.zIndex = imageframes[imageframe].zIndex;
			} else {
				if (player === 0) {
					imageframes[imageframe].thisdiv.style.zIndex = imageframes[imageframe].zIndex;
					imageframes[imageframe].thisdiv.style.opacity = 0.5;
				} else {
					imageframes[imageframe].thisdiv.style.zIndex = 1;
					imageframes[imageframe].thisdiv.style.opacity = 0.0;
				}
			}
		}
		
		for (var tokenframe in tokenframes) {
			if (tokenframes[tokenframe].visible) {
				tokenframes[tokenframe].thisdiv.style.opacity = 1.0;
				tokenframes[tokenframe].thisdiv.style.zIndex = tokenframes[tokenframe].zIndex;
			} else {
				if (player === 0) {
					tokenframes[tokenframe].thisdiv.style.zIndex = tokenframes[tokenframe].zIndex;
					tokenframes[tokenframe].thisdiv.style.opacity = 0.5;
				} else {
					tokenframes[tokenframe].thisdiv.style.zIndex = 1;
					tokenframes[tokenframe].thisdiv.style.opacity = 0.0;
				}
			}
		}
		
		for (var lotteryframe in lotteryframes) {
			if (lotteryframes[lotteryframe].viewingrights.includes(player)) {
				lotteryframes[lotteryframe].thisdiv.style.opacity = 1.0;
			} else {
				if (player === 0) {
					lotteryframes[lotteryframe].thisdiv.style.opacity = 1.0;
				}
			}
		}
		adjustzCounter();
	});
	iosocket.on('serverip', ( serveraddress0 ) => {		
		serveraddress = serveraddress0;
	});
	iosocket.on('updateplayernotes', ( someplayer, somenotes ) => {		
		if (someplayer === player && player !== 0) {
			currentnotes[someplayer] = somenotes;
			if (editingnotes) {
				notesdiv_textinput.value = currentnotes[someplayer].replace(/<br>/g, '\n');
				changednotes = false;
				document.getElementById("notesdiv_bapply").innerHTML = "Applied";
				document.getElementById("notesdiv_bapply").style.backgroundColor = "#cccccc";
				document.getElementById("notesdiv_bapply").disabled = true;
				notesdiv_textinput.focus();
			} else {
				notesdiv_textdisplaydiv.innerHTML = currentnotes[someplayer];
			}
		} else if (player === 0) {
			currentnotes[someplayer] = somenotes;
			if (currentnoteedit === someplayer) {
				if (editingnotes) {
					notesdiv_textinput.value = currentnotes[someplayer].replace(/<br>/g, '\n');
					changednotes = false;
					document.getElementById("notesdiv_bapply").innerHTML = "Applied";
					document.getElementById("notesdiv_bapply").style.backgroundColor = "#cccccc";
					document.getElementById("notesdiv_bapply").disabled = true;
					notesdiv_textinput.focus();
				} else {
					notesdiv_textdisplaydiv.innerHTML = currentnotes[someplayer];
				}
			}
		}
	});
	iosocket.on('camera_apply', (somex, somey, somezoomvalue) => {
		cameraposx = somex - 0.5 * window.innerWidth;
		cameraposy = somey - 0.5 * window.innerHeight;
		zoomvalue = somezoomvalue;
		rescalegamedivelements();
		repositiongamedivelements();
	});
	iosocket.on('gameoptions_update', (gameoptions0) => {
		gameoptions = gameoptions0;
		if (!gameoptions.includes("notes") && player !== 0) {
			notesvisible = false;
			notesdiv.style.visibility = "hidden";
		}
		if (gameoptions.includes("hugo")) {
			d6preloadimages[8] = new Image();
			d6preloadimages[8].src = "img/_server_/dice/d6_hugo.png";
			d6preloadimages2[8] = new Image();
			d6preloadimages2[8].src = "img/_server_/dice/d6blue_hugo.png";
			d6preloadimages3[8] = new Image();
			d6preloadimages3[8].src = "img/_server_/dice/d6green_hugo.png";
			d6preloadimages4[8] = new Image();
			d6preloadimages4[8].src = "img/_server_/dice/d6red_hugo.png";
			d6preloadimages5[8] = new Image();
			d6preloadimages5[8].src = "img/_server_/dice/d6white_hugo.png";
		}
		for (var i = 0; i < cardturnangleinc.length; i++) {
			cardturnangleinc[i] = 90;
		}
		for (var i = 0; i < gameoptions.length; i++) {
			if (gameoptions[i].includes("cardturnangleinc")) { // expected format d<deckid>cardturnangleinc<intValue>
				var optioninfo = gameoptions[i].split("cardturnangleinc");
				var somedeckid = parseInt(optioninfo[0].substr(1));
				if (!isNaN(somedeckid)) {
					var newcardturnangleinc = parseInt(optioninfo[1]);
					if (!isNaN(newcardturnangleinc)) {
						cardturnangleinc[somedeckid] = newcardturnangleinc;
					}
				}
			}
		}
	});
	iosocket.on('seteeventlog', ( someeventlogsetting ) => {
		showeventlog = someeventlogsetting;
		if (showeventlog || player === 0) {
			logdivlist.parentNode.style.visibility = "";
		} else {
			logdivlist.parentNode.style.visibility = "hidden";
		}
	});
	iosocket.on('queueTTS', ( somemessage ) => {
		if (ttsvoice && somemessage != "") {
		//	console.log('play tts', somemessage);
			var msg = new SpeechSynthesisUtterance();
			msg.text = somemessage;
			msg.volume = basevolume;
			msg.voice = ttsvoice;
			window.speechSynthesis.speak(msg);
		}
	});
	iosocket.on('providesavefile', ( somefilename, savefilecontent ) => {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(savefilecontent));
		element.setAttribute('download', somefilename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	});
	
	iosocket.on('printevent', ( somemessage ) => {
		if (showeventlog || player === 0) {
			addsomethingtolog(somemessage);
		}
	});
	iosocket.on('setdievalue', ( someid, somevalue ) => {
		if (dieframes[someid]) {
			dieframes[someid].justrolled = false;
			dieframes[someid].value = somevalue;
			dieframes[someid].applyimage();
			var verbatimresult = dieframes[someid].value;
			if (gameoptions.includes('hugo')) {
				if (dieframes[someid].maxvalue === 6 && somevalue === 6) 
					verbatimresult = "hugo";
			}
			if (dieframes[someid].tokenlink) {
				addsomethingtolog("You (" + dieframes[someid].tokenlink.descname + ") rolled a " + verbatimresult + ".");
			} else {
				addsomethingtolog("You rolled a " + verbatimresult + ".");
			}
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
	iosocket.on('updatepublicdieframe', ( someframe ) => {
		if (!publicdieframes[someframe.id]) publicdieframes[someframe.id] = new PublicDie(someframe.id, gamediv, someframe.x, someframe.y, someframe.size, someframe.maxvalue, someframe.filenamebase, someframe.filenametype);
		publicdieframes[someframe.id].loadproperties2(someframe);
		publicdieframes[someframe.id].justrolled = false; // if rolled before first push
		adjustzCounter();
	});
	iosocket.on('updatepublicdieframeposition', ( someid, newx, newy, newtimestamp ) => {
		if (publicdieframes[someid]) {
			if (publicdieframes[someid].timestamp < newtimestamp) {
				publicdieframes[someid].timestamp = newtimestamp;
				publicdieframes[someid].x = newx;
				publicdieframes[someid].y = newy;
				publicdieframes[someid].setdisplayposition();
			}
		}
	});
	iosocket.on('deletepublicdieframe', ( someid ) => {
		if (publicdieframes[someid]) {
			publicdieframes[someid].thisdiv.parentNode.removeChild(publicdieframes[someid].thisdiv);
			delete publicdieframes[someid];
		}
	});
	iosocket.on('letpublicdieanimate', ( someid ) => {
		publicdieframes[someid].justrolled = true;
		if (publicdieframes[someid]) {
			var timer = setInterval(function () {
				if (!publicdieframes[someid].justrolled) {
					clearInterval(timer);
					return;
				}
				
				var randomresult = publicdieframes[someid].value;
				while (randomresult === publicdieframes[someid].value) {
					randomresult = Math.floor(1 + publicdieframes[someid].maxvalue * random());
				}
				publicdieframes[someid].value = randomresult;
				
				publicdieframes[someid].applyimage();
			}, 50 + 50*random());
		}
	});
	iosocket.on('setpublicdievalue', ( someid, somevalue ) => {
		if (publicdieframes[someid]) {
			publicdieframes[someid].justrolled = false;
			publicdieframes[someid].value = somevalue;
			publicdieframes[someid].applyimage();
			var verbatimresult = publicdieframes[someid].value;
			if (gameoptions.includes('hugo')) {
				if (publicdieframes[someid].maxvalue === 6 && somevalue === 6) 
					verbatimresult = "hugo";
			}
		}
	});
	iosocket.on('updateimageframe', ( someframe ) => {
		if (!imageframes[someframe.id]) imageframes[someframe.id] = new FrameContainer(someframe.id, gamediv, 0, 0);
		imageframes[someframe.id].loadproperties2(someframe, someframe["marker"], someframe["label"]);
		adjustzCounter();
	});
	iosocket.on('updateimageframeposition', ( someid, newx, newy, newtimestamp ) => {
		if (imageframes[someid]) {
			if (imageframes[someid].timestamp < newtimestamp) {
				imageframes[someid].timestamp = newtimestamp;
				imageframes[someid].x = newx;
				imageframes[someid].y = newy;
				imageframes[someid].setdisplayposition();
			}
		}
	});
	iosocket.on('deleteimage', ( someid ) => {
		if (imageframes[someid]) {
			imageframes[someid].thisdiv.parentNode.removeChild(imageframes[someid].thisdiv);
			delete imageframes[someid];
		}
	});
	iosocket.on('deletemarker', ( someframeid, somemarkerid ) => {
		if (imageframes[someframeid]) {
			if (imageframes[someframeid]["marker"][imageframes[somemarkerid]]) {
				imageframes[someframeid]["marker"][imageframes[somemarkerid]].thisdiv.parentNode.removeChild(imageframes[someframeid]["marker"][imageframes[somemarkerid]].thisdiv);
			}
		}
	});
	iosocket.on('deletelabel', ( someframeid, somelabelid ) => {
		if (imageframes[someframeid]) {
			if (imageframes[someframeid]["label"][imageframes[somelabelid]]) {
				imageframes[someframeid]["label"][imageframes[somelabelid]].thisdiv.parentNode.removeChild(imageframes[someframeid]["label"][imageframes[somelabelid]].thisdiv);
			}
		}
	});
	iosocket.on('updatecanvasframe', ( someframe ) => {
		if (!canvasframes[someframe.id]) canvasframes[someframe.id] = new CanvasFrameContainer(someframe.id, gamediv, someframe.x, someframe.y, someframe.width, someframe.height);
		canvasframes[someframe.id].loadproperties2(someframe);
		adjustzCounter();
	});
	iosocket.on('updatecanvasframeposition', ( someid, newx, newy, newtimestamp ) => {
		if (canvasframes[someid]) {
			if (canvasframes[someid].timestamp < newtimestamp) {
				canvasframes[someid].timestamp = newtimestamp;
				canvasframes[someid].x = newx;
				canvasframes[someid].y = newy;
				canvasframes[someid].setdisplayposition();
			}
		}
	});
	iosocket.on('updatecanvascontent', ( someid, someJSON, newtimestamp ) => {
		if (canvasframes[someid]) {
			if (canvasframes[someid].timestamp < newtimestamp) {
				canvasframes[someid].timestamp = newtimestamp;
				canvasframes[someid].changinghistory = true;
				canvasframes[someid].initfromJSON(someJSON);
			}
		}
	});
	iosocket.on('deletecanvas', ( someid ) => {
		if (canvasframes[someid]) {
			canvasframes[someid].thisdiv.parentNode.removeChild(canvasframes[someid].thisdiv);
			delete canvasframes[someid];
		}
	});
	iosocket.on('updatetokenframe', ( someframe ) => {
		if (!tokenframes[someframe.id]) tokenframes[someframe.id] = new TokenContainer(someframe.id, gamediv, 0, 0);
		tokenframes[someframe.id].loadproperties2(someframe);
		adjustzCounter();
	});
	iosocket.on('updatetokenframeposition', ( someid, newx, newy, newtimestamp ) => {
		if (tokenframes[someid]) {
			if (tokenframes[someid].timestamp < newtimestamp) {
				tokenframes[someid].timestamp = newtimestamp;
				tokenframes[someid].x = newx;
				tokenframes[someid].y = newy;
				tokenframes[someid].setdisplayposition();
				if (tokenframes[someid].descriptionopen) {
					tokenframes[someid].descdiv.style.left = (tokenframes[someid].displayx + tokenframes[someid].descriptionpositionoffset*tokenframes[someid].size) + "px";
					tokenframes[someid].descdiv.style.top = (tokenframes[someid].displayy + tokenframes[someid].descriptionpositionoffset*tokenframes[someid].size) + "px";
				}
			}
		}
	});
	iosocket.on('deletetoken', ( someid ) => {
		if (tokenframes[someid]) {
			if (tokenframes[someid].dielink) tokenframes[someid].dielink.tokenlink = null;
			tokenframes[someid].thisdiv.parentNode.removeChild(tokenframes[someid].thisdiv);
			delete tokenframes[someid]
		}
	});
	iosocket.on('updatecard', ( somecard ) => {
		if (!decks[somecard.deckid]) decks[somecard.deckid] = {};
		if (!decks[somecard.deckid][somecard.cardid]) decks[somecard.deckid][somecard.cardid] = new Card(somecard.deckid, somecard.cardid, decks[somecard.deckid], gamediv, somecard.x, somecard.y, somecard.width, somecard.height, somecard.filenamefront, somecard.filenameback);
		decks[somecard.deckid][somecard.cardid].loadproperties2(somecard);
		if (decks[somecard.deckid][somecard.cardid].onhand && !decks[somecard.deckid][somecard.cardid].faceup && decks[somecard.deckid][somecard.cardid].viewingrights.includes(player)) {
			decks[somecard.deckid][somecard.cardid].thishandicon.style.display = "";
			decks[somecard.deckid][somecard.cardid].onhand = true;
			decks[somecard.deckid][somecard.cardid].thisimgfront.style.display = "block";
			decks[somecard.deckid][somecard.cardid].thisimgback.style.display = "none";
			decks[somecard.deckid][somecard.cardid].thisdiv.style.background = decks[somecard.deckid][somecard.cardid].backgroundfront;
		} else {
			decks[somecard.deckid][somecard.cardid].thishandicon.style.display = "none";
			decks[somecard.deckid][somecard.cardid].onhand = false;
		}
		adjustzCounter();
	});
	iosocket.on('forcediscard', ( ) => {
		for (var deck in decks) {
			for (var card in decks[deck]) {
				decks[deck][card].discard();
			}
		}
	});
	iosocket.on('changedeckid', ( oldid, newid ) => {
		if (!decks[newid]) {
			if (decks[oldid]) {
				Object.defineProperty(decks, newid, Object.getOwnPropertyDescriptor(decks, oldid));
				delete decks[oldid];
			}
			for (var card in decks[newid]) {
				decks[newid][card].deckid = newid;
			}
		}
	});
	iosocket.on('updatecardposition', ( somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp ) => {
		if (decks[somedeckid]) {
			if (decks[somedeckid][somecardid]) {
				if (decks[somedeckid][somecardid].timestamp < newtimestamp) {
					decks[somedeckid][somecardid].timestamp = newtimestamp;
					decks[somedeckid][somecardid].x = newx;
					decks[somedeckid][somecardid].y = newy;
					decks[somedeckid][somecardid].setdisplayposition();
					decks[somedeckid][somecardid].angle = newangle;
					decks[somedeckid][somecardid].thisdiv.style.transform = "rotate("+decks[somedeckid][somecardid].angle+"deg)";
					if (newfaceup !== decks[somedeckid][somecardid].faceup) {
						if (newfaceup) {
							decks[somedeckid][somecardid].thisimgfront.style.display = "block";
							decks[somedeckid][somecardid].thisimgback.style.display = "none";
							decks[somedeckid][somecardid].thisdiv.style.background = decks[somedeckid][somecardid].backgroundfront;
						} else {
							decks[somedeckid][somecardid].thisimgfront.style.display = "none";
							decks[somedeckid][somecardid].thisimgback.style.display = "block";
							decks[somedeckid][somecardid].thisdiv.style.background = decks[somedeckid][somecardid].backgroundback;
						}
						decks[somedeckid][somecardid].faceup = newfaceup;
					}
					if (decks[somedeckid][somecardid].onhand && !decks[somedeckid][somecardid].faceup && decks[somedeckid][somecardid].viewingrights.includes(player)) {
						decks[somedeckid][somecardid].thishandicon.style.display = "";
						decks[somedeckid][somecardid].thisimgfront.style.display = "block";
						decks[somedeckid][somecardid].thisimgback.style.display = "none";
						decks[somedeckid][somecardid].thisdiv.style.background = decks[somedeckid][somecardid].backgroundfront;
					} else {
						decks[somedeckid][somecardid].thishandicon.style.display = "none";
						decks[somedeckid][somecardid].onhand = false;
					}
				}
			}
		}
	});
	iosocket.on('changecardzIndex', ( somedeckid, somecardid, newzIndex, newtimestamp ) => {
		if (decks[somedeckid]) {
			if (decks[somedeckid][somecardid]) {
				decks[somedeckid][somecardid].timestamp = newtimestamp;
				decks[somedeckid][somecardid].zIndex = newzIndex;
				decks[somedeckid][somecardid].thisdiv.style.zIndex = newzIndex;
			}
		}
	});
	iosocket.on('deletecard', function (somedeckid, somecardid) {
		if (decks[somedeckid]) {
			if (decks[somedeckid][somecardid]) {
				decks[somedeckid][somecardid].thisdiv.parentNode.removeChild(decks[somedeckid][somecardid].thisdiv);
				delete decks[somedeckid][somecardid];
				
				if (Object.keys(decks[somedeckid]).length === 0) {
					delete decks[somedeckid];
				}
			}
		}
	});
	iosocket.on('deletedeck', function (somedeckid) {
		for (var card in decks[somedeckid]) {
			decks[somedeckid][card].thisdiv.parentNode.removeChild(decks[somedeckid][card].thisdiv);
			delete decks[somedeckid][card];
		}
		delete decks[somedeckid];
	});
	iosocket.on('updatelotteryframe', ( someframe ) => {
		if (!lotteryframes[someframe.id]) lotteryframes[someframe.id] = new LotteryFrame(someframe.id, gamediv, someframe.x, someframe.y, someframe.options);
		lotteryframes[someframe.id].loadproperties2(someframe);
		adjustzCounter();
	});
	iosocket.on('setlotteryindex', ( someid, newtimestamp, newindex ) => {
		if (lotteryframes[someid]) {
			if (lotteryframes[someid].timestamp < newtimestamp) {
				lotteryframes[someid].timestamp = newtimestamp;
				lotteryframes[someid].pick(newindex);
			}
		}
	});
	iosocket.on('updatelotteryframeposition', ( someid, newx, newy, newindex, newtimestamp ) => {
		if (lotteryframes[someid]) {
			if (lotteryframes[someid].timestamp < newtimestamp) {
				lotteryframes[someid].timestamp = newtimestamp;
				lotteryframes[someid].x = newx;
				lotteryframes[someid].y = newy;
				lotteryframes[someid].setdisplayposition();
				lotteryframes[someid].pick(newindex);
			}
		}
	});
	iosocket.on('deletelottery', ( someid ) => {
		if (lotteryframes[someid]) {
			lotteryframes[someid].thisdiv.parentNode.removeChild(lotteryframes[someid].thisdiv);
			delete lotteryframes[someid];
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
			for (var canvasframe in canvasframes) {
				if (canvasframes[canvasframe].drawingmode === "e") {
					if (canvasframes[canvasframe].fabriccanvas.getActiveObject()) canvasframes[canvasframe].fabriccanvas.getActiveObject().remove();
					if (canvasframes[canvasframe].fabriccanvas.getActiveGroup()) {
						for (var j = 0; j < canvasframes[canvasframe].fabriccanvas.getActiveGroup()._objects.length; j++) {
							canvasframes[canvasframe].fabriccanvas.getActiveGroup()._objects[j].remove();
						}
					}
					canvasframes[canvasframe].fabriccanvas.discardActiveObject().discardActiveGroup().renderAll();
					break;
				}
			}
		}
	});
	$(document).keydown(function(e){
		if (e.which === 9 || e.keyCode === 9) {
			var currentcanvas = null;
			for (var canvasframe in canvasframes) {
				if (canvasframes[canvasframe].drawingmode !== "") {
					currentcanvas = canvasframes[canvasframe];
					break;
				}
			}
			if (currentcanvas) {
				e.preventDefault();
				if (currentcanvas.drawingmode === "d") {
					currentcanvas.drawingmode = "e";
					currentcanvas.controlstogglebutton.innerHTML = "Draw";
					currentcanvas.fabriccanvas.isDrawingMode = false;
					currentcanvas.fabriccanvas.selection = true;
					var everything = currentcanvas.fabriccanvas.getObjects();
					for (var i = 0; i < everything.length; i++) {
						if (everything[i].type == "rect") {
							everything[i].selectable = false;
						} else {
							everything[i].selectable = true;
						}
					}
				} else {
					currentcanvas.drawingmode = "d";
					currentcanvas.controlstogglebutton.innerHTML = "Edit";
					currentcanvas.fabriccanvas.isDrawingMode = true;
					currentcanvas.fabriccanvas.selection = false;
					var everything = currentcanvas.fabriccanvas.getObjects();
					for (var i = 0; i < everything.length; i++) {
						everything[i].selectable = false;
					}
					currentcanvas.fabriccanvas.deactivateAll().renderAll();
				}
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
						current.value.thisdiv.style.borderColor = current.value.cardbordercolor;
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
					if (!e.ctrlKey && multiselected && topframe.what !== ContainerTypes.Card){
						multiselected = false;
						var current = multiselectlist.head;
						for (var i = 0; i < multiselectlist.length; i++) {
							current.value.thisdiv.style.borderColor = current.value.cardbordercolor;
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
						//if (topframe.what === ContainerTypes.Card) {
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
						//}
					} else {
						if (e.detail === 1) {
							if (topframe.owner.includes(player)) {
								if (topframe.what === ContainerTypes.FrameContainer) 
									topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
								if (topframe.what === ContainerTypes.CanvasFrame) {
									if (topframe.drawingmode === "")
										topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
								}
								if (topframe.what === ContainerTypes.TokenContainer) {
									topframe.highlightcolor = topframe.highlightcolor0;
									topframe.redraw();
								}
								if (topframe.what === ContainerTypes.LotteryFrame) {
									topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
								}
								if (topframe.what === ContainerTypes.Card) {
									topframe.thisdiv.style.borderColor = topframe.cardbordercolorhighlight;
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
							if (topframe.what === ContainerTypes.PublicDieFrame && !topframe.fixposition) {
								if (topframe.owner.includes(player)) {
									topframe.highlight = true;
									topframe.redraw();
									draggedframe = topframe;
									draggedrefx = draggedframe.displayx;
									draggedrefy = draggedframe.displayy;
									dragframe = true;
								}
							}
							// image/token/card/canvas/lottery drag
							if (topframe.what !== ContainerTypes.Marker && topframe.what !== ContainerTypes.FrameLabel && topframe.what !== ContainerTypes.PublicDieFrame) {
								if (topframe.owner.includes(player)) {
									if (!((topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.LotteryFrame) && topframe.fixposition)) {
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
										var toberaisedlist = [];
										var currentdate = new Date();
										var newtime = currentdate.getTime() - clienttimereference + servertimereference;
										var current = multiselectlist.head;
										for (var i = 0; i < multiselectlist.length; i++) {
											current.value.displayxref = current.value.displayx;
											current.value.displayyref = current.value.displayy;
											current.value.timestamp = newtime;
											if (gameoptions.includes("d"+current.value.deckid+"dragtotop")) {
												toberaisedlist.push(current.value.deckid + "." + current.value.cardid);
											}
											current = current.next;
										}
										if (toberaisedlist.length > 0) iosocket.emit('dragcardstacktotop', toberaisedlist, newtime);
										
									} else {
										multiselected = false;
										var current = multiselectlist.head;
										for (var i = 0; i < multiselectlist.length; i++) {
											current.value.thisdiv.style.borderColor = current.value.cardbordercolor;
											current = current.next;
										}
										multiselectlist = new LinkedList();
									}
								}
							} else {
								if (topframe.what === ContainerTypes.Card) {
									if (gameoptions.includes("d"+topframe.deckid+"dragtotop")) {
										iosocket.emit('dragcardtotop', topframe.deckid, topframe.cardid, topframe.timestamp);
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
					} else if (draggedframe.what === ContainerTypes.LotteryFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						iosocket.emit('updatelotteryposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.currentindex, draggedframe.timestamp);
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
					} else if (draggedframe.what == ContainerTypes.PublicDieFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx + draggedframe.displaysize/2)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy + draggedframe.displaysize/2)/draggedframe.scale/zoomvalue;
						draggedframe.timestamp = currenttime - clienttimereference + servertimereference;
						iosocket.emit('updatepublicdieposition', draggedframe.id, draggedframe.x, draggedframe.y, draggedframe.timestamp);
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
			for (var deck in decks) {
				for (var card in decks[deck]) {
					var divBB = decks[deck][card].thisdiv.getBoundingClientRect();
					if (doboxescollide(boxx, boxx + boxw, boxy + boxh, boxy, divBB.left, divBB.right, divBB.bottom, divBB.top) ||
						iscardinstack(multiselectlist, decks[deck][card].deckid, decks[deck][card].cardid)) {
						if (decks[deck][card].owner.includes(player)) {
							decks[deck][card].thisdiv.style.borderColor = decks[deck][card].cardbordercolorhighlight;
						}
					} else {
						decks[deck][card].thisdiv.style.borderColor = decks[deck][card].cardbordercolor;
					}
				}
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
				for (var imageframe in imageframes) {
					imageframes[imageframe].thisdiv.style.backgroundColor = imageframes[imageframe].backgroundcolor0;
				}
				for (var tokenframe in tokenframes) {
					if (tokenframes[tokenframe].highlightcolor !== tokenframes[tokenframe].bordercolor) {
						tokenframes[tokenframe].highlightcolor = tokenframes[tokenframe].bordercolor;
						tokenframes[tokenframe].redraw();
					}
				}
				for (var deck in decks) {
					for (var card in decks[deck]) {
						decks[deck][card].thisdiv.style.borderColor = decks[deck][card].cardbordercolor;
					}
				}
				if (multiselected) {
					current = multiselectlist.head;
					for (var i = 0; i < multiselectlist.length; i++) {
						current.value.thisdiv.style.borderColor = current.value.cardbordercolorhighlight;
						current = current.next;
					}
				}
				for (var dieframe in dieframes) {
					dieframes[dieframe].highlight = false;
					dieframes[dieframe].redraw();
				}
				for (var publicdieframe in publicdieframes) {
					publicdieframes[publicdieframe].highlight = false;
					publicdieframes[publicdieframe].redraw();
				}
				for (var canvasframe in canvasframes) {
					if (canvasframes[canvasframe].drawingmode === "")
						canvasframes[canvasframe].thisdiv.style.backgroundColor = canvasframes[canvasframe].backgroundcolor0;
				}
				for (var lotteryframe in lotteryframes) {
					lotteryframes[lotteryframe].thisdiv.style.backgroundColor = lotteryframes[lotteryframe].backgroundcolor0;
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
					} else if (draggedframe.what == ContainerTypes.LotteryFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy)/draggedframe.scale/zoomvalue;
					} else if (draggedframe.what == ContainerTypes.PublicDieFrame) {
						draggedframe.x = (cameraposx + draggedframe.displayx + draggedframe.displaysize/2)/draggedframe.scale/zoomvalue;
						draggedframe.y = (cameraposy + draggedframe.displayy + draggedframe.displaysize/2)/draggedframe.scale/zoomvalue;
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
				
				for (var deck in decks) {
					for (var card in decks[deck]) {
						var divBB = decks[deck][card].thisdiv.getBoundingClientRect();
						if (!iscardinstack(multiselectlist, decks[deck][card].deckid, decks[deck][card].cardid)) {
							if (doboxescollide(boxx, boxx + boxw, boxy + boxh, boxy, divBB.left, divBB.right, divBB.bottom, divBB.top)) {
								if (decks[deck][card].owner.includes(player)) {
									decks[deck][card].thisdiv.style.borderColor = decks[deck][card].cardbordercolorhighlight;
									multiselectlist.addToTail(decks[deck][card]);
								}
							} else {
								decks[deck][card].thisdiv.style.borderColor = decks[deck][card].cardbordercolor;
							}
						}
					}
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
		if (e.target.parentNode.parentNode === logdivlist || e.target.parentNode.parentNode.parentNode === logdivlist || e.target.parentNode === logdivlist || e.target === logdivlist || e.target === logdivlist.parentNode || e.target === notesdiv || e.target.parentNode === notesdiv || e.target.parentNode.parentNode === notesdiv) {
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
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.LotteryFrame) {
						if (e.deltaY < 0 && topframe.zIndex < 2) return false;
						// change layer
						// look for other id
						var correctframe = null;
						for (var imageframe in imageframes) {
							if (imageframes[imageframe].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
								correctframe = imageframes[imageframe];
								break;
							}
						}
						if (!correctframe) {
							for (var tokenframe in tokenframes) {
								if (tokenframes[tokenframe].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = tokenframes[tokenframe];
									break;
								}
							}
						}
						if (!correctframe) {
							for (var canvasframe in canvasframes) {
								if (canvasframes[canvasframe].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = canvasframes[canvasframe];
									break;
								}
							}
						}
						if (!correctframe) {
							for (var lotteryframe in lotteryframes) {
								if (lotteryframes[lotteryframe].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = lotteryframes[lotteryframe];
									break;
								}
							}
						}
						if (!correctframe) {
							for (var dieframe in dieframes) {
								if (dieframes[dieframe].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = dieframes[dieframe];
									break;
								}
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
						for (var marker in topframe.parentframe.marker) {
							if (topframe.parentframe.marker[marker].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
								correctframe = topframe.parentframe.marker[marker];
								break;
							}
						}
						if (!correctframe) {
							for (var label in topframe.parentframe.label) {
								if (topframe.parentframe.label[label].zIndex === topframe.zIndex + Math.sign(e.deltaY)) {
									correctframe = topframe.parentframe.label[label];
									break;
								}
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
							if (topframe.streamcontent) {
								var currentdate = new Date();
								topframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
								topframe.getJSON();
								tempframe = {};
								for (var j = 0; j < relevantdata_canvasframe.length; j++) {
									tempframe[relevantdata_canvasframe[j]] = topframe[relevantdata_canvasframe[j]];
								}
								topframe.changinghistory = true;
								iosocket.emit('pushcanvas', tempframe);
							}
						}
					}
					if (topframe.what == ContainerTypes.LotteryFrame) {
						var relativex = (parseInt(e.clientX) - topframe.displayx)/topframe.thisdiv.clientWidth;
						var relativey = (parseInt(e.clientY) - topframe.displayy)/topframe.thisdiv.clientHeight;
						
						if (e.deltaY > 0) {
							topframe.scale *= 0.9;
						}
						if (e.deltaY < 0) {
							topframe.scale /= 0.9;
						}
						// update scales
						topframe.setdisplayscale();
						// and position
						topframe.displayx = parseInt(e.clientX) - relativex * topframe.thisdiv.clientWidth;
						topframe.displayy = parseInt(e.clientY) - relativey * topframe.thisdiv.clientHeight;
						topframe.x = (cameraposx + topframe.displayx)/topframe.scale/zoomvalue;
						topframe.y = (cameraposy + topframe.displayy)/topframe.scale/zoomvalue;
						topframe.thisdiv.style.left = topframe.displayx+"px";
						topframe.thisdiv.style.top = topframe.displayy+"px";
					}
					if (topframe.what == ContainerTypes.PublicDieFrame) {
						if (e.deltaY > 0) {
							topframe.scale *= 0.9;
						}
						if (e.deltaY < 0) {
							topframe.scale /= 0.9;
						}
						// update scales
						topframe.x = (cameraposx + topframe.displayx + topframe.displaysize/2)/topframe.scale/zoomvalue;
						topframe.y = (cameraposy + topframe.displayy + topframe.displaysize/2)/topframe.scale/zoomvalue;
						topframe.setdisplayscale();
						topframe.setdisplayposition();
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
			if (topframe.what == ContainerTypes.Die) {
				if (e.deltaY > 0) {
					topframe.scale *= 0.9;
				}
				if (e.deltaY < 0) {
					topframe.scale /= 0.9;
				}
				// update scales
				topframe.x = (cameraposx + topframe.displayx + topframe.displaysize/2)/topframe.scale/zoomvalue;
				topframe.y = (cameraposy + topframe.displayy + topframe.displaysize/2)/topframe.scale/zoomvalue;
				topframe.setdisplayscale();
			//	topframe.setdisplayposition();
			}
		} else if (e.ctrlKey) {
		
		} else {
			var topframe = lastwheelframe;
			if (topframe) {
				if (topframe.what === ContainerTypes.Die) {
					if (!topframe.justrolled) {
						if (e.deltaY > 0) {
							topframe.down();
						}
						if (e.deltaY < 0) {
							topframe.up();
						}
					}
					return;
				}
				if (topframe.what === ContainerTypes.PublicDieFrame) {
					if (topframe.setable && !topframe.justrolled && topframe.owner.includes(player)) {
						if (e.deltaY > 0) {
							topframe.down();
						}
						if (e.deltaY < 0) {
							topframe.up();
						}
						return;
					}
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
			} else if (e.deltaY < 0) {
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
						} else if (lastmenuup.what === ContainerTypes.LotteryFrame) {
							lastmenuup.thisdiv.style.backgroundColor = lastmenuup.backgroundcolor0;
						} else if (lastmenuup.what === ContainerTypes.TokenContainer) {
							lastmenuup.highlightcolor = lastmenuup.bordercolor;
							lastmenuup.redraw();
						} else if (lastmenuup.what === ContainerTypes.Die) {
							lastmenuup.highlight = false;
							lastmenuup.redraw();
						} else if (lastmenuup.what === ContainerTypes.PublicDieFrame) {
							lastmenuup.highlight = false;
							lastmenuup.redraw();
						} else if (lastmenuup.what === ContainerTypes.Marker) {
							//..
						} else if (lastmenuup.what === ContainerTypes.Card) {
							if (multiselected) {
								if (!iscardinstack(multiselectlist, lastmenuup.deckid, lastmenuup.cardid)) {
									lastmenuup.thisdiv.style.borderColor = lastmenuup.cardbordercolor;
								}
							} else {
								lastmenuup.thisdiv.style.borderColor = lastmenuup.cardbordercolor;
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
			
			if (e.target === notesdiv || e.target === notesdiv_textdisplaydiv ) {
				if (!editingnotes) {
					thismenu.items["closenotes"] = {"name": "Hide Notes", "callback": function(itemKey, opt){
												notesvisible = false;
												notesdiv.style.visibility = "hidden";
											}
							   };
					return thismenu;
				}
			}
			if (e.target.parentNode.parentNode === document.getElementById("notesdiv")) {
				return false;
			}
			var topframe = lastmousedownframe;		   
			if (topframe) {
				if (topframe.what === ContainerTypes.FrameContainer)
					topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
				if (topframe.what === ContainerTypes.TokenContainer) {
					topframe.highlightcolor = topframe.highlightcolor0;
					topframe.redraw();
				}
				if (topframe.what === ContainerTypes.LotteryFrame) {
					topframe.thisdiv.style.backgroundColor = topframe.backgroundcolorhighlight;
				}
				if (topframe.what === ContainerTypes.Die) {
					topframe.highlight = true;
					topframe.redraw();
				}
				if (topframe.what === ContainerTypes.PublicDieFrame) {
					if (topframe.owner.includes(player) || player === 0) {
						topframe.highlight = true;
						topframe.redraw();
					}
				}
				if (topframe.what === ContainerTypes.Card) {
					topframe.thisdiv.style.borderColor = topframe.cardbordercolorhighlight;
					if (multiselected) {
						if (!iscardinstack(multiselectlist, topframe.deckid, topframe.cardid)) {
							multiselected = false;
							var current = multiselectlist.head;
							for (var i = 0; i < multiselectlist.length; i++) {
								current.value.thisdiv.style.borderColor = current.value.cardbordercolor;
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
				thismenu.items["createframe"] = {"name": "New Image", "callback": function(itemKey, opt){
												var newid = nextid();
												imageframes[newid] = new FrameContainer(newid, gamediv, InitialMouseDownX, InitialMouseDownY);
												adjustzCounter();
											}
							   };
				thismenu.items["createtoken"] = {"name": "New Token", "callback": function(itemKey, opt){
												var newid = nextid();
												tokenframes[newid] = new TokenContainer(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 100);
												adjustzCounter();
											}
							   };
				thismenu.items["createcanvas"] = {"name": "New Canvas", "callback": function(itemKey, opt){
												var newid = nextid();
												canvasframes[newid] = new CanvasFrameContainer(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 400, 400);
												adjustzCounter();
												canvasframes[newid].setdisplayscale();
												canvasframes[newid].resethistory();
											}
							   };
				thismenu.items["createdeck"] = {"name": "New Deck", "callback": function(itemKey, opt){
							$("#fileinputdialog").trigger('click');							
							document.getElementById("fileinputdialog").onchange = function(){
								
								asyncLoadLocalFile(this.files[0], function(contents){
										var words = contents.split(/\r?\n/);
										var newdeckid = 0;
										for (var deck in decks) {
											newdeckid = Math.max(newdeckid, decks[deck][Object.keys(decks[deck])[0]].deckid);
											for (var card in decks[deck]) {
												zcounter = Math.max(zcounter, decks[deck][card].zIndex + 1);
												
											}
										}
										newdeckid += 1;
										decks[newdeckid] = {};
										var cardcounter = -1;
										for (var i = 1; i < words.length; i++) {
											var thiscarddata = words[i].split(/\t/);
											if (thiscarddata.length === 4) {
												// thiscarddata[0-4] = width, height, frontfile, backfile("-" for empty)
												var newcard = new Card(newdeckid, ++cardcounter, decks[newdeckid], gamediv, InitialMouseDownX + cardcounter * Math.min(1*thiscarddata[0], 1*thiscarddata[1])/words.length, InitialMouseDownY + cardcounter * Math.min(1*thiscarddata[0], 1*thiscarddata[1])/words.length, 1*thiscarddata[0], 1*thiscarddata[1], thiscarddata[2], thiscarddata[3]);
												decks[newdeckid][newcard.cardid] = newcard;
												for (var j = 1; j < playernames.length; j++) {
													decks[newdeckid][newcard.cardid].owner.push(j);
													decks[newdeckid][newcard.cardid].viewingrights.push(j);
												}
											}
										}
									});
								document.getElementById("fileinputdialog").value = null;
								
							};
						}
					};
				thismenu.items["createlottery"] = {"name": "New Lottery", "callback": function(itemKey, opt){
												var newid = nextid();
												lotteryframes[newid] = new LotteryFrame(newid, gamediv, InitialMouseDownX, InitialMouseDownY, playernames.slice(1, playernames.length));
												for (var i = 1; i < playernames.length; i++) {
													lotteryframes[newid].owner.push(i);
													lotteryframes[newid].viewingrights.push(i);
												}
												
												adjustzCounter();
											}
							   };
				if (topframe) {
					if (topframe.what == ContainerTypes.FrameContainer) {
						thismenu.items["createmarker"] = {"name": "New Marker", "callback": function(itemKey, opt){
												var somesize = markersize;
												var somex = InitialMouseDownX - topframe.displayx - topframe.thisimg.offsetLeft-zoomvalue*somesize/2;
												var somey = InitialMouseDownY - topframe.displayy - topframe.thisimg.offsetTop-zoomvalue*somesize/2;
												for (marker in topframe["marker"]) {
													topframe.markeridcounter = Math.max(topframe.markeridcounter, marker + 1);
												}
												var newid = topframe.markeridcounter++
												topframe["marker"][newid] = new Marker(newid, topframe, topframe.thisdiv, somex/topframe.scale/zoomvalue, somey/topframe.scale/zoomvalue, markersize, "img/_server_/markerdemo.jpg"); 
											}
									   };
						thismenu.items["createlabel"] = {"name": "New Label", "callback": function(itemKey, opt){
												var somex = InitialMouseDownX - topframe.displayx - topframe.thisimg.offsetLeft;
												var somey = InitialMouseDownY - topframe.displayy - topframe.thisimg.offsetTop;
												for (label in topframe["label"]) {
													topframe.labelidcounter = Math.max(topframe.labelidcounter, label + 1);
												}
												var newid = topframe.labelidcounter++
												topframe["label"][newid] = new FrameLabel(newid, topframe, topframe.thisdiv, somex/topframe.scale/zoomvalue, somey/topframe.scale/zoomvalue, "Some Label"); 
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
												var thiscolor = d6filenamebases[Math.floor(d6filenamebases.length * random())];
												var newid = dieidcounter++;
												dieframes[newid] = new Die(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 60, 6, thiscolor, "png");
												adjustzCounter();
											}
							   };
				thismenu.items.die.items["created20"] = {"name": "New D20", "callback": function(itemKey, opt){
												var thiscolor = d20filenamebases[Math.floor(d20filenamebases.length * random())];
												var newid = dieidcounter++;
												dieframes[newid] = new Die(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 80, 20, thiscolor, "png");
												adjustzCounter();
											}
							   };	
				if (player === 0) {
					thismenu.items.die.items["createpublicd6"] = {"name": "New Public D6", "callback": function(itemKey, opt){
													var newid = nextid();
													publicdieframes[newid] = new PublicDie(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 60, 6, "img/_server_/dice/d6_", "png");
													for (var i = 1; i < playernames.length; i++) {
														publicdieframes[newid].owner.push(i);
													}
													adjustzCounter();
												}
								   };
					thismenu.items.die.items["createpublicd20"] = {"name": "New Public D20", "callback": function(itemKey, opt){
													var newid = nextid();
													publicdieframes[newid] = new PublicDie(newid, gamediv, InitialMouseDownX, InitialMouseDownY, 80, 20, "img/_server_/dice/d20_", "png");
													for (var i = 1; i < playernames.length; i++) {
														publicdieframes[newid].owner.push(i);
													}
													adjustzCounter();
												}
								   };
					publicdieframes
				}
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
				thismenu.items.sound.items["playTTS"] = {"name": "Queue TTS", "callback": function(itemKey, opt){
												var msg = prompt("Enter Text.", lastmsg);
												if (msg) {
													lastmsg = msg;
													iosocket.emit('requestqueueTTS', msg);
												}
											}
							   };
				thismenu.items.sound.items["changevolume"] = {"name": "Volume", "type": "text"};
				if (voices) {
					if (voices.length > 0) {
						thismenu.items.sound.items["ttsvoices"] = {"name": "Select TTS voice", "items": {} };
						for (var i = 0; i < voices.length; i++) {
							thismenu.items.sound.items.ttsvoices.items["ttsvoice"+i] = {"name": voices[i].name, "callback": function(itemKey, opt){
														var thisvoice = parseInt(itemKey.replace("ttsvoice", ""));
														ttsvoice = voices[thisvoice];
														addsomethingtolog('Set TTS voice to ' + voices[thisvoice].name + '.');
												}
								   };
						}
					} 
				}
			}
			if (topframe) {
				if (topframe.what === ContainerTypes.Die) {
					thismenu.items["sep1"] = "---------";
					thismenu.items["rolldie"] = {"name": "Roll", "callback": function(itemKey, opt){
													if (!topframe.justrolled)
														topframe.roll();
												}
								   };
					thismenu.items["diecolor"] = { "name": "Set Die Color", "items": {} };
					if (topframe.maxvalue === 6) {
						for (var i = 0; i < d6filenamebases_labels.length; i++) {
							thismenu.items.diecolor.items["diecolor"+i] = {"name": d6filenamebases_labels[i], "callback": function(itemKey, opt){
															var thiscolor = parseInt(itemKey.replace("diecolor", ""));
															topframe.filenamebase = d6filenamebases[thiscolor];
															topframe.applyimage();
														}
										};
						}
					}
					if (topframe.maxvalue === 20) {
						for (var i = 0; i < d20filenamebases_labels.length; i++) {
							thismenu.items.diecolor.items["diecolor"+i] = {"name": d20filenamebases_labels[i], "callback": function(itemKey, opt){
															var thiscolor = parseInt(itemKey.replace("diecolor", ""));
															topframe.filenamebase = d20filenamebases[thiscolor];
															topframe.applyimage();
														}
										};
						}
					}
								   
					var legaltokens = [];
					for (var tokenframe in tokenframes) {
						if (tokenframes[tokenframe].owner.includes(player)) {
							legaltokens.push(tokenframes[tokenframe]);
						}
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
													if (dieframes[topframe.id]) {
														if (dieframes[topframe.id].tokenlink) dieframes[topframe.id].tokenlink.dielink = null;
														dieframes[topframe.id].thisdiv.parentNode.removeChild(dieframes[topframe.id].thisdiv);
														delete dieframes[topframe.id];
													}
												}
								   };
					//return thismenu;
				} else if (topframe.what == ContainerTypes.PublicDieFrame) {
					if (topframe.owner.includes(player)) {
						thismenu.items["sep1"] = "---------";
						thismenu.items["rolldie"] = {"name": "Roll", "callback": function(itemKey, opt){
														if (!topframe.justrolled)
															topframe.roll();
													}
									   };
					}
				} else if (topframe.what === ContainerTypes.LotteryFrame) {
					if (topframe.owner.includes(player)) {
						thismenu.items["sep1"] = "---------";
						thismenu.items["pick"] = {"name": "Pick Next", "callback": function(itemKey, opt){
														var currentdate = new Date();
														iosocket.emit('reqlotterypick', topframe.id, currentdate.getTime() - clienttimereference + servertimereference);
													}
									   };
						if (player !== 0) return thismenu;
					}
				}
			}
			if (player !== 0 && gameoptions.includes('yahtzee')) {
				thismenu.items["rollalldies"] = {"name": "Roll All", "callback": function(itemKey, opt){
												for (var dieframe in dieframes) {
													if (!dieframes[dieframe].justrolled) {
														dieframes[dieframe].roll();
													}
												}
												for (var publicdieframe in publicdieframes) {
													if (publicdieframes[publicdieframe].owner.includes(player) && !publicdieframes[publicdieframe].justrolled) {
														publicdieframes[publicdieframe].roll();
													}
												}
											}
							   };
			}
			if (topframe) {
				if (player !== 0) { 
					if (topframe.what === ContainerTypes.TokenContainer) {
						if (topframe.dielink) {
							thismenu.items["rolldielink"] = {"name": "Roll", "callback": function(itemKey, opt){
															if (!topframe.dielink.justrolled)
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
						// note: grabtopfunction..
						var grabtopnfunction = function(n) {
							if (multiselected) {
								while (multiselectlist.length > n) {
									var current = multiselectlist.head;
									var lowestz = multiselectlist.head;
									for (var i = 0; i < multiselectlist.length; i++) {
										if (current.value.zIndex < lowestz.value.zIndex) {
											lowestz = current;
										}
										current = current.next;
									}
									lowestz.value.thisdiv.style.borderColor = lowestz.value.cardbordercolor;
									multiselectlist.moveToTail(lowestz);
									multiselectlist.removeFromTail();
								}
							}
						};
						thismenu.items["grabtopnlast"] = {"name": "Grab top " + lastnumberofcardsfromstack, "callback": function(itemKey, opt){
														if (lastnumberofcardsfromstack > 0) grabtopnfunction(lastnumberofcardsfromstack);
													}
												};
						thismenu.items["grabtopn"] = {"name": "Grab top ..", "callback": function(itemKey, opt){
														var newn = prompt("Enter Size.", lastnumberofcardsfromstack);
														if (newn) {
															if (!isNaN(parseInt(newn)) && parseInt(newn) > 0) {
																lastnumberofcardsfromstack = parseInt(newn);
																grabtopnfunction(lastnumberofcardsfromstack);
															} else {
																alert("Non-integer/negative input invalid.")
															}
														}
													}
												};
							
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
													for (var deck in decks) {
														for (var card in decks[deck]) {
															decks[deck][card].discard();
														}
													}
												}
								   };
					if (!notesvisible && gameoptions.includes("notes")) thismenu.items["opennotes"] = {"name": "Show Notes", "callback": function(itemKey, opt){
												notesvisible = true;
												notesdiv.style.visibility = "";
											}
							   };
					if (akeydown) thismenu.items["changevolume"] = {"name": "Volume", "type": "text"};
					if (voices && akeydown) {
						if (voices.length > 0) {
							thismenu.items["ttsvoices"] = {"name": "Select TTS voice", "items": {} };
							for (var i = 0; i < voices.length; i++) {
								thismenu.items.ttsvoices.items["ttsvoice"+i] = {"name": voices[i].name, "callback": function(itemKey, opt){
															var thisvoice = parseInt(itemKey.replace("ttsvoice", ""));
															ttsvoice = voices[thisvoice];
															addsomethingtolog('Set TTS voice to ' + voices[thisvoice].name + '.');
													}
									   };
							}
						} 
					}
				} else {
					if (!notesvisible) thismenu.items["opennotes"] = {"name": "Show Notes", "callback": function(itemKey, opt){
												notesvisible = true;
												notesdiv.style.visibility = "";
											}
							   };
				}
				
			}
			if (player === 0 && topframe) {
				thismenu.items["sep2"] = "---------";
				
				var thisname = "";
				if (topframe.what === ContainerTypes.Card) {
					thismenu.items["topframeinfo"] = { "name": "Card " + topframe.deckid + "." + topframe.cardid, "disabled": true };
				} else {
					if (topframe.what === ContainerTypes.FrameContainer) {
						thisname = "Image";
					} else if (topframe.what === ContainerTypes.TokenContainer) {
						thisname = "Token";
					} else if (topframe.what === ContainerTypes.Marker) {
						thisname = "Marker";
					} else if (topframe.what === ContainerTypes.FrameLabel) {
						thisname = "Label";
					} else if (topframe.what === ContainerTypes.CanvasFrame) {
						thisname = "Canvas";
					} else if (topframe.what === ContainerTypes.LotteryFrame) {
						thisname = "Lottery";
					} else if (topframe.what === ContainerTypes.PublicDieFrame) {
						thisname = "Die";
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

				if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.Marker || topframe.what === ContainerTypes.FrameLabel || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.LotteryFrame || topframe.what === ContainerTypes.PublicDieFrame) {
					if (topframe.what === ContainerTypes.TokenContainer)
						thismenu.items["copytoken"] = {"name": "Copy Token", "callback": function(itemKey, opt){
														var newid = nextid();
														var tempframe = {};
														for (var j = 0; j < relevantdata_tokenframe.length; j++) {
															tempframe[relevantdata_tokenframe[j]] = topframe[relevantdata_tokenframe[j]];
														}
														tempframe.id = newid;
														tempframe.x = topframe.x + 25;
														tempframe.y = topframe.y + 25;
														tokenframes[tempframe.id] = new TokenContainer(tempframe.id, gamediv, 0, 0, topframe.size);
														tokenframes[tempframe.id].loadproperties2(tempframe);
														tokenframes[tempframe.id].setdisplayposition();
														adjustzCounter();
													}
									   };
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.LotteryFrame || topframe.what === ContainerTypes.PublicDieFrame) {
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
					if (topframe.what === ContainerTypes.LotteryFrame) {
						// build viewing submenu+callback
						thismenu.items["viewersubmenu"] = { "name": "Set Visibility", "items": {} };
						for (var i = 0; i < playernames.length; i++) {
							if (topframe.viewingrights.includes(i))
								thismenu.items.viewersubmenu.items["viewersubmenukey"+i] = {"name": playernames[i], "callback": function(itemKey, opt){
																		var thisplayer =  parseInt(itemKey.replace("viewersubmenukey", ""));
																		if (topframe.viewingrights.includes(thisplayer)) {
																			topframe.viewingrights.splice(topframe.viewingrights.indexOf(thisplayer), 1);
																			opt.items.viewersubmenu.items[itemKey].$node[0].classList.add("disabledtext"); 
																		} else {
																			topframe.viewingrights.push(thisplayer);
																			opt.items.viewersubmenu.items[itemKey].$node[0].classList.remove("disabledtext"); 
																		}
																		return false;}};//
							else
								thismenu.items.viewersubmenu.items["viewersubmenukey"+i] = {"name": playernames[i], "className": "disabledtext", "callback": function(itemKey, opt){
																		var thisplayer =  parseInt(itemKey.replace("viewersubmenukey", ""));
																		if (topframe.viewingrights.includes(thisplayer)) {
																			topframe.viewingrights.splice(topframe.viewingrights.indexOf(thisplayer), 1);
																			opt.items.viewersubmenu.items[itemKey].$node[0].classList.add("disabledtext"); 
																		} else {
																			topframe.viewingrights.push(thisplayer);
																			opt.items.viewersubmenu.items[itemKey].$node[0].classList.remove("disabledtext"); 
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
														var tempframe = {};
														for (var j = 0; j < relevantdata_imageframe.length; j++) {
															tempframe[relevantdata_imageframe[j]] = actualframe[relevantdata_imageframe[j]];
														}
														var tempmarkers = {};
														for (var marker in actualframe["marker"]) {
															var tempmarker = {};
															for (var k = 0; k < relevantdata_markerframe.length; k++) {
																tempmarker[relevantdata_markerframe[k]] = actualframe["marker"][marker][relevantdata_markerframe[k]];
															}
															tempmarkers[marker] = tempmarker;
														}
														var templabels = {};
														for (var label in actualframe["label"]) {
															var templabel = {};
															for (var k = 0; k < relevantdata_framelabel.length; k++) {
																templabel[relevantdata_framelabel[k]] = actualframe["label"][label][relevantdata_framelabel[k]];
															}
															templabels[label] = templabel;
														}
														iosocket.emit('pushimage', tempframe, tempmarkers, templabels);
													} else if (actualframe.what === ContainerTypes.TokenContainer) {
														var tempframe = {};
														for (var j = 0; j < relevantdata_tokenframe.length; j++) {
															tempframe[relevantdata_tokenframe[j]] = actualframe[relevantdata_tokenframe[j]];
														}
														iosocket.emit('pushtoken', tempframe);
													} else if (actualframe.what === ContainerTypes.CanvasFrame) {
														var tempframe = {};
														actualframe.getJSON();
														for (var i = 0; i < relevantdata_canvasframe.length; i++) {
															tempframe[relevantdata_canvasframe[i]] = actualframe[relevantdata_canvasframe[i]];
														}
														actualframe.changinghistory = true;
														iosocket.emit('pushcanvas', tempframe);
													} else if (actualframe.what === ContainerTypes.LotteryFrame) {
														var tempframe = {};
														for (var j = 0; j < relevantdata_lotteryframe.length; j++) {
															tempframe[relevantdata_lotteryframe[j]] = actualframe[relevantdata_lotteryframe[j]];
														}
														iosocket.emit('pushlottery', tempframe);
													} else if (actualframe.what === ContainerTypes.PublicDieFrame) {
														var tempframe = {};
														for (var j = 0; j < relevantdata_publicdieframe.length; j++) {
															tempframe[relevantdata_publicdieframe[j]] = actualframe[relevantdata_publicdieframe[j]];
														}
														iosocket.emit('pushpublicdie', tempframe);
													}
												}
								   };
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.Marker) {
						thismenu.items["loadimage"] = {"name": "Load Image", "callback": function(itemKey, opt){
													loadingimage = true;
						
													loadimagediv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
													document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "";
													document.getElementById("loadimage_bapply").style.visibility = "";
													document.getElementById("loadimage_bcancel").style.visibility = "";
													document.getElementById("loadimage_bupdate").style.visibility = "";
													document.getElementById("loadimage_label").style.visibility = "hidden";
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
													loadimagediv.ondragenter = function(e){
														e.preventDefault();
														document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "hidden";
														document.getElementById("loadimage_bapply").style.visibility = "hidden";
														document.getElementById("loadimage_bcancel").style.visibility = "hidden";
														document.getElementById("loadimage_bupdate").style.visibility = "hidden";
														document.getElementById("loadimage_label").style.visibility = "";
														loadimagediv.style.background = "repeating-linear-gradient(-55deg, #888 0px, #888 10px, #999 10px, #999 50px)";
													};	
													loadimagediv.ondragover = function(e){
														e.preventDefault();
													};
													loadimagediv.ondragleave = function(e){
														e.preventDefault();
														if (e.toElement.parentNode !== loadimagediv) {
															document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "";
															document.getElementById("loadimage_bapply").style.visibility = "";
															document.getElementById("loadimage_bcancel").style.visibility = "";
															document.getElementById("loadimage_bupdate").style.visibility = "";
															document.getElementById("loadimage_label").style.visibility = "hidden";
															loadimagediv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
														}
													};
													document.getElementById("loadimage_label").style.pointerEvents = "none";
													var ondropfunction = function(e) {
														e.preventDefault();
														e.stopPropagation();
														if (e.dataTransfer.files[0]) {
															if (e.dataTransfer.files[0].type.substring(0,6) == "image/") {
																loadimagedivcontainer.style.visibility = "hidden";
																loadimagediv.style.zIndex = 0;
																loadingimage = false;
																
																console.log('Using file:', e.dataTransfer.files[0]);
																
																var reader = new FileReader();
																reader.readAsDataURL(e.dataTransfer.files[0]);
																reader.onload = function () {
																	//console.log(reader.result);
																	if (topframe.what == ContainerTypes.FrameContainer) {
																		topframe.applyimage(reader.result);
																	} else if (topframe.what == ContainerTypes.TokenContainer) {
																		topframe.offsetx = 0;
																		topframe.offsety = 0;
																		topframe.scale = 1.0;
																		topframe.applyimage(reader.result);
																	} else if (topframe.what == ContainerTypes.Marker) {
																		if (topframe.descriptionisprepared) {
																			topframe.descfilename = reader.result;
																			topframe.applyimage(reader.result);
																		} else {
																			topframe.descfilename = reader.result;
																		}
																	}
																};
																reader.onerror = function (error) {
																	console.log('Error: ', error);
																};
															} else {
																document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "";
																document.getElementById("loadimage_bapply").style.visibility = "";
																document.getElementById("loadimage_bcancel").style.visibility = "";
																document.getElementById("loadimage_bupdate").style.visibility = "";
																document.getElementById("loadimage_label").style.visibility = "hidden";
																loadimagediv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
																alert('Not a valid image file.', e.dataTransfer.files[0]);
															}
														} else {
															document.getElementById("loadimageautocompletecontainerdiv").style.visibility = "";
															document.getElementById("loadimage_bapply").style.visibility = "";
															document.getElementById("loadimage_bcancel").style.visibility = "";
															document.getElementById("loadimage_bupdate").style.visibility = "";
															document.getElementById("loadimage_label").style.visibility = "hidden";
															loadimagediv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";
															alert('Not a valid image file.');
															console.log(e, e.dataTransfer.getData('Text'));
														}
													}
													loadimagediv.ondrop = ondropfunction;			
													document.getElementById("loadimage_label").ondrop = ondropfunction;
							}
						};
					}
					if (topframe.what === ContainerTypes.LotteryFrame) {
						thismenu.items["setoptions"] = {"name": "Set Options", "callback": function(itemKey, opt){
													textediting = true;

													texteditdivcontainer.style.visibility = "";
													texteditdivcontainer.style.zIndex = zcounter + 100;
													texteditdiv.style.zIndex = zcounter + 120;
													texteditdiv.style.left = document.body.clientWidth/2 - parseInt(texteditdiv.style.width.replace("px", ""))/2 + "px";
													texteditdiv.style.top = "0px";
													
													document.getElementById("texteditinput").value = topframe.options.join('\n');
													document.getElementById("texteditinput").focus();
													
													document.getElementById("texteditinput").oninput = function(){
														/* 
														** Returns the caret (cursor) position of the specified text field (oField).
														** Return value range is 0-oField.value.length.
														*/
														var getCaretPosition = function (oField) {

														  // Initialize
														  var iCaretPos = 0;

														  // IE Support
														  if (document.selection) {

														    // Set focus on the element
														    oField.focus();

														    // To get cursor position, get empty selection range
														    var oSel = document.selection.createRange();

														    // Move selection start to 0 position
														    oSel.moveStart('character', -oField.value.length);

														    // The caret position is selection length
														    iCaretPos = oSel.text.length;
														  }

														  // Firefox support
														  else if (oField.selectionStart || oField.selectionStart == '0')
														    iCaretPos = oField.selectionDirection=='backward' ? oField.selectionStart : oField.selectionEnd;

														  // Return results
														  return iCaretPos;
														}
														var setCaretPosition = function (oField, caretPos) {
															if(oField != null) {
																if(oField.createTextRange) {
																  var range = oField.createTextRange();
																  range.move('character', caretPos);
																  range.select();
																}
																else {
																  if(oField.selectionStart) {
																      oField.focus();
																      oField.setSelectionRange(caretPos, caretPos);
																  }
																  else
																      oField.focus();
																}
															}
														}
														var currentpos = getCaretPosition(document.getElementById("texteditinput"));
														document.getElementById("texteditinput").value = document.getElementById("texteditinput").value.replace(/,/g, '\n').replace(/\r?\n/g, '\n').replace(/\n\n/g, '\n');
														setCaretPosition(document.getElementById("texteditinput"), currentpos);
													};
													document.getElementById("textedit_bapply").onclick = function(){
														texteditdivcontainer.style.visibility = "hidden";
														texteditdiv.style.zIndex = 0;
														textediting = false;
														topframe.options = document.getElementById("texteditinput").value.split(/\r?\n/g);
														topframe.currentindex = 0;	
														var currentdate = new Date();
														topframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
														var tempframe = {};
														for (var j = 0; j < relevantdata_lotteryframe.length; j++) {
															tempframe[relevantdata_lotteryframe[j]] = topframe[relevantdata_lotteryframe[j]];
														}
														iosocket.emit('pushlottery', tempframe);
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
					
						thismenu.items["setcurrentsubmenu"] = { "name": "Set Option", "items": {} };
						for (var i = 0; i < topframe.options.length; i++) {
							thismenu.items.setcurrentsubmenu.items["setcurrentsubmenukey"+i] = {"name": topframe.options[i], "callback": function(itemKey, opt){
																var thisoption =  parseInt(itemKey.replace("setcurrentsubmenukey", ""));
																var currentdate = new Date();
																iosocket.emit('reqlotterypick', topframe.id, currentdate.getTime() - clienttimereference + servertimereference, thisoption);
																	
												}
									};
						}
					}
					thismenu.items["framedetails"] = { "name": "Details", "items": {} };
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.LotteryFrame || topframe.what === ContainerTypes.PublicDieFrame) {
						/*if (topframe.what === ContainerTypes.FrameContainer) {
							thismenu.items.framedetails.items["thiszindex"] = {"name": "Rearrange This Layering", "callback": function(itemKey, opt){
															topframe.adjustzIndices();
														}
										   };
						}*/
						if (topframe.what !== ContainerTypes.PublicDieFrame) {
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
						}
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
						if (topframe.what === ContainerTypes.LotteryFrame) {
							if (topframe.selectatrandom)
								thismenu.items.framedetails.items["selectatrandomtoggle"] = {"name": "Select Random: On", "callback": function(itemKey, opt){
																		if (topframe.selectatrandom) {
																			topframe.selectatrandom = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Select Random: Off</span>";
																		} else {
																			topframe.selectatrandom = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Select Random: On</span>"; 
																		}
																		return false;}};
							else
								thismenu.items.framedetails.items["selectatrandomtoggle"] = {"name": "Select Random: Off", "callback": function(itemKey, opt){
																		if (topframe.selectatrandom) {
																			topframe.selectatrandom = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Select Random: Off</span>";
																		} else {
																			topframe.selectatrandom = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Select Random: On</span>"; 
																		}
																		return false;}};
							if (topframe.isturnindicator)
								thismenu.items.framedetails.items["isturnindicatortoggle"] = {"name": "Turn Indicator: On", "callback": function(itemKey, opt){
																		if (topframe.isturnindicator) {
																			topframe.isturnindicator = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Turn Indicator: Off</span>";
																		} else {
																			topframe.isturnindicator = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Turn Indicator: On</span>"; 
																		}
																		return false;}};
							else
								thismenu.items.framedetails.items["isturnindicatortoggle"] = {"name": "Turn Indicator: Off", "callback": function(itemKey, opt){
																		if (topframe.isturnindicator) {
																			topframe.isturnindicator = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Turn Indicator: Off</span>";
																		} else {
																			topframe.isturnindicator = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Turn Indicator: On</span>"; 
																		}
																		return false;}};
							if (topframe.publicresult)
								thismenu.items.framedetails.items["publicresulttoggle"] = {"name": "Write Log: On", "callback": function(itemKey, opt){
																		if (topframe.publicresult) {
																			topframe.publicresult = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Write Log: Off</span>";
																		} else {
																			topframe.publicresult = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Write Log: On</span>"; 
																		}
																		return false;}};
							else
								thismenu.items.framedetails.items["publicresulttoggle"] = {"name": "Write Log: Off", "callback": function(itemKey, opt){
																		if (topframe.publicresult) {
																			topframe.publicresult = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Write Log: Off</span>";
																		} else {
																			topframe.publicresult = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Write Log: On</span>"; 
																		}
																		return false;}};
							if (topframe.playsound)
								thismenu.items.framedetails.items["playsoundtoggle"] = {"name": "Use TTS: On", "callback": function(itemKey, opt){
																		if (topframe.playsound) {
																			topframe.playsound = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Use TTS: Off</span>";
																		} else {
																			topframe.playsound = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Use TTS: On</span>"; 
																		}
																		return false;}};
							else
								thismenu.items.framedetails.items["playsoundtoggle"] = {"name": "Use TTS: Off", "callback": function(itemKey, opt){
																		if (topframe.playsound) {
																			topframe.playsound = false;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Use TTS: Off</span>";
																		} else {
																			topframe.playsound = true;
																			opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Use TTS: On</span>"; 
																		}
																		return false;}};
						}
					}
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.CanvasFrame || topframe.what === ContainerTypes.LotteryFrame || topframe.what === ContainerTypes.PublicDieFrame) {
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
					if (topframe.what === ContainerTypes.FrameContainer) {
						if (topframe.backgroundcolor0 === "transparent")
							thismenu.items.framedetails.items["transparentbackgroundtoggle"] = {"name": "Background: Transparent", "callback": function(itemKey, opt){
																	if (topframe.backgroundcolor0 === "transparent") {
																		topframe.backgroundcolor0 = "white";
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Background: White</span>";
																	} else {
																		topframe.backgroundcolor0 = "transparent";
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Background: Transparent</span>";
																	}
																	return false;}};
						else
							thismenu.items.framedetails.items["transparentbackgroundtoggle"] = {"name": "Background: White", "callback": function(itemKey, opt){
																	if (topframe.backgroundcolor0 === "transparent") {
																		topframe.backgroundcolor0 = "white";
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Background: White</span>";
																	} else {
																		topframe.backgroundcolor0 = "transparent";
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Background: Transparent</span>";
																	}
																	return false;}};
					}
					if (topframe.what === ContainerTypes.PublicDieFrame) {
						thismenu.items.framedetails.items["diecolor"] = { "name": "Set Die Color", "items": {} };
						if (topframe.maxvalue === 6) {
							for (var i = 0; i < pd6filenamebases_labels.length; i++) {
								thismenu.items.framedetails.items.diecolor.items["diecolor"+i] = {"name": pd6filenamebases_labels[i], "callback": function(itemKey, opt){
																var thiscolor = parseInt(itemKey.replace("diecolor", ""));
																topframe.filenamebase = pd6filenamebases[thiscolor];
																topframe.applyimage();
															}
											};
							}
						}
						if (topframe.maxvalue === 20) {
							for (var i = 0; i < pd20filenamebases_labels.length; i++) {
								thismenu.items.framedetails.items.diecolor.items["diecolor"+i] = {"name": pd20filenamebases_labels[i], "callback": function(itemKey, opt){
																var thiscolor = parseInt(itemKey.replace("diecolor", ""));
																topframe.filenamebase = pd20filenamebases[thiscolor];
																topframe.applyimage();
															}
											};
							}
						}
						if (topframe.setable)
							thismenu.items.framedetails.items["setabletoggle"] = {"name": "Set-able: On", "callback": function(itemKey, opt){
																	if (topframe.setable) {
																		topframe.setable = false;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Set-able: Off</span>";
																	} else {
																		topframe.setable = true;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Set-able: On</span>";
																	}
																	return false;}};
						else
							thismenu.items.framedetails.items["setabletoggle"] = {"name": "Set-able: Off", "callback": function(itemKey, opt){
																	if (topframe.setable) {
																		topframe.setable = false;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Set-able: Off</span>";
																	} else {
																		topframe.setable = true;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Set-able: On</span>";
																	}
																	return false;}};
						if (topframe.animated)
							thismenu.items.framedetails.items["animationtoggle"] = {"name": "Animation: On", "callback": function(itemKey, opt){
																	if (topframe.animated) {
																		topframe.animated = false;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Animation: Off</span>";
																	} else {
																		topframe.animated = true;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Animation: On</span>";
																	}
																	return false;}};
						else
							thismenu.items.framedetails.items["animationtoggle"] = {"name": "Animation: Off", "callback": function(itemKey, opt){
																	if (topframe.animated) {
																		topframe.animated = false;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Animation: Off</span>";
																	} else {
																		topframe.animated = true;
																		opt.items.framedetails.items[itemKey].$node[0].innerHTML = "<span>Animation: On</span>";
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
																			  fill: topframe.backgroundcolorinputcolor,
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
																	if (topframe.streamcontent) {
																		var currentdate = new Date();
																		topframe.timestamp = currentdate.getTime() - clienttimereference + servertimereference;
																		topframe.getJSON();
																		tempframe = {};
																		for (var j = 0; j < relevantdata_canvasframe.length; j++) {
																			tempframe[relevantdata_canvasframe[j]] = topframe[relevantdata_canvasframe[j]];
																		}
																		topframe.changinghistory = true;
																		iosocket.emit('pushcanvas', tempframe);
																	}
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
																			topframe.setdisplayposition();
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
							thismenu.items.framedetails.items["tokencolorfromlist"] = {"name": "Color from List", "items": {}};
							for (var i = 0; i < tokencolors.length; i++) {
								thismenu.items.framedetails.items.tokencolorfromlist.items["tokencolor"+i] = {"name": tokencolors_labels[i], "callback": function(itemKey, opt){
																var thiscolor = parseInt(itemKey.replace("tokencolor", ""));
																topframe.bordercolor = tokencolors[thiscolor];
																topframe.redraw();
															}
											};
							}
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
					if (topframe.what === ContainerTypes.Marker) {
						thismenu.items.framedetails.items["markercolor"] = { "name": "Set Marker Color", "items": {} };
						for (var i = 0; i < markerfilenamebases_labels.length; i++) {
							thismenu.items.framedetails.items.markercolor.items["markercolor"+i] = {"name": markerfilenamebases_labels[i], "callback": function(itemKey, opt){
															var thiscolor = parseInt(itemKey.replace("markercolor", ""));
															topframe.markercolor = thiscolor;
															topframe.redraw();
														}
										};
						}
					}
					if (topframe.what === ContainerTypes.FrameContainer || topframe.what === ContainerTypes.TokenContainer || topframe.what === ContainerTypes.CanvasFrame) {
						thismenu.items["restore"] = {"name": "Restore", "callback": function(itemKey, opt){
														if (topframe.what == ContainerTypes.FrameContainer) {
															iosocket.emit('requestrestoreimage', topframe.id);
														} else if (topframe.what == ContainerTypes.TokenContainer) {
															iosocket.emit('requestrestoretoken', topframe.id);
														} else if (topframe.what == ContainerTypes.CanvasFrame) {
															iosocket.emit('requestrestorecanvas', topframe.id);
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
													} else if (topframe.what == ContainerTypes.LotteryFrame) {
														iosocket.emit('pushdeletelottery', topframe.id);
														topframe = null;
													} else if (topframe.what == ContainerTypes.PublicDieFrame) {
														iosocket.emit('pushdeletepublicdie', topframe.id);
														topframe = null;
													}
												}
								   };
				} else if (topframe.what === ContainerTypes.Card)	{
					thismenu.items["cardsinglesubmenu"] = { "name": "Card", "items": {} };
					thismenu.items["cardstacksubmenu"] = { "name": "Stack ("+multiselectlist.length+" cards)", "disabled": !multiselected, "items": {} };
					thismenu.items["carddecksubmenu"] = { "name": "Deck ("+Object.keys(topframe.deck).length+" cards)", "items": {} };
					
					
					var currentcardlist = null;
					var pushfunction = function(itemKey, opt) {
								// send to server for broadcast
								var currentdate = new Date();
								var currenttime = currentdate.getTime();
								var current = currentcardlist.head;
								for (var i = 0; i < currentcardlist.length; i++) {
									var tempframe = {};
									current.value.timestamp = currenttime - clienttimereference + servertimereference;
									for (var j = 0; j < relevantdata_card.length; j++) {
										tempframe[relevantdata_card[j]] = current.value[relevantdata_card[j]];
									}
									iosocket.emit('pushcard', tempframe);
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
													currentcardlist = new LinkedList();
													for (var card in decks[topframe.deckid]) {
														currentcardlist.addToTail(decks[topframe.deckid][card]);
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
																currentcardlist = new LinkedList();
																for (var card in decks[topframe.deckid]) {
																	currentcardlist.addToTail(decks[topframe.deckid][card]);
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
																currentcardlist = new LinkedList();
																for (var card in decks[topframe.deckid]) {
																	currentcardlist.addToTail(decks[topframe.deckid][card]);
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
																for (var card in decks[topframe.deckid]) {
																	if (!decks[topframe.deckid][card].faceup) { 
																		decks[topframe.deckid][card].turncard();
																		decks[topframe.deckid][card].timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', decks[topframe.deckid][card].deckid, decks[topframe.deckid][card].cardid, decks[topframe.deckid][card].x, decks[topframe.deckid][card].y, decks[topframe.deckid][card].angle, decks[topframe.deckid][card].faceup, decks[topframe.deckid][card].timestamp);
																	}
																}
															}
														};
					thismenu.items.carddecksubmenu.items["facedownd"] = {"name": "Turn Face Down", "callback": function(itemKey, opt){
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																for (var card in decks[topframe.deckid]) {
																	if (decks[topframe.deckid][card].faceup) { 
																		decks[topframe.deckid][card].turncard();
																		decks[topframe.deckid][card].timestamp = currenttime - clienttimereference + servertimereference;
																		iosocket.emit('updatecardposition', decks[topframe.deckid][card].deckid, decks[topframe.deckid][card].cardid, decks[topframe.deckid][card].x, decks[topframe.deckid][card].y, decks[topframe.deckid][card].angle, decks[topframe.deckid][card].faceup, decks[topframe.deckid][card].timestamp);
																	}
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
									var tempframe = {};
									for (var j = 0; j < relevantdata_card.length; j++) {
										tempframe[relevantdata_card[j]] = current.value[relevantdata_card[j]];
									}
									iosocket.emit('pushcard', tempframe);
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
													currentcardlist = new LinkedList();
													for (var card in decks[topframe.deckid]) {
														currentcardlist.addToTail(decks[topframe.deckid][card]);
													}
													changescalefunction();
												}
								   };

					if (topframe.cardbordercolor === "transparent")
						thismenu.items.carddecksubmenu.items["transparentbordertoggle"] = {"name": "Border: Transparent", "callback": function(itemKey, opt){
																if (topframe.cardbordercolor === "transparent") {
																	for (var card in decks[topframe.deckid]) {
																		decks[topframe.deckid][card].cardbordercolor = "white";
																		decks[topframe.deckid][card].backgroundback = decks[topframe.deckid][card].backgroundback0;
																		decks[topframe.deckid][card].thisdiv.style.borderColor = decks[topframe.deckid][card].cardbordercolor;
																		if (!decks[topframe.deckid][card].faceup) {
																			decks[topframe.deckid][card].thisdiv.style.background = decks[topframe.deckid][card].backgroundback;
																		}
																	}
																	opt.items.carddecksubmenu.items[itemKey].$node[0].innerHTML = "<span>Border: White</span>";
																} else {
																	for (var card in decks[topframe.deckid]) {
																		decks[topframe.deckid][card].cardbordercolor = "transparent";
																		decks[topframe.deckid][card].backgroundback = "transparent";
																		decks[topframe.deckid][card].thisdiv.style.borderColor = decks[topframe.deckid][card].cardbordercolor;
																		if (!decks[topframe.deckid][card].faceup) {
																			decks[topframe.deckid][card].thisdiv.style.background = decks[topframe.deckid][card].backgroundback;
																		}
																	}
																	opt.items.carddecksubmenu.items[itemKey].$node[0].innerHTML = "<span>Border: Transparent</span>";
																}
																return false;}};
					else
						thismenu.items.carddecksubmenu.items["transparentbordertoggle"] = {"name": "Border: White", "callback": function(itemKey, opt){
																if (topframe.cardbordercolor === "transparent") {
																	for (var card in decks[topframe.deckid]) {
																		decks[topframe.deckid][card].cardbordercolor = "white";
																		decks[topframe.deckid][card].backgroundback = decks[topframe.deckid][card].backgroundback0;
																		decks[topframe.deckid][card].thisdiv.style.borderColor = decks[topframe.deckid][card].cardbordercolor;
																		if (!decks[topframe.deckid][card].faceup) {
																			decks[topframe.deckid][card].thisdiv.style.background = decks[topframe.deckid][card].backgroundback;
																		}
			
																	}
																	opt.items.carddecksubmenu.items[itemKey].$node[0].innerHTML = "<span>Border: White</span>";
																} else {
																	for (var card in decks[topframe.deckid]) {
																		decks[topframe.deckid][card].cardbordercolor = "transparent";
																		decks[topframe.deckid][card].backgroundback = "transparent";
																		decks[topframe.deckid][card].thisdiv.style.borderColor = decks[topframe.deckid][card].cardbordercolor;
																		if (!decks[topframe.deckid][card].faceup) {
																			decks[topframe.deckid][card].thisdiv.style.background = decks[topframe.deckid][card].backgroundback;
																		}
																	}
																	opt.items.carddecksubmenu.items[itemKey].$node[0].innerHTML = "<span>Border: Transparent</span>";
																}
																return false;}};								   
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
																for (var card in decks[topframe.deckid]) {
																	decks[topframe.deckid][card].x = topframe.x;
																	decks[topframe.deckid][card].y = topframe.y;
																	decks[topframe.deckid][card].setdisplayposition();
																	decks[topframe.deckid][card].timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', decks[topframe.deckid][card].deckid, decks[topframe.deckid][card].cardid, decks[topframe.deckid][card].x, decks[topframe.deckid][card].y, decks[topframe.deckid][card].angle, decks[topframe.deckid][card].faceup, decks[topframe.deckid][card].timestamp);
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
																for (var card in decks[topframe.deckid]) {
																	decks[topframe.deckid][card].touchedthis = false;
																}
																var sortedlist = new LinkedList();
																for (var i = 0; i < Object.keys(decks[topframe.deckid]).length; i++) {
																	var currentlowest = null;
																	for (var card in decks[topframe.deckid]) {
																		if (currentlowest) {
																			if (!decks[topframe.deckid][card].touchedthis) {
																				if (currentlowest.zIndex > decks[topframe.deckid][card].zIndex) {
																					currentlowest = decks[topframe.deckid][card];
																				}
																			}
																		} else {
																			if (!decks[topframe.deckid][card].touchedthis) {
																				currentlowest = decks[topframe.deckid][card];
																			}
																		}
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
																	current.value.x = refx + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/Object.keys(decks[topframe.deckid]).length;
																	current.value.y = refy + i*Math.min(sortedlist.head.value.width, sortedlist.head.value.height)/Object.keys(decks[topframe.deckid]).length;
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
																	if (decks[parseInt(newid)]) {
																		alert("New ID already in use.");
																		return;
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
																for (var card in decks[topframe.deckid]) {
																	shufflelist.push(topframe.deckid + "." + decks[topframe.deckid][card].cardid);
																}
																iosocket.emit('reqshuffle', shufflelist);
															}
														};
														
					/*var deletefunction = function(itemKey, opt) {
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
								   };*/	
					thismenu.items.carddecksubmenu.items["preparedeck"] = {"name": "Prepare", "callback": function(itemKey, opt){
																// Drop
																iosocket.emit('reqforcediscard');
																
																// Face Down
																var currentdate = new Date();
																var currenttime = currentdate.getTime();
																for (var card in decks[topframe.deckid]) {
																	if (decks[topframe.deckid][card].faceup) { 
																		decks[topframe.deckid][card].turncard();
																	}
																}
																
																// Collect
																for (var card in decks[topframe.deckid]) {
																	decks[topframe.deckid][card].angle = 0;
																	decks[topframe.deckid][card].thisdiv.style.transform = "rotate("+decks[topframe.deckid][card].angle+"deg)";
																	decks[topframe.deckid][card].x = topframe.x;
																	decks[topframe.deckid][card].y = topframe.y;
																	decks[topframe.deckid][card].setdisplayposition();
																	decks[topframe.deckid][card].timestamp = currenttime - clienttimereference + servertimereference;
																	iosocket.emit('updatecardposition', decks[topframe.deckid][card].deckid, decks[topframe.deckid][card].cardid, decks[topframe.deckid][card].x, decks[topframe.deckid][card].y, decks[topframe.deckid][card].angle, decks[topframe.deckid][card].faceup, decks[topframe.deckid][card].timestamp);
																}
																
																// Shuffle
																var shufflelist = [];
																for (var card in decks[topframe.deckid]) {
																	shufflelist.push(topframe.deckid + "." + decks[topframe.deckid][card].cardid);
																}
																iosocket.emit('reqshuffle', shufflelist);
															}
														};
					thismenu.items.carddecksubmenu.items["pushdeletethisdeck"] = {"name": "Delete", "callback": function(itemKey, opt){
													var r = confirm("Deleting deck of cards.. Continue?");
													if (r) {
														iosocket.emit('pushdeletedeck', topframe.deckid);
													}
												}
								   };
																	
				}
				
				
			}
		if (player === 0){ // && !topframe) {
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
												var newoption = prompt("Current settings: " + gameoptions.join(' ') + "; supported yahtzee, notes, d<deckid>dragtotop, d<deckid>randomizeangles, d<deckid>cardturnangleinc<intValue>, ...", "");
												if (newoption) {
													var newoptions = newoption.split(" ");
													for (var i = 0; i < newoptions.length; i++) {
														
														if (newoptions[i].includes("cardturnangleinc")) { // expected format d<deckid>cardturnangleinc<intValue>
															var optioninfo = newoptions[i].split("cardturnangleinc");
															var somedeckid = parseInt(optioninfo[0].substr(1));
															if (!isNaN(somedeckid)) {
																var newcardturnangleinc = parseInt(optioninfo[1]);
																if (!isNaN(newcardturnangleinc)) {
																	cardturnangleinc[somedeckid] = newcardturnangleinc;
																} else {
																	alert("Option '" + newoptions[i] + "' invalid format; expected: d<deckid>cardturnangleinc<intValue>");
																	continue;
																}
															} else {
																alert("Option '" + newoptions[i] + "' invalid format; expected: d<deckid>cardturnangleinc<intValue>");
																continue;
															}
														}
														
														iosocket.emit('gameoptions_add', newoptions[i]);
													}
												}
											}
							   };
				thismenu.items.gameoptionsubmenu.items["removeoption"] = {"name": "Remove Option", "callback": function(itemKey, opt){
												var oldoption = prompt("Current settings: " + gameoptions.join(' '), gameoptions.join(' '));
												if (oldoption) {
													var oldoptions = oldoption.split(" ");
													for (var i = 0; i < oldoptions.length; i++) {
														iosocket.emit('gameoptions_remove', oldoptions[i]);
													}
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
														
				thismenu.items.gameoptionsubmenu.items["setcamera"] = {"name": "Set This Camera", "callback": function(itemKey, opt){
												var camxcenter = cameraposx + 0.5 * window.innerWidth;
												var camycenter = cameraposy + 0.5 * window.innerHeight;
												iosocket.emit('camera_set', camxcenter, camycenter, zoomvalue);
											}
							   };
				thismenu.items.gameoptionsubmenu.items["unsetcamera"] = {"name": "Unset Camera", "callback": function(itemKey, opt){
												iosocket.emit('camera_unset');
											}
							   };
				thismenu.items.gameoptionsubmenu.items["changetokensizeall"] = {"name": "Set Global Token Size", "callback": function(itemKey, opt){
												var newsize = prompt("Enter Size.", 100);
												if (newsize) {
													if (!isNaN(parseInt(newsize)) && parseInt(newsize) > 0) {
														newsize = parseInt(newsize);
														for (var tokenframe in tokenframes) {
															tokenframes[tokenframe].size = newsize;
															tokenframes[tokenframe].redraw();
															tokenframes[tokenframe].thiscanvas.style.width = tokenframes[tokenframe].size + "px";
															tokenframes[tokenframe].thiscanvas.style.height = tokenframes[tokenframe].size + "px";
															tokenframes[tokenframe].setdisplayposition();
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
														for (var imageframe in imageframes) {
															for (var marker in imageframes[imageframe]["marker"]) {
																imageframes[imageframe]["marker"][marker].size = newsize;
																imageframes[imageframe]["marker"][marker].thisimg.style.width = zoomvalue*imageframes[imageframe]["marker"][marker].scale*imageframes[imageframe]["marker"][marker].size + "px";
																imageframes[imageframe]["marker"][marker].thisimg.style.height = zoomvalue*imageframes[imageframe]["marker"][marker].scale*imageframes[imageframe]["marker"][marker].size + "px";
																imageframes[imageframe]["marker"][marker].setpositionandscale();
															}
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
												var currenttime = currentdate.getTime();
												// make dummy to avoid sending self referencing object
												
												for (var imageframe in imageframes) {
													var tempframe = {};
													imageframes[imageframe].timestamp = currenttime - clienttimereference + servertimereference;
													for (var j = 0; j < relevantdata_imageframe.length; j++) {
														tempframe[relevantdata_imageframe[j]] = imageframes[imageframe][relevantdata_imageframe[j]];
													}
													var tempmarkers = {};
													for (var marker in imageframes[imageframe]["marker"]) {
														var tempmarker = {};
														for (var k = 0; k < relevantdata_markerframe.length; k++) {
															tempmarker[relevantdata_markerframe[k]] = imageframes[imageframe]["marker"][marker][relevantdata_markerframe[k]];
														}
														tempmarkers[marker] = tempmarker;
													}
													var templabels = {};
													for (var label in imageframes[imageframe]["label"]) {
														var templabel = {};
														for (var k = 0; k < relevantdata_framelabel.length; k++) {
															templabel[relevantdata_framelabel[k]] = imageframes[imageframe]["label"][label][relevantdata_framelabel[k]];
														}
														templabels[label] = templabel;
													}
													iosocket.emit('pushimage', tempframe, tempmarkers, templabels);
												}
												for (var tokenframe in tokenframes) {
													var tempframe = {};
													tokenframes[tokenframe].timestamp = currenttime - clienttimereference + servertimereference;
													for (var j = 0; j < relevantdata_tokenframe.length; j++) {
														tempframe[relevantdata_tokenframe[j]] = tokenframes[tokenframe][relevantdata_tokenframe[j]];
													}
													iosocket.emit('pushtoken', tempframe);
												}
												for (var deck in decks) {
													for (var card in decks[deck]) {
														var tempframe = {};
														decks[deck][card].timestamp = currenttime - clienttimereference + servertimereference;
														for (var j = 0; j < relevantdata_card.length; j++) {
															tempframe[relevantdata_card[j]] = decks[deck][card][relevantdata_card[j]];
														}
														iosocket.emit('pushcard', tempframe);
													}
												}
												for (var canvasframe in canvasframes) {
													var tempframe = {};
													canvasframes[canvasframe].timestamp = currenttime - clienttimereference + servertimereference;
													canvasframes[canvasframe].getJSON();
													for (var j = 0; j < relevantdata_canvasframe.length; j++) {
														tempframe[relevantdata_canvasframe[j]] = canvasframes[canvasframe][relevantdata_canvasframe[j]];
													}
													iosocket.emit('pushcanvas', tempframe);
												}
												for (var lotteryframe in lotteryframes) {
													var tempframe = {};
													lotteryframes[lotteryframe].timestamp = currenttime - clienttimereference + servertimereference;
													for (var j = 0; j < relevantdata_lotteryframe.length; j++) {
														tempframe[relevantdata_lotteryframe[j]] = lotteryframes[lotteryframe][relevantdata_lotteryframe[j]];
													}
													iosocket.emit('pushlottery', tempframe);
												}
												for (var publicdieframe in publicdieframes) {
													var tempframe = {};
													publicdieframes[publicdieframe].timestamp = currenttime - clienttimereference + servertimereference;
													for (var j = 0; j < relevantdata_publicdieframe.length; j++) {
														tempframe[relevantdata_publicdieframe[j]] = publicdieframes[publicdieframe][relevantdata_publicdieframe[j]];
													}
													iosocket.emit('pushpublicdie', tempframe);
												}
											}
							   };
				thismenu.items["fdiscardall"] = {"name": "Force Discard All", "callback": function(itemKey, opt){
												iosocket.emit('reqforcediscard');
											}
							   };
				thismenu.items["sep4"] = "---------";
				thismenu.items["copyserveraddress"] = {"name": "Copy Server Address", "callback": function(itemKey, opt){
												var textArea = document.createElement("textarea");
												console.log(serveraddress);
												textArea.value = serveraddress;

												// Avoid scrolling to bottom
												textArea.style.top = "0";
												textArea.style.left = "0";
												textArea.style.position = "fixed";
												textArea.style.border = 'none';
												textArea.style.outline = 'none';
												textArea.style.boxShadow = 'none';
												textArea.style.background = 'transparent';
												//textArea.style.visibility = "hidden";

												document.body.appendChild(textArea);
												textArea.focus();
												textArea.select();
												try {
													var successful = document.execCommand('copy');
													if (successful) 
														addsomethingtolog('Server address ' + serveraddress + ' copied to clipboard.');
													else
														addsomethingtolog('Server address: ' + serveraddress + '; copy to clipboard not supported.');
												} catch (err) {
													addsomethingtolog('Server address: ' + serveraddress + '; copy to clipboard not supported.');
												}
												document.body.removeChild(textArea);
											}
							   };
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
													document.getElementById("fileinputdialog").value = null;
												};
											}
							   };
				thismenu.items["restoreall"] = {"name": "Restore All", "callback": function(itemKey, opt){
												for (var imageframe in imageframes) {
													iosocket.emit('requestrestoreimage', imageframe);
												}
												for (var tokenframe in tokenframes) {
													iosocket.emit('requestrestoretoken', tokenframe);
												}
												for (var canvasframe in canvasframes) {
													iosocket.emit('requestrestorecanvas', canvasframe);
												}
												for (var deck in decks) {
													for (var card in decks[deck]) {
														iosocket.emit('requestrestorecard', deck, card);
													}
												}
											}
							   };
				thismenu.items["deleteall"] = {"name": "Delete All", "callback": function(itemKey, opt){
												var r = confirm("Everything will be removed. Continue?");
												if (r) {
													for (var imageframe in imageframes) {
														iosocket.emit('pushdeleteimage', imageframe);
													}
													for (var tokenframe in tokenframes) {
														iosocket.emit('pushdeletetoken', tokenframe);
													}
													for (var canvasframe in canvasframes) {
														iosocket.emit('pushdeletecanvas', canvasframe);
													}
													for (var deck in decks) {
														for (var card in decks[deck]) {
															iosocket.emit('pushdeletecard', deck, card);
														}
													}
													for (var lotteryframe in lotteryframes) {
														iosocket.emit('pushdeletelottery', lotteryframe);
													}
													for (var publicdieframe in publicdieframes) {
														iosocket.emit('pushdeletepublicdie', publicdieframe);
													}
													var toberemoved = gameoptions;
													for (var i = 0; i < toberemoved.length; i++) {
														iosocket.emit('gameoptions_remove', toberemoved[i]);
													}
													for (var i = 0; i < playernames.length; i++) {
														iosocket.emit('submitplayernotes', i, "");
													}
													iosocket.emit('requeststopsound');
												}
											}
							   };
						
			}
			thismenu.items["sep6"] = "---------";
			thismenu.items["logout"] = {"name": "Return to Login", "callback": function(itemKey, opt){
										// discard all cards
										for (var deck in decks) {
											for (var card in decks[deck]) {
												decks[deck][card].discard();
											}
										}
										document.getElementById("gamedivloginoverlay").style.zIndex = zcounter + 100;
										document.getElementById("logindialogdiv").style.zIndex = zcounter + 110;
										document.getElementById("gamedivloginoverlay").style.visibility = "";
										document.getElementById("logindialogdiv").style.visibility = "";
										var charoptions2 = document.getElementById("characterselect");
										charoptions2.selectedIndex = Math.min(charoptions2.options.length-1, Math.max(0, player));
										
										editingnotes = false;
										notesdiv_textdisplaydiv.style.visibility = "";
										notesdiv_textinputdiv.style.visibility = "hidden";
										notesdiv_textdisplaydiv.innerHTML = currentnotes[currentnoteedit];
										notesdiv_textdisplaydiv.innerHTML = "";
										notesdiv_textinput.value = "";
										iosocket.emit('userlogout');
									}
						   };
			
			return thismenu;
			}
	}); 
	
})

function repositiongamedivelements() {
	for (var imageframe in imageframes) {
		imageframes[imageframe].setdisplayposition();
	}
	for (var tokenframe in tokenframes) {
		tokenframes[tokenframe].setdisplayposition();
	}
	for (var deck in decks) {
		for (var card in decks[deck]) {
			decks[deck][card].setdisplayposition();
		}
	}
	for (var canvasframe in canvasframes) {
		canvasframes[canvasframe].setdisplayposition();
	}
	for (var lotteryframe in lotteryframes) {
		lotteryframes[lotteryframe].setdisplayposition();
	}
	for (var publicdieframe in publicdieframes) {
		publicdieframes[publicdieframe].setdisplayposition();
	}
}

function rescalegamedivelements() {
	for (var imageframe in imageframes) {
		imageframes[imageframe].setdisplayscale();
	}
	for (var deck in decks) {
		for (var card in decks[deck]) {
			decks[deck][card].setdisplayscale();
		}
	}
	for (var canvasframe in canvasframes) {
		canvasframes[canvasframe].setdisplayscale();
	}
	for (var lotteryframe in lotteryframes) {
		lotteryframes[lotteryframe].setdisplayscale();
	}
	for (var publicdieframe in publicdieframes) {
		publicdieframes[publicdieframe].setdisplayscale();
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
	if (Object.keys(imageframes).length > 0) {
		minzforimages = imageframes[Object.keys(imageframes)[0]].zIndex;
		maxzforimages = imageframes[Object.keys(imageframes)[0]].zIndex;
		for (var imageframe in imageframes) {
			minzforimages = Math.min(imageframes[imageframe].zIndex, minzforimages);
			maxzforimages = Math.max(imageframes[imageframe].zIndex, maxzforimages);
		}
	}
	var minzforcanvas = 0;
	var maxzforcanvas = 0;
	if (Object.keys(canvasframes).length > 0) {
		minzforcanvas = canvasframes[Object.keys(canvasframes)[0]].zIndex;
		maxzforcanvas = canvasframes[Object.keys(canvasframes)[0]].zIndex;
		current = canvasframes.head;
		for (var canvasframe in canvasframes) {
			minzforcanvas = Math.min(canvasframes[canvasframe].zIndex, minzforcanvas);
			maxzforcanvas = Math.max(canvasframes[canvasframe].zIndex, maxzforcanvas);
		}
	}
	var minzfortokens = 0;
	var maxzfortokens = 0;
	if (Object.keys(tokenframes).length > 0) {
		minzfortokens = tokenframes[Object.keys(tokenframes)[0]].zIndex;
		maxzfortokens = tokenframes[Object.keys(tokenframes)[0]].zIndex;
		for (var tokenframe in tokenframes) {
			minzfortokens = Math.min(tokenframes[tokenframe].zIndex, minzforimages);
			maxzfortokens = Math.max(tokenframes[tokenframe].zIndex, maxzforimages);
		}
	}
	var minzforlottery = 0;
	var maxzforlottery = 0;
	if (Object.keys(lotteryframes).length > 0) {
		minzforlottery = lotteryframes[Object.keys(lotteryframes)[0]].zIndex;
		maxzforlottery = lotteryframes[Object.keys(lotteryframes)[0]].zIndex;
		for (var lotteryframe in lotteryframes) {
			minzforlottery = Math.min(lotteryframes[lotteryframe].zIndex, minzforlottery);
			maxzforlottery = Math.max(lotteryframes[lotteryframe].zIndex, maxzforlottery);
		}
	}
	var minzforpublicdie = 0;
	var maxzforpublicdie = 0;
	if (Object.keys(publicdieframes).length > 0) {
		minzforpublicdie = publicdieframes[Object.keys(publicdieframes)[0]].zIndex;
		maxzforpublicdie = publicdieframes[Object.keys(publicdieframes)[0]].zIndex;
		for (var publicdieframe in publicdieframes) {
			minzforpublicdie = Math.min(publicdieframes[publicdieframe].zIndex, minzforpublicdie);
			maxzforpublicdie = Math.max(publicdieframes[publicdieframe].zIndex, maxzforpublicdie);
		}
	}
	zcounter = Math.max(Math.max(Math.max(Math.max(maxzforpublicdie, maxzforlottery), maxzforcanvas), maxzforimages), maxzfortokens) + 1;
	
	var zcounter2 = 0;
	if (Object.keys(tokenframes).length > 0 && player > 0) {
		for (var tokenframe in tokenframes) {
			if (tokenframes[tokenframe].owner.includes(player)) tokenframes[tokenframe].thisdiv.style.zIndex = zcounter + zcounter2++;
		}
	}
	for (var dieframe in dieframes) {
		dieframes[dieframe].thisdiv.style.zIndex = zcounter + zcounter2++;
	}
	
	logdivlist.parentNode.style.zIndex = zcounter + zcounter2++;
	notesdiv.style.zIndex = zcounter + zcounter2++;
	
	for (var canvasframe in canvasframes) {
		if (canvasframes[canvasframe].drawingmode !== "") {
			canvasframes[canvasframe].thisdiv.style.zIndex = zcounter + zcounter2++;
			canvasframes[canvasframe].controlsdiv.style.zIndex = zcounter + zcounter2++;
		}
	}
}

function adjustzIndices() {
	
	var fulllist = new LinkedList();
	
	// process imageframes
	var imageandcanvasframes = new LinkedList();
	for (var imageframe in imageframes) {
		imageframes[imageframe].touchedthis = false;
		imageandcanvasframes.addToTail(imageframes[imageframe]);
	}
	for (var canvasframe in canvasframes) {
		canvasframes[canvasframe].touchedthis = false;
		imageandcanvasframes.addToTail(canvasframes[canvasframe]);
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
	for (var deck in decks) {
		decks[deck][Object.keys(decks[deck])[0]].touchedthis = false;
	}
	for (var i = 0; i < Object.keys(decks).length; i++) {
		var currenttarget = null;
		for (var deck in decks) {
			if (currenttarget) {
				if (!decks[deck][Object.keys(decks[deck])[0]].touchedthis) {
					if (decks[deck][Object.keys(decks[deck])[0]].deckid < currenttarget.deckid) {
						currenttarget = decks[deck];
					}	
				}
			} else if (!decks[deck][Object.keys(decks[deck])[0]].touchedthis) {
				currenttarget = decks[deck];
			}
		}
		currenttarget[Object.keys(currenttarget)[0]].touchedthis = true;
		fulldecklist.addToTail(currenttarget);
	}
	// now add cards in raising order deck after deck
	var currentdeck = fulldecklist.head;
	for (var i = 0; i < fulldecklist.length; i++) {
		var deck = currentdeck.value[Object.keys(currentdeck.value)[0]].deckid;
		for (var card in decks[deck]) {
			decks[deck][card].touchedthis = false;
		}
		for (var j = 0; j < Object.keys(decks[deck]).length; j++) {
			var currenttarget = null;
			for (var card in decks[deck]) {
				if (currenttarget) {
					if (!decks[deck][card].touchedthis) {
						if (decks[deck][card].zIndex < currenttarget.zIndex) {
							currenttarget = decks[deck][card];
						}	
					}
				} else if (!decks[deck][card].touchedthis) {
					currenttarget = decks[deck][card];
				}
			}
			currenttarget.touchedthis = true;
			fulllist.addToTail(currenttarget);
		}
		currentdeck = currentdeck.next;
	}
	
	// process lotteryframes
	for (var lotteryframe in lotteryframes) {
		lotteryframes[lotteryframe].touchedthis = false;
	}
	for (var i = 0; i < Object.keys(lotteryframes).length; i++) {
		var currenttarget = null;
		for (var lotteryframe in lotteryframes) {
			if (currenttarget) { // this ifelse is needed for the case of identical zIndices
				if (!lotteryframes[lotteryframe].touchedthis) {
					if (lotteryframes[lotteryframe].zIndex < currenttarget.zIndex) {
						currenttarget = lotteryframes[lotteryframe];
					}	
				}
			} else if (!lotteryframes[lotteryframe].touchedthis) {
				currenttarget = lotteryframes[lotteryframe];
			}
		}
		currenttarget.touchedthis = true;
		fulllist.addToTail(currenttarget);
	}
	
	// process tokenframes
	for (var tokenframe in tokenframes) {
		tokenframes[tokenframe].touchedthis = false;
	}
	for (var i = 0; i < Object.keys(tokenframes).length; i++) {
		var currenttarget = null;
		for (var tokenframe in tokenframes) {
			if (currenttarget) { // this ifelse is needed for the case of identical zIndices
				if (!tokenframes[tokenframe].touchedthis) {
					if (tokenframes[tokenframe].zIndex < currenttarget.zIndex) {
						currenttarget = tokenframes[tokenframe];
					}	
				}
			} else if (!tokenframes[tokenframe].touchedthis) {
				currenttarget = tokenframes[tokenframe];
			}
		}
		currenttarget.touchedthis = true;
		fulllist.addToTail(currenttarget);
	}
	
	// process dieframes
	for (var publicdieframe in publicdieframes) {
		publicdieframes[publicdieframe].touchedthis = false;
	}
	for (var i = 0; i < Object.keys(publicdieframes).length; i++) {
		var currenttarget = null;
		for (var publicdieframe in publicdieframes) {
			if (currenttarget) { // this ifelse is needed for the case of identical zIndices
				if (!publicdieframes[publicdieframe].touchedthis) {
					if (publicdieframes[publicdieframe].zIndex < currenttarget.zIndex) {
						currenttarget = publicdieframes[publicdieframe];
					}	
				}
			} else if (!publicdieframes[publicdieframe].touchedthis) {
				currenttarget = publicdieframes[publicdieframe];
			}
		}
		currenttarget.touchedthis = true;
		fulllist.addToTail(currenttarget);
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


function pancamera(startx, starty, startzoom, endx, endy, endzoom, duration) {
    var elapsedtime = 0;
    var timer = setInterval(function () {
        if (elapsedtime >= duration){
            clearInterval(timer);
	  cameraposx = endx;
	  cameraposy = endy;
	  zoomvalue = endzoom;
	  rescalegamedivelements();
	  repositiongamedivelements();
        }
          elapsedtime += 16;
	cameraposx = startx + (endx - startx)/duration*elapsedtime;
	cameraposy = starty + (endy - starty)/duration*elapsedtime;
	zoomvalue = startzoom + (endzoom - startzoom)/duration*elapsedtime;
	rescalegamedivelements();
	repositiongamedivelements();
    }, 16);
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
	if (somegameoptions.length > 0) {
		for (var i = 0; i < somegameoptions.length; i++) {
			iosocket.emit('gameoptions_add', somegameoptions[i]);
		}
		console.log('added game settings:', somegameoptions);
	}
	
	for (var i = 0; i < playernames.length; i++) {
		var somenote = xmlDoc.getElementsByTagName("playernote" + i)[0];
		if (somenote) {
			if (somenote.childNodes[0].nodeValue) {
				currentnotes[i] = somenote.childNodes[0].nodeValue.replace(/\r?\n/g, "").replace(/\t/g, "");
			} else {
				currentnotes[i] = "";
			}
			if (currentnoteedit === i) {
				notesdiv_textdisplaydiv.innerHTML = currentnotes[i];
				if (editingnotes) {
					notesdiv_textinput.value = currentnotes[i].replace(/<br>/g, '\n');
					notesdiv_textinput.focus();
				}
			}
			iosocket.emit('submitplayernotes', i, currentnotes[i]);
		}
	}
	
	for (var imageframe in imageframes) {
		idcounter = Math.max(idcounter, imageframes[imageframe].id + 1);
	}
	for (var tokenframe in tokenframes) {
		idcounter = Math.max(idcounter, tokenframes[tokenframe].id  + 1);
	}
	for (var canvasframe in canvasframes) {
		idcounter = Math.max(idcounter, canvasframes[canvasframe].id  + 1);
	}
	for (var lotteryframe in lotteryframes) {
		idcounter = Math.max(idcounter, lotteryframes[lotteryframe].id  + 1);
	}
	for (var publicdieframe in publicdieframes) {
		idcounter = Math.max(idcounter, publicdieframes[publicdieframe].id  + 1);
	}
	// do imageframes
	var someimageframes = xmlDoc.getElementsByTagName("imageframe");
	for (var i = 0; i < someimageframes.length; i++) {
		var tempframe = {};
		var tempframemarkers = {};
		var tempframelabels = {};
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
				tempframemarkers[tempmarker.id] = tempmarker;
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
				tempframelabels[templabel.id] = templabel;
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
		imageframes[tempframe["id"]] = new FrameContainer(tempframe["id"], gamediv, 0, 0);
		imageframes[tempframe["id"]].loadproperties2(tempframe, tempframemarkers, tempframelabels);
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
		tokenframes[temptoken["id"]] = new TokenContainer(temptoken["id"], gamediv, 0, 0);
		tokenframes[temptoken["id"]].loadproperties2(temptoken);
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
		canvasframes[tempcanvas["id"]] = new CanvasFrameContainer(tempcanvas["id"], gamediv, 0, 0, tempcanvas["width"], tempcanvas["height"]);
		canvasframes[tempcanvas["id"]].loadproperties2(tempcanvas);
		canvasframes[tempcanvas["id"]].resethistory();
	}
	var somelotteryframes = xmlDoc.getElementsByTagName("lotteryframe");
	for (var i = 0; i < somelotteryframes.length; i++) {
		var templottery = {};
		for (var j = 0; j < somelotteryframes[i].childNodes.length; j++) {
			if (somelotteryframes[i].childNodes[j].nodeName == "#text") continue;
			if (somelotteryframes[i].childNodes[j].firstChild) {
				templottery[somelotteryframes[i].childNodes[j].nodeName] = parsesomething(relevantdata_lotteryframe_types[somelotteryframes[i].childNodes[j].nodeName], somelotteryframes[i].childNodes[j].firstChild.nodeValue);
			} else {
				templottery[somelotteryframes[i].childNodes[j].nodeName] = "";
			}
		}
		templottery["id"] = idcounter++;
		var currentdate = new Date();
		templottery["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		lotteryframes[templottery["id"]] = new LotteryFrame(templottery["id"], gamediv, 0, 0, templottery["options"]);
		lotteryframes[templottery["id"]].loadproperties2(templottery);
	}
	var somecards = xmlDoc.getElementsByTagName("card");
	var deckmappings = {};
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
		if (!deckmappings[tempcard.deckid]) {
			// if deckid already taken, select next to largest for new deck; keep track of this via deckmappings
			if (decks[tempcard.deckid]) {
				var smallestdeckid = 0;
				for (var deck in decks) {
					smallestdeckid = Math.max(smallestdeckid, decks[deck][Object.keys(decks[deck])[0]].deckid);
				}
				deckmappings[tempcard.deckid] = smallestdeckid + 1;
				decks[deckmappings[tempcard.deckid]] = {};
			} else {
			// otherwise use deckid, select next to largest for new deck; keep track of this via deckmappings
				deckmappings[tempcard.deckid] = tempcard.deckid;
				decks[tempcard.deckid] = {};
			}
		}
		decks[deckmappings[tempcard.deckid]][tempcard.cardid] = new Card(deckmappings[tempcard.deckid], tempcard.cardid, decks[deckmappings[tempcard.deckid]], gamediv, tempcard.x, tempcard.y, tempcard.width, tempcard.height, tempcard.filenamefront, tempcard.filenameback);
		var currentdate = new Date();
		tempcard["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		decks[deckmappings[tempcard.deckid]][tempcard.cardid].loadproperties2(tempcard);
		decks[deckmappings[tempcard.deckid]][tempcard.cardid].deckid = deckmappings[tempcard.deckid];
	}
	var somedieframes = xmlDoc.getElementsByTagName("dieframe");
	for (var i = 0; i < somedieframes.length; i++) {
		var tempdie = {};
		for (var j = 0; j < somedieframes[i].childNodes.length; j++) {
			if (somedieframes[i].childNodes[j].nodeName == "#text") continue;
			if (somedieframes[i].childNodes[j].firstChild) {
				tempdie[somedieframes[i].childNodes[j].nodeName] = parsesomething(relevantdata_publicdieframe_types[somedieframes[i].childNodes[j].nodeName], somedieframes[i].childNodes[j].firstChild.nodeValue);
			} else {
				tempdie[somedieframes[i].childNodes[j].nodeName] = "";
			}
		}
		tempdie["id"] = idcounter++;
		var currentdate = new Date();
		tempdie["timestamp"] = currentdate.getTime() - clienttimereference + servertimereference;
		publicdieframes[tempdie["id"]] = new PublicDie(tempdie["id"], gamediv, tempdie.x, tempdie.y, tempdie.size, tempdie.maxvalue, tempdie.filenamebase, tempdie.filenametype);
		publicdieframes[tempdie["id"]].loadproperties2(tempdie);
	}
}

function nextid() {
	for (var imageframe in imageframes) {
		idcounter = Math.max(idcounter, imageframes[imageframe].id + 1);
	}
	for (var tokenframe in tokenframes) {
		idcounter = Math.max(idcounter, tokenframes[tokenframe].id  + 1);
	}
	for (var canvasframe in canvasframes) {
		idcounter = Math.max(idcounter, canvasframes[canvasframe].id  + 1);
	}
	for (var lotteryframe in lotteryframes) {
		idcounter = Math.max(idcounter, lotteryframes[lotteryframe].id  + 1);
	}
	for (var publicdieframe in publicdieframes) {
		idcounter = Math.max(idcounter, publicdieframes[publicdieframe].id  + 1);
	}
	return idcounter++;
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
	case "stringarray":
	  return somevalue.split(',');
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

