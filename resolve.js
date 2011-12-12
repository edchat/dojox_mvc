define([
	"dojo/_base/lang",
	"dijit/registry"
], function(lang, registry){
	var resolve = /*===== dojox.mvc.resolve = =====*/ function(/*dojo.Stateful|String*/ target){
		// summary:
		//		Find a dojo.Stateful for the target.
		// description:
		//		If target is not a string, return target itself.
		//		If target is "widget:widgetid", returns the widget whose ID is widgetid.
		//		If target is other string, returns the object whose object ID is target.

		if(typeof target == "string"){
			var tokens = target.match(/^(widget):(.*)$/) || [];
			if(tokens[1] == "widget"){
				target = registry.byId(tokens[2]);
			}else{
				target = lang.getObject(target);
			}
		}
		return target; // dojo.Stateful
	};

	return lang.setObject("dojox.mvc.resolve", resolve);
});
