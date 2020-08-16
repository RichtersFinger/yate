
class FrameLabel {
	constructor(someid, parentframe, parentdiv, x0, y0, sometext) {
		this.id = someid;
		this.owner = [0];
		
		// used to check whether processed in some loop somewhere
		this.touchedthis = false;
		
		this.what = ContainerTypes.FrameLabel;
		
		this.parentframe = parentframe;
		
		this.thisdiv = document.createElement('div');
		parentdiv.appendChild(this.thisdiv);
		this.thisdiv.addEventListener('mousedown', e => {
			lastmousedownframe = this;
			if (e.which === 3) lastmenuup = this;
		});
		this.thisdiv.addEventListener('wheel', e => {
			lastwheelframe = this;
		});
		this.thisdiv.addEventListener('dblclick', e => {
			if (player === 0) {
				if (e.target === this.thislabel || e.target.parentElement.parentElement === this.thislabel) {
					textediting = true;
							
					texteditdivcontainer.style.visibility = "";
					texteditdivcontainer.style.zIndex = zcounter + 100;
					texteditdiv.style.zIndex = zcounter + 120;
					texteditdiv.style.left = document.body.clientWidth/2 - parseInt(texteditdiv.style.width.replace("px", ""))/2 + "px";
					texteditdiv.style.top = "0px";
					
					document.getElementById("texteditinput").value = this.thislabel.innerHTML.replace(/<br>/g, '\n');
					document.getElementById("texteditinput").focus();
					
					var thelabel = this;
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
			}
		});
		
		this.thislabel = document.createElement('h2');
		this.thislabel.classList.add("noselect");
		this.thislabel.classList.add("nowrap");
		this.textcolor = "#000000";
		this.thislabel.style.color = this.textcolor;
		this.thisdiv.appendChild(this.thislabel);
		this.angle = 0.0;
		this.thisdiv.style.transform = "rotate("+this.angle+"deg)";
		this.ctradius = 0;
		this.ctdir = 1;
		this.circletype; // = new CircleType(this.thislabel)
		
		this.thisdiv.style.position = "absolute";
		this.x = x0;
		this.y = y0;
		this.displayx = 0;
		this.displayy = 0;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		
		this.scale = 1.0;
		this.setpositionandscale(); 
		this.zIndex = zcounter++;
		this.thisdiv.style.zIndex = this.zIndex;
		
		this.currenttext = sometext;
		this.thislabel.innerHTML = this.currenttext;
	}
	setpositionandscale() {
		this.displayx = zoomvalue * this.parentframe.scale * this.x;
		this.displayy = zoomvalue * this.parentframe.scale * this.y;
		this.thisdiv.style.left = this.displayx + "px";
		this.thisdiv.style.top = this.displayy + "px";
		this.thislabel.style.fontSize = Math.floor(zoomvalue*this.parentframe.scale*this.scale*22)+"px";
	}
	setArc(someradius, somedir) {
		if (this.circletype) this.circletype.destroy.bind(this.circletype);
		this.thislabel.innerHTML = this.currenttext;
		this.ctradius = someradius;
		this.ctdir = somedir;
		if (someradius != 0) {
			this.thisdiv.style.transform = "rotate(0deg)";
			this.circletype = new CircleType(this.thislabel).dir(this.ctdir).radius(this.ctradius);
			this.thisdiv.style.transform = "rotate("+this.angle+"deg)";
		}													
	}
}

