var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');

const version = "1.1";


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
	    console.log('Running on ' + ip + ":" + port);
	});
	
	var currentdate = new Date();
	initialtime = currentdate.getTime();
	currenttime = initialtime;
	lasttime = currenttime;
	
	var interval = 5 * 60 * 1000;
	setTimeout(function(){backups(interval);}, interval);
});

//var players = ["GM", "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8"];
var players = ["GM", "Valerie von Berle", "Anthropa Catzopolis", "Wilde Hilde", "Asiul Regnif", "Steward Flitchtail", "Dr. Arakel Sokan", "-Zuschauer-"];
var passwords = ["wasd", "letmein", "letmein", "letmein", "letmein", "letmein", "letmein", "letmein"];
var playersuserId = [-1, -1, -1, -1, -1, -1, -1, -1];
var playersloggedin = [false, false, false, false, false, false, false, false];

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "FrameLabel":5};

var serverimageframes = new sLinkedList();
var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "visible"];
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext"];
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var servertokenframes = new sLinkedList();
var playingsound = false, lastsound = '', lastsoundlooping = false;


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
	var userId; // user/client identifier for communication
	var loggedin = false; // ..
	var userplayerId = -1; // which role does the user have?
	socket.on('somethingelse', function () {
		// do something else
	});
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
			userplayerId = -1;
			socket.emit('loginoptions', players, playersloggedin);
			socket.broadcast.emit('loginoptions', players, playersloggedin);
		}
	});
	socket.on('disconnect', function (reason) {
		if (loggedin) {
			socket.emit('alertmsg', "Something caused a disconnect. Please reload page.");
			console.log("Player '" + players[userplayerId] + "' " + "(" + userplayerId + ") disconnected (" + reason + ").");
			playersuserId[userplayerId] = -1;
			playersloggedin[userplayerId] = false;
			socket.emit('loginoptions', players, playersloggedin);
			socket.broadcast.emit('loginoptions', players, playersloggedin);
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
	socket.on('pushimage', function (someframe, someMarkers, someLabels) {
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		if (userplayerId == 0) {
			var current = serverimageframes.head;
			var correctframe = null;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id == someframe.id) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		var current = serverimageframes.head;
		var correctframe = null;
		for (var i = 0; i < serverimageframes.length; i++) {
			if (current.value.id == someid) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		var current = servertokenframes.head;
		var correctframe = null;
		for (var i = 0; i < servertokenframes.length; i++) {
			if (current.value.id == someid) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		if (userplayerId == 0) {
			var current = servertokenframes.head;
			var correctframe = null;
			for (var i = 0; i < servertokenframes.length; i++) {
				if (current.value.id == sometoken.id) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		if (userplayerId == 0) {
			var current = serverimageframes.head;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id == someid) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		if (userplayerId == 0) {
			var current = servertokenframes.head;
			for (var i = 0; i < servertokenframes.length; i++) {
				if (current.value.id == someid) {
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
		if (userplayerId == 0) {
			var current = serverimageframes.head;
			for (var i = 0; i < serverimageframes.length; i++) {
				if (current.value.id == someframeid) {
					break;
				}
				current = current.next;
			}
			for (var i = 0; i < current.value.marker.length; i++) {
				if (current.value.marker[i].id == somemarkerid) {
					current.value.marker.splice(i, 1);
					break;
				}
			}
			socket.emit('deletemarker', someframeid, somemarkerid);
			socket.broadcast.emit('deletemarker', someframeid, somemarkerid);
		}
	});
	socket.on('requestrestoreimage', function (someid) {
		var current = serverimageframes.head;
		for (var i = 0; i < serverimageframes.length; i++) {
			if (current.value.id == someid) {
				socket.emit('updateimageframe', current.value);
				break;
			}
			current = current.next;
		}
	});
	socket.on('requestrestoretoken', function (someid) {
		var current = servertokenframes.head;
		for (var i = 0; i < servertokenframes.length; i++) {
			if (current.value.id == someid) {
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
	socket.on('diceroll', function (somevalue, somemaxvalue) {
		if (userplayerId !== 0) {
			console.log('Player ' + players[userplayerId] + ' rolled ' + somevalue + ' with a d' + somemaxvalue + ".");
		}
	});
	socket.on('requestplaysound', function (somesound, looping) {
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
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
		if (userplayerId === -1) socket.emit('alertmsg', "Not logged in - please sign back in.");
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
	var current = servertokenframes.head;
	for (var i = 0; i < servertokenframes.length; i++) {
		socket.emit('updatetokenframe', current.value);
		current = current.next;
	}
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
	
	fs.writeFileSync(filename, collecteddata);
}

function sendservertime(socket) {
	
	var currentdate = new Date();
	var currenttime2 = currentdate.getTime();
	socket.emit('servertime', currenttime2 - initialtime);
	
	setTimeout(function(){sendservertime(socket);}, 60000);
}