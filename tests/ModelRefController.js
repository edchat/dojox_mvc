define([
	"doh",
	"dojo/_base/declare",
	"dojo/Stateful",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"../ModelRefController",
	"dojo/text!./templates/ModelRefControllerInTemplate.html"
], function(doh, declare, Stateful, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ModelRefController, template){
	doh.register("dojox.mvc.tests.ModelRefController", [
		function attachPoint(){
			var w = new (declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
				templateString: template
			}))({}, document.createElement("div"));
			w.startup();
			doh.t(w.controllerNode, "The controllerNode exists in the template widget");
		}
	]);
});