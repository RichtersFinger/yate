var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
	  pingInterval: 25000,
	  pingTimeout: 60000
  });
const path = require('path');
const fs = require('fs');

const version = "1.6";

app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

app.use("/img", express.static('img'));
app.use('/favicon.ico', express.static('img/_server_/logo.ico'));

app.use("/data", express.static('data'));

app.use("/lib", express.static('lib'));

app.use("/sound", express.static('sound'));

var players = [];
var passwords = [];
var playersuserId = [];
var playersloggedin = [];

var playernotes = {};

const port = 8080;
var serverip = 0;
server.listen(port, function(){
	//npm install external-ip
	const getIP = require('external-ip')();
	getIP((err, ip) => {
	    if (err) {
	        // every service in the list has failed
	        throw err;
	    }
	    serverip = ip;
	    console.log('Listening on local port', port);
	    console.log('Copy-able address: ' + ip + ":" + port);
	});


	var interval = 5 * 60 * 1000;
	setTimeout(function(){backups(interval);}, interval);


	var contents = fs.readFileSync('players.dat', 'utf8').split(/\r?\n/);
	for (var i = 0; i < contents.length; i++) {
		var current = contents[i].split('\t');
		if (current[0]) {
			players.push(current[0]);
			if (current[1]) {
				passwords.push(current[1]);
			} else {
				passwords.push("");
			}
			playersuserId.push(-1);
			playersloggedin.push(false);
			playernotes[i] = "";
		}
	}
	console.log('List of players:', players);

	var currentdate = new Date();
	initialtime = currentdate.getTime();
	currenttime = initialtime;
	for (var i = 0; i < players.length; i++) {
		lasttimes[i] = currenttime;
	}

	rngseed(currenttime);
});

const serverContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "FrameLabel":5, "Card":6, "CanvasFrame":7, "LotteryFrame":8, "PublicDieFrame":9, "Soundboard":10};
const serverSoundboardTypes = {"file":1, "TTS":2};

var playingsound = false, lastsound = '', lastsoundlooping = false;
var showeventlog = false;
var camera0set = false;
var camerax, cameray, camerazoom;
var serverimageframes = {};
var servertokenframes =  {};
var serverdecks = {};
var servercanvasframes = {};
var serverlotteryframes = {};
var serverpublicdieframes = {};
var serversoundboards = {};

var gameoptions = [];

var initialtime, currenttime, lasttime, lasttimes = [];



var resourcelist = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
					resourcelist(file, function(err, res) {
					  results = results.concat(res);
					  next();
					});
        } else {
					if (!file.includes("_server_")) {
						results.push(file.substring(__dirname.length+1).replace(/\\/g, "/"));
					}
					next();
        }
      });
    })();
  });
};

var welcome = io.of('/welcome');
welcome.on('connection', function (socket) {
	var userId = socket.id; // user/client identifier for communication
	var loggedin = false; // ..
	var alertednotloggedin = false;
	var userplayerId = -1; // which role does the user have?
	socket.on('somethingelse', function () {
		// do something else
	});
	socket.emit('seteeventlog', showeventlog);
	socket.on('userloginattempt', function (playerid, somepassword) {
		if (playerid > -1 && playerid < players.length) {
			if (playersloggedin[playerid]) {
				console.log("Failed login attempt for player '" + players[playerid] + "'.");
				socket.emit('failedlogin', "Character is already logged in. Try refreshing.");
			} else {
				if (passwords[playerid] === somepassword) {
					console.log("Player '" + players[playerid] + "' " + "(" + playerid + ") logged in.");
					playersloggedin[playerid] = true;
					loggedin = true;
					userplayerId = playerid;
					playersuserId[userplayerId] = userId;
					socket.emit('loginoptions', players, playersloggedin);
					socket.broadcast.emit('loginoptions', players, playersloggedin);
					socket.emit('loginsuccess', userplayerId, players[userplayerId]);
					if (playingsound) {
						socket.emit('playsound', lastsound, lastsoundlooping);
					}
					if (userplayerId === 0) {
						for (var someplayer in playernotes) {
							socket.emit('updateplayernotes', parseInt(someplayer), playernotes[someplayer]);
						}
						socket.emit('serverip', serverip + ":" + port);
					} else {
						if (playernotes[userplayerId]) socket.emit('updateplayernotes', userplayerId, playernotes[userplayerId]);
					}

					if (userplayerId === 0) {
						resourcelist('img', function(err, results) {
						  if (err) throw err;
						  socket.emit('resourcelist', results);
						  //console.log(results);
						});
						resourcelist('data', function(err, results) {
						  if (err) throw err;
						  socket.emit('resourcelist_data', results);
						  //console.log(results);
						});
						resourcelist('sound', function(err, results) {
						  if (err) throw err;
						  socket.emit('resourcelist_sound', results);
						  //console.log(results);
						});
					}

				} else {
					console.log("Failed login attempt for player " + players[playerid] + ".");
					socket.emit('failedlogin', "Wrong Password.");
				}

			}
		} else {
			socket.emit('failedlogin', "Chosen character does not exist. This should not happen.");
		}
	});
	socket.on('userlogout', function () {
		if (loggedin) {
			console.log("Player '" + players[userplayerId] + "' " + "(" + userplayerId + ") logged out.");
			playersuserId[userplayerId] = -1;
			playersloggedin[userplayerId] = false;
			loggedin = false;
			alertednotloggedin = false;
			userplayerId = -1;
			socket.emit('loginoptions', players, playersloggedin);
			socket.broadcast.emit('loginoptions', players, playersloggedin);
		}
	});
	socket.on('disconnect', function (reason) {
		if (loggedin) {
			socket.emit('alertmsg', "Something caused a disconnect. Please relog/reload page.");
			console.log("Player '" + players[userplayerId] + "' " + "(" + userplayerId + ") disconnected (" + reason + ").");
			playersuserId[userplayerId] = -1;
			playersloggedin[userplayerId] = false;
			socket.emit('loginoptions', players, playersloggedin);
			socket.broadcast.emit('loginoptions', players, playersloggedin);
		}
	});
	socket.on('requesttoggleeventlog', function () {
		if (userplayerId === 0) {
			showeventlog = !showeventlog;
			socket.emit('seteeventlog', showeventlog);
			socket.broadcast.emit('seteeventlog', showeventlog);
		}
	});
	socket.on('reqresourcelist', function () {
		if (userplayerId === 0) {
			resourcelist('img', function(err, results) {
			  if (err) throw err;
			  socket.emit('resourcelist', results);
			});
		}
	});
	socket.on('reqresourcelist_data', function () {
		if (userplayerId === 0) {
			resourcelist('data', function(err, results) {
			  if (err) throw err;
			  socket.emit('resourcelist_data', results);
			});
		}
	});
	socket.on('reqresourcelist_sound', function () {
		if (userplayerId === 0) {
			resourcelist('sound', function(err, results) {
			  if (err) throw err;
			  socket.emit('resourcelist_sound', results);
			});
		}
	});
	socket.on('camera_set', function (camerax0, cameray0, camerazoom0) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			camera0set = true;
			camerax = camerax0;
			cameray = cameray0;
			camerazoom = camerazoom0;
			socket.broadcast.emit('camera_apply', camerax0, cameray0, camerazoom0);
		}
	});
	socket.on('camera_unset', function () {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			camera0set = false;
		}
	});
	socket.on('gameoptions_add', function (option) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (!gameoptions.includes(option.replace(/\s/g, '').replace(/,/g, ''))) {
				gameoptions.push(option.replace(/\s/g, '').replace(/,/g, ''));
				console.log('current gameoptions:', gameoptions);
				socket.emit('gameoptions_update', gameoptions);
				socket.broadcast.emit('gameoptions_update', gameoptions);
			}
		}
	});
	socket.on('gameoptions_remove', function (option) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (gameoptions.includes(option)) {
				var index = gameoptions.indexOf(option);
				if (index > -1) {
					gameoptions.splice(index, 1);
				}
				console.log('current gameoptions:', gameoptions);
				socket.emit('gameoptions_update', gameoptions);
				socket.broadcast.emit('gameoptions_update', gameoptions);
			}
		}
	});
	socket.on('pushimage', function (someframe, someMarkers, someLabels) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverimageframes[someframe.id]) {
				console.log("GM updated imageframe " + someframe.id + ".");
			} else {
				console.log("GM pushed new imageframe " + someframe.id + ".");
			}
			serverimageframes[someframe.id] = someframe;
			if (someframe.filename.substring(0,11) == "data:image/") {
				serverimageframes[someframe.id].filename = saveimagetofile(someframe.filename, gethash(someframe.filename), someframe.desiredfilename);
			}
			serverimageframes[someframe.id]["marker"] = someMarkers;
			for (var marker in someMarkers) {
				if (someMarkers[marker].descfilename.substring(0,11) == "data:image/") {
					serverimageframes[someframe.id]["marker"][marker].descfilename = saveimagetofile(someMarkers[marker].descfilename, gethash(someMarkers[marker].descfilename), someMarkers[marker].desiredfilename);
				}
			}
			serverimageframes[someframe.id]["label"] = someLabels;
			socket.emit('updateimageframe', serverimageframes[someframe.id]);
			socket.broadcast.emit('updateimageframe', serverimageframes[someframe.id]);
		}
	});
	socket.on('submitplayernotes', function (someplayer, somenotes) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (someplayer === userplayerId || userplayerId === 0) {
			if (typeof somenotes == "string") {
				playernotes[someplayer] = somenotes;

				socket.emit('updateplayernotes', someplayer, somenotes);
				// broadcast.to does not send to issuing client
				socket.broadcast.to(playersuserId[0]).emit('updateplayernotes', someplayer, somenotes);
				socket.broadcast.to(playersuserId[someplayer]).emit('updateplayernotes', someplayer, somenotes);
			}
		}
	});
	socket.on('updateimageposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverimageframes[someid]) {
			if (serverimageframes[someid].owner.includes(userplayerId)) {
				if (serverimageframes[someid].timestamp < newtimestamp) {
					serverimageframes[someid].x = newx;
					serverimageframes[someid].y = newy;

					var currentdate = new Date();
					currenttime = currentdate.getTime();
					serverimageframes[someid].timestamp = newtimestamp;
					if ( currenttime - lasttimes[userplayerId] >= 1000/100) {
						lasttimes[userplayerId] = currenttime;
						socket.emit('updateimageframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updateimageframeposition', someid, newx, newy, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('pushdeleteimage', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverimageframes[someid]) delete serverimageframes[someid];
			socket.emit('deleteimage', someid);
			socket.broadcast.emit('deleteimage', someid);
		}
	});
	socket.on('requestrestoreimage', function (someid) {
		if (serverimageframes[someid]) socket.emit('updateimageframe', serverimageframes[someid]);
	});
	socket.on('pushdeletemarker', function (someframeid, somemarkerid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverimageframes[someframeid]) {
				if (serverimageframes[someframeid].marker[somemarkerid]) delete serverimageframes[someframeid].marker[somemarkerid];
				socket.emit('deletemarker', someframeid, somemarkerid);
				socket.broadcast.emit('deletemarker', someframeid, somemarkerid);
			}
		}
	});
	socket.on('pushdeletelabel', function (someframeid, somelabelid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverimageframes[someframeid]) {
				if (serverimageframes[someframeid].label[somelabelid]) delete serverimageframes[someframeid].label[somelabelid];
				socket.emit('deletelabel', someframeid, somelabelid);
				socket.broadcast.emit('deletelabel', someframeid, somelabelid);
			}
		}
	});
	socket.on('pushtoken', function (sometoken) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (servertokenframes[sometoken.id]) {
				console.log("GM updated token " + sometoken.id + ".");
			} else {
				console.log("GM pushed new token " + sometoken.id + ".");
			}
			servertokenframes[sometoken.id] = sometoken;
			if (sometoken.filename.substring(0,11) == "data:image/") {
				servertokenframes[sometoken.id].filename = saveimagetofile(sometoken.filename, gethash(sometoken.filename), sometoken.desiredfilename);
			}
			if (sometoken.descfilename.substring(0,11) == "data:image/") {
				servertokenframes[sometoken.id].descfilename = saveimagetofile(sometoken.descfilename, gethash(sometoken.descfilename, sometoken.desiredfilename));
			}
			socket.emit('updatetokenframe', sometoken);
			socket.broadcast.emit('updatetokenframe', sometoken);
		}
	});
	socket.on('updatetokenposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (servertokenframes[someid]) {
			if (servertokenframes[someid].owner.includes(userplayerId)) {
				if (servertokenframes[someid].timestamp < newtimestamp) {
					servertokenframes[someid].x = newx;
					servertokenframes[someid].y = newy;

					var currentdate = new Date();
					currenttime = currentdate.getTime();
					servertokenframes[someid].timestamp = newtimestamp;
					if (currenttime - lasttimes[userplayerId] >= 1000/100) {
						lasttimes[userplayerId] = currenttime;
						socket.emit('updatetokenframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updatetokenframeposition', someid, newx, newy, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('pushdeletetoken', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (servertokenframes[someid]) {
				console.log("removing token " + someid);
				delete servertokenframes[someid];
			}
			socket.emit('deletetoken', someid);
			socket.broadcast.emit('deletetoken', someid);
		}
	});
	socket.on('requestrestoretoken', function (someid) {
		if (servertokenframes[someid]) socket.emit('updatetokenframe', servertokenframes[someid]);
	});
	socket.on('pushcard', function (somecard) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverdecks[somecard.deckid]) {
				if (serverdecks[somecard.deckid][somecard.cardid]) {
					console.log("GM updated card " + somecard.deckid + "." + somecard.cardid + ".");
				} else {
					console.log("GM pushed new card " + somecard.deckid + "." + somecard.cardid + ".");
				}
			} else {
				serverdecks[somecard.deckid] = {};
				console.log("GM pushed new card " + somecard.deckid + "." + somecard.cardid + ".");
			}
			serverdecks[somecard.deckid][somecard.cardid] = somecard;
			socket.emit('updatecard', somecard);
			socket.broadcast.emit('updatecard', somecard);
		}
	});
	socket.on('pushdeletecard', function (somedeckid, somecardid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverdecks[somedeckid]) {
				if (serverdecks[somedeckid][somecardid]) {
					console.log("removing card " + somedeckid + "." + somecardid);
					delete serverdecks[somedeckid][somecardid];
				}
				if (Object.keys(serverdecks[somedeckid]).length === 0) {
					console.log("removing empty deck " + somedeckid);
					delete serverdecks[somedeckid];
				}
			}
		}
		socket.emit('deletecard', somedeckid, somecardid);
		socket.broadcast.emit('deletecard', somedeckid, somecardid);
	});
	socket.on('pushdeletedeck', function (somedeckid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverdecks[somedeckid]) {
				delete serverdecks[somedeckid];
			}
		}
		socket.emit('deletedeck', somedeckid);
		socket.broadcast.emit('deletedeck', somedeckid);
	});
	socket.on('reqforcediscard', function () {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			socket.broadcast.emit('forcediscard');
		}
	});
	socket.on('reqchangedeckid', ( oldid, newid ) => {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (!serverdecks[newid]) {
				if (serverdecks[oldid]) {
					Object.defineProperty(serverdecks, newid, Object.getOwnPropertyDescriptor(serverdecks, oldid));
					delete serverdecks[oldid];
				}
				for (var currentcard in serverdecks[newid]) {
					serverdecks[newid][currentcard].deckid = newid;
				}
				socket.emit('changedeckid', oldid, newid);
				socket.broadcast.emit('changedeckid', oldid, newid);
				for (var i = 0; i < gameoptions.length; i++) {
					if (gameoptions[i].includes("d" + oldid + "cardturnangleinc")) { // expected format d<deckid>cardturnangleinc<intValue>
						var optioninfo = gameoptions[i].split("cardturnangleinc");
						gameoptions[i] = "d" + newid + "cardturnangleinc" + optioninfo[1];
					} else if (gameoptions[i] === "d" + oldid + "dragtotop") {
						gameoptions[i] = "d" + newid + "dragtotop";
					} else if (gameoptions[i] === "d" + oldid + "randomizeangles") {
						gameoptions[i] = "d" + newid + "randomizeangles";
					}
				}
				socket.emit('gameoptions_update', gameoptions);
				socket.broadcast.emit('gameoptions_update', gameoptions);
			}
		}
	});
	socket.on('updatecardposition', function (somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverdecks[somedeckid]) {
			if (serverdecks[somedeckid][somecardid]) {
				if (serverdecks[somedeckid][somecardid].owner.includes(userplayerId)) {
					if (serverdecks[somedeckid][somecardid].timestamp < newtimestamp) {
						serverdecks[somedeckid][somecardid].x = newx;
						serverdecks[somedeckid][somecardid].y = newy;
						serverdecks[somedeckid][somecardid].angle = newangle;
						serverdecks[somedeckid][somecardid].faceup = newfaceup;

						var currentdate = new Date();
						currenttime = currentdate.getTime();
						serverdecks[somedeckid][somecardid].timestamp = newtimestamp;
					// lasttime-does not work due to multiple cards being movable at once -> make updatecardstack for fix
					//	if (currenttime - lasttimes[userplayerId] >= 1000/100 || newfaceup !== serverdecks[somedeckid][somecardid].faceup || newangle != serverdecks[somedeckid][somecardid].angle) {
							lasttimes[userplayerId] = currenttime;
							socket.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
							socket.broadcast.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
					//	}
					}
				}
			}
		}
	});
	socket.on('dragcardtotop', function (somedeckid, somecardid, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverdecks[somedeckid]) {
			if (serverdecks[somedeckid][somecardid]) {
				if (serverdecks[somedeckid][somecardid].owner.includes(userplayerId)) {
					var maxzIndex = -1;
					var originalindex = serverdecks[somedeckid][somecardid].zIndex;
					for (var currentcard in serverdecks[somedeckid]) {
						maxzIndex = Math.max(maxzIndex, serverdecks[somedeckid][currentcard].zIndex);
						if (serverdecks[somedeckid][currentcard].cardid !== serverdecks[somedeckid][somecardid].cardid
						    && serverdecks[somedeckid][currentcard].zIndex >= serverdecks[somedeckid][somecardid].zIndex) {
							serverdecks[somedeckid][currentcard].zIndex -= 1;
							serverdecks[somedeckid][currentcard].timestamp = newtimestamp;
							socket.emit('changecardzIndex', somedeckid, serverdecks[somedeckid][currentcard].cardid, serverdecks[somedeckid][currentcard].zIndex, newtimestamp);
							socket.broadcast.emit('changecardzIndex', somedeckid, serverdecks[somedeckid][currentcard].cardid, serverdecks[somedeckid][currentcard].zIndex, newtimestamp);
						}
					}
					if (maxzIndex !== serverdecks[somedeckid][somecardid].zIndex) {
						serverdecks[somedeckid][somecardid].timestamp = newtimestamp;
						serverdecks[somedeckid][somecardid].zIndex = maxzIndex;
						socket.emit('changecardzIndex', somedeckid, serverdecks[somedeckid][somecardid].cardid, serverdecks[somedeckid][somecardid].zIndex, newtimestamp);
						socket.broadcast.emit('changecardzIndex', somedeckid, serverdecks[somedeckid][somecardid].cardid, serverdecks[somedeckid][somecardid].zIndex, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('dragcardstacktotop', function (cardlist, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var cardlists = {};
		for (var i = 0; i < cardlist.length; i++) {
			var currentdeckid = cardlist[i].split('.')[0];
			var currentcardid = cardlist[i].split('.')[1];
			if (serverdecks[currentdeckid]) {
				if (!cardlists[currentdeckid]) cardlists[currentdeckid] = [];
				if (serverdecks[currentdeckid][currentcardid]) {
					if (serverdecks[currentdeckid][currentcardid].owner.includes(userplayerId)) {
						cardlists[currentdeckid].push(serverdecks[currentdeckid][currentcardid]);
					}
				}
			}
		}
		var _cardlists = {};
		for (var deck in serverdecks) {
			if (cardlists[deck]) {
				_cardlists[deck] = [];
				for (var card in serverdecks[deck]) {
					if (!cardlist.includes(deck + "." + card)) {
						if (serverdecks[deck][card].owner.includes(userplayerId)) {
							_cardlists[deck].push(serverdecks[deck][card]);
						}
					}
				}
			}
		}
		for (var cardlist in cardlists) {
			cardlists[cardlist].sort(function (a, b) {
						// a should come before b in the sorted order
						if (a.zIndex < b.zIndex) {
						      return -1;
						// a should come after b in the sorted order
						} else if (a.zIndex > b.zIndex) {
						      return 1;
						// a and b are the same
						} else {
						      return 0;
						}
				});
			_cardlists[cardlist].sort(function (a, b) {
						// a should come before b in the sorted order
						if (a.zIndex < b.zIndex) {
						      return -1;
						// a should come after b in the sorted order
						} else if (a.zIndex > b.zIndex) {
						      return 1;
						// a and b are the same
						} else {
						      return 0;
						}
				});
			var minzrest = cardlists[cardlist][0].zIndex;
			if (_cardlists[cardlist][0]) minzrest = _cardlists[cardlist][0].zIndex;
			var minz = Math.min(cardlists[cardlist][0].zIndex, minzrest);
			var maxz = minz + Object.keys(serverdecks[cardlists[cardlist][0].deckid]).length - 1;

			for (var i = 0; i < cardlists[cardlist].length; i++) {
				if (cardlists[cardlist][i].zIndex !== maxz - cardlists[cardlist].length + 1 + i) {
					cardlists[cardlist][i].timestamp = newtimestamp;
					cardlists[cardlist][i].zIndex = maxz - cardlists[cardlist].length + 1 + i;
					socket.emit('changecardzIndex', cardlists[cardlist][i].deckid, cardlists[cardlist][i].cardid, cardlists[cardlist][i].zIndex, newtimestamp);
					socket.broadcast.emit('changecardzIndex', cardlists[cardlist][i].deckid, cardlists[cardlist][i].cardid, cardlists[cardlist][i].zIndex, newtimestamp);
				}
			}
			for (var i = 0; i < _cardlists[cardlist].length; i++) {
				if (_cardlists[cardlist][i].zIndex !== minz + i) {
					_cardlists[cardlist][i].timestamp = newtimestamp;
					_cardlists[cardlist][i].zIndex = minz + i;
					socket.emit('changecardzIndex', _cardlists[cardlist][i].deckid, _cardlists[cardlist][i].cardid, _cardlists[cardlist][i].zIndex, newtimestamp);
					socket.broadcast.emit('changecardzIndex', _cardlists[cardlist][i].deckid, _cardlists[cardlist][i].cardid, _cardlists[cardlist][i].zIndex, newtimestamp);
				}
			}
		}
	});
	socket.on('reqshuffle', function (cardlist) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var shufflelist = [];
		for (var currentdeck in serverdecks) {
			for (var currentcard in serverdecks[currentdeck]) {
				if (serverdecks[currentdeck][currentcard].owner.includes(userplayerId)) {
					if (cardlist.includes(serverdecks[currentdeck][currentcard].deckid + "." + serverdecks[currentdeck][currentcard].cardid)) {
						shufflelist.push(serverdecks[currentdeck][currentcard]);
						if (shufflelist.length === cardlist.length) break;
					}
				}
			}
		}
		console.log(players[userplayerId] + ' shuffled ' + shufflelist.length + ' cards.');
		// Fisher-Yates algorithm
		for (var i = 0; i <= shufflelist.length - 2; i++) {
			var partner = Math.floor(i + (shufflelist.length - 1 - i + 1) * random()); // random int in range i<=partner<shufflelist.length-1
			var tempcardzIndex = shufflelist[i].zIndex;
			shufflelist[i].zIndex = shufflelist[partner].zIndex;
			shufflelist[partner].zIndex = tempcardzIndex;
		}
		for (var i = 0; i < shufflelist.length; i++) {
			shufflelist[i].timestamp += 1;
			socket.emit('changecardzIndex', shufflelist[i].deckid, shufflelist[i].cardid, shufflelist[i].zIndex, shufflelist[i].timestamp);
			socket.broadcast.emit('changecardzIndex', shufflelist[i].deckid, shufflelist[i].cardid, shufflelist[i].zIndex, shufflelist[i].timestamp);
		}
	});
	socket.on('reqshuffleangle', function (cardlist, angleinc) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var shufflelist = [];
		for (var currentdeck in serverdecks) {
			for (var currentcard in serverdecks[currentdeck]) {
				if (serverdecks[currentdeck][currentcard].owner.includes(userplayerId)) {
					if (cardlist.includes(serverdecks[currentdeck][currentcard].deckid + "." + serverdecks[currentdeck][currentcard].cardid)) {
						shufflelist.push(serverdecks[currentdeck][currentcard]);
						if (shufflelist.length === cardlist.length) break;
					}
				}
			}
		}
		console.log(players[userplayerId] + ' shuffled ' + shufflelist.length + ' cards angles.');
		for (var i = 0; i < shufflelist.length; i++) {
			shufflelist[i].angle = Math.floor(360.0/angleinc * random()) * angleinc;
			shufflelist[i].timestamp += 1;
			socket.emit('updatecardposition', shufflelist[i].deckid, shufflelist[i].cardid, shufflelist[i].x, shufflelist[i].y, shufflelist[i].angle, shufflelist[i].faceup, shufflelist[i].timestamp);
			socket.broadcast.emit('updatecardposition', shufflelist[i].deckid, shufflelist[i].cardid, shufflelist[i].x, shufflelist[i].y, shufflelist[i].angle, shufflelist[i].faceup, shufflelist[i].timestamp);
		}
	});
	socket.on('requestrestorecard', function (somedeckid, somecardid) {
		if (serverdecks[somedeckid]) {
			if (serverdecks[somedeckid][somecardid]) socket.emit('updatecard', serverdecks[somedeckid][somecardid]);
		}
	});
	socket.on('pushcanvas', function (somecanvas) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (servercanvasframes[somecanvas.id]) {
				console.log("GM updated canvas " + somecanvas.id + ".");
			} else {
				console.log("GM pushed new canvas " + somecanvas.id + ".");
			}
			servercanvasframes[somecanvas.id] = somecanvas;
			socket.emit('updatecanvasframe', somecanvas);
			socket.broadcast.emit('updatecanvasframe', somecanvas);
		}
	});
	socket.on('pushdeletecanvas', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (servercanvasframes[someid]) delete servercanvasframes[someid];
			socket.emit('deletecanvas', someid);
			socket.broadcast.emit('deletecanvas', someid);
		}
	});
	socket.on('requpdatecanvascontent', function (someid, someJSON, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (servercanvasframes[someid]) {
			if (servercanvasframes[someid].owner.includes(userplayerId)) {
				if (servercanvasframes[someid].timestamp < newtimestamp) {
					servercanvasframes[someid].content = someJSON;
					servercanvasframes[someid].timestamp = newtimestamp;

					socket.emit('updatecanvascontent', someid, someJSON, newtimestamp);
					socket.broadcast.emit('updatecanvascontent', someid, someJSON, newtimestamp);
				}
			}
		}
	});
	socket.on('updatecanvasposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (servercanvasframes[someid]) {
			if (servercanvasframes[someid].owner.includes(userplayerId)) {
				if (servercanvasframes[someid].timestamp < newtimestamp) {
					servercanvasframes[someid].x = newx;
					servercanvasframes[someid].y = newy;

					var currentdate = new Date();
					currenttime = currentdate.getTime();
					servercanvasframes[someid].timestamp = newtimestamp;
					if ( currenttime - lasttimes[userplayerId] >= 1000/100) {
						lasttimes[userplayerId] = currenttime;
						socket.emit('updatecanvasframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updatecanvasframeposition', someid, newx, newy, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('requestrestorecanvas', function (someid) {
		if (servercanvasframes[someid]) socket.emit('updatecanvasframe', servercanvasframes[someid]);
	});
	socket.on('requestsavestate', function (somefilename) {
		if (userplayerId === 0) {
			console.log('Saving backup as', somefilename);
			var savefilecontent = xmlsavestate(somefilename);
			socket.emit('providesavefile', somefilename.slice(somefilename.lastIndexOf('/') + 1), savefilecontent);
		}
	});
	socket.on('pushlottery', function (someframe) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverlotteryframes[someframe.id]) {
				console.log("GM updated lottery " + someframe.id + ".");
			} else {
				console.log("GM pushed new lottery " + someframe.id + ".");
			}
			serverlotteryframes[someframe.id] = someframe;
			socket.emit('updatelotteryframe', serverlotteryframes[someframe.id]);
			socket.broadcast.emit('updatelotteryframe', serverlotteryframes[someframe.id]);
		}
	});
	socket.on('updatelotteryposition', function (someid, newx, newy, newindex, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverlotteryframes[someid]) {
			if (serverlotteryframes[someid].owner.includes(userplayerId)) {
				if (serverlotteryframes[someid].timestamp < newtimestamp) {
					serverlotteryframes[someid].x = newx;
					serverlotteryframes[someid].y = newy;
					serverlotteryframes[someid].currentindex = newindex;

					var currentdate = new Date();
					currenttime = currentdate.getTime();
					serverlotteryframes[someid].timestamp = newtimestamp;
					if ( currenttime - lasttimes[userplayerId] >= 1000/100) {
						lasttimes[userplayerId] = currenttime;
						socket.emit('updatelotteryframeposition', someid, newx, newy, newindex, newtimestamp);
						socket.broadcast.emit('updatelotteryframeposition', someid, newx, newy, newindex, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('pushdeletelottery', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverlotteryframes[someid]) delete serverlotteryframes[someid];
			socket.emit('deletelottery', someid);
			socket.broadcast.emit('deletelottery', someid);
		}
	});
	socket.on('reqlotterypick', function (someid, newtimestamp, newindex) {
		if (serverlotteryframes[someid]) {
			if (serverlotteryframes[someid].owner.includes(userplayerId)) {
				if (newindex !== undefined) {
					serverlotteryframes[someid].currentindex = newindex;
				} else {
					if (serverlotteryframes[someid].selectatrandom) {
						serverlotteryframes[someid].currentindex = Math.floor(serverlotteryframes[someid].options.length * random());
					} else {
						serverlotteryframes[someid].currentindex = (serverlotteryframes[someid].currentindex + 1) % serverlotteryframes[someid].options.length;
					}
				}
				serverlotteryframes[someid].timestamp = newtimestamp;
				socket.emit('setlotteryindex', someid, newtimestamp, serverlotteryframes[someid].currentindex);
				socket.broadcast.emit('setlotteryindex', someid, newtimestamp, serverlotteryframes[someid].currentindex);
				console.log('Player ' + players[userplayerId] + ' picked "' + serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex] + '" from lottery ' + someid +  '.');
				if (serverlotteryframes[someid].playsound) {
					for (var i = 1; i < players.length; i++) {
						//if (serverlotteryframes[someid].viewingrights.includes(i)) {
							socket.broadcast.to(playersuserId[i]).emit('queueTTS', serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex]);
						//}
					}
					// broadcast.to does not send to issuing client
					if (userplayerId !== 0 && serverlotteryframes[someid].viewingrights.includes(userplayerId)) socket.emit('queueTTS', serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex]);
				}
				if (serverlotteryframes[someid].publicresult) {

					// send info to owner
					if (!serverlotteryframes[someid].isturnindicator)
						socket.emit('printevent', 'You picked "' + serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex] + '" from lottery.');

					if (showeventlog) {
						var someresult = serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex];
						if (serverlotteryframes[someid].isturnindicator) {
							if (someresult.charAt(someresult.length - 1) == "s" || someresult.charAt(someresult.length - 1) == "x" || someresult.charAt(someresult.length - 1) == "z") {
								socket.emit('printevent', 'Next: ' + someresult + "' turn.");
								socket.broadcast.emit('printevent', 'Next: ' + someresult + "' turn.");
							} else {
								socket.emit('printevent', 'Next: ' + someresult + "'s turn.");
								socket.broadcast.emit('printevent', 'Next: ' + someresult + "'s turn.");
							}
						} else {
							socket.broadcast.to(playersuserId[0]).emit('printevent', players[userplayerId] + ' picked "' + someresult + '" from lottery.');
							for (var i = 1; i < players.length; i++) {
								if (serverlotteryframes[someid].viewingrights.includes(i)) {
									// broadcast.to does not send to issuing client
									socket.broadcast.to(playersuserId[i]).emit('printevent', players[userplayerId] + ' picked "' + someresult + '" from lottery.');
								}
							}
						}
					} else {
						socket.broadcast.to(playersuserId[0]).emit('printevent', players[userplayerId] + ' picked "' + serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex] + '" from lottery.');
					}
				} else {
					socket.broadcast.to(playersuserId[0]).emit('printevent', players[userplayerId] + ' picked "' + serverlotteryframes[someid].options[serverlotteryframes[someid].currentindex] + '" from lottery.');
				}
			}
		}
	});
	socket.on('pushpublicdie', function (someframe) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverpublicdieframes[someframe.id]) {
				console.log("GM updated die " + someframe.id + ".");
			} else {
				console.log("GM pushed new die " + someframe.id + ".");
			}
			serverpublicdieframes[someframe.id] = someframe;
			socket.emit('updatepublicdieframe', serverpublicdieframes[someframe.id]);
			socket.broadcast.emit('updatepublicdieframe', serverpublicdieframes[someframe.id]);
		}
	});
	socket.on('updatepublicdieposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverpublicdieframes[someid]) {
			if (serverpublicdieframes[someid].owner.includes(userplayerId)) {
				if (serverpublicdieframes[someid].timestamp < newtimestamp) {
					serverpublicdieframes[someid].x = newx;
					serverpublicdieframes[someid].y = newy;

					var currentdate = new Date();
					currenttime = currentdate.getTime();
					serverpublicdieframes[someid].timestamp = newtimestamp;
					if ( currenttime - lasttimes[userplayerId] >= 1000/100) {
						lasttimes[userplayerId] = currenttime;
						socket.emit('updatepublicdieframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updatepublicdieframeposition', someid, newx, newy, newtimestamp);
					}
				}
			}
		}
	});
	socket.on('pushdeletepublicdie', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serverpublicdieframes[someid]) delete serverpublicdieframes[someid];
			socket.emit('deletepublicdieframe', someid);
			socket.broadcast.emit('deletepublicdieframe', someid);
		}
	});
	socket.on('reqpublicdieset', function (someid, newvalue, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverpublicdieframes[someid]) {
			if (serverpublicdieframes[someid].owner.includes(userplayerId)) {
				if (serverpublicdieframes[someid].timestamp < newtimestamp) {
					serverpublicdieframes[someid].timestamp = newtimestamp;
					serverpublicdieframes[someid].value = newvalue;

					var dieresult = serverpublicdieframes[someid].value;
					socket.emit('setpublicdievalue', someid, serverpublicdieframes[someid].value, newtimestamp);
					socket.broadcast.emit('setpublicdievalue', someid, serverpublicdieframes[someid].value, newtimestamp);
				}
			}
		}
	});
	socket.on('reqpublicdiceroll', function (someid, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverpublicdieframes[someid]) {
			if (serverpublicdieframes[someid].owner.includes(userplayerId)) {
				//if (serverpublicdieframes[someid].timestamp < newtimestamp) {
					serverpublicdieframes[someid].isrolling = false;
					serverpublicdieframes[someid].timestamp = newtimestamp;
					serverpublicdieframes[someid].value = Math.floor(1 + serverpublicdieframes[someid].maxvalue * random());

					var dieresult = serverpublicdieframes[someid].value;
					socket.emit('setpublicdievalue', someid, serverpublicdieframes[someid].value, newtimestamp);
					socket.broadcast.emit('setpublicdievalue', someid, serverpublicdieframes[someid].value, newtimestamp);
					console.log('Player ' + players[userplayerId] + ' rolled ' + dieresult + ' (d' + serverpublicdieframes[someid].maxvalue + ').');
					if (gameoptions.includes('hugo')) {
						if (serverpublicdieframes[someid].maxvalue == 6 && dieresult === 6) dieresult = "hugo";
					}
					socket.emit('printevent', 'You rolled a ' + dieresult + ' (d' + serverpublicdieframes[someid].maxvalue + ').');
					socket.broadcast.emit('printevent', players[userplayerId] + ' rolled a ' + dieresult + ' (d' + serverpublicdieframes[someid].maxvalue + ').');
				//}
			}
		}
	});
	socket.on('reqpublicdiceanimation', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serverpublicdieframes[someid]) {
			if (serverpublicdieframes[someid].owner.includes(userplayerId)) {
				serverpublicdieframes[someid].isrolling = true;
				socket.emit('letpublicdieanimate', someid);
				socket.broadcast.emit('letpublicdieanimate', someid);
			}
		}

	});
	socket.on('reqdiceroll', function (someid, somemaxvalue) {
		var dieresult = Math.floor(1 + somemaxvalue * random());
		socket.emit('setdievalue', someid, dieresult);
		console.log('Player ' + players[userplayerId] + ' rolled ' + dieresult + ' (d' + somemaxvalue + ').');
		if (gameoptions.includes('hugo')) {
			if (somemaxvalue == 6 && dieresult === 6) dieresult = "hugo";
		}
		if (showeventlog)
			socket.broadcast.emit('printevent', players[userplayerId] + ' rolled a ' + dieresult + ' (d' + somemaxvalue + ').');
		else {
			socket.broadcast.to(playersuserId[0]).emit('printevent', players[userplayerId] + ' rolled a ' + dieresult + ' (d' + somemaxvalue + ').');
		}
	});
	socket.on('reqdiceroll_linked', function (somename, someid, somemaxvalue) {
		var dieresult = Math.floor(1 + somemaxvalue * random());
		socket.emit('setdievalue', someid, dieresult);
		console.log('Player ' + players[userplayerId] + ' rolled ' + dieresult + ' (d' + somemaxvalue + ') for token ' + somename + '.');
		if (gameoptions.includes('hugo')) {
			if (somemaxvalue == 6 && dieresult === 6) dieresult = "hugo";
		}
		if (showeventlog)
			socket.broadcast.emit('printevent', somename + ' rolled a ' + dieresult + ' (d' + somemaxvalue + ').');
		else {
			socket.broadcast.to(playersuserId[0]).emit('printevent', players[userplayerId] + ' rolled a ' + dieresult + ' (d' + somemaxvalue + ') for token ' + somename + '.');
		}
	});
	socket.on('pushsoundboard', function (somesoundboard) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serversoundboards[somesoundboard.id]) {
				console.log("GM updated soundboard " + somesoundboard.id + ".");
			} else {
				console.log("GM pushed new soundboard " + somesoundboard.id + ".");
			}
			serversoundboards[somesoundboard.id] = somesoundboard;
			socket.emit('updatesoundboard', somesoundboard);
			socket.broadcast.emit('updatesoundboard', somesoundboard);
		}
	});
	socket.on('restoresoundboard', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serversoundboards[someid]) {
				socket.emit('updatesoundboard', serversoundboards[someid]);
			}
		}
	});
	socket.on('pushdeletesoundboard', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (serversoundboards[someid]) delete serversoundboards[someid];
			socket.emit('deletesoundboard', someid);
			socket.broadcast.emit('deletesoundboard', someid);
		}
	});
	socket.on('requestsoundboardsound', function (someid, soundid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (serversoundboards[someid]) {
			if (serversoundboards[someid].owner.includes(userplayerId)) {
				if (serversoundboards[someid].labels[soundid]) {
					if (serversoundboards[someid].soundtypes[soundid] === serverSoundboardTypes.TTS) {
						socket.emit('queueTTS', serversoundboards[someid].filepaths[soundid], serversoundboards[someid].pitches[soundid], serversoundboards[someid].rates[soundid]);
						socket.broadcast.emit('queueTTS', serversoundboards[someid].filepaths[soundid], serversoundboards[someid].pitches[soundid], serversoundboards[someid].rates[soundid]);
					} else if (serversoundboards[someid].soundtypes[soundid] === serverSoundboardTypes.file) {
						socket.emit('playsound', serversoundboards[someid].filepaths[soundid], false);
						socket.broadcast.emit('playsound', serversoundboards[someid].filepaths[soundid], false);
					}
				} else {
					socket.emit('alertmsg', "Unknown entry - try push.");
				}
			}
		} else {
			socket.emit('alertmsg', "Unknown soundboard - try push.");
		}
	});
	socket.on('requestplaysound', function (somesound, looping) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			if (looping) {
				playingsound = true;
				lastsound = somesound;
				lastsoundlooping = looping;
			}
			socket.emit('playsound', somesound, looping);
			socket.broadcast.emit('playsound', somesound, looping);
		}
	});
	socket.on('requestqueueTTS', function (somemessage, somepitch, somerate) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			socket.emit('queueTTS', somemessage, somepitch, somerate);
			socket.broadcast.emit('queueTTS', somemessage, somepitch, somerate);
		}
	});
	socket.on('requeststopsound', function () {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			playingsound = false;
			lastsound = '';
			socket.emit('stopsound');
			socket.broadcast.emit('stopsound');
		}
	});

	sendservertime(socket);

	if (camera0set) socket.emit('camera_apply', camerax, cameray, camerazoom);
	// register client + send login options
	socket.emit('loginoptions', players, playersloggedin);

	for (var current in serverimageframes) {
		socket.emit('updateimageframe', serverimageframes[current]);
	}
	for (var current in servercanvasframes) {
		socket.emit('updatecanvasframe', servercanvasframes[current]);
	}
	for (var current in servertokenframes) {
		socket.emit('updatetokenframe', servertokenframes[current]);
	}
	for (var currentdeck in serverdecks) {
		for (currentcard in serverdecks[currentdeck]) {
			socket.emit('updatecard', serverdecks[currentdeck][currentcard]);
		}
	}
	for (var current in serverlotteryframes) {
		socket.emit('updatelotteryframe', serverlotteryframes[current]);
	}
	for (var current in serverpublicdieframes) {
		socket.emit('updatepublicdieframe', serverpublicdieframes[current]);
	}
	for (var current in serversoundboards) {
		socket.emit('updatesoundboard', serversoundboards[current]);
	}
	socket.emit('gameoptions_update', gameoptions);
	console.log("new client, sent login options/game data");
});


var counter = 0;
function backups(interval) {
	console.log('autosaving..');
	xmlsavestate('savestates/autosave'+(counter%100)+'.xml');
	counter++;
	setTimeout(function(){backups(interval);}, interval);
}

function xmlsavestate(filename) {
	var collecteddata = "<xml>\n"
	collecteddata += "<date>" + new Date() + "</date>\n<version>" + version + "</version>\n";

	collecteddata += "<gameoptions>" + gameoptions.join(',') + "</gameoptions>\n";

	for (var currentplayernote in playernotes) {
		collecteddata += "<playernote" + currentplayernote + ">\n";
		collecteddata += "\t" + playernotes[currentplayernote].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "\n";
		collecteddata += "</playernote" + currentplayernote + ">\n";
	}

	// note: IMPORTANT: replace &, <, > by &amp;, &lt; and &gt; in strings (simply substitute this in all values)
	for (var currentimageframe in serverimageframes) {
		collecteddata += "<imageframe>\n";
		for (var currentproperty in serverimageframes[currentimageframe]) {
			if (currentproperty === "marker") continue;
			if (currentproperty === "label") continue;
			collecteddata += "\t<" + currentproperty + ">" + ("" + serverimageframes[currentimageframe][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		for (var currentmarker in serverimageframes[currentimageframe]["marker"]) {
			collecteddata += "\t<marker>\n";
			for (currentproperty in serverimageframes[currentimageframe]["marker"][currentmarker]) {
				collecteddata += "\t\t<" + currentproperty + ">" + ("" + serverimageframes[currentimageframe]["marker"][currentmarker][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
			}
			collecteddata += "\t</marker>\n";
		}
		for (var currentlabel in serverimageframes[currentimageframe]["label"]) {
			collecteddata += "\t<label>\n";
			for (currentproperty in serverimageframes[currentimageframe]["label"][currentlabel]) {
				collecteddata += "\t\t<" + currentproperty + ">" + ("" + serverimageframes[currentimageframe]["label"][currentlabel][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
			}
			collecteddata += "\t</label>\n";
		}
		collecteddata += "</imageframe>\n";
	}
	for (var currenttokenframe in servertokenframes) {
		collecteddata += "<tokenframe>\n";
		for (var currentproperty in servertokenframes[currenttokenframe]) {
			collecteddata += "\t<" + currentproperty + ">" + ("" + servertokenframes[currenttokenframe][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		collecteddata += "</tokenframe>\n";
	}
	for (var currentdeck in serverdecks) {
		for (var currentcard in serverdecks[currentdeck]) {
			collecteddata += "<card>\n";
			for (var currentproperty in serverdecks[currentdeck][currentcard]) {
				collecteddata += "\t<" + currentproperty + ">" + ("" + serverdecks[currentdeck][currentcard][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
			}
			collecteddata += "</card>\n";
		}
	}
	for (var currentcanvasframe in servercanvasframes) {
		collecteddata += "<canvasframe>\n";
		for (var currentproperty in servercanvasframes[currentcanvasframe]) {
			collecteddata += "\t<" + currentproperty + ">" + ("" + servercanvasframes[currentcanvasframe][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		collecteddata += "</canvasframe>\n";
	}
	for (var currentlotteryframe in serverlotteryframes) {
		collecteddata += "<lotteryframe>\n";
		for (var currentproperty in serverlotteryframes[currentlotteryframe]) {
			collecteddata += "\t<" + currentproperty + ">" + ("" + serverlotteryframes[currentlotteryframe][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		collecteddata += "</lotteryframe>\n";
	}
	for (var currentdie in serverpublicdieframes) {
		collecteddata += "<dieframe>\n";
		for (var currentproperty in serverpublicdieframes[currentdie]) {
			collecteddata += "\t<" + currentproperty + ">" + ("" + serverpublicdieframes[currentdie][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		collecteddata += "</dieframe>\n";
	}
	for (var currentsb in serversoundboards) {
		collecteddata += "<soundboard>\n";
		for (var currentproperty in serversoundboards[currentsb]) {
			// special treatment for label, filepaths, pitches, rates, and types - save like array (comma separated?), index can be dropped
			if (currentproperty === "labels" || currentproperty === "filepaths" || currentproperty === "pitches" || currentproperty === "rates" || currentproperty === "soundtypes") continue;
			collecteddata += "\t<" + currentproperty + ">" + ("" + serversoundboards[currentsb][currentproperty]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</" + currentproperty + ">\n";
		}
		// special treatment for label, filepaths, and types - save like array (comma separated?), index can be dropped
		for (var currententry in serversoundboards[currentsb].labels) {
			collecteddata += "\t<entry>\n";
			collecteddata += "\t\t<labels>" + ("" + serversoundboards[currentsb].labels[currententry]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</labels>\n";
			collecteddata += "\t\t<filepaths>" + ("" + serversoundboards[currentsb].filepaths[currententry]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</filepaths>\n";
			collecteddata += "\t\t<pitches>" + ("" + serversoundboards[currentsb].pitches[currententry]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</pitches>\n";
			collecteddata += "\t\t<rates>" + ("" + serversoundboards[currentsb].rates[currententry]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</rates>\n";
			collecteddata += "\t\t<soundtypes>" + ("" + serversoundboards[currentsb].soundtypes[currententry]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</soundtypes>\n";
			collecteddata += "\t</entry>\n";
		}
		collecteddata += "</soundboard>\n";
	}

	collecteddata += "</xml>";
	fs.writeFileSync(filename, collecteddata);

	return collecteddata;
}

function handlenotloggedinwarning(somesocket, somemsg) {
	somesocket.emit('alertmsg', somemsg);
}

function sendservertime(socket) {
	var currentdate = new Date();
	var currenttime2 = currentdate.getTime();
	socket.emit('servertime', currenttime2 - initialtime);

	setTimeout(function(){sendservertime(socket);}, 60000);
}

function gethash(input) {
	var hash = 0;
	if (input.length == 0) {
		return Math.abs(hash).toString(16);
	}
	for (var i = 0; i < input.length; i++) {
		var character = input.charCodeAt(i);
		hash = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(16);
}

function saveimagetofile(image, filename, desiredfilename) {
	if (!fs.existsSync('img/_uploaded_')){
	    fs.mkdirSync('img/_uploaded_');
	}
	var bitmap = Buffer.from(/base64,(.+)/.exec(image)[1], 'base64');
	var actualfilename;
	if (desiredfilename) {
		actualfilename = "img/_uploaded_/" + desiredfilename;
	} else {
		actualfilename = "img/_uploaded_/" + filename + "." + image.substring(image.indexOf('/') + 1, image.indexOf(';base64'));
	}
	try {
		if (fs.existsSync(actualfilename)) {
			console.log('-> file', actualfilename, ' already exists, overwriting..');
		} else {
			console.log('-> writing new file as ', actualfilename);
		}
		fs.writeFileSync(actualfilename, bitmap);
		return actualfilename;
	} catch(err) {
		console.log('some error occured ', err);
	}
}

var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;

// Takes any integer
function rngseed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive),
// just like Math.random().
function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}
