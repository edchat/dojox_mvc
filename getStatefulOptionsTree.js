define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"./StatefulObject",
	"./StatefulArray",
	"./getStateful"
], function(array, lang, StatefulObject, StatefulArray, getStateful){

    var StatefulOptions = {
        // summary:
        //		Options used for dojox/mvc/getStateful().

        getType: function(/*Anything*/ v){
            // summary:
            //		Returns the type of the given value.
            // v: Anything
            //		The value.

            return lang.isArray(v) ? "array" : v != null && {}.toString.call(v) == "[object Object]" ? "object" : "value";
        },

        getStatefulArray: function(/*Anything[]*/ a){
            // summary:
            //		Returns the stateful version of the given array.
            // a: Anything[]
            //		The array.

            var stateful = new StatefulArray([]); // dojox/mvc/StatefulArray
            stateful.push.apply(stateful, array.map(a, function(item){ return getStateful(item, this); }, this));
            return stateful;
        },

        getStatefulObject: function(/*Object*/ o){
            // summary:
            //		Returns the stateful version of the given object.
            // o: Object
            //		The object.

            var stateful = new StatefulObject();
            for(var s in o){
                stateful.set(s, getStateful(o[s], this));
            }
            return stateful; // dojo/Stateful
        },

        getStatefulValue: function(/*Anything*/ v){
            // summary:
            //		Just returns the given value.

            return v; // Anything
        }
    };
    
    return StatefulOptions;
});
