
class CanvasFrameContainer {
	constructor(someid, parentdiv, x0, y0, w0, h0, filename) {
		this.id = someid;
		this.owner = [0];
		this.timestamp = -1;
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.CanvasFrame;
		
		this.thisdiv = document.createElement('div');
		this.thisdiv.style.position = "absolute";
		this.thisdiv.style.left = x0 + "px";
		this.thisdiv.style.top = y0 + "px";
		this.backgroundcolor0 = "white";
		this.backgroundcolorhighlight = "red";
		this.backgroundedithighlight = "blue";
		this.thisdiv.style.backgroundColor = this.backgroundcolor0;
		this.thisdiv.style.padding = "5px";
		parentdiv.appendChild(this.thisdiv);
		
		this.thisdiv.addEventListener('dblclick', e => {
			if (this.owner.includes(player)) {
				if (e.target === this.thisdiv || e.target === this.fabriccanvas.upperCanvasEl) {
					if (this.fabriccanvas.isDrawingMode) {
						this.fabriccanvas.isDrawingMode = false;
						this.thisdiv.style.backgroundColor = "white";
					} else {
						this.fabriccanvas.isDrawingMode = true;
						this.thisdiv.style.backgroundColor = this.backgroundedithighlight;
					}
				}
			}
		});
					
		this.thiscanvas = document.createElement('canvas');
		this.thiscanvas.id = "somecanvas"+someid;
		this.thisdiv.appendChild(this.thiscanvas);
		
		
		this.controlsdiv = document.createElement('div');
		this.controlsdiv.style.backgroundColor = "#cccccc";
		//this.controlsdiv.style.display = 'none';
		this.controlsdiv.style.width = "100%";
		
		this.controlsexitbutton = document.createElement('button');
		this.controlsexitbutton.classList.add("fancybutton");
		this.controlsexitbutton.style.backgroundColor = "#38e038";
		this.controlsexitbutton.innerHTML = "Apply";
		var applyfunction = (function (canvasreference){
						return function(){	
							console.log(canvasreference.fabriccanvas._objects);
						};
				}(this));
		this.controlsexitbutton.onclick = applyfunction;
		
		this.controlsdiv.appendChild(this.controlsexitbutton);
		this.thisdiv.appendChild(this.controlsdiv);
		
		
		
		
		
		
		
		this.fabriccanvas = new fabric.Canvas("somecanvas"+someid);
		this.fabriccanvas.setHeight(h0);
		this.fabriccanvas.setWidth(w0);
		
		this.fabriccanvas.isDrawingMode = false;
		this.fabriccanvas.freeDrawingBrush.width = 5;
		this.fabriccanvas.freeDrawingBrush.color = "#000000";
	
		// create a rectangle object
		var rect = new fabric.Rect({
		  left: 0,
		  top: 0,
		  fill: 'white',
		  width: w0,
		  height: h0
		});
		rect.selectable = false;

		// "add" rectangle onto canvas
		this.fabriccanvas.add(rect);
		//this.fabriccanvas.renderAll();
	}
}

