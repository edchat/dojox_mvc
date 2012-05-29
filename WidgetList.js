define([
	"require",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dijit/_Container",
	"dijit/_WidgetBase"
], function(require, array, lang, declare, _Container, _WidgetBase){
	var childTypeAttr = "data-mvc-child-type",
	 childMixinsAttr = "data-mvc-child-mixins",
	 childParamsAttr = "data-mvc-child-props";

	function evalParams(params){
		return eval("({" + params + "})");
	}

	var WidgetList = declare("dojox.mvc.WidgetList", [_WidgetBase, _Container], {
		// summary:
		//		A widget that creates child widgets repeatedly based on children attribute (the repeated data) and childType/childMixins/childParams attributes (determines how to create each child widget).

		// childType: String
		//		The module ID of child widget.
		//		Can be specified via data-mvc-child-type attribute of widget declaration.
		childType: "",

		// childMixins: String
		//		The list of module IDs, separated by comma, of the classes that will be mixed into child widget.
		//		Can be specified via data-mvc-child-mixins attribute of widget declaration.
		childMixins: "",

		// childParams: Object
		//		The mixin properties for child widget.
		//		Can be specified via data-mvc-child-props attribute of widget declaration.
		//		"this" in data-mvc-child-props will have the following properties:
		//			parent - This widget's instance.
		//			target - The data item in children.
		childParams: null,

		// children: dojox.mvc.StatefulArray
		//		The array of data model that is used to render child nodes.
		children: null,

		// _relTargetProp: String
		//		The name of the property that is used by child widgets for relative data binding.
		_relTargetProp : "children",

		postMixInProperties: function(){
			this.childType = this[childTypeAttr];
			this.childMixins = this[childMixinsAttr];
		},

		startup: function(){
			this.inherited(arguments);
			this._setChildrenAttr(this.children);
		},

		_setChildrenAttr: function(/*dojo.Stateful*/ value){
			// summary:
			//		Handler for calls to set("children", val).

			var children = this.children;
			this._set("children", value);
			if(this._started && (!this._builtOnce || children != value)){
				this._builtOnce = true;
				this._buildChildren(value);
			}
		},

		_buildChildren: function(/*dojox.mvc.StatefulArray*/ children){
			// summary:
			//		Create child widgets upon children and inserts them into the container node.

			require([this.childType].concat(this.childMixins && this.childMixins.split(",") || []), lang.hitch(this, function(seq){
				if(this._buildChildrenSeq > seq){ return; } // If newer _buildChildren call comes during lazy loading, bail
				var clz = declare([].slice.call(arguments, 1), {});
				array.forEach(array.map(children, function(child){
					var params = {ownerDocument: this.ownerDocument, target: child, parent: this};
					if(this.templateString){ params.templateString = this.templateString; }
					return new clz(lang.mixin(params, this.childParams || evalParams.call(params, this[childParamsAttr])), this.ownerDocument.createElement(this.domNode.tagName));
				}, this), function(child){
					this.addChild(child);
				}, this);
			}, this._buildChildrenSeq = (this._buildChildrenSeq || 0) + 1));
		}
	});

	WidgetList.prototype[childTypeAttr] = WidgetList.prototype[childMixinsAttr] = WidgetList.prototype[childParamsAttr] = ""; // Let parser treat these attributes as string
	return WidgetList;
});
