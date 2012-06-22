define([
    "dojo/_base/kernel",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Stateful"
], function(kernel, lang, array, declare, Stateful){

    var StatefulObject = declare("dojox.mvc.StatefulObject", Stateful, {
        _objectParent: function(){},
        _refInParent: function(){},
        
        set: function(name, value){
            var ret,
                params = {
                    target: name,
                    old: this.get(name),
                    new: value
                };

            //params[name] = {old: this.get(name), new: value};

            if(value && lang.isFunction(value._setParent)){
                value._setParent(this, name);
            }
            ret = this.inherited(arguments);
            
            this.propagate(params);
            
            return ret;
        },
        
        propagate: function(params){
            // summary:
            //      Propagate threw parents

            if(this._watchChildrenCallbacks){
                this._watchChildrenCallbacks(params);
            }
            if(this._objectParent()){
                params.target = this._refInParent() +':'+params.target;
                //parentParams[this._refInParent()] = params;
                this._objectParent().propagate(params);
            }
        },
        
        _setParent: function(/*StatefulObject*/ parent, /*String*/ name){
            // summary:
            //      Set parent properties.
            
            // _objectParent and _refInParent are functions to prevent Generate.js
            // build them as they were model properties.
            this._objectParent = function(){ return parent; };
            this._refInParent = lang.isArray(parent) ? 
                    function(){ return parent.indexOf(this); }:
                    function(){ return name; };
        },
        
        watchChildren: function(/*Function*/ callback){
            // summary:
            //        Watch for change in object descendants.
            // callback: Function
            //        The callback function, which should take one parameter.

            var callbacks = this._watchChildrenCallbacks, _self = this;
            if(!callbacks){
                callbacks = this._watchChildrenCallbacks = function(params){
                    for(var list = [].concat(callbacks.list), i = 0; i < list.length; i++){
                        list[i].call(_self, params);
                    }
                };
                callbacks.list = [];
            }

            callbacks.list.push(callback);

            var h = {};
            h.unwatch = h.remove = function(){
                for(var list = callbacks.list, i = 0; i < list.length; i++){
                    if(list[i] == callback){
                        list.splice(i, 1);
                        break;
                    }
                }
            }; 
            return h; // dojo/handle
        }
    });
    
    return StatefulObject;
});
