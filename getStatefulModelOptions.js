define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"./getStateful",
	"./StatefulArray",
	"./StatefulModel"
], function(darray, lang, getStateful, StatefulArray, StatefulModel){
	return /*===== dojox.mvc.getStatefulModelOptions = =====*/ {
		// summary:
		//		An object that defines how model object should be created from plain object hierarchy.

		getStatefulArray: function(/*Anything[]*/ a){
			// summary:
			//		Create a stateful array from a plain array.
			// a: Anything[]
			//		The plain array.

			var _self = this, array = lang.mixin(new StatefulArray(darray.map(a, function(item){ return getStateful(item, _self); })));
			for(var s in StatefulModel.prototype){
				if(s != "set"){ array[s] = StatefulModel.prototype[s]; }
			}
			array.data = a;
			return array;
		},

		getStatefulObject: function(/*Object*/ o){
			// summary:
			//		Create a stateful object from a plain object.
			// o: Object
			//		The plain object.

			var object = new StatefulModel({data: {}});
			object.data = o;
			for(var s in o){
				object.set(s, getStateful(o[s], this));
			}
			return object; // dojox.mvc.StatefulModel
		},

		getStatefulValue: function(/*Anything*/ v){
			// summary:
			//		Create a stateful value from a plain value.
			// v: Anything
			//		The plain value.

			var value = new StatefulModel({data: {}});
			value.data = v;
			value.set("value", v);
			return value;
		}
	};
});
