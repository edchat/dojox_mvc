define([
	"dojo/_base/declare",
	"dojo/Stateful"
], function(declare, Stateful){
	return declare("dojox.mvc.Stateful", Stateful, {
		// summary:
		//		dojo.Stateful extension, supporting pre-defined getters/setters.
		// description:
		//		dojo.Stateful extension.
		//		getXXXProp()/setXXXProp() functions are used for getter/setter if those corresponding to name are defined.

		get: function(/*String*/ name){
			// summary:
			//		Returns a property in this object.
			// description:
			//		Returns a property in this object. If getXXXProp() function corresponding to name is defined, uses it. 
			// name: String
			//		The property name.

			var getterName = "_get" + name.replace(/^[a-z]/, function(c){ return c.toUpperCase(); }) + "Prop";
			if(this[getterName]){
				return this[name] = this[getterName]();
			}
			return this.inherited(arguments);
		},

		set: function(/*String*/name, value){
			// summary:
			//		Set a property to this.
			// description:
			//		Sets a property to this. If setXXXProp() function corresponding to name is defined, uses it. 
			// name: String
			//		The property to set.
			// value:
			//		The value to set in the property.

			var oldValue = this[name];

			var setterName = "_set" + name.replace(/^[a-z]/, function(c){ return c.toUpperCase(); }) + "Prop";
			if(this[setterName]){
				this[setterName](value);
			}else{
				this[name] = value;
			}

			if(this._watchCallbacks){
				this._watchCallbacks(name, oldValue, value);
			}

			return this;
		}
	});
});
