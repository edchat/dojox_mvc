define([
	"dojo/_base/declare",
	"./ModelRefController",
	"./EditControllerMixin"
], function(declare, ModelRefController, EditControllerMixin){
	return declare("dojox.mvc.EditModelRefController", [ModelRefController, EditControllerMixin], {
		// summary:
		//		A child class of dojox/mvc/ModelRefController.
		//		Keeps a copy (originalModel) of given data model (sourceModel) so that it can manage the data model of before/after the edit.
		// description:
		//		Has two modes:
		//
		//		- Directly reflect the edits to sourceModel (holdModelUntilCommit=false)
		//		- Don't reflect the edits to sourceModel, until commit() is called (holdModelUntilCommit=true)
		//
		//		For the 1st case, dojo/Stateful get()/set()/watch() interfaces will work with sourceModel.
		//		For the 2nd case, dojo/Stateful get()/set()/watch() interfaces will work with a copy of sourceModel, and sourceModel will be replaced with such copy when commit() is called.
		//
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.
		// example:
		//		The check box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property on behalf of the model ("model" property in the controller, which comes from "sourceModel" property).
		//		Two seconds later, the check box changes from unchecked to checked, and the controller saves the state.
		//		Two seconds later then, the check box changes from checked to unchecked.
		//		Two seconds later then, the controller goes back to the last saved state, and the check box changes from unchecked to checked as the result.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/Stateful", "dijit/registry", "dijit/form/CheckBox", "dojox/mvc/EditModelRefController", "dojo/domReady!"
		// |					], function(ddom, parser, Stateful, registry){
		// |						model = new Stateful({value: false});
		// |						setTimeout(function(){
		// |							ddom.byId("check").click();
		// |							registry.byId("ctrl").commit();
		// |							setTimeout(function(){
		// |								ddom.byId("check").click();
		// |								setTimeout(function(){
		// |									registry.byId("ctrl").reset();
		// |								}, 2000);
		// |							}, 2000);
		// |						}, 2000);
		// |						parser.parse();
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/EditModelRefController" data-dojo-props="sourceModel: model"></span>
		// |				<input id="check" type="checkbox" data-dojo-type="dijit/form/CheckBox" data-dojo-props="checked: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
		// example:
		//		The controller with "ctrlSource" ID specifies holding changes until commit() is called (by setting true to holdModelUntilCommit).
		//		As the change in the second check box is committed two seconds later from the change, the first check box is checked at then (when the change is committed).
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/Stateful", "dijit/registry",
		// |						"dijit/form/CheckBox", "dojox/mvc/ModelRefController", "dojox/mvc/EditModelRefController", "dojo/domReady!"
		// |					], function(ddom, parser, Stateful, registry){
		// |						model = new Stateful({value: false});
		// |						setTimeout(function(){
		// |							ddom.byId("checkEdit").click();
		// |							setTimeout(function(){
		// |								registry.byId("ctrlEdit").commit();
		// |							}, 2000);
		// |						}, 2000);
		// |						parser.parse();
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrlSource" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-props="model: model"></span>
		// |				<span id="ctrlEdit" data-dojo-type="dojox/mvc/EditModelRefController"
		// |				 data-dojo-props="sourceModel: at('widget:ctrlSource', 'model'), holdModelUntilCommit: true"></span>
		// |				Source:
		// |				<input id="checkSource" type="checkbox" data-dojo-type="dijit/form/CheckBox"
		// |				 data-dojo-props="checked: at('widget:ctrlSource', 'value')">
		// |				Edit:
		// |				<input id="checkEdit" type="checkbox" data-dojo-type="dijit/form/CheckBox"
		// |				 data-dojo-props="checked: at('widget:ctrlEdit', 'value')">
		// |			</body>
		// |		</html>
	});
});