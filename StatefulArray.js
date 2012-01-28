define([
	"dojo/_base/lang",
	"dojo/Stateful"
], function(lang, Stateful){
	function update(/*dojox.mvc.StatefulArray*/ a){
		// summary:
		//		Set all array elements as stateful so that watch function runs.
		// a: dojox.mvc.StatefulArray
		//		The array.

		for(var i = 0; i < a.get("length"); i++){
			a.set(i, a[i]);
		}
		return a; // dojox.mvc.StatefulArray
	}

	function splice(/*dojox.mvc.StatefulArray*/ a, /*Number*/ idx, /*Number*/ n){
		// summary:
		//		Removes and then adds some elements to an array.
		//		Updates the removed/added elements, as well as the length, as stateful.
		// a: dojox.mvc.StatefulArray
		//		The array.
		// idx: Number
		//		The index where removal/addition should be done.
		// n: Number
		//		How many elements to be removed at idx.
		// varargs: Anything[]
		//		The elements to be added to idx.
		// returns: dojox.mvc.StatefulArray
		//		The removed elements.

		var l = a.get("length"),
		 p = Math.min(idx, l),
		 removals = a.slice(idx, idx + n),
		 adds = lang._toArray(arguments).slice(3),
		 slid = a.notifySlides && a.slice(idx, idx + l - p - n);

		// If we don't need to notify slid elements, do the modification in a native manner except for setting additions
		if(!a.notifySlides){
			[].splice.apply(this, [idx, n].concat(new Array(adds.length)));
		}

		// Set additions in a stateful manner
		for(var i = 0; i < adds.length; i++){
			a.set(p + i, adds[i]);
		}

		// Set slid elements in a stateful manner to notify of them
		if(a.notifySlides && (n > 0 || adds.length > 0)){
			for(i = 0; i < slid.length; i++){
				a.set(p + adds.length + i, slid[i]);
			}
		}

		// Set elements of reduced index, in a stateful manner
		for(var i = l - n + adds.length; i < l; i++){
			a.set(i, void 0);
		}

		// Update the length
		a.set("length", l - n + adds.length);

		return removals; // dojox.mvc.StatefulArray
	}

	function join(/*dojox.mvc.StatefulArray*/ a, /*String*/ sep){
		// summary:
		//		Returns a string joining string elements in a, with a separator.
		// a: dojox.mvc.StatefulArray
		//		The array.
		// sep: String
		//		The separator.

		var list = [];
		for(var l = this.get("length"), i = 0; i < l; i++){
			list.push(a.get(i));
		}
		return list.join(sep); // String
	}

	function slice(/*dojox.mvc.StatefulArray*/ a, /*Number*/ start, /*Number*/ end){
		// summary:
		//		Returns partial elements of an array.
		// a: dojox.mvc.StatefulArray
		//		The array.
		// start: Number
		//		The index to begin with.
		// end: Number
		//		The index to end at. (a[end] won't be picked up)

		var slice = [], end = typeof end === "undefined" ? a.get("length") : end;
		for(var i = start; i < Math.min(end, a.get("length")); i++){
			slice.push(a.get(i));
		}
		return new StatefulArray(slice); // dojox.mvc.StatefuArray
	}

	function set(/*dojox.mvc.StatefulArray*/ a, /*Number|String*/ name, /*Anything*/ value){
		// summary:
		//		Sets a new value to an array.
		// a: dojox.mvc.StatefulArray
		//		The array.
		// name: Number|String
		//		The property name.
		// value: Anything
		//		The new value.

		if(arguments.callee.caller.caller == splice){
			return Stateful.prototype.set.call(this, name, value);
		}else if(name == "length"){
			var old = a.get("length");
			if(old < value){
				a.splice.apply(a, [old, 0].concat(new Array(value - old)))
			}else if(value > old){
				a.splice.apply(a, [value, old - value]);
			}
			return this;
		}else{
			Stateful.prototype.set.call(this, name, value);
			return Stateful.prototype.set.call(this, "length", this.length);
		}
	}

	var StatefulArray = /*===== dojox.mvc.StatefulArray = =====*/ function(/*Anything[]*/ a){
		// summary:
		//		An inheritance of native JavaScript array, that adds dojo.Stateful capability.
		// description:
		//		Supported methods are:
		//
		//			* pop() - Stateful update is done for the removed element, as well as the length.
		//			* push() - Stateful update is done for the added element, as well as the length.
		//			* reverse() - Stateful update is done for the elements.
		//			* shift() - Stateful update is done for the removed element, as well as the length.
		//			* sort() - Stateful update is done for the elements.
		//			* splice() - Stateful update is done for the removed/added elements, as well as the length. Returns an instance of StatefulArray instead of the native array.
		//			* unshift() - Stateful update is done for the added element, as well as the length.
		//			* concat() - Returns an instance of StatefulArray instead of the native Array.
		//			* join() - The length as well as the elements are obtained via stateful getters, instead of direct access.
		//			* slice() - The length as well as the elements are obtained via stateful getters, instead of direct access.
		//			* Setting an element to this array via set() - Stateful update is done for the new element as well as the new length.
		//			* Setting a length to this array via set() - Stateful update is done for the removed/added elements as well as the new length.

		var array = lang._toArray(a);
		var ctor = StatefulArray;
		ctor._meta = {bases: [Stateful]}; // For isInstanceOf()
		array.constructor = ctor;
		return lang.mixin(array, {
			pop: function(){
				return this.splice(this.get("length") - 1, 1)[0];
			},
			push: function(){
				this.splice.apply(this, [this.get("length"), 0].concat(lang._toArray(arguments)));
				return this.get("length");
			},
			reverse: function(){
				return update([].reverse.apply(this, lang._toArray(arguments)));
			},
			shift: function(){
				return this.splice(0, 1)[0];
			},
			sort: function(){
				return update([].sort.apply(this, lang._toArray(arguments)));
			},
			splice: function(/*Number*/ idx, /*Number*/ n){
				return splice.apply(this, [this].concat(lang._toArray(arguments)));
			},
			unshift: function(){
				this.splice.apply(this, [0, 0].concat(lang._toArray(arguments)));
				return this.get("length");
			},
			concat: function(/*Array*/ a){
				return new StatefulArray([].concat(this).concat(a));
			},
			join: function(/*String*/ sep){
				return join.apply(this, [this].concat(lang._toArray(arguments)));
			},
			slice: function(/*Number*/ start, /*Number*/ end){
				return slice.apply(this, [this].concat(lang._toArray(arguments)));
			}
		}, Stateful.prototype, {
			set: function(/*Number|String*/ name, /*Anything*/ value){
				return set.apply(this, [this].concat(lang._toArray(arguments)));
			}
		});
	};

	return lang.setObject("dojox.mvc.StatefulArray", StatefulArray);
});
