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

	function unwatchElements(/*dojox.mvc.WidgetList*/ w){
		if(w._elementWatchHandle){
			w._elementWatchHandle.unwatch();
			delete w._elementWatchHandle;
		}
	}

	var WidgetList = declare("dojox.mvc.WidgetList", [_WidgetBase, _Container], {
		// summary:
		//		A widget that creates child widgets repeatedly based on children attribute (the repeated data) and childType/childMixins/childParams attributes (determines how to create each child widget).

		// childClz: Function
		//		The class of child widget. Takes precedence over childType/childMixins.
		childClz: null,

		// childType: String
		//		The module ID of child widget. childClz takes precedence over this/childMixins.
		//		Can be specified via data-mvc-child-type attribute of widget declaration.
		childType: "",

		// childMixins: String
		//		The list of module IDs, separated by comma, of the classes that will be mixed into child widget. childClz takes precedence over childType/this.
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
			if(this[childTypeAttr]){
				this.childType = this[childTypeAttr];
			}
			if(this[childMixinsAttr]){
				this.childMixins = this[childMixinsAttr];
			}
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
				unwatchElements(this);
				this._builtOnce = true;
				this._buildChildren(value);
			}
		},

		_buildChildren: function(/*dojox.mvc.StatefulArray*/ children){
			// summary:
			//		Create child widgets upon children and inserts them into the container node.

			var createAndWatch = lang.hitch(this, function(seq){
				if(this._buildChildrenSeq > seq){ return; } // If newer _buildChildren call comes during lazy loading, bail
				var clz = declare([].slice.call(arguments, 1), {}), _self = this;
				function create(children, idx){
					array.forEach(array.map(children, function(child){
						var params = {/* ownerDocument: _self.ownerDocument, */ target: child, parent: _self}; // Disabling passing around ownerDocument for now, due to a bug in _WidgetBase.set()
						if(_self.templateString){ params.templateString = _self.templateString; }
						return new clz(lang.mixin(params, _self.childParams || evalParams.call(params, _self[childParamsAttr])), _self.ownerDocument.createElement(_self.domNode.tagName));
					}), function(child){
						_self.addChild(child, idx++);
					});
				}
				create(children, 0);
				this._elementWatchHandle = lang.isFunction(children.watchElements) && children.watchElements(function(idx, removals, adds){
					for(var i = 0, l = (removals || []).length; i < l; ++i){
						_self.removeChild(idx);
					}
					create(adds, idx);
				});
			}, this._buildChildrenSeq = (this._buildChildrenSeq || 0) + 1);

			if(this.childClz){
				createAndWatch(this.childClz);
			}else{
				require([this.childType].concat(this.childMixins && this.childMixins.split(",") || []), createAndWatch);
			}
		},

		destroy: function(){
			unwatchElements(this);
		}
	});

	WidgetList.prototype[childTypeAttr] = WidgetList.prototype[childMixinsAttr] = WidgetList.prototype[childParamsAttr] = ""; // Let parser treat these attributes as string
	return WidgetList;
});
