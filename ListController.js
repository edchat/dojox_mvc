define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(darray, declare, _WidgetBase){
	return declare("dojox.mvc.ListController", _WidgetBase, {
		// summary:
		//		A controller working with array model, managing its cursor.

		// ownProps: Object
		//		The list of properties owned by this controller instead of the model.
		ownProps: {
			cursorId: 1,
			cursorIndex: 1,
			cursor: 1,
			model: 1,
			ownProps: 1
		},

		// idProperty: String
		//		The property name in element in the model array, that works as its identifier.
		idProperty: "uniqueId",

		// cursorId: String
		//		The ID of the selected element in the model array.
		cursorId: null,

		// cursorIndex: Number
		//		The index of the selected element in the model array.
		cursorIndex: -1,

		// cursor: dojo.Stateful
		//		The selected element in the model array.
		cursor: null,

		// model: dojox.mvc.StatefulArray
		//		The data model working as an array.
		model: null,

		// _modelWatchHandle: Object
		//		The watch handle of model.
		_modelWatchHandle: null,

		get: function(/*String*/ name){
			// summary:
			//		Returns a property in this controller or in the selected element in the model array.
			// name: String
			//		The property name.

			if(this.ownProps[name]){
				return this.inherited(arguments);
			}
			return this.getAtCursor(name);
		},

		set: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		Sets a property to this controller or to the selected element in the model array.
			// name: String
			//		The property name.
			// value: Anything
			//		The property value.

			if(this.ownProps[name]){
				return this.inherited(arguments);
			}
			return this.setAtCursor(name, value);
		},

		destroy: function(){
			if(this._modelWatchHandle){
				this._modelWatchHandle.unwatch();
				this._modelWatchHandle = null;
			}
			this.inherited(arguments);
		},

		getAtCursor: function(/*String*/ name){
			// summary:
			//		Returns a property in the selected element in the model array.
			// name: String
			//		The property name.

			if(this.cursor){
				return this.cursor.get(name);
			}
		},

		setAtCursor: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		Sets a property to the selected element in the model array.
			// name: String
			//		The property name.
			// value: Anything
			//		The property value.

			if(this.cursor){
				return this.cursor.set(name, value);
			}
		},

		_setCursorIdAttr: function(/*String*/ value){
			// summary:
			//		Handler for calls to set("cursorId", val).
			// description:
			//		Finds the index associated with the given cursor ID, and updates cursorIndex property.

			if(!this.model){ return; }
			for(var i = 0; i < this.model.length; i++){
				if(this.model[i][this.idProperty] == value){
					this.set("cursorIndex", i);
					return;
				}
			}
			this._set("cursorIndex", -1);
		},

		_setCursorIndexAttr: function(/*Number*/ value){
			// summary:
			//		Handler for calls to set("cursorIndex", val).
			// description:
			//		Updates cursor, cursorId, cursorIndex properties internally and call watch callbacks for them.

			if(!this.model){ return; }
			this._set("cursor", this.model[value]);
			this._set("cursorId", this.model[value] && this.model[value][this.idProperty]);
			this._set("cursorIndex", value);
		},

		_setCursorAttr: function(/*dojo.Stateful*/ value){
			// summary:
			//		Handler for calls to set("cursor", val).
			// description:
			//		Finds the index associated with the given element, and updates cursorIndex property.

			this.set("cursorIndex", darray.indexOf(this.model, value));
		},

		_setModelAttr: function(/*dojox.mvc.StatefulArray*/ value){
			// summary:
			//		Handler for calls to set("model", val).
			// description:
			//		Updates cursor upon the new model. Also watch for change in model so that cursor is maintained upon removals/adds.

			if(this._modelWatchHandle){
				this._modelWatchHandle.unwatch();
				this._modelWatchHandle = null;
			}
			var _self = this;
			this._modelWatchHandle = value.watchElements(function(idx, removals, adds){
				if(removals && adds){
					var curIdx = _self.get("cursorIndex");
					// If selected element is removed, make "no selection" state
					if(removals && curIdx >= idx && curIdx < idx + removals.length){
						this.set("cursorIndex", -1);
						return;
					}
					// If selected element is equal to or larger than the removals/adds point, update the selected index
					if((removals.length || adds.length) && curIdx >= idx){
						this.set("cursor", this.get("cursor"));
					}
				}else{
					// If there is a update to the whole array, update the selected index 
					this.set("cursor", this.get("cursor"));
				}
			});
			this._setCursorIndexAttr(this.cursorIndex);
			this._set("model", value);
		}
	});
});
