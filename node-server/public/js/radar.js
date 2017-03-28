function Ball(x,y,r){
	this.x = x;
	this.y = y;
	this.r = r;
	this.vx = 0;
	this.vy = 0;
	Ball.all.push(this);
}

Ball.all = [];
Ball.prototype = {
  draw: function(){
	ctx.save();
	  ctx.translate(this.x,this.y);
	  ctx.fillStyle = "#fb0";
	  ctx.beginPath();
	  ctx.arc(0,0, this.r, 0, Math.PI * 2, true);
	  ctx.closePath();
	  ctx.fill();
	ctx.restore();
  },
  remove: function(){
	Ball.all.splice(Ball.all.indexOf(this), 1);
  }
};
function Blip(x,y,t){
	this.x = x;
	this.y = y;
	this.t = t;
	Blip.all.push(this);
}
Blip.all = [];

function radar(id="radar",w=200,h=200,r=100) {
	this.id = id;
	this.w = w;
	this.h = h;
	this.r = r;
	
	var canvas = document.getElementById(id);
	canvas.width = this.w;
	canvas.height = this.h;
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = "rgba(50, 50, 50, 1)";
	
	var line = {
		x: 100,
		y: 100,
		length: 100,
		angle: 0,
		speed: Math.PI / 360.,
		end: {
			x: 100,
			y: 0
		}
	}

	line.draw = function(){
		this.angle += this.speed;
		this.end.x = this.x + this.length * Math.cos(this.angle);
		this.end.y = this.y + this.length * Math.sin(this.angle);
		ctx.save();
		ctx.strokeStyle = "#383";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.end.x,this.end.y);
		ctx.stroke();


		var i = Ball.all.length;
		while(i--){
			if (pointToLineDistance(line, line.end, Ball.all[i] ) < 1.
				&& lineDistance(line, Ball.all[i] ) < line.length
				&& lineDistance(line.end, Ball.all[i] ) < line.length){
				new Blip( Ball.all[i].x, Ball.all[i].y, 0.2 );

			}
		}
		ctx.restore();
	}

	function pointToLineDistance(A, B, P){
		var normalLength = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
		return Math.abs((P.x - A.x) * (B.y - A.y) - (P.y - A.y) * (B.x - A.x)) / normalLength;
	}
	function lineDistance(A, B ){ 
		return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
	}
	
	function main() {
	  // Clear display
		ctx.save();
		ctx.fillStyle = "rgba(20, 0, 0, .04)";
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();


	  // Update balls. Add balls if under 200 exist
	  if (Ball.all.length < 20){
		for(var i = 0; i < 5; i++){
		  var ball = new Ball(Math.random()*200,Math.random()*200,2);
		  ball.vx = Math.random() / canvas.width/2;
		  ball.vy = Math.random() / canvas.height/2;
		}
	  }
	  
	  var i = Ball.all.length;
	  while(i--){
		  // Update ball
		  Ball.all[i].x += Ball.all[i].vx;
		  Ball.all[i].y += Ball.all[i].vy;
		  if (Ball.all[i].x > canvas.width - Ball.all[i].r) {
			Ball.all[i].x = canvas.width - Ball.all[i].r;
			Ball.all[i].vx = -Math.abs(Ball.all[i].vx);
		  }
		  else if (Ball.all[i].x < Ball.all[i].r) {
			Ball.all[i].x = Ball.all[i].r;
			Ball.all[i].vx = Math.abs(Ball.all[i].vx);
		  }
		  if (Ball.all[i].y > canvas.height - Ball.all[i].r) {
			Ball.all[i].y = canvas.height - Ball.all[i].r;
			Ball.all[i].vy = -Math.abs(Ball.all[i].vy);
		  }
		  else if (Ball.all[i].y < Ball.all[i].r) {
			Ball.all[i].y = Ball.all[i].r;
			Ball.all[i].vy = Math.abs(Ball.all[i].vy);
		  }
	  }

		var i = Blip.all.length;
		//console.log(i + " blips");
		var kill_cutoff = 0.0005;
		var blip_strength_drain = 0.997;
		while(i--){
			ctx.save();
			if (Blip.all[i].t > kill_cutoff){
				Blip.all[i].t *= blip_strength_drain;
				var col = "rgba(25, 255, 25, " + Blip.all[i].t + ")"
				//var col = "rgba(25, 255, 25, 0.2 )"
				// ctx.strokeStyle = col;
				// ctx.beginPath();
				// ctx.moveTo(Blip.all[i].x, Blip.all[i].y);
				// ctx.lineTo(Blip.all[i].x+1, Blip.all[i].y+1);
				// ctx.stroke();

				ctx.fillStyle = col;
				ctx.beginPath();
				ctx.arc(Blip.all[i].x, Blip.all[i].y, 2, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
			}
			else if (Blip.all[i].t <= kill_cutoff){
				Blip.all.splice(i,1);
			}
			ctx.restore();
		}


		line.draw();

		ctx.strokeStyle = "rgba(80,80,80, 1)";
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.arc(100, 100, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.stroke();

		for (var i = 1; i < 4; i++){
			ctx.strokeStyle = "rgba(30,80,30, 0.5)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(100, 100, canvas.width/10 * i, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.stroke();

		}
	} 
	setInterval( main, 1000 / 80);
}
new radar();
