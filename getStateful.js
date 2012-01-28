define(["dojo/_base/lang"], function(lang){
	/*=====
	dojox.mvc.getStatefulOptions = {
		// summary:
		//		An object that defines how model object should be created from plain object hierarchy.

		getStatefulArray: function(a){
			// summary:
			//		Create a stateful array from a plain array.
			// a: Anything[]
			//		The plain array.

			return a; // dojox.mvc.StatefulArray
		},

		getStatefulObject: function(o){
			// summary:
			//		Create a stateful object from a plain object.
			// o: Object
			//		The plain object.

			return o; // dojo.Stateful
		},

		getStatefulValue: function(v){
			// summary:
			//		Create a stateful value from a plain value.
			// v: Anything
			//		The plain value.

			return v; // Anything
		}
	};
	=====*/

	var getStateful = /*===== dojox.mvc.getStateful = =====*/ function(/*Anything*/ value, /*dojox.mvc.getStatefulOptions*/ options){
		// summary:
		//		Create a dojo.Stateful object from a raw value.
		// description:
		//		Recursively iterates the raw value given, and convert them to stateful ones.
		// value: Anything
		//		The raw value.
		// options: Object
		//		The object that defines how model object should be created from plain object hierarchy.
		// returns: Anything
		//		 The converted value.

		if(lang.isArray(value)){
			return options.getStatefulArray(value);
		}else if({}.toString.call(value) == "[object Object]"){
			return options.getStatefulObject(value);
		}else{
			return options.getStatefulValue(value);
		}
	};

	return lang.setObject("dojox.mvc.getStateful", getStateful);
});
