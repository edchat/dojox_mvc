define([
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"./_atBindingMixin",
	"dijit/registry"
], function(aspect, domAttr, domClass, array, lang, _WidgetBase, _atBindingMixin){
	function domSetter(/*String*/ attr, /*Object*/ commands){
		// summary:
		//		Return setter for a DOMNode attribute, innerHTML, or innerText.
		//		Note some attributes like "type" cannot be processed this way as they are not mutable.
		// attr:
		//		Name of widget attribute, ex: "label"
		// commands:
		//		A single command or array of commands.  A command is:
		//
		//			- a string like "focusNode" to set this.focusNode[attr]
		//			- an object like {node: "labelNode", type: "attribute", attribute: "role" } to set this.labelNode.role
		//			- an object like {node: "domNode", type: "class" } to set this.domNode.className
		//			- an object like {node: "labelNode", type: "innerHTML" } to set this.labelNode.innerHTML
		//			- an object like {node: "labelNode", type: "innerText" } to set this.labelNode.innerText

		function simpleDomSetter(command){
			var mapNode = command.node || command || "domNode";	// this[mapNode] is the DOMNode to adjust
			switch(command.type){
				case "innerText":
					return function(value){
						this[mapNode].innerHTML = "";
						this[mapNode].appendChild(this.ownerDocument.createTextNode(value));
						this._set(attr, value);
					};
				case "innerHTML":
					return function(value){
						this[mapNode].innerHTML = value;
						this._set(attr, value);
					};
				case "class":
					return function(value){
						domClass.replace(this[mapNode], value, this._get(attr));
						this._set(attr, value);
					};
				default:
					// Map to DOMNode attribute, or attribute on a supporting widget.
					// First, get the name of the DOM node attribute; usually it's the same
					// as the name of the attribute in the widget (attr), but can be overridden.
					// Also maps handler names to lowercase, like onSubmit --> onsubmit
					var attrName = command.attribute ? command.attribute :
						(/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);

					return function(value){
						if(typeof value == "function"){ // functions execute in the context of the widget
							value = lang.hitch(this, value);
						}
						if(this[mapNode].tagName){
							// Normal case, mapping to a DOMNode.  Note that modern browsers will have a mapNode.setAttribute()
							// method, but for consistency we still call domAttr().  For 2.0 change to set property?
							domAttr.set(this[mapNode], attrName, value);
						}else{
							// mapping to a sub-widget
							this[mapNode].set(attrName, value);
						}
						this._set(attr, value);
					};
			}
		}

		if(lang.isArray(commands)){
			// Unusual case where there's a list of commands, ex: _setFooAttr: ["focusNode", "domNode"].
			var setters = array.map(commands, simpleDomSetter);
			return function(value){
				array.forEach(setters, function(setter){
					setter.call(this, value);
				}, this);
			};
		}else{
			return simpleDomSetter(commands);
		}
	}

	// Apply the at binding mixin to all dijits, see mixin class description for details.
	// Hiding this from the doc viewer since it's too much to display for every single widget.
	lang.extend(_WidgetBase, /*===== {} || =====*/ _atBindingMixin.prototype);

	// Monkey patch dijit._WidgetBase.postscript to get the list of dojox/mvc/at handles before startup
	aspect.before(_WidgetBase.prototype, "postscript", function(/*Object?*/ params, /*DomNode|String*/ srcNodeRef){
		this._dbpostscript(params, srcNodeRef);
	});

	// Monkey patch dijit._WidgetBase.startup to get data binds set up
	aspect.before(_WidgetBase.prototype, "startup", function(){
		this._startAtWatchHandles();
	});

	// Monkey patch dijit._WidgetBase.destroy to remove watches setup in _DataBindingMixin
	aspect.before(_WidgetBase.prototype, "destroy", function(){
		this._stopAtWatchHandles();
	});

	// Monkey patch dijit._WidgetBase.set to establish data binding if a dojox/mvc/at handle comes
	aspect.around(_WidgetBase.prototype, "set", function(oldWidgetBaseSet){
		return function(/*String*/ name, /*Anything*/ value){
			if(name == _atBindingMixin.prototype.dataBindAttr){
				return this._setBind(value);
			}else if((value || {}).atsignature == "dojox.mvc.at"){
				return this._setAtWatchHandle(name, value);
			}
			var names = this._getAttrNames(name),
				setter = this[names.s],
				prop = this.constructor._props[name.replace(/-[a-zA-Z]/g, function(c){ return c.charAt(1).toUpperCase(); })];
			if(!prop && setter){
				return (typeof setter == "function" ? setter : (setter || setter === "") ? domSetter(name, setter) : function(val){
					// _setFooAttr: null or _setFooAttr: undefined means to *not* apply the value to a DOMNode
					this._set(name, val);
				}).call(this, value) || this;
			}
			return oldWidgetBaseSet.apply(this, lang._toArray(arguments));
		};
	});
});
