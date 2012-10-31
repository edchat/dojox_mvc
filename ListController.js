define([
	"dojo/_base/declare",
	"./ModelRefController",
	"./ListControllerMixin"
], function(declare, ModelRefController, ListControllerMixin){
	return declare("dojox.mvc.ListController", [ModelRefController, ListControllerMixin], {
		// summary:
		//		A controller working with array model, managing its cursor.
		//		NOTE - If this class is used with a widget by data-dojo-mixins, make sure putting the widget in data-dojo-type and putting this class to data-dojo-mixins.
		// example:
		//		The text box changes its value every two seconds.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/parser", "dijit/registry", "dojox/mvc/StatefulArray",
		// |						"dijit/form/TextBox", "dojox/mvc/ListController", "dojo/domReady!"
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
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ListController" data-dojo-props="model: model"></span>
		// |				<input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
	});
});
