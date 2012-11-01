define([
	"dojo/_base/declare",
	"./ModelRefController",
	"./StoreControllerMixin"
], function(declare, ModelRefController, StoreControllerMixin){
	return declare("dojox.mvc.StoreRefController", [ModelRefController, StoreControllerMixin], {
		// summary:
		//		A child class of dojox.mvc.ModelRefController, which keeps a reference to Dojo Object Store (in store property).
		// description:
		//		Has several methods to work with the store:
		//
		//		- queryStore(): Runs query() against the store, and creates a data model from retrieved data
		//		- getStore(): Runs get() against the store, and creates a data model from retrieved data
		//		- putStore(): Runs put() against the store
		//		- addStore(): Runs add() against the store
		//		- removeStore(): Runs remove() against the store
		//
		//		dojo.Stateful get()/set()/watch() interfaces in dojox.mvc.StoreRefController will work with the data model from queryStore() or getStore().
		//
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.
		// example:
		//		The text box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property, from the data coming from data store ("store" property in the controller).
		//		Two seconds later, the text box changes from "Foo" to "Bar" as the controller gets new data from data store.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/parser", "dojo/when", "dojo/store/Memory", "dijit/registry", "dojo/domReady!"
		// |					], function(parser, when, Memory, registry){
		// |						store = new Memory({data: [{id: "Foo", value: "Foo"}, {id: "Bar", value: "Bar"}]});
		// |						when(parser.parse(), function(){
		// |							registry.byId("ctrl").getStore("Foo");
		// |							setTimeout(function(){ registry.byId("ctrl").getStore("Bar"); }, 2000);
		// |						});
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox.mvc.StoreRefController" data-dojo-props="store: store"></span>
		// |				<input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
	});
});