define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"./at",
	"./Stateful",
	"./_atBindingMixin"
], function(declare, lang, at, Stateful, _atBindingMixin){
	return declare("dojox.mvc.ModelRefController", [Stateful, _atBindingMixin], {
		// summary:
		//		A controller working with a data model as a reference.
		//		Manages change in model as well as change in model properties.

		// ownProps: Object
		//		List of property names owned by this controller, instead of the data model.
		ownProps: null,

		// _refModelProp: String
		//		The property name for the data model.
		_refModelProp: "model",

		postscript: function(/*Object?*/ params, /*DomNode|String?*/ srcNodeRef){
			// summary:
			//		If this object is not called from Dojo parser, starts this up right away.
			//		Also, if widget registry is available, register this object.

			this._dbpostscript(params, srcNodeRef);
			if(params){
				this.params = params;
				for(var s in params){
					this.set(s, params[s]);
				}
			}
			var registry;
			try{
				// Usage of dijit/registry module is optional. Do not use it if it's not already loaded.
				registry = require("dijit/registry");
				this.id = this.id || (srcNodeRef || {}).id || registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
				registry.add(this);
			}catch(e){}
			if(!srcNodeRef){
				this.startup();
			}
		},

		startup: function(){
			// summary:
			//		Starts up data binding as this object starts up.

			this._startAtWatchHandles();
			this.inherited(arguments);
		},

		destroy: function(){
			// summary:
			//		Stops data binding as this object is destroyed.

			this._stopAtWatchHandles();
			this.inherited(arguments);
		},

		get: function(/*String*/ name){
			// summary:
			//		If getter function is there, use it. Otherwise, get the data from data model of this object.
			// name: String
			//		The property name.

			var getterName = "_get" + name.replace(/^[a-z]/, function(c){ return c.toUpperCase(); }) + "Attr";
			if(!this[getterName] && name != this._refModelProp && !(name in (this.ownProps || {})) && !(name in this.constructor.prototype)){
				var model = this[this._refModelProp];
				return model && model.get(name);
			}
			return this.inherited(arguments);
		},

		set: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		If the value given is dojox.mvc.at handle, use it for data binding.
			//		Otherwise, if setter function is there, use it.
			//		Otherwise, set the value to the data model or to this object.
			// name: String
			//		The property name.
			// value: Anything
			//		The property value.

			if((value || {}).atsignature == "dojox.mvc.at"){
				return this._setAtWatchHandle(name, value);
			}
			return this.inherited(arguments);
		},

		_set: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		Set the value to the data model or to this object.
			// name: String
			//		The property name.
			// value: Anything
			//		The property value.

			if(name != this._refModelProp && !(name in (this.ownProps || {})) && !(name in this.constructor.prototype)){
				var model = this[this._refModelProp];
				model && model.set(name, value);
				return this;
			}
			return this.inherited(arguments);
		},

		watch: function(/*String?*/ name, /*Function*/ callback){
			// summary:
			//		Watch a propertyin  the data model or in this object.
			// name: String?
			//		The property name.
			// callback: Function
			//		The callback function.

			if(name == this._refModelProp || (name in (this.ownProps || {})) || (name in this.constructor.prototype)){
				return this.inherited(arguments);
			}

			if(!callback){
				callback = name;
				name = null;
			}

			var hm = null, hp = null;

			function watchModel(model){
				if(hp){ hp.unwatch(); }
				var args = (name ? [name] : []).concat([function(name, old, current){ callback(name, old, current); }]);
				hp = model && lang.isFunction(model.set) && lang.isFunction(model.watch) && model.watch.apply(model, args);
			}

			hm = this.inherited("watch", [this._refModelProp, function(name, old, current){ if(old !== current){ watchModel(current); } }]);
			watchModel(this[this._refModelProp]);

			return {
				unwatch: function(){
					if(hp){ h.unwatch(); } if(hm){ h.unwatch(); }
				}
			};
		}
	});
})
