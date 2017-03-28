var MyPreloader	= function(opts) 
{
	_this = this;

	this.opts			= opts			|| {};

	this._SCREEN_WIDTH = window.innerWidth;
	this._SCREEN_HEIGHT = window.innerHeight;

	this._RADIUS = this.opts.radius || 70;

	this._RADIUS_SCALE = 1;
	this._RADIUS_SCALE_MIN = 1;
	this._RADIUS_SCALE_MAX = this.opts.radiusScaleMax || 1.5;

	this._QUANTITY = this.opts.quantity || 25;

	this._mouseX = this._SCREEN_WIDTH * 0.5;
	this._mouseY = this._SCREEN_HEIGHT * 0.5;
	this._mouseIsDown = false;

	this._canvas = this.opts.canvas || document.createElement('canvas');
	this._context;
	this._particles;
	this._orbitRadius = this.opts.orbitRadius || -1;
	this._colorMin = this.opts.colorMin || 220;
	this._colorMax = this.opts.colorMax || 260;
	
	this._init();
}

MyPreloader.prototype._changeColors	= function(min, max)
{
	this._colorMin = min;
	this._colorMax = max;
	var lastRandColor = "green";
	
	for (var i = 0; i < this._particles.length; i++) {
		var particle = this._particles[i];
		var randColor = get_random_color(this._colorMin, this._colorMax);
		
		particle.fillColor = randColor;
		lastRandColor = randColor;
	}
    return lastRandColor;	
}

MyPreloader.prototype._init	= function()
{

  if (this._canvas && this._canvas.getContext) {
		this._context = this._canvas.getContext('2d');
		var __this = this;

		// Register event listeners
		window.addEventListener('resize', __this._windowResizeHandler, false);
		
		this._createParticles();
		
		this._windowResizeHandler();
				
		$( document ).ready(function() {
			setInterval(function(){
				__this._loop();
			}, 20);
		});
	}	
}
MyPreloader.prototype._createParticles	= function()
{
	this._particles = [];
	
	for (var i = 0; i < this._QUANTITY; i++) {
		var randColor = get_random_color(this._colorMin, this._colorMax);
		var orbit;
		if( this._orbitRadius < 0) {
			orbit = this._RADIUS*.5 + (this._RADIUS * .5 * Math.random());
		} else {
			orbit = this._orbitRadius;
		}
		
		var particle = {
			size: 1,
			position: { x: this._mouseX, y: this._mouseY },
			offset: { x: 0, y: 0 },
			shift: { x: this._mouseX, y: this._mouseY },
			speed: 0.01+Math.random()*0.04,
			targetSize: 1,
			fillColor: randColor,
			orbit: orbit
		};
		
		this._particles.push( particle );
	}	
}

function rand(min, max) {
    return parseInt(Math.random() * (max-min+1), 10) + min;
}

function get_random_color(min, max) {
    var h = rand(min, max); // color hue between 1 and 360
    var s = rand(30, 100); // saturation 30-100%
    var l = rand(30, 70); // lightness 30-70%
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

MyPreloader.prototype._windowResizeHandler	= function()
{
	this._SCREEN_WIDTH = window.innerWidth;
	this._SCREEN_HEIGHT = window.innerHeight;
	
	this._canvas.width = this._SCREEN_WIDTH;
	this._canvas.height = this._SCREEN_HEIGHT;	

}
MyPreloader.prototype._loop	= function()
{
	
	if( this._mouseIsDown ) {
		this._RADIUS_SCALE += ( this._RADIUS_SCALE_MAX - this._RADIUS_SCALE ) * (0.02);
	}
	else {
		this._RADIUS_SCALE -= ( this._RADIUS_SCALE - this._RADIUS_SCALE_MIN ) * (0.02);
	}
	
	this._RADIUS_SCALE = Math.min( this._RADIUS_SCALE, this._RADIUS_SCALE_MAX );
	
	// this._context.fillStyle = 'rgba(0,0,0,0.05)';
	this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
	
	for (i = 0, len = this._particles.length; i < len; i++) {
		var particle = this._particles[i];
		
		var lp = { x: particle.position.x, y: particle.position.y };
		
		// Rotation
		particle.offset.x += particle.speed;
		particle.offset.y += particle.speed;
		
		// Follow mouse with some lag
		particle.shift.x += ( this._mouseX - particle.shift.x) * (particle.speed);
		particle.shift.y += ( this._mouseY - particle.shift.y) * (particle.speed);
		
		// Apply position
		particle.position.x = particle.shift.x + Math.cos(i + particle.offset.x) * (particle.orbit*this._RADIUS_SCALE);
		particle.position.y = particle.shift.y + Math.sin(i + particle.offset.y) * (particle.orbit*this._RADIUS_SCALE);
		
		// Limit to screen bounds
		particle.position.x = Math.max( Math.min( particle.position.x, this._SCREEN_WIDTH ), 0 );
		particle.position.y = Math.max( Math.min( particle.position.y, this._SCREEN_HEIGHT ), 0 );
		
		particle.size += ( particle.targetSize - particle.size ) * 0.05;
		
		if( Math.round( particle.size ) == Math.round( particle.targetSize ) ) {
			particle.targetSize = 1 + Math.random() * 7;
		}
		
		this._context.beginPath();
		this._context.fillStyle = particle.fillColor;
		this._context.strokeStyle = particle.fillColor;
		this._context.lineWidth = particle.size;
		this._context.moveTo(lp.x, lp.y);
		this._context.lineTo(particle.position.x, particle.position.y);
		this._context.stroke();
		this._context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
		this._context.fill();
		
	}	
}



