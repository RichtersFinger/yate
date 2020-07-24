var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');

const version = "1.3";


class sLinkedList {
    constructor() {
	this.head = null;
	this.tail = null;
	this.length = 0;
    }
    
    addToHead(value) {
        const newNode = { value };
        if (this.length === 0) {
		this.head = newNode;
		this.tail = newNode;
		this.head.next = newNode;
		this.tail.prev = newNode;
		this.tail.next = null;
		this.head.prev = null;
        } else {
		newNode.prev = null;
		newNode.next = this.head;
		this.head.prev = newNode;
		this.head = newNode;
        }
        this.length++;
        return this;
    }
    
    addToTail(value) {
        const newNode = { value };
        if (this.length === 0) {
		this.head = newNode;
		this.tail = newNode;
		this.head.next = newNode;
		this.tail.prev = newNode;
		this.tail.next = null;
		this.head.prev = null;
        } else {
		newNode.next = null;
		newNode.prev = this.tail;
		this.tail.next = newNode;
		this.tail = newNode;
        }
        this.length++;
        return this;
    }
    
    moveToTail(node) {
	if (node === this.tail) { // done
		return this;
	} else if (node === this.head) { // exclude prev null
		node.value.cardlayer = this.tail.value.cardlayer + 1;
		node.next.prev = node.prev;
		this.head = node.next;
		this.tail.next = node;
		node.prev = this.tail;
		node.next = null;
		this.tail = node;
		 
	} else { //
		node.value.cardlayer = this.tail.value.cardlayer + 1;
		node.prev.next = node.next;
		node.next.prev = node.prev;
		this.tail.next = node;
		node.prev = this.tail;
		node.next = null;
		this.tail = node;
	}
	return this;
    }
    
    removeFromHead() {
        if (this.length === 0) {
            return undefined;
        }
        
        const value = this.head.value;
        if (this.length === 1) {
		this.tail = null;
		this.head = null;
		this.length--;
        } else {
	        this.head = this.head.next;
	        this.head.prev = null;
	        this.length--;
        }
        
        return value;
    }
    
    removeFromTail() {
        if (this.length === 0) {
            return undefined;
        }
        
        const value = this.tail.value;
        if (this.length === 1) {
		this.tail = null;
		this.head = null;
		this.length--;
        } else {
		this.tail = this.tail.prev;
		this.tail.next = null;
		this.length--;
        }
        return value;
    }
    
    find(val) {
        let thisNode = this.head;
        
        while(thisNode) {
            if(thisNode.value === val) {
                return thisNode;
            }
            
            thisNode = thisNode.next;
        }
        
        return thisNode;
    }
    
    remove(val) {
        if(this.length === 0) {
            return undefined;
        }
        
        if (this.head.value === val) {
            return this.removeFromHead();
        }
        
        let previousNode = this.head;
        let thisNode = previousNode.next;
        
        while(thisNode) {
            if(thisNode.value === val) {
                break;
            }
            
            previousNode = thisNode;
            thisNode = thisNode.next;
        }
        
        if (thisNode === null) {
            return undefined;
        }
        
        previousNode.next = thisNode.next;
        this.length--;
        return this;
    }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

app.use("/img", express.static('img'));

app.use("/data", express.static('data'));

app.use("/lib", express.static('lib'));

app.use("/sound", express.static('sound'));

/*app.use("/font", express.static('font'));*/

const port = 8080;
server.listen(port, function(){
	//npm install external-ip
	const getIP = require('external-ip')();
	getIP((err, ip) => {
	    if (err) {
	        // every service in the list has failed
	        throw err;
	    }
	    console.log('Local port', 8080);
	    console.log('Listening on ' + ip + ":" + 8080 + ' (WLAN)');
	    console.log('Listening on ' + ip + ":" + 8081 + ' (LAN)');
	});
	
	var currentdate = new Date();
	initialtime = currentdate.getTime();
	currenttime = initialtime;
	lasttime = currenttime;
	
	rngseed(currenttime);
	
	var interval = 5 * 60 * 1000;
	setTimeout(function(){backups(interval);}, interval);
});

//var players = ["GM", "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8"];
var players = ["GM", "Valerie von Berle", "Anthropa Catzopolis", "Wilde Hilde", "Asiul Regnif", "Steward Flitchtail", "Dr. Arakel Sokan", "-Zuschauer-"];
var passwords = ["", "", "letmein", "letmein", "letmein", "letmein", "letmein", "letmein"];
var playersuserId = [-1, -1, -1, -1, -1, -1, -1, -1];
var playersloggedin = [false, false, false, false, false, false, false, false];

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "Marker":4, "FrameLabel":5, "Card":6};

var serverimageframes = new sLinkedList();
var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "visible"];
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext"];
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var relevantdata_card = ["deckid", "cardid", "owner", "viewingrights", "streamposition", "timestamp", "x", "y", "angle", "faceup", "width", "height", "scale", "bordercolor", "filenamefront", "filenameback", "zIndex"];
var servertokenframes = new sLinkedList();
var playingsound = false, lastsound = '', lastsoundlooping = false;
var showeventlog = false;
var serverdecks = new sLinkedList();

var gameoptions = [];

var initialtime, currenttime, lasttime;



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
			var current = serverimageframes.head;
			var correctframe = null;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id === someframe.id) {
					correctframe = current.value;
					break;
				}
				current = current.next;
			}
			if (correctframe) {
				console.log("GM updated imageframe " + someframe.id + ".");
				for (var i = 0; i < relevantdata_imageframe.length; i++) {
					correctframe[relevantdata_imageframe[i]] = someframe[relevantdata_imageframe[i]];
				}
				// keep only container with marker/label info
				correctframe.marker = someMarkers;
				correctframe.label = someLabels;
				socket.emit('updateimageframe', correctframe);
				socket.broadcast.emit('updateimageframe', correctframe);
			} else {
				console.log("GM pushed new imageframe " + someframe.id + ".");
				serverimageframes.addToTail(someframe);
				// keep only container with marker/label info
				serverimageframes.tail.value.marker = someMarkers;
				serverimageframes.tail.value.label = someLabels;
				socket.emit('updateimageframe', someframe);
				socket.broadcast.emit('updateimageframe', someframe);
			}
		}
	});
	socket.on('updateimageposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var current = serverimageframes.head;
		var correctframe = null;
		for (var i = 0; i < serverimageframes.length; i++) {
			if (current.value.id === someid) {
				correctframe = current.value;
				break;
			}
			current = current.next;
		}
		if (correctframe) {
			if (correctframe.owner.includes(userplayerId)) {
				if (correctframe.timestamp < newtimestamp) {
					correctframe.x = newx;
					correctframe.y = newy;
					
					var currentdate = new Date();
					currenttime = currentdate.getTime();
					correctframe.timestamp = newtimestamp;
					if ( currenttime - lasttime >= 1000/100) {
						lasttime = currenttime;
						socket.emit('updateimageframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updateimageframeposition', someid, newx, newy, newtimestamp);
					}
				}
			} 
		}
	});
	socket.on('updatetokenposition', function (someid, newx, newy, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var current = servertokenframes.head;
		var correctframe = null;
		for (var i = 0; i < servertokenframes.length; i++) {
			if (current.value.id === someid) {
				correctframe = current.value;
				break;
			}
			current = current.next;
		}
		if (correctframe) {
			if (correctframe.owner.includes(userplayerId)) {
				if (correctframe.timestamp < newtimestamp) {
					correctframe.x = newx;
					correctframe.y = newy;
					
					var currentdate = new Date();
					currenttime = currentdate.getTime();
					correctframe.timestamp = newtimestamp;
					if ( currenttime - lasttime >= 1000/100) {
						lasttime = currenttime;
						socket.emit('updatetokenframeposition', someid, newx, newy, newtimestamp);
						socket.broadcast.emit('updatetokenframeposition', someid, newx, newy, newtimestamp);
					}
				}
			} 
		}
	});
	socket.on('pushtoken', function (sometoken) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			var current = servertokenframes.head;
			var correctframe = null;
			for (var i = 0; i < servertokenframes.length; i++) {
				if (current.value.id === sometoken.id) {
					correctframe = current.value;
					break;
				}
				current = current.next;
			}
			if (correctframe) {
				console.log("GM updated token " + sometoken.id + ".");
				for (var i = 0; i < relevantdata_tokenframe.length; i++) {
					correctframe[relevantdata_tokenframe[i]] = sometoken[relevantdata_tokenframe[i]];
				}
				socket.emit('updatetokenframe', sometoken);
				socket.broadcast.emit('updatetokenframe', sometoken);
			} else {
				console.log("GM pushed new token " + sometoken.id + ".");
				servertokenframes.addToTail(sometoken);
				socket.emit('updatetokenframe', sometoken);
				socket.broadcast.emit('updatetokenframe', sometoken);
			}
		}
	});
	socket.on('pushdeleteimage', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			var current = serverimageframes.head;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id === someid) {
					console.log("removing frame " + someid);
					serverimageframes.moveToTail(current);
					serverimageframes.removeFromTail(current);
					break;
				}
				current = current.next;
			}
			socket.emit('deleteimage', someid);
			socket.broadcast.emit('deleteimage', someid);
		}
	});
	socket.on('pushdeletetoken', function (someid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			var current = servertokenframes.head;
			for (var i = 0; i < servertokenframes.length; i++) {
				if (current.value.id === someid) {
					console.log("removing token " + someid);
					servertokenframes.moveToTail(current);
					servertokenframes.removeFromTail(current);
					break;
				}
				current = current.next;
			}
			socket.emit('deletetoken', someid);
			socket.broadcast.emit('deletetoken', someid);
		}
	});
	socket.on('pushdeletemarker', function (someframeid, somemarkerid) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			var current = serverimageframes.head;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id === someframeid) {
					break;
				}
				current = current.next;
			}
			if (current) {
				for (var i = 0; i < current.value.marker.length; i++) {
					if (current.value.marker[i].id === somemarkerid) {
						current.value.marker.splice(i, 1);
						break;
					}
				}
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
			var current = serverimageframes.head;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id === someframeid) {
					break;
				}
				current = current.next;
			}
			if (current) {
				for (var i = 0; i < current.value.label.length; i++) {
					if (current.value.label[i].id === somelabelid) {
						current.value.label.splice(i, 1);
						break;
					}
				}
				socket.emit('deletelabel', someframeid, somelabelid);
				socket.broadcast.emit('deletelabel', someframeid, somelabelid);
			}
		}
	});
	socket.on('pushcard', function (somecard) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		if (userplayerId === 0) {
			// look for card in data; start with looking for correct deck
			var currentdeck = serverdecks.head;
			var correctdeck = null;
			for (var i = 0; i < serverdecks.length; i++) {
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
				serverdecks.addToTail(new sLinkedList());
				correctdeck = serverdecks.tail.value;
			}
			// search deck
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
				console.log("GM updated card " + somecard.deckid + "." + somecard.cardid + ".");
				for (var i = 0; i < relevantdata_card.length; i++) {
					correctcard[relevantdata_card[i]] = somecard[relevantdata_card[i]];
				}
			} else {
				console.log("GM pushed new card " + somecard.deckid + "." + somecard.cardid + ".");
				correctdeck.addToTail(somecard);
			}
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
			var currentdeck = serverdecks.head;
			var correctdeck = null;
			for (var i = 0; i < serverdecks.length; i++) {
				// intended not to occur; no deckid defined
				// if (currentdeck.value.length > 0) { .. }
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
						console.log("removing card " + somedeckid + "." + somecardid);
						correctdeck.value.moveToTail(currentcard);
						correctdeck.value.removeFromTail(currentcard);
						
						if (correctdeck.value.length === 0) {
							console.log("removing empty deck " + somedeckid);
							serverdecks.moveToTail(correctdeck);
							serverdecks.removeFromTail(correctdeck);
						}
						break;
					}
					currentcard = currentcard.next;
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
			var currentdeck = serverdecks.head;
			for (var i = 0; i < serverdecks.length; i++) {
				if (currentdeck.value.head.value.deckid === somedeckid) {
					serverdecks.moveToTail(currentdeck);
					serverdecks.removeFromTail(currentdeck);
					console.log("removing deck " + somedeckid);
					break;
				}
				currentdeck = currentdeck.next;
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
			var currentdeck = serverdecks.head;
			for (var i = 0; i < serverdecks.length; i++) {
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
			socket.emit('changedeckid', oldid, newid);
			socket.broadcast.emit('changedeckid', oldid, newid);
		}
	});
	socket.on('updatecardposition', function (somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp) {
		if (userplayerId === -1 && !alertednotloggedin) {
			alertednotloggedin = true;
			handlenotloggedinwarning(socket, "Not logged in - please sign back in.");
		}
		var currentdeck = serverdecks.head;
		var correctdeck = null;
		for (var i = 0; i < serverdecks.length; i++) {
			// intended not to occur; no deckid defined
			// if (currentdeck.value.length > 0) { .. }
			if (currentdeck.value.head.value.deckid === somedeckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		if (correctdeck) {
			// search deck
			var currentcard = correctdeck.head;
			var correctcard = null;
			for (var i = 0; i < correctdeck.length; i++) {
				if (currentcard.value.cardid === somecardid) {
					correctcard = currentcard.value;
					break;
				}
				currentcard = currentcard.next;
			}
			if (correctcard) {
				if (correctcard.owner.includes(userplayerId)) {
					if (correctcard.timestamp < newtimestamp) {
						correctcard.x = newx;
						correctcard.y = newy;
						
						var currentdate = new Date();
						currenttime = currentdate.getTime();
						correctcard.timestamp = newtimestamp;
						//if ( currenttime - lasttime >= 1000/100 || newfaceup !== correctcard.faceup || newangle != correctcard.angle) {
							lasttime = currenttime;
							socket.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
							socket.broadcast.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
						//}
						correctcard.angle = newangle;
						correctcard.faceup = newfaceup;
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
		var currentdeck = serverdecks.head;
		var correctdeck = null;
		for (var i = 0; i < serverdecks.length; i++) {
			if (currentdeck.value.head.value.deckid === somedeckid) {
				correctdeck = currentdeck.value;
				break;
			}
			currentdeck = currentdeck.next;
		}
		if (correctdeck) {
			// search deck
			var currentcard = correctdeck.head;
			var correctcard = null;
			for (var i = 0; i < correctdeck.length; i++) {
				if (currentcard.value.cardid === somecardid) {
					correctcard = currentcard.value;
					break;
				}
				currentcard = currentcard.next;
			}
			if (correctcard) {
				if (correctcard.owner.includes(userplayerId)) {
					var currentcard = correctdeck.head;
					var maxzIndex = -1;
					var originalindex = correctcard.zIndex;
					for (var i = 0; i < correctdeck.length; i++) {
						maxzIndex = Math.max(maxzIndex, currentcard.value.zIndex);
						if (currentcard.value.zIndex >= correctcard.zIndex) {
							currentcard.value.zIndex -= 1;
							currentcard.value.timestamp = newtimestamp;
						}
						currentcard = currentcard.next;
					}
					correctcard.timestamp = newtimestamp;
					correctcard.zIndex = maxzIndex;
					
					currentcard = correctdeck.head;
					for (var i = 0; i < correctdeck.length; i++) {
						//if (currentcard.value.zIndex >= originalindex - 1) {
							socket.emit('changecardzIndex', somedeckid, currentcard.value.cardid, currentcard.value.zIndex, newtimestamp);
							socket.broadcast.emit('changecardzIndex', somedeckid, currentcard.value.cardid, currentcard.value.zIndex, newtimestamp);
						//}
						currentcard = currentcard.next;
					}
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
		var currentdeck = serverdecks.head;
		for (var i = 0; i < serverdecks.length; i++) {
			var currentcard = currentdeck.value.head;
			for (var j = 0; j < currentdeck.value.length; j++) {
				if (currentcard.value.owner.includes(userplayerId)) {
					if (cardlist.includes(currentcard.value.deckid + "." + currentcard.value.cardid)) {
						shufflelist.push(currentcard.value);
					}
					if (shufflelist.length === cardlist.length) break;
				}
				currentcard = currentcard.next;
			}
			if (shufflelist.length === cardlist.length) break;
			currentdeck = currentdeck.next;
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
	socket.on('requestrestoreimage', function (someid) {
		var current = serverimageframes.head;
		for (var i = 0; i < serverimageframes.length; i++) {
			if (current.value.id === someid) {
				socket.emit('updateimageframe', current.value);
				break;
			}
			current = current.next;
		}
	});
	socket.on('requestrestoretoken', function (someid) {
		var current = servertokenframes.head;
		for (var i = 0; i < servertokenframes.length; i++) {
			if (current.value.id === someid) {
				socket.emit('updatetokenframe', current.value);
				break;
			}
			current = current.next;
		}
	});
	socket.on('requestsavestate', function (somefilename) {
		if (userplayerId === 0) {
			console.log('Saving backup as', somefilename);
			savestate(somefilename);
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
	
	// register client + send login options
	socket.emit('loginoptions', players, playersloggedin);
	
	var current = serverimageframes.head;
	for (var i = 0; i < serverimageframes.length; i++) {
		socket.emit('updateimageframe', current.value);
		current = current.next;
	}
	current = servertokenframes.head;
	for (var i = 0; i < servertokenframes.length; i++) {
		socket.emit('updatetokenframe', current.value);
		current = current.next;
	}
	current = serverdecks.head;
	for (var i = 0; i < serverdecks.length; i++) {
		var ccurrent = current.value.head;
		for (var j = 0; j < current.value.length; j++) {
			socket.emit('updatecard', ccurrent.value);
			ccurrent = ccurrent.next;
		}
		current = current.next;
	}
	socket.emit('gameoptions_update', gameoptions);
	console.log("new client, sent login options/game data");
}); 


var counter = 0;
function backups(interval) {
	console.log('autosaving..');
	savestate('savestates/autosave'+(counter%100)+'.dat');
	counter++;
	setTimeout(function(){backups(interval);}, interval);
}

function savestate(filename) {
	var collecteddata = "" + new Date() + "\n" + version + "\n";
	
	collecteddata += gameoptions.join(',') + "\n";
	
	var current = serverimageframes.head;
	for (var i = 0; i < serverimageframes.length; i++) {
		collecteddata += "================" + "\n";
		collecteddata += ContainerTypes.FrameContainer + "\n";
		for (var j = 0; j < relevantdata_imageframe.length; j++) {
			collecteddata += current.value[relevantdata_imageframe[j]] + "\n";
		}
		for (var j = 0; j < current.value.marker.length; j++) {
			collecteddata += "================" + "\n";
			collecteddata += ContainerTypes.Marker + "\n";
			for (var k = 0; k < relevantdata_markerframe.length; k++) {
				collecteddata += current.value.marker[j][relevantdata_markerframe[k]] + "\n";
			}
		}
		for (var j = 0; j < current.value.label.length; j++) {
			collecteddata += "================" + "\n";
			collecteddata += ContainerTypes.FrameLabel + "\n";
			for (var k = 0; k < relevantdata_framelabel.length; k++) {
				collecteddata += current.value.label[j][relevantdata_framelabel[k]] + "\n";
			}
		}
		current = current.next;
	}
	current = servertokenframes.head;
	for (var i = 0; i < servertokenframes.length; i++) {
		collecteddata += "================" + "\n";
		collecteddata += ContainerTypes.TokenContainer + "\n";
		for (var j = 0; j < relevantdata_tokenframe.length; j++) {
			collecteddata += current.value[relevantdata_tokenframe[j]] + "\n";
		}
		current = current.next;
	}
	var currentdeck = serverdecks.head;
	for (var i = 0; i < serverdecks.length; i++) {
		current = currentdeck.value.head;
		for (var j = 0; j < currentdeck.value.length; j++) {
			collecteddata += "================" + "\n";
			collecteddata += ContainerTypes.Card + "\n";
			for (var k = 0; k < relevantdata_card.length; k++) {
				collecteddata += current.value[relevantdata_card[k]] + "\n";
			}
			current = current.next;
		}
		currentdeck = currentdeck.next;
	}
	
	fs.writeFileSync(filename, collecteddata);
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