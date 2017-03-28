var VirtualJoystick	= function(opts)
{
	var _this = this;
	this.opts			= opts			|| {};
	this._baseCanvas = this.opts.baseCanvas || document.createElement( 'canvas' );
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
    this._baseStrokeStyle = opts.baseStrokeStyle || this._strokeStyle;
	
	this._preloader = new MyPreloader({quantity: 40, radiusScaleMax: 4.5, colorMin: 95, colorMax: 105});
	this._baseCanvas = this._preloader._canvas;
	
	this._stickPreloader = new MyPreloader({radius: 15, quantity: 6});
	this._stickCanvas = this._stickPreloader._canvas;	
	
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._baseX		= this._stickX = opts.baseX || 0
	this._baseY		= this._stickY = opts.baseY || 0
	this._limitStickTravel	= opts.limitStickTravel || false
	this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false
    this._colorsMatchTrackSpeed = opts.colorsMatchTrackSpeed || false;

	this._container.style.position	= "relative"

	this._container.appendChild(this._baseEl)
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none"
	this._container.appendChild(this._stickEl)
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none"

	this._pressed	= false;
	this._touchIdx	= null;
	
	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
	}
    
	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();
	
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
	
	// mtav
	this._tracks = {
		left: 0,
		right: 0
	};
	this._onDown(this._baseX, this._baseY);
	this._onUp();
}

VirtualJoystick.prototype.changeBaseColors	= function(min, max)
{

	// this._preloader._changeColors(min, max);
}

VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}
 
/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
}

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
;(function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
			if( result !== undefined )	return result;
		}
		return undefined
	};
})(VirtualJoystick.prototype);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){ return this._stickX - this._baseX;	}
VirtualJoystick.prototype.deltaY	= function(){ return this._stickY - this._baseY;	}

VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;
}
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )				return false;
	if( Math.abs(deltaX) > 2*Math.abs(deltaY) )	return false;
	return true;	
}
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
}
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )				return false;
	if( Math.abs(deltaY) > 2*Math.abs(deltaX) )	return false;
	return true;	
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////
/*******************************?
 * MTAV!
 * **************/
 
 VirtualJoystick.prototype._resetStationaryBase	= function()
{	
	var dx = this.deltaX();
	var dy = this.deltaY();
	
	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
	}
	
	this._moveBase(this._baseEl.style, (this._baseX - this._baseEl.width /2), (this._baseY - this._baseEl.height/2));
	
}
 
 /*******************************?
 * END MTAV!
 * **************/
 
 
VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false; 
	this._preloader._mouseIsDown = this._pressed;
	// this._stickEl.style.display	= "none";
	
	if(this._stationaryBase == false){	
		this._baseEl.style.display	= "none";
	
		this._baseX	= this._baseY	= 0;
		this._stickX	= this._stickY	= 0;
	}
}

VirtualJoystick.prototype._onDown	= function(x, y)
{
	this._pressed	= true; 
	this._preloader._mouseIsDown = this._pressed;
	
	if(this._stationaryBase == false){
		this._baseX	= x;
		this._baseY	= y;
		this._baseEl.style.display	= "";
		this._move(this._baseEl.style, (this._baseX - this._baseEl.width /2), (this._baseY - this._baseEl.height/2));
	}
	
	this._stickX	= x;
	this._stickY	= y;
	
	if(this._limitStickTravel === true){
		var deltaX	= this.deltaX();
		var deltaY	= this.deltaY();
		var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
		if(stickDistance > this._stickRadius){
			var stickNormalizedX = deltaX / stickDistance;
			var stickNormalizedY = deltaY / stickDistance;
			
			this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
			this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
		} 	
	}
	
	this._stickEl.style.display	= "";
	this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));	
}

VirtualJoystick.prototype._onMove	= function(x, y)
{

	if( this._pressed === true ){
		this._stickX	= x;
		this._stickY	= y;
		
		if(this._limitStickTravel === true){
			var deltaX	= this.deltaX();
			var deltaY	= this.deltaY();
			var stickDistance = Math.sqrt( (deltaX * deltaX) + (deltaY * deltaY) );
			if(stickDistance > this._stickRadius){
				var stickNormalizedX = deltaX / stickDistance;
				var stickNormalizedY = deltaY / stickDistance;
			
				this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
				this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
			} 		
		}
		
        	this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));	
	}	
}


//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	return this._onUp();
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
	event.preventDefault();
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onDown(x, y);
}

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onMove(x, y);
}
VirtualJoystick.prototype._stickInchBackToBase	= function(event) {
	if( this._pressed == false ) 
	{
		var increments = 50;
        var step = this._stickRadius / increments;
		
		var deltaX	= this.deltaX();
		var deltaY	= this.deltaY();
		
		var dxSign = (deltaX >= 0 ? 1 : -1 );
		var dySign = (deltaY >= 0 ? 1 : -1 );
			
		this._stickX = this._stickX - dxSign * step;
		this._stickY = this._stickY - dySign * step;			
		
		if ( Math.sqrt( deltaX * deltaX + deltaY * deltaY ) < step )  {
			this._stickX = this._baseX;
			this._stickY = this._baseY;
		}
		
		
		this._move(this._stickEl.style, (this._stickX - this._stickEl.width /2), (this._stickY - this._stickEl.height/2));	
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onTouchStart	= function(event)
{
	// if there is already a touch inprogress do nothing
	if( this._touchIdx !== null )	return;

	// notify event for validation
	var isValid	= this.dispatchEvent('touchStartValidation', event);
	if( isValid === false )	return;
	
	// dispatch touchStart
	this.dispatchEvent('touchStart', event);

	event.preventDefault();
	// get the first who changed
	var touch	= event.changedTouches[0];
	// set the touchIdx of this joystick
	this._touchIdx	= touch.identifier;

	// forward the action
	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onDown(x, y)
}

VirtualJoystick.prototype._onTouchEnd	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// dispatch touchEnd
	this.dispatchEvent('touchEnd', event);

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++);
	// if touch event isnt found, 
	if( i === touchList.length)	return;

	// reset touchIdx - mark it as no-touch-in-progress
	this._touchIdx	= null;

//??????
// no preventDefault to get click event on ios
event.preventDefault();

	return this._onUp()
}

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	// if there is no touch in progress, do nothing
	if( this._touchIdx === null )	return;

	// try to find our touch event
	var touchList	= event.changedTouches;
	for(var i = 0; i < touchList.length && touchList[i].identifier !== this._touchIdx; i++ );
	// if touch event with the proper identifier isnt found, do nothing
	if( i === touchList.length)	return;
	var touch	= touchList[i];

	event.preventDefault();

	var x		= touch.pageX;
	var y		= touch.pageY;
	return this._onMove(x, y)
}


//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase	= function()
{
	var canvas	= this._baseCanvas;
	
	return canvas;
}

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick	= function()
{
	var canvas	= document.createElement( 'canvas' );
	
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle	= this._strokeStyle; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();
	// var canvas	= this._stickCanvas; // TODO
	
	return canvas;
}

// MTAV
VirtualJoystick.prototype._changeColors	= function(base, stick)
{		
	this.changeJoystickStickColor(stick);
}
VirtualJoystick.prototype.changeJoystickStickColor	= function(color)
{		
    var newColor = color || 'green'
	var canvas = this._stickEl
	canvas.width	= 86;
	canvas.height	= 86;
	
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath(); 
	ctx.strokeStyle	= newColor; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.height/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();
}


VirtualJoystick.prototype._init	= function(opts) {
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
    this._baseStrokeStyle = opts.baseStrokeStyle || this._strokeStyle;
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._baseX		= this._stickX = opts.baseX || 0
	this._baseY		= this._stickY = opts.baseY || 0
	this._limitStickTravel	= opts.limitStickTravel || false
	this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false

	this._container.style.position	= "relative"

	this._container.appendChild(this._baseEl)
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none"
	this._container.appendChild(this._stickEl)
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none"

	this._pressed	= false;
	this._touchIdx	= null;
	
	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
	}
    
	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();
	
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
    this._onDown(this._baseX, this._baseY);
	this._onUp();
}
//////////////////////////////////////////////////////////////////////////////////
//		move using translate3d method with fallback to translate > 'top' and 'left'		
//      modified from https://github.com/component/translate and dependents
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._move = function(style, x, y)
{
  if (this._transform) {
    if (this._has3d) {
      style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
    } else {
      style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
    }
  } else {
    style.left = x + 'px';
    style.top = y + 'px';
  }
}

VirtualJoystick.prototype._moveBase = function(style, x, y)
{
  if (this._transform) {
    if (this._has3d) {
      style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
    } else {
      style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
    }
  } else {
    style.left = x + 'px';
    style.top = y + 'px';
  }
}

VirtualJoystick.prototype._getTransformProperty = function() 
{
    var styles = [
      'webkitTransform',
      'MozTransform',
      'msTransform',
      'OTransform',
      'transform'
    ];
    
    var el = document.createElement('p');
    var style;
    
    for (var i = 0; i < styles.length; i++) {
      style = styles[i];
      if (null != el.style[style]) {
        return style;
        break;
      }
    }         
}
  
VirtualJoystick.prototype._check3D = function() 
{        
    var prop = this._getTransformProperty();
    // IE8<= doesn't have `getComputedStyle`
    if (!prop || !window.getComputedStyle) return module.exports = false;
    
    var map = {
      webkitTransform: '-webkit-transform',
      OTransform: '-o-transform',
      msTransform: '-ms-transform',
      MozTransform: '-moz-transform',
      transform: 'transform'
    };
    
    // from: https://gist.github.com/lorenzopolidori/3794226
    var el = document.createElement('div');
    el.style[prop] = 'translate3d(1px,1px,1px)';
    document.body.insertBefore(el, null);
    var val = getComputedStyle(el).getPropertyValue(map[prop]);
    document.body.removeChild(el);
    var exports = null != val && val.length && 'none' != val;
    return exports;
}
VirtualJoystick.prototype._updateTracks = function() {
			// get all data from the joystick
	
	var deltaX = this.deltaX();
	var deltaY = this.deltaY();
	var right = this.right();
	var up = this.up();
	var left = this.left();
	var down = this.down();
	
	
	/*      process the data
		
		Joystick formulas: http://home.kendra.com/mauser/Joystick.html
		
		Get X and Y from the Joystick, do whatever scaling and calibrating you need to do based on your hardware.
		Invert X
		Calculate R+L (Call it V): V =(100-ABS(X)) * (Y/100) + Y
		Calculate R-L (Call it W): W= (100-ABS(Y)) * (X/100) + X
		Calculate R: R = (V+W) /2
		Calculate L: L= (V-W)/2
	*/
	var X = - ( deltaX);
	var Y = deltaY;
	var V =(100-Math.abs(X)) * (Y/100) + Y;
	var W = (100-Math.abs(Y)) * (X/100) + X;
	var R = (V+W) /2;
	var L = (V-W)/2;
	
	if( this._tracks.left != Math.floor(R) && this._tracks.right != Math.floor(L)) 
	{
		this._tracks = {
			left: Math.floor(R), // dont ask why this works...
			right: Math.floor(L)
		};
		
		// console.log(this._tracks);
		//make the AJAX call
		$.ajax({
			url: '/tracks-update',
			type: 'POST',
			data: {
			tracks: this._tracks
			}
		});	
	}
	var minColor = 0;
	var maxColor = 260;
	var steps = 100
	var step = maxColor / steps;
	
	var percentageOfOverallSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY ) / this._stickRadius;
	
	if( this._colorsMatchTrackSpeed ) {
		console.log("PercentOverallSpeed: " + percentageOfOverallSpeed);
		var changeFlag = Math.floor((percentageOfOverallSpeed * maxColor) / step);
		
		if(changeFlag != 0) {
			
			var adjustedMin = percentageOfOverallSpeed * maxColor - 20;
			var adjustedMax = percentageOfOverallSpeed * maxColor;
			
			var newColor = this._preloader._changeColors(adjustedMin, adjustedMax);
			this.changeJoystickStickColor(newColor);
		} 
	}
}


