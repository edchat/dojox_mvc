define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/has",
	"dojo/string",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/spinner-vml.html",
	"dojo/text!./templates/spinner-canvas.html"
], function(declare, lang, win, domClass, domConstruct, has, dstring, _WidgetBase, _TemplatedMixin, spinnerVmlHtml, spinnerCanvasHtml){
	var mode = win.global.CanvasRenderingContext2D ? "canvas" : has("ie") ? "vml" : "";
	if(!mode){
		console.error("dojox.mvc.widget.Spinner is not supported for this browser.");
		return _WidgetBase;
	}

	function drawPetals(/*dojox.mvc.widget.spinner*/ spinner){
		// summary:
		//		Draw spinner's petals.

		if(spinner._beingDestroyed){ return; }

		if(mode == "vml"){
			var petalHtml = [];
			for(var i = 0; i < spinner.petals; i++){
				petalHtml.push(dstring.substitute(spinner.innerTemplateString, {
					size: spinner.size,
					strokeWeight: spinner.lineWidth / 4 * 3,
					rotation: i * 360 / spinner.petals,
					rgbString: dstring.substitute("rgb(${0},${1},${2})", spinner.colors[i]),
					startX: spinner.size / 2,
					startY: spinner.size  * 3 / 4,
					endX: spinner.size / 2,
					endY: spinner.size
				}));
			}
			spinner.domNode.innerHTML = petalHtml.join("");
		}else{
			var context = spinner.domNode.getContext("2d");
			context.save();
			for(var i = 0; i < spinner.petals; i++){
				context.beginPath();
				context.moveTo(0, spinner.size / 4);
				context.lineTo(0, spinner.size / 2);
				context.strokeStyle = dstring.substitute("rgb(${0},${1},${2})", spinner.colors[i]);
				context.stroke();
				context.rotate(Math.PI * 2 / spinner.petals);
			}
			context.restore();
		}
	}

	function rotate(/*dojox.mvc.widget.spinner*/ spinner){
		// summary:
		//		Rotate the spinner.

		if(spinner._beingDestroyed){ return; }

		if(mode == "vml"){
			spinner.domNode.style.rotation = spinner.rotation * 360 / spinner.petals;
			if(++spinner.rotation >= spinner.petals){
				spinner.rotation = 0;
			}
		}else{
			var context = spinner.domNode.getContext("2d");
			context.clearRect(-3 / 4 * spinner.size, -3 / 4 * spinner.size, 3 / 2 * spinner.size, 3 / 2 * spinner.size);
			context.rotate(Math.PI * 2 / spinner.petals);
			drawPetals(spinner);
		}
	}

	function checkTimeout(/*dojox.mvc.widget.spinner*/ spinner){
		// summary:
		//		Stop the spinner as it didn't stop in the given duration.

		if (spinner.interval) {
			console.warn("Aborting spin - Timeout has passed for: " + spinner.domNode.id);
			spinner.set("value", 0);
		}
	}

	return declare("dojox.mvc.widget.Spinner", [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		Spinner to show progress on network activity, etc.
		//		The spinner spins when "value" attribute is greater than zero. It stops otherwise.

		// value: Number
		//		If greater than zero, start spinning. Otherwise, stop spinning.
		value: 0,

		// rotateInterval: Number
		//		Rotate the spinner every rotateInterval milliseconds
		rotateInterval: 100,

		// defaultTimeoutDuration: Number
		//		Duration to stop the spinner if it does not stop in the given duration
		defaultTimeoutDuration: 120000,

		// size: Number
		//		The spinner's size in pixels
		size: 16,

		// petals: Number
		//		The number of spinner's petals to draw
		petals: 12,

		// lineWidth: Number
		//		The width spinner's petals
		lineWidth: 2,

		// startColor: [Number, Number, Number]
		//		RGB array of spinner's britest color
		startColor: [255, 255, 255],

		// endColor: [Number, Number, Number]
		//		RGB array of spinner's darkest color
		endColor: [63, 99, 159],

		// hideOnStop: Boolean
		//		If true, hides the spinner when the spinner is not spinning
		hideOnStop: false,

		// templateString: String
		//		The HTML for spinner. For IE, <v:shape> part is repeated for number of petals
		templateString: mode == "canvas" ? spinnerCanvasHtml : spinnerVmlHtml,

		// Pseudo template parameters, for inner template string
		startX: "${startX}",
		startY: "${startY}",
		endX: "${endX}",
		endY: "${endY}",
		rotation: "${rotation}",
		rgbString: "${rgbString}",
		strokeWeight: "${strokeWeight}",

		buildRendering: function(){
			// description:
			//		Obtains repeating portion of template, and removes it from initial DOM

			this.inherited(arguments);
			if(mode == "vml"){
				this.innerTemplateString = this.domNode.innerHTML;
				while (this.domNode.childNodes.length) {
					this.domNode.removeChild(this.domNode.firstChild);
				}
			}
		},

		startup: function(){
			// description:
			//		Create color table, draw spinner's petals, and set initial states of the spinner

			var started = this._started;
			this.inherited(arguments);

			this.timeoutDuration = 0;
			this.colors = [];

			for(var i = 0; i < this.petals; i++){
				this.colors[i] = [];
				for (var j = 0; j < 3; j++) {
					this.colors[i][j] = this.startColor[j] + Math.floor((this.endColor[j] - this.startColor[j]) / this.petals * i);
				}
			}

			if(mode == "vml"){
				this.rotation = 0;
			}else{
				var context = this.domNode.getContext("2d");
				context.lineWidth = this.lineWidth;
				context.lineCap = "round";
				context.translate(this.size / 2, this.size / 2);
			}

			drawPetals(this);
			if(!started){
				this._setValueAttr(this.value);
			}
		},

		destroy: function(){
			// description:
			//		Stop the spinner to clean it up, before being destroyed

			this.set("value", 0);
			this.inherited(arguments);
		},

		_setValueAttr: function(value){
			// summary:
			//		Handler for calls to set("value", val).
			// description:
			//		If the value is greater than zero, start spinning. Otherwise, stop spinning.

			// If this spinner hasn't been started yet, bail
			if(!this._started){ return; }

			if(value <= 0){
				clearInterval(this.interval);
				clearTimeout(this.timeout);
				this.interval = void 0;
				this.timeout = void 0;
				this.timeoutDuration = 0;
			}else{
				if(typeof(this.interval) == "undefined"){
					this.interval = setInterval(lang.hitch(window, rotate, this), this.rotateInterval);
				}
				var timeoutDuration;
				if(this.timeoutDuration == 0){
					timeoutDuration = this.defaultTimeoutDuration;
				}
				if(timeoutDuration > this.timeoutDuration){
					clearTimeout(this.timeout);
					this.timeoutDuration = timeoutDuration;
					if(this.timeoutDuration != Infinity){
						this.timeout = setTimeout(lang.hitch(window, checkTimeout, this), this.timeoutDuration);
					}
				}
			}

			this.hideOnStop && domClass.toggle(this.domNode, "dijitHidden", value <= 0);
			this._set("value", value);
		}
	});
});
