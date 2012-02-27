define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"./getPlainValue",
	"./getStateful",
	"./ModelRefController"
], function(declare, lang, getPlainValue, getStateful, ModelRefController){
	function setRefSourceModel(/*dojox.mvc.EditModelRefController*/ ctrl, /*Anything*/ old, /*Anything*/ current){
		// summary:
		//		A function called when this controller gets newer value as the data source.
		// ctrl: dojox.mvc.EditModelRefController
		//		The controller.
		// old: Anything
		//		The older value.
		// current: Anything
		//		The newer value.

		if(old !== current){
			ctrl.set(ctrl._refOriginalModelProp, ctrl.holdModelUntilCommit ? current : ctrl.cloneModel(current));
			ctrl.set(ctrl._refEditModelProp, ctrl.holdModelUntilCommit ? ctrl.cloneModel(current) : current);
		}
	}

	return declare("dojox.mvc.EditModelRefController", ModelRefController, {
		// summary:
		//		A controller that takes a data model as a data source.
		//		When this controller gets such data model, it creates a copy of that and works with it as the data model.
		//		This controller can reset the data model to the data source it originally got (reset()), or send the change back to the data source (commit()).
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.

		// getStatefulOptions: dojox.mvc.getStatefulOptions
		//		The options to get stateful object from plain value.
		getStatefulOptions: null,

		// getPlainValueOptions: dojox.mvc.getPlainValueOptions
		//		The options to get plain value from stateful object.
		getPlainValueOptions: null,

		// holdModelUntilCommit: Boolean
		//		True not to send the change in model back to sourceModel until commit() is called.
		holdModelUntilCommit: false,

		// originalModel: dojo.Stateful
		//		The data model, that serves as the original data.
		originalModel: null,

		// originalModel: dojo.Stateful
		//		The data model, that serves as the data source.
		sourceModel: null,

		// _refOriginalModelProp: String
		//		The property name for the data model, that serves as the original data.
		_refOriginalModelProp: "originalModel",

		// _refSourceModelProp: String
		//		The property name for the data model, that serves as the data source.
		_refSourceModelProp: "sourceModel",

		// _refEditModelProp: String
		//		The property name for the data model, that is being edited.
		_refEditModelProp: "model",

		postscript: function(/*Object?*/ params, /*DomNode|String?*/ srcNodeRef){
			// summary:
			//		Sets certain properties before setting models.

			for(var s in {getStatefulOptions: 1, getPlainValueOptions: 1, holdModelUntilCommit: 1}){
				var value = (params || {})[s];
				if(typeof value != "undefined"){
					this[s] = value;
				}
			}
			this.inherited(arguments);
		},

		set: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		Set a property to this.
			// name: String
			//		The property to set.
			// value: Anything
			//		The value to set in the property.

			if(name == this._refSourceModelProp){
				setRefSourceModel(this, this[this._refSourceModelProp], value);
			}
			this.inherited(arguments);
		},

		cloneModel: function(/*Anything*/ value){
			// summary:
			//		Create a clone object of the data source.
			//		Child classes of this controller can override it to achieve its specific needs.
			// value: Anything
			//		The data serving as the data source.

			var plain = lang.isFunction((value || {}).set) && lang.isFunction((value || {}).watch) ? getPlainValue(value, this.getPlainValueOptions) : value;
			return getStateful(plain, this.getStatefulOptions);
		},

		commit: function(){
			// summary:
			//		Send the change back to the data source.

			this.set(this.holdModelUntilCommit ? this._refSourceModelProp : this._refOriginalModelProp, this.cloneModel(this.get(this._refEditModelProp)));
		},

		reset: function(){
			// summary:
			//		Change the model back to its original state.

			this.set(this.holdModelUntilCommit ? this._refEditModelProp : this._refSourceModelProp, this.cloneModel(this.get(this._refOriginalModelProp)));
		},

		hasControllerProperty: function(/*String*/ name){
			// summary:
			//		Returns true if this controller itself owns the given property.
			// name: String
			//		The property name.

			return this.inherited(arguments) || name == this._refOriginalModelProp || name == this._refSourceModelProp;
		}
	});
});
