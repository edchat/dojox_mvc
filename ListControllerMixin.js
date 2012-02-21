define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"./ModelRefControllerMixin"
], function(darray, declare, ModelRefControllerMixin){
	function setRefListModel(/*dojox.mvc.StatefulArray*/ value){
		// summary:
		//		A function called when this controller gets newer value as the list data.
		// value: Anything
		//		The data serving as the list data.

		if(this._listModelWatchHandle){
			this._listModelWatchHandle.unwatch();
			this._listModelWatchHandle = null;
		}
		var _self = this;
		this._listModelWatchHandle = value.watchElements(function(idx, removals, adds){
			if(removals && adds){
				var curIdx = _self.get("cursorIndex");
				// If selected element is removed, make "no selection" state
				if(removals && curIdx >= idx && curIdx < idx + removals.length){
					_self.set("cursorIndex", -1);
					return;
				}
				// If selected element is equal to or larger than the removals/adds point, update the selected index
				if((removals.length || adds.length) && curIdx >= idx){
					_self.set("cursor", this.get("cursor"));
				}
			}else{
				// If there is a update to the whole array, update the selected index 
				_self.set("cursor", _self.get("cursor"));
			}
		});

		this._set(this._refListModelProp, value);
		this._setCursorIndexAttr(this.cursorIndex);
	}

	return declare("dojox.mvc.ListControllerMixin", ModelRefControllerMixin, {
		// summary:
		//		A controller, used as a mixin to dojox.mvc._Controller or dijit._WidgetBase descendants, working with array model, managing its cursor.
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.

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

		// _listModelWatchHandle: Object
		//		The watch handle of model.
		_listModelWatchHandle: null,

		// _refListModelProp: String
		//		The property name for the data model of the list.
		_refListModelProp: "model",

		// _refModelProp: String
		//		The property name for the data model.
		_refModelProp: "cursor",

		postscript: function(/*Object?*/ params, /*DomNode|String?*/ srcNodeRef){
			// summary:
			//		Sets the setter for _refListModelProp.

			var setterName = "_set" + this._refListModelProp.replace(/^[a-z]/, function(c){ return c.toUpperCase(); }) + "Attr";
			this[setterName] = setRefListModel;
			this.inherited(arguments);
		},

		destroy: function(){
			if(this._listModelWatchHandle){
				this._listModelWatchHandle.unwatch();
				this._listModelWatchHandle = null;
			}
			this.inherited(arguments);
		},

		_setCursorIdAttr: function(/*String*/ value){
			// summary:
			//		Handler for calls to set("cursorId", val).
			// description:
			//		Finds the index associated with the given cursor ID, and updates cursorIndex property.

			if(!this[this._refListModelProp]){ return; }
			for(var i = 0; i < this[this._refListModelProp].length; i++){
				if(this[this._refListModelProp][i][this.idProperty] == value){
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

			if(!this[this._refListModelProp]){ return; }
			this._set("cursorIndex", value);
			this._set("cursor", this[this._refListModelProp][value]);
			this._set("cursorId", this[this._refListModelProp][value] && this[this._refListModelProp][value][this.idProperty]);
		},

		_setCursorAttr: function(/*dojo.Stateful*/ value){
			// summary:
			//		Handler for calls to set("cursor", val).
			// description:
			//		Finds the index associated with the given element, and updates cursorIndex property.

			var foundIdx = darray.indexOf(this[this._refListModelProp], value);
			if(foundIdx < 0){
				var targetIdx = this.get("cursorIndex");
				if(targetIdx >= 0 && targetIdx < this[this._refListModelProp].length){
					this[this._refListModelProp].set(targetIdx, value);
				}
			}else{
				this.set("cursorIndex", foundIdx);
			}
		}
	});
});
