define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(darray, declare, _WidgetBase){
	return declare("dojox.mvc.widget.SpinnerController", _WidgetBase, {
		// summary:
		//		A controller widget to control dojox.mvc.widget.spinner.
		// description:
		//		Increases *ActivityCount* attribute when *true* is set to *loading* attribute, decreases *ActivityCount* attribute when *false* is set to *loading* attribute.
		//		*ActivityCount* typically is bound to a spinner, to start/stop rolling spinner upon *ActivityCount*.
		//		Also, this widget makes sure resetting *loading* attribute when this widget is destroyed, so that the network activity associated with this widget is not orphaned.

		// loading: Boolean
		//		true if the network activity associated with this widget is ongoing, false otherwise.
		loading: false,

		// ActivityCount: Number
		//		The count of network activities. This property typically is bound to a spinner.
		ActivityCount: 0,

		_setLoadingAttr: function(value){
			// summary:
			//		Sets whether the network activity associated with this widget is ongoing or not, according to value.

			if (this.loading != value)
				this.set("ActivityCount", this.get("ActivityCount") + (value ? 1 : -1));
			this._set("loading", value);
		},

		destroy: function(){
			// summary:
			//		Resets the state of network activity, upon this widget being destroyed.

			this.set("loading", false);
			this.inherited(arguments);
		}
	});
});
