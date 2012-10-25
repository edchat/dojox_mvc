define(["dojo/_base/declare"], function(declare){
	return declare("dojox.mvc.EditStoreRefListControllerMixin", null, {
		// summary:
		//		A mixin class to the combination of dojox/mvc/ModelRefController, dojox/mvc/EditModelRefControllerMixin, dojox/mvc/StoreRefControllerMixin, dojox/mvc/EditStoreRefControllerMixin, dojox/mvc/ListControllerMixin, dojox/mvc/EditModelRefListControllerMixin and dojox/mvc/EditStoreRefControllerMixin.
		// description:
		//		In addition to what the combination of dojox/mvc/ModelRefController, dojox/mvc/EditModelRefControllerMixin, dojox/mvc/StoreRefControllerMixin, dojox/mvc/EditStoreRefControllerMixin, dojox/mvc/ListControllerMixin, dojox/mvc/EditModelRefListControllerMixin and dojox/mvc/EditStoreRefControllerMixin does, this class adds an ability to save data (commit) of currently selected list item.
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
		// |						"dojo/dom", "dojo/parser", "dojo/store/Observable", "dojo/store/Memory", "dijit/registry", "dojo/domReady!"
		// |					], function(ddom, parser, Observable, Memory, registry){
		// |						store = Observable(new Memory({data: [{id: "Foo", value: false}]}));
		// |						parser.parse();
		// |						registry.byId("ctrl").queryStore().observe(function(object, previousIndex, newIndex){
		// |							alert("ID: " + object.id + ", value: " + object.value);
		// |						}, true);
		// |						var count = 0;
		// |						var h = setInterval(function(){
		// |							ddom.byId("check").click();
		// |							registry.byId("ctrl").commitCurrent();
		// |							if(++count >= 2){ clearInterval(h); }
		// |						}, 2000);
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditModelRefControllerMixin,dojox/mvc/StoreRefControllerMixin,dojox/mvc/EditStoreRefControllerMixin,dojox/mvc/ListControllerMixin,dojox/mvc/EditModelRefListControllerMixin,dojox/mvc/EditStoreRefListControllerMixin"
		// |				 data-dojo-props="uniqueId: 'id', store: store, cursorIndex: 0"></span>
		// |				<input id="check" type="checkbox" data-dojo-type="dijit/form/CheckBox" data-dojo-props="checked: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>

		commitCurrent: function(){
			// summary:
			//		Send the change of currently selected list item back to the data source for the current index.

			this.inherited(arguments);
			this.store.put(this.cursor);
		}
	});
});
