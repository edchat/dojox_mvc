define([
	"dojo/_base/lang",
	"./resolve",
	"./Bind"
], function(lang, resolve, Bind){
	/*=====
	dojox.mvc.at.handle = {
		// summary:
		//		A handle of data binding target (a dojo.Stateful property), which is used for start synchronization with data binding source (another dojo.Stateful property).

		bind: function(source, sourceProp){
			// summary:
			//		Start data binding synchronization with specified data binding source, with the data binding target defined in this handle.
			// source: dojo.Stateful|String
			//		The dojo.Stateful of data binding source.
			// sourceProp: String
			//		The property name in dojo.Stateful of data binding source.
			// example:
			//		Start synchronizing dojo.Stateful property with another dojo.Stateful property:
			// |		dojox.mvc.at(stateful, "propertyname").bind(anotherstateful, "propertynameinanotherstateful") 
		}
	};
	=====*/

	function logBindingFailure(target, targetProp){
		console.warn(targetProp + " could not be resolved" + (typeof target == "string" ? (" with " + target) : "") + ".");
	}

	var at = /*===== dojox.mvc.at = =====*/ function(/*dojo.Stateful|String*/ target, /*String*/ targetProp){
		// summary:
		//		Returns a handle of data binding target (a dojo.Stateful property), which is used for start synchronization with data binding source (another dojo.Stateful property).
		// description:
		//		Typically used in ref property in data-dojo-props so that a widget can synchronize its attribute with another dojo.Stateful, like shown in the example.
		// target: dojo.Stateful|String
		//		dojo.Stateful to be synchronized.
		// targetProp: String
		//		The property name in target to be synchronized.
		// returns:
		//		A handle of data binding target (a dojo.Stateful property), which is used for start synchronization with data binding source (another dojo.Stateful property).
		// example:
		//		Synchronize attrbinwidget attribute in my.widget with propertyname in stateful.
		// |		<div data-dojo-type="my.widget" data-dojo-props="ref: {attribinwidget: dojox.mvc.at(stateful, 'propertyname')}"></div>

		return {
			atsignature: "dojox.mvc.at",
			bind: function(/*dojo.Stateful|String*/ source, /*String*/ sourceProp){
				var resolvedTarget = resolve(target, targetProp) || {};
				if(!resolvedTarget.set || !resolvedTarget.watch){
					logBindingFailure(target, targetProp);
				}

				var resolvedSource = resolve(source, sourceProp) || {};
				if(!resolvedSource.set || !resolvedTarget.watch){
					logBindingFailure(source, sourceProp);
				}

				if(!resolvedTarget.set || !resolvedTarget.watch || !resolvedSource.set || !resolvedTarget.watch){ return; }

				return Bind.bindTwo(resolvedTarget, targetProp, resolvedSource, sourceProp); // dojox.mvc.Bind.handle
			}
		}; // dojox.mvc.at.handle
	};

	return lang.setObject("dojox.mvc.at", at);
});
