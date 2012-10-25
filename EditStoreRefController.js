define([
	"dojo/_base/declare",
	"./ModelRefController",
	"./EditModelRefControllerMixin",
	"./StoreRefControllerMixin"
], function(declare, ModelRefController, EditModelRefControllerMixin, StoreRefControllerMixin){
	return declare("dojox.mvc.EditStoreRefController", [ModelRefController, EditModelRefControllerMixin, StoreRefControllerMixin], {
		// summary:
		//		A child class of dojox/mvc/StoreRefController, managing edits.
		// description:
		//		In addition to what dojox/mvc/StoreRefController does, the commit() method sends the data model as well as the removed entries in array to the data store.
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.
		// example:
		//		The check box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property, from the data coming from data store ("store" property in the controller), using the first one in array.
		//		Two seconds later, the check box changes from unchecked to checked.
		//		The change is committed to the data store, which is reflected to dojo/store/Observable callback. 
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/when", "dojo/store/Observable", "dojo/store/Memory", "dijit/registry", "dojo/domReady!"
		// |					], function(ddom, parser, when, Observable, Memory, registry){
		// |						store = Observable(new Memory({data: [{id: "Foo", value: false}]}));
		// |						when(parser.parse(), function(){
		// |							registry.byId("ctrl").queryStore().observe(function(object, previousIndex, newIndex){
		// |								alert("ID: " + object.id + ", value: " + object.value);
		// |							}, true);
		// |							var count = 0;
		// |							var h = setInterval(function(){
		// |								ddom.byId("check").click();
		// |								registry.byId("ctrl").commit();
		// |								if(++count >= 2){ clearInterval(h); }
		// |							}, 2000);
		// |						});
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/EditStoreRefController" data-dojo-mixins="dojox/mvc/ListController"
		// |				 data-dojo-props="store: store, cursorIndex: 0"></span>
		// |				<input id="check" type="checkbox" data-dojo-type="dijit/form/CheckBox" data-dojo-props="checked: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
	});
});
