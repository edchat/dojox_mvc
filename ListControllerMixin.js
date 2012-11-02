define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/declare"
], function(array, lang, declare){
	var undef;

	function findIndex(/*String*/ idProperty, /*Object*/ model, /*Object*/ cursor){
		if(lang.isArray(model)){
			for(var i = 0, l = model.length; i < l; ++i){
				if(model[i][idProperty] && model[i][idProperty] == cursor[idProperty]){
					return i;
				}
			}
		}else{
			for(var s in model){
				if(model[s][idProperty] && model[s][idProperty] == cursor[idProperty]){
					return s;
				}
			}
		}
	}

	function unwatchHandles(/*dojox/mvc/ListControllerMixin*/ c){
		// summary:
		//		Unwatch model watch handles.

		for(var s in {"_listModelWatchHandle": 1, "_tableModelWatchHandle": 1}){
			if(c[s]){
				c[s].unwatch();
				c[s] = null;
			}
		}
	}

	function setRefInModel(/*dojox/mvc/ListControllerMixin*/ ctrl, /*dojo/Stateful*/ old, /*dojo/Stateful*/ current){
		// summary:
		//		A function called when this controller gets newer value as the list data.

		unwatchHandles(ctrl);
		if(current && old !== current){
			if(current.watchElements){
				ctrl._listModelWatchHandle = current.watchElements(function(idx, removals, adds){
					if(removals && adds){
						var curIdx = ctrl.get("cursorIndex");
						// If selected element is removed, make "no selection" state
						if(removals && curIdx >= idx && curIdx < idx + removals.length){
							ctrl.set("cursorIndex", -1);
							return;
						}
						// If selected element is equal to or larger than the removals/adds point, update the selected index
						if((removals.length || adds.length) && curIdx >= idx){
							ctrl.set(ctrl._refCursorProp, ctrl.get("cursor"));
						}
					}else{
						// If there is a update to the whole array, update the selected index 
						ctrl.set(ctrl._refCursorProp, ctrl.get(ctrl._refCursorProp));
					}
				});
			}
			if(current.set && current.watch){
				if(ctrl.get("cursorIndex") < 0){ ctrl._set("cursorIndex", ""); }
				ctrl._tableModelWatchHandle = current.watch(function(name, old, current){
					if(old !== current && name == ctrl.get("cursorIndex")){
						ctrl.set(ctrl._refCursorProp, current);
					}
				});
			}
		}
		ctrl._setCursorIndexAttr(ctrl.cursorIndex);
	}

	function setRefSourceModel(/*dojox/mvc/EditModelRefListControllerMixin*/ ctrl, /*Anything*/ old, /*Anything*/ current){
		// summary:
		//		A function called when this controller gets newer value as the data source.
		// ctrl: dojox/mvc/EditControllerMixin
		//		The controller.
		// old: Anything
		//		The older value.
		// current: Anything
		//		The newer value.

		if(old !== current){
			ctrl._handleRefSourceModel && ctrl._handleRefSourceModel.remove();
			current && ctrl.own(ctrl._handleRefSourceModel = current.watch(function(name, old, current){
				if(!isNaN(name) && old !== current){
					ctrl[ctrl._refOriginalModelProp].set(name - 0, ctrl.holdModelUntilCommit ? current : ctrl.cloneModel(current));
					ctrl[ctrl._refEditModelProp].set(name - 0, ctrl.holdModelUntilCommit ? ctrl.cloneModel(current) : current);
				}
			}));
		}
	}

	function setRefCursor(/*dojox/mvc/ListControllerMixin*/ ctrl, /*dojo/Stateful*/ old, /*dojo/Stateful*/ current){
		// summary:
		//		A function called when this controller gets newer value as the data of current selection.
		// description:
		//		Finds the index associated with the given element, and updates cursorIndex property.

		var model = ctrl[ctrl._refInModelProp];
		if(!model){ return; }
		if(old !== current){
			if(lang.isArray(model)){
				var foundIdx = array.indexOf(model, current);
				if(foundIdx < 0){
					var targetIdx = ctrl.get("cursorIndex");
					if(targetIdx >= 0 && targetIdx < model.length){
						model.set(targetIdx, current);
					}
				}else{
					ctrl.set("cursorIndex", foundIdx);
				}
			}else{
				for(var s in model){
					if(model[s] == current){
						ctrl.set("cursorIndex", s);
						return;
					}
				}
				var targetIdx = ctrl.get("cursorIndex");
				if(targetIdx){
					model.set(targetIdx, current);
				}
			}
		}
	}

	return declare("dojox.mvc.ListControllerMixin", null, {
		// summary:
		//		A mixin to dojox/mvc/ModelRefController, working with array model, managing its cursor.
		// example:
		//		The text box changes its value every two seconds.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/parser", "dijit/registry", "dojox/mvc/StatefulArray", "dojo/domReady!"
		// |					], function(parser, registry, StatefulArray){
		// |						var count = 0;
		// |						model = new StatefulArray([{value: "First"}, {value: "Second"}, {value: "Third"}, {value: "Fourth"}, {value: "Fifth"}]);
		// |						setInterval(function(){ registry.byId("ctrl").set("cursorIndex", ++count % 5); }, 2000);
		// |						parser.parse();
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/ListControllerMixin" data-dojo-props="model: model"></span>
		// |				<input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
		// example:
		//		The text box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property, from the data model, using the third one in array.
		//		Two seconds later, the text box changes from "Third" to "3rd", and it's saved for reversion.
		//		Two seconds later then, the text box changes from "3rd" to "THIRD", and two seconds later then, the text box changes back to "3rd".
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/when", "dojo/Stateful", "dijit/registry", "dojox/mvc/StatefulArray", "dojo/domReady!"
		// |					], function(ddom, parser, when, Stateful, registry, StatefulArray){
		// |						model = new StatefulArray([
		// |							{uniqueId: 0, value: "First"},
		// |							{uniqueId: 1, value: "Second"},
		// |							{uniqueId: 2, value: "Third"},
		// |							{uniqueId: 3, value: "Fourth"},
		// |							{uniqueId: 4, value: "Fifth"}
		// |						]);
		// |						when(parser.parse(), function(){
		// |							setTimeout(function(){
		// |								registry.byId("text").set("value", "3rd");
		// |								registry.byId("ctrl").commitCurrent();
		// |								setTimeout(function(){
		// |									registry.byId("text").set("value", "THIRD");
		// |									setTimeout(function(){
		// |										registry.byId("ctrl").resetCurrent();
		// |									}, 2000);
		// |								}, 2000);
		// |							}, 2000);
		// |						});
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditControllerMixin,dojox/mvc/ListControllerMixin" data-dojo-props="sourceModel: model, cursorIndex: 2"></span>
		// |				<input id="text" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
		// example:
		//		The controller with "ctrlSource" ID specifies holding changes until commit() is called (by setting true to holdModelUntilCommit).
		//		As the change in the second text box is committed two seconds later from the change, the first text box is updated at then (when the change is committed).
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/when", "dojo/Stateful", "dijit/registry", "dojox/mvc/StatefulArray", "dojo/domReady!"
		// |					], function(ddom, parser, when, Stateful, registry, StatefulArray){
		// |						model = new StatefulArray([
		// |							{uniqueId: 0, value: "First"},
		// |							{uniqueId: 1, value: "Second"},
		// |							{uniqueId: 2, value: "Third"},
		// |							{uniqueId: 3, value: "Fourth"},
		// |							{uniqueId: 4, value: "Fifth"}
		// |						]);
		// |						when(parser.parse(), function(){
		// |							setTimeout(function(){
		// |								registry.byId("text").set("value", "3rd");
		// |								setTimeout(function(){
		// |									registry.byId("ctrlEdit").commitCurrent();
		// |								}, 2000);
		// |							}, 2000);
		// |						});
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrlSource" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/ListControllerMixin" data-dojo-props="model: model, cursorIndex: 2"></span>
		// |				<span id="ctrlEdit" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditControllerMixin,dojox/mvc/ListControllerMixin" data-dojo-props="sourceModel: at('widget:ctrlSource', 'model'), cursorIndex: 2, holdModelUntilCommit: true"></span>
		// |				Source: <input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrlSource', 'value')">
		// |				Edit: <input id="text" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrlEdit', 'value')">
		// |			</body>
		// |		</html>

		// idProperty: String
		//		The property name in element in the model array, that works as its identifier.
		idProperty: "uniqueId",

		// cursorId: String
		//		The ID of the selected element in the model array.
		cursorId: null,

		// cursorIndex: Number|String
		//		The index of the selected element in the model.
		cursorIndex: -1,

		// cursor: dojo/Stateful
		//		The selected element in the model array.
		cursor: null,

		// model: dojox/mvc/StatefulArray
		//		The data model working as an array.
		model: null,

		// _listModelWatchHandle: Object
		//		The watch handle of model, watching for array elements.
		_listModelWatchHandle: null,

		// _tableModelWatchHandle: Object
		//		The watch handle of model.
		_tableModelWatchHandle: null,

		// _refCursorProp: String
		//		The property name for the data model of the current selection.
		_refCursorProp: "cursor",

		// _refModelProp: String
		//		The property name for the data model.
		_refModelProp: "cursor",

		destroy: function(){
			unwatchHandles(this);
			this.inherited(arguments);
		},

		set: function(/*String*/ name, /*Anything*/ value){
			// summary:
			//		Set a property to this.
			// name: String
			//		The property to set.
			// value: Anything
			//		The value to set in the property.

			var oldRefInCursor = this[this._refCursorProp],
			 oldRefInModel = this[this._refInModelProp],
			 oldRefSourceModel = this[this._refSourceModelProp];
			this.inherited(arguments);
			if(name == this._refCursorProp){
				setRefCursor(this, oldRefInCursor, value);
			}
			if(name == this._refInModelProp){
				setRefInModel(this, oldRefInModel, value);
			}
			if(name == this._refSourceModelProp){
				setRefSourceModel(this, oldRefSourceModel, value);
			}
		},

		_setCursorIdAttr: function(/*String*/ value){
			// summary:
			//		Handler for calls to set("cursorId", val).
			// description:
			//		Finds the index associated with the given cursor ID, and updates cursorIndex property.

			var old = this.cursorId;
			this._set("cursorId", value);
			var model = this[this._refInModelProp];
			if(!model){ return; }
			if(old !== value){
				if(lang.isArray(model)){
					for(var i = 0; i < model.length; i++){
						if(model[i][this.idProperty] == value){
							this.set("cursorIndex", i);
							return;
						}
					}
					this._set("cursorIndex", -1);
				}else{
					for(var s in model){
						if(model[s][this.idProperty] == value){
							this.set("cursorIndex", s);
							return;
						}
					}
					this._set("cursorIndex", "");
				}
			}
		},

		_setCursorIndexAttr: function(/*Number*/ value){
			// summary:
			//		Handler for calls to set("cursorIndex", val).
			// description:
			//		Updates cursor, cursorId, cursorIndex properties internally and call watch callbacks for them.

			this._set("cursorIndex", value);
			if(!this[this._refInModelProp]){ return; }
			this.set(this._refCursorProp, this[this._refInModelProp][value]);
			this.set("cursorId", this[this._refInModelProp][value] && this[this._refInModelProp][value][this.idProperty]);
		},

		commitCurrent: function(){
			// summary:
			//		Send the change of currently selected list item back to the data source.

			var model = this[this.holdModelUntilCommit ? this._refSourceModelProp : this._refOriginalModelProp],
			 index = findIndex(this.idProperty, model, this.cursor);
			if(index !== undef){
				model.set(index, this.cloneModel(this.cursor));
			}
			this.inherited(arguments);
		},

		resetCurrent: function(){
			// summary:
			//		Change the currently selected list item back to its original state.

			var model = this[this.holdModelUntilCommit ? this._refEditModelProp : this._refSourceModelProp],
			 originalModel = this[this._refOriginalModelProp],
			 index = findIndex(this.idProperty, model, this.cursor),
			 originalModelIndex = findIndex(this.idProperty, originalModel, this.cursor);
			if(index !== undef && originalModelIndex !== undef){
				model.set(index, this.cloneModel(originalModel[originalModelIndex]));
			}
			this.inherited(arguments);
		},

		hasControllerProperty: function(/*String*/ name){
			// summary:
			//		Returns true if this controller itself owns the given property.
			// name: String
			//		The property name.

			return this.inherited(arguments) || name == this._refCursorProp;
		}
	});
});
