
class Die {
	constructor(someid, parentdiv, x0, y0, somesize, dwhat, filenamebase, filenametype) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;
		
		this.what = ContainerTypes.Die;
		
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
		//this.thisdiv.innerHTML = "asd";
		this.thiscanvas = document.createElement('canvas');
		this.thisdiv.appendChild(this.thiscanvas);
		
		this.thisdiv.style.position = "absolute";
		this.backgroundcolor0 = "transparent";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.highlight = false;
		this.displayx = x0 - somesize/2;
		this.displayy = y0 - somesize/2;
		this.x = (this.displayx + cameraposx + somesize/2)/zoomvalue;
		this.y = (this.displayy + cameraposy + somesize/2)/zoomvalue;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.zIndex = zcounter + 99;
		this.thisdiv.style.zIndex = this.zIndex;
		//this.thisdiv.style.opacity = 0.5;
		
		this.thiscanvas.style.display = "none";
		this.thiscanvas.style.backgroundColor = this.backgroundcolor0;
		this.thiscanvas.style.borderStyle = "none";
		this.ctx = this.thiscanvas.getContext('2d');
		this.image = new Image();
		this.filenamebase = filenamebase;
		this.maxvalue = dwhat;
		this.value = 1;
		this.filenametype = filenametype;
		this.imagehighlight = new Image();
		this.imagehighlight.src = this.filenamebase+"highlight."+this.filenametype;
		this.size = somesize;
		this.thiscanvas.style.width = this.size + "px";
		this.thiscanvas.style.height = this.size + "px";
		this.applyimage();
	}
	applyimage() {
		this.image.src = this.filenamebase+this.value+"."+this.filenametype;
		
		if (this.image.complete) {
			this.redraw();
		} else {
			this.image.addEventListener('load', e => {
				this.redraw();	
			});
		}
		//this.redraw();
	}
	redraw() {
		this.thiscanvas.style.display = "block"; 
		this.ctx.canvas.width = this.image.width;
		this.ctx.canvas.height = this.image.height;
		if (this.highlight && this.imagehighlight.complete) {
			this.ctx.drawImage(this.imagehighlight, 0, 0);
		}
		this.ctx.drawImage(this.image, 0.04 * this.image.width, 0.04 * this.image.width, 0.92 * this.image.width, 0.92 * this.image.width);
	}
	setdisplayposition() {
		this.displayx = zoomvalue * this.x - cameraposx - this.size/2;
		this.displayy = zoomvalue * this.y - cameraposy - this.size/2;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
	}
	up() {
		this.value = Math.min(this.value + 1, this.maxvalue);
		this.applyimage();
	}
	down() {
		this.value = Math.max(this.value - 1, 1);
		this.applyimage();
	}
	roll() {
		iosocket.emit('reqdiceroll', this.id, this.maxvalue);
	}
}

