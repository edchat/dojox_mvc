define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dijit/_WidgetBase"
], function(declare, lang, domAttr, _WidgetBase){
	return declare("dojox.mvc.widget.StatefulButton", [_WidgetBase], {
		// summary:
		//		A clickable area, which does:
		//
		//			* Change the content (title) inside, if the title associated with the value is defined.
		//			* Updates the value upon click, if the next value associated with the current value is defined.

		// titles: Object
		//		List of titles of <input> button corresponding this widget's value property.
		titles: null,

		// next: Object
		//		List of next values that's set when <input> button is clicked.
		next: null,

		// value
		//		Current value.
		value: null,

		// attr: object
		// 		Html attributes that reflect the state of the widget. 
		attr: null, 

		postCreate: function(){
			// summary:
			//		Sets onclick handler to <input> button.

			this.inherited(arguments);
			this.connect(this.domNode, "onclick", "_onButtonClick");
		},

		_onButtonClick: function(evt){
			// summary:
			//		Sets next value upon <input> button click.
			// tags:
			//		private

			if(this.next){
				if (lang.isFunction(this.next))
					this.set("value", this.next(this.get("value")));
				else
					this.set("value", this.next[this.get("value")]);
			}
			this.onClick(evt);
		},

		onClick: function(evt){},

		_setValueAttr: function(value){
			// summary:
			//		Handler for calls to set("value", val).
			// description:
			//		Sets the title of <input> button.
			// tags:
			//		private

			if(this.titles){
				if(typeof this.domNode.value != "undefined"){
					this.domNode.value = this.titles[value];
				}else{
					this.domNode.innerHTML = this.titles[value];
				}
			}
			if(this.attr) domAttr.set(this.domNode, this.attr[value]);
			this._set("value", value);
		}
	});
});
