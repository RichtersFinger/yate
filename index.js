var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');

const version = "1.4";


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

var players = [];
var passwords = [];
var playersuserId = [];
var playersloggedin = [];

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
	
	
	var contents = fs.readFileSync('players.dat', 'utf8').split(/\r?\n/);
	for (var i = 0; i < contents.length; i++) {
		var current = contents[i].split('\t');
		players.push(current[0]);
		passwords.push(current[1]);
		playersuserId.push(-1);
		playersloggedin.push(false);
	}
	console.log('List of players:', players);
});

const ContainerTypes = {"FrameContainer":1, "TokenContainer":2, "Die":3, "Marker":4, "Marker":4, "FrameLabel":5, "Card":6, "CanvasFrame":7};

var serverimageframes = {};
var relevantdata_imageframe = ["id", "owner", "streamposition", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "filename", "zIndex", "markeridcounter", "labelidcounter", "visible"];
var relevantdata_canvasframe = ["id", "owner", "streamposition", "streamcontent", "fixposition", "timestamp", "x", "y", "width", "height", "scale", "content", "zIndex"];
var relevantdata_markerframe = ["id", "hasdescription", "x", "y", "size", "scale", "zIndex", "descfilename", "descname", "desctext"];
var relevantdata_framelabel = ["id", "x", "y", "scale", "zIndex", "currenttext", "textcolor", "angle", "ctradius", "ctdir"];
var relevantdata_tokenframe = ["id", "owner", "streamposition", "hasdescription", "timestamp", "x", "y", "size", "offsetx", "offsety", "scale", "bordercolor", "filename", "zIndex", "descname", "descfilename", "desctext", "visible"];
var relevantdata_card = ["deckid", "cardid", "owner", "viewingrights", "streamposition", "timestamp", "x", "y", "angle", "faceup", "width", "height", "scale", "bordercolor", "filenamefront", "filenameback", "zIndex"];
var servertokenframes =  {};
var playingsound = false, lastsound = '', lastsoundlooping = false;
var showeventlog = false;
var serverdecks = {};
var servercanvasframes = {};

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
			if (serverimageframes[someframe.id]) {
				console.log("GM updated imageframe " + someframe.id + ".");
			} else {
				console.log("GM pushed new imageframe " + someframe.id + ".");
			}
			serverimageframes[someframe.id] = someframe;
			serverimageframes[someframe.id]["marker"] = someMarkers;
			serverimageframes[someframe.id]["label"] = someLabels;
			socket.emit('updateimageframe', serverimageframes[someframe.id]);
			socket.broadcast.emit('updateimageframe', serverimageframes[someframe.id]);
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
					if ( currenttime - lasttime >= 1000/100) {
						lasttime = currenttime;
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
					if (currenttime - lasttime >= 1000/100) {
						lasttime = currenttime;
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
						//if ( currenttime - lasttime >= 1000/100 || newfaceup !== correctcard.faceup || newangle != correctcard.angle) {
							lasttime = currenttime;
							socket.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
							socket.broadcast.emit('updatecardposition', somedeckid, somecardid, newx, newy, newangle, newfaceup, newtimestamp);
						//}
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
			var minzrest = cardlists[cardlist][1].zIndex;
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
	socket.on('requestrestorecard', function (somedeckid, somecardid) {
		if (serverdecks[somedeckid]) {
			if (serverdecks[somedeckid][somecardid]) socket.emit('updatecardframe', serverdecks[somedeckid][somecardid]);
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
					if ( currenttime - lasttime >= 1000/100) {
						lasttime = currenttime;
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
			xmlsavestate(somefilename);
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
	
	collecteddata += "</xml>";
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