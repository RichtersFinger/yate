
const SoundboardTypes = {"file":1, "TTS":2};

class Soundboard {
	constructor(someid, parentdiv, x0, y0, title) {
		this.id = someid;
		this.owner = [0]; // who can see this
		this.timestamp = -1;

		this.tablecounter = 0;
		this.labels = {};
		this.filepaths = {};
		this.pitches = {};
		this.rates = {};
		this.soundtypes = {}; // file or TTS
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;

		this.what = ContainerTypes.Soundboard;

		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.classList.add("noselect");
		this.thiscontentdiv = document.createElement('div');
		this.thiscontentdiv.style.maxHeight = 0.75 * window.innerHeight + "px";
		this.thiscontentdiv.style.overflowY = "auto";
		this.thiscontentdiv.style.overflowX = "hidden";
		this.thisdiv.appendChild(this.thiscontentdiv);
		this.thistitle = document.createElement('label');
		this.thistitle.style.background = "rgba(0,0,0,0.4)";
		this.thistitle.style.fontSize = 23 + "px";
		this.thisdiv.style.fontFamily = "Arial";
		this.thistitle.style.color = "#ffffff";
		this.thistitle.style.padding = "5px";
		this.thistitle.style.float = "left";
		this.thistitle.style.width = "100%";
		this.thistitletext = title;
		this.thistitle.innerHTML = this.thistitletext.bold();
		this.thistitle.classList.add("noselect");
		this.thiscontentdiv.appendChild(this.thistitle);
		this.thiscontentdiv.appendChild(document.createElement('br'));
		this.thistable = document.createElement('table');
		this.thiscontentdiv.appendChild(this.thistable);

		this.thisdiv.addEventListener('mousedown', e => {
			this.thisdiv.style.zIndex = zcounter++;
			if (e.target.nodeName != "BUTTON") { // && e.target.parentNode != this.thistitle
				lastmousedownframe = this;
				if (e.which === 3) lastmenuup = this;
			}
		});
		this.thisdiv.addEventListener('wheel', e => {
			lastwheelframe = this;
		});
		this.thistitle.addEventListener('dblclick', e => {
			if (player === 0) {
				if (e.target.parentNode === this.thistitle) {
					var msg = prompt("Enter soundboard name.", this.thistitletext);
					if (msg) {
						this.thistitletext = msg;
						this.thistitle.innerHTML = this.thistitletext.bold();
					}
				}
			}
		});

		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "white";
		this.backgroundcolorhighlight = "red";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.thiscontentdiv.style.background = "repeating-linear-gradient(-55deg, #444 0px, #444 10px, #555 10px, #555 50px)";

		this.displayx = x0;
		this.displayy = y0;
		this.thisdiv.style.left = this.displayx+"px";
		this.thisdiv.style.top = this.displayy+"px";
		this.thisdiv.style.padding = "0.2%";
		this.zIndex = zcounter++
		this.thisdiv.style.zIndex = this.zIndex;

		this.scale = 1.0;

		if (player === 0) this.addrowtoadd();
	}
	addrowtoadd() {
		var addbutton = document.createElement('button');
		addbutton.classList.add("fancybutton");
		addbutton.style.background = "#38e038";
		addbutton.style.backgroundImage = "url('img/_server_/addicon.png')";
		addbutton.style.backgroundSize = "20px";
		addbutton.style.backgroundRepeat = "no-repeat";
		addbutton.style.backgroundPosition = "center";
		addbutton.style.fontSize = "20px";
		addbutton.style.textAlign = "center";
		addbutton.style.width = "40px";
		addbutton.style.height = "40px";
		addbutton.style.padding = "0px 0px";
		var newfunction = (function (sbreference){
						return function(){
							sbreference.opencreationdialog();
						};
				}(this));
		addbutton.onclick = newfunction;
		var somerow = document.createElement('tr');
		var somecell = document.createElement('th');
		somecell.style.textAlign = "left";
		somecell.appendChild(addbutton);
		somerow.appendChild(somecell);
		this.thistable.appendChild(somerow);
  }
	addnewentry(sometype, somelabel, somefilename, somepitch, somerate) {
		var playbutton = document.createElement('button');
		playbutton.classList.add("fancybutton");
		playbutton.style.background = "#38e038";
		playbutton.style.backgroundImage = "url('img/_server_/playicon.png')";
		playbutton.style.backgroundSize = "30px";
		playbutton.style.backgroundRepeat = "no-repeat";
		playbutton.style.backgroundPosition = "center";
		playbutton.style.fontSize = "20px";
		playbutton.style.textAlign = "center";
		playbutton.style.width = "60px";
		playbutton.style.height = "40px";
		playbutton.style.padding = "0px 0px";
		playbutton.id = "sbbuttonid_" + this.id + "." + this.tablecounter;
		var playfunction = (function (sbreference){
						return function(){
							var thisid = this.id.substring(this.id.indexOf(".") + 1);
							iosocket.emit('requestsoundboardsound', sbreference.id, thisid);
						};
				}(this));
		playbutton.onclick = playfunction;
		var somerow = document.createElement('tr');
		var playcell = document.createElement('th');
		var labelcell = document.createElement('th');
		labelcell.id = "sblabelid_" + this.id + "." + this.tablecounter;
		labelcell.classList.add("noselect");
		labelcell.style.textAlign = "left";
		labelcell.style.color = "#ffffff";
		labelcell.innerHTML = somelabel;
		playcell.appendChild(playbutton);
		somerow.appendChild(labelcell);
		somerow.appendChild(playcell);
		if (player === 0) {
				var removebutton = document.createElement('button');
				removebutton.classList.add("fancybutton");
				removebutton.style.background = "#d13824";
				removebutton.style.backgroundImage = "url('img/_server_/reset.png')";
				removebutton.style.backgroundSize = "30px";
				removebutton.style.backgroundRepeat = "no-repeat";
				removebutton.style.backgroundPosition = "center";
				removebutton.style.fontSize = "20px";
				removebutton.style.textAlign = "center";
				removebutton.style.width = "40px";
				removebutton.style.height = "40px";
				removebutton.style.padding = "0px 0px";
				removebutton.id = "sbdelbuttonid_" + this.id + "." + this.tablecounter;
				var removefunction = (function (sbreference){
								return function(){
									var thisid = this.id.substring(this.id.indexOf(".") + 1);
									delete sbreference.soundtypes[thisid];
									delete sbreference.labels[thisid];
									delete sbreference.filepaths[thisid];
									delete sbreference.pitches[thisid];
									delete sbreference.rates[thisid];
									this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
								};
						}(this));
				removebutton.onclick = removefunction;
				var delcell = document.createElement('th');
				delcell.style.textAlign = "left";
				delcell.appendChild(removebutton);
				somerow.appendChild(delcell);
		}

		this.soundtypes[this.tablecounter] = sometype;
		this.labels[this.tablecounter] = somelabel;
		this.filepaths[this.tablecounter] = somefilename;
		this.pitches[this.tablecounter] = somepitch;
		this.rates[this.tablecounter] = somerate;
		this.removelast();
		this.thistable.appendChild(somerow);
		this.addrowtoadd();
		this.tablecounter++;
	}
	removelast() {
    this.thistable.deleteRow(this.thistable.rows.length - 1);
  }
	opencreationdialog() {
		loadingsound = true;

		soundboardadddivcontainer.style.visibility = "";
		soundboardadddivcontainer.style.zIndex = zcounter + 1;
		soundboardadddiv.style.zIndex = zcounter + 2;
		soundboardadddiv.style.left = document.body.clientWidth/2 - parseInt(soundboardadddiv.style.width.replace("px", ""))/2 + "px";
		soundboardadddiv.style.top = "0px";

		document.getElementById("soundboardadddiv_File_autocompleteinput").value = 'sound/';

		var sbapplyfunction = (function (sbreference){
						return function(){
							soundboardadddivcontainer.style.visibility = "hidden";
							soundboardadddiv.style.zIndex = 0;
							loadingsound = false;
							var thislabeltext = "", thisfilepath = "", thispitch = "", thisrate = "", thistype = "";
							if (document.getElementById("soundboardaddtablink_bFile").classList.contains("active")) {
								thistype = SoundboardTypes.file;
								thislabeltext = document.getElementById("soundboardadddiv_File_labelinput").value;
								thisfilepath = document.getElementById("soundboardadddiv_File_autocompleteinput").value;
								thispitch = 1.0;
								thisrate = 1.0;
							}
							if (document.getElementById("soundboardaddtablink_bTTS").classList.contains("active")) {
								thistype = SoundboardTypes.TTS;
								thislabeltext = document.getElementById("soundboardadddiv_TTS_labelinput").value;
								thisfilepath = document.getElementById("soundboardadddiv_TTS_textinput").value;
								thispitch = document.getElementById("soundboardadddiv_TTS_pitchinput").value;
								thisrate = document.getElementById("soundboardadddiv_TTS_rateinput").value;
							}
							sbreference.addnewentry(thistype, thislabeltext, thisfilepath, thispitch, thisrate);
						};
				}(this));
		document.getElementById("soundboardadd_bapply").onclick = sbapplyfunction;
		document.getElementById("soundboardadd_bcancel").onclick = function(){
			soundboardadddivcontainer.style.visibility = "hidden";
			soundboardadddiv.style.zIndex = 0;
			loadingsound = false;
		};
		document.getElementById("soundboardadddivcontainer").onmousedown = function(e){
			if (e.target === document.getElementById("soundboardadddivcontainer")) {
				soundboardadddivcontainer.style.visibility = "hidden";
				soundboardadddiv.style.zIndex = 0;
				loadingsound = false;
			}
		};
		document.getElementById("soundboardadddiv_File_btest").onclick = function(){
			if (audio_oneshot) audio_oneshot.src = '';
			audio_oneshot = new Audio(document.getElementById("soundboardadddiv_File_autocompleteinput").value);
			audio_oneshot.pause();
			audio_oneshot.volume = basevolume;
			audio_oneshot.play();
		};
		document.getElementById("soundboardadddiv_TTS_btest").onclick = function(){
			if (ttsvoice && document.getElementById("soundboardadddiv_TTS_textinput").value != "") {
				var msg = new SpeechSynthesisUtterance();
				msg.text = document.getElementById("soundboardadddiv_TTS_textinput").value;
				msg.pitch = document.getElementById("soundboardadddiv_TTS_pitchinput").value;
				msg.rate = document.getElementById("soundboardadddiv_TTS_rateinput").value;
				msg.volume = basevolume;
				msg.voice = ttsvoice;
				window.speechSynthesis.speak(msg);
			}
		};
		document.getElementById("soundboardadddiv_File_bupdate").onclick = function(){
			iosocket.emit('reqresourcelist_sound');
		};
	}
	loadproperties2(someframe) {
		for (var currentproperty in someframe) {
			if (currentproperty === "labels" || currentproperty === "filepaths" || currentproperty === "pitches" || currentproperty === "rates" || currentproperty === "soundtypes") continue;
			this[currentproperty] = someframe[currentproperty];
		}
		this.thistitle.innerHTML = this.thistitletext.bold();
		if (this.owner.includes(player)) {
			this.thisdiv.style.visibility = "visible";
		} else {
			if (player === 0) {
				this.thisdiv.style.visibility = "visible";
			} else {
				this.thisdiv.style.visibility = "hidden";
			}
		}
		// remove previous
		if (Object.keys(someframe["labels"]).length > 0) {
			var currentlength = this.thistable.rows.length;
			for (var i = 0; i < currentlength; i++) {
				this.removelast();
			}
			var tablecounter0 = this.tablecounter;
			for (var entry in someframe["labels"]) {
				this.tablecounter = parseInt(entry);
				// backwards compatibility:
				if (!someframe["pitches"][entry]) someframe["pitches"][entry] = 1.0;
				if (!someframe["rates"][entry]) someframe["rates"][entry] = 1.0;
				this.addnewentry(someframe["soundtypes"][entry], someframe["labels"][entry], someframe["filepaths"][entry], someframe["pitches"][entry], someframe["rates"][entry]);
			}
			this.tablecounter = tablecounter0;
		} else {
			if (player === 0 && this.thistable.rows.length === 0) {
				this.addrowtoadd();
			}
		}
	}
}
function opensoundboarddialog(e, theselection) {
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (var i = 0; i < tabcontent.length; i++) {
    if (tabcontent[i].parentNode === soundboardadddiv) tabcontent[i].style.display = "none";
  }

  var tablinks = document.getElementsByClassName("tablinks");
  for (var i = 0; i < tablinks.length; i++) {
    if (tabcontent[i].parentNode === soundboardadddiv) tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

	document.getElementById(theselection).style.display = "block";
  e.currentTarget.className += " active";
}
