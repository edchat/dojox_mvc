define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/Destroyable"
], function(declare, lang, Destroyable){
	var undef;

	function findIndex(/*String*/ idProperty, /*Object*/ model, /*Object*/ cursor){
		if(lang.isArray(model)){
			for(var i = 0, l = model.length; i < l; ++i){
				if(model[i][idProperty] == cursor[idProperty]){
					return i;
				}
			}
		}else{
			for(var s in model){
				if(model[s][idProperty] == cursor[idProperty]){
					return s;
				}
			}
		}
	}

	function setRefSourceModel(/*dojox/mvc/EditModelRefListControllerMixin*/ ctrl, /*Anything*/ old, /*Anything*/ current){
		// summary:
		//		A function called when this controller gets newer value as the data source.
		// ctrl: dojox/mvc/EditModelRefControllerMixin
		//		The controller.
		// old: Anything
		//		The older value.
		// current: Anything
		//		The newer value.

		if(old !== current){
			ctrl._handleRefSourceModel && ctrl._handleRefSourceModel.remove();
			ctrl.own(ctrl._handleRefSourceModel = current.watch(function(name, old, current){
				if(old !== current){
					var index;
					index = findIndex(ctrl.idProperty, ctrl[ctrl._refOriginalModelProp], current);
					if(index !== undef){
						ctrl[ctrl._refOriginalModelProp].set(index, ctrl.holdModelUntilCommit ? current : ctrl.cloneModel(current));
					}
					index = findIndex(ctrl.idProperty, ctrl[ctrl._refEditModelProp], current);
					if(index !== undef){
						ctrl[ctrl._refEditModelProp].set(index, ctrl.holdModelUntilCommit ? ctrl.cloneModel(current) : current);
					}
				}
			}));
		}
	}

	return declare("dojox.mvc.EditModelRefListControllerMixin", Destroyable, {
		// summary:
		//		A mixin class to the combination of dojox/mvc/ModelRefController, dojox/mvc/EditModelRefControllerMixin and dojox/mvc/ListControllerMixin.
		// description:
		//		In addition to what the combination of dojox/mvc/ModelRefController, dojox/mvc/EditModelRefControllerMixin and dojox/mvc/ListControllerMixin does, this class adds an ability to save data (commit) of currently selected list item.
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
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditModelRefControllerMixin,dojox/mvc/ListControllerMixin,dojox/mvc/EditModelRefListControllerMixin" data-dojo-props="sourceModel: model, cursorIndex: 2"></span>
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
		// |				<span id="ctrlEdit" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditModelRefControllerMixin,dojox/mvc/ListControllerMixin,dojox/mvc/EditModelRefListControllerMixin" data-dojo-props="sourceModel: at('widget:ctrlSource', 'model'), cursorIndex: 2, holdModelUntilCommit: true"></span>
		// |				Source: <input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrlSource', 'value')">
		// |				Edit: <input id="text" type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrlEdit', 'value')">
		// |			</body>
		// |		</html>

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

		commitCurrent: function(){
			// summary:
			//		Send the change of currently selected list item back to the data source.

			var model = this[this.holdModelUntilCommit ? this._refSourceModelProp : this._refOriginalModelProp],
			 index = findIndex(this.idProperty, model, this.cursor);
			if(index !== undef){
				model.set(index, this.cloneModel(this.cursor));
			}
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
		}
	});
});