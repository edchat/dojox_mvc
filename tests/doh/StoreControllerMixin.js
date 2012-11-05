define([
	"doh",
	"dojo/_base/declare",
	"../../ModelRefController",
	"../../StoreControllerMixin"
], function(doh, declare, ModelRefController, StoreControllerMixin){
	doh.register("dojox.mvc.tests.StoreControllerMixin", [
		function basic(){
			var o = new (declare([ModelRefController, StoreControllerMixin], {}));
			doh.is("model", o._refSourceModelProp);
		}
	]);
});