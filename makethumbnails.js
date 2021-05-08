const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const thumbnailsize = 200;
const thumbnailquality = 30;

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
		if (!file.includes("_server_") && !file.includes("_thumbnails_")) {
			results.push(file.substring(__dirname.length+1).replace(/\\/g, "/"));
		}
		next();
	}
	});
    })();
  });
};

resourcelist('img', function(err, results) {
	if (err) throw err;
	for (var i = 0; i < results.length; i++) {
		let thispath = path.parse(results[i]).dir + "/";
		let thisname = path.parse(results[i]).name;
		let thisextension = path.parse(results[i]).ext;
		if (thisextension === ".jpeg" || thisextension === ".jpg" || thisextension === ".png") {
			Jimp.read(thispath + thisname + thisextension, (err, thisfile) => {
				if (err) {
					console.log("error opening file " + thispath + thisname + thisextension);
				} else {
				    thisfile.resize(thumbnailsize, Jimp.AUTO)
					.quality(thumbnailquality)
					.write('img/_thumbnails_/' + thispath + thisname + thisextension + ".jpg");
					console.log("done " + thispath + thisname + thisextension);
				}
			});
		}
	}
});