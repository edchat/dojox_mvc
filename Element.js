define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){
	return declare("dojox.mvc.Element", _WidgetBase, {
		// summary:
		//		A simple widget that maps "value" attribute to DOM text. (Lightweight version of dojox.mvc.Output)

		_setValueAttr: {node: "domNode", type: "innerText"}
	});
});
