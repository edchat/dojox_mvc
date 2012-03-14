define([
	"require",
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/has!dojo-parser?:dojo/_base/window",
	"dojo/has",
	"dojo/has!dojo-mobile-parser?:dojo/parser",
	"dojo/has!dojo-parser?:dojox/mobile/parser",
	"dojox/mvc/Element",
	"dojox/mvc/FormElement"
], function(require, kernel, lang, win, has, parser, mobileParser){

	// module:
	//		dojox/mvc/ParserExtension
	// summary:
	//		A extension of Dojo parser that allows data binding without specifying data-dojo-type.

	has.add("dom-qsa", !!document.createElement("div").querySelectorAll);
	try{ has.add("dojo-parser", !!require("dojo/parser"));  }catch(e){}
	try{ has.add("dojo-mobile-parser", !!require("dojox/mobile/parser")); }catch(e){}

	if(has("dojo-parser")){
		var oldConstruct = parser.construct, oldScan = parser.scan;

		if(!has("dojox-mvc-binding-in-props-only")){
			parser.construct = /*====== dojo.parser.construct = ======*/ function(/*Function*/ ctor, /*DOMNode*/ node, /*Object?*/ mixin, /*Object?*/ options, /*DOMNode[]?*/ scripts, /*Object?*/ inherited){
				// summary:
				//		Calls new ctor(params, node), where params is the hash of parameters specified on the node,
				//		excluding data-dojo-type and data-dojo-mixins.   Does not call startup().   Returns the widget.
				// ctor: Function
				//		Widget constructor.
				// node: DOMNode
				//		This node will be replaced/attached to by the widget.  It also specifies the arguments to pass to ctor.
				// mixin: Object?
				//		Attributes in this object will be passed as parameters to ctor,
				//		overriding attributes specified on the node.
				// options: Object?
				//		An options object used to hold kwArgs for instantiation.   See parse.options argument for details.
				// scripts: DOMNode[]?
				//		Array of <script type="dojo/*"> DOMNodes.  If not specified, will search for <script> tags inside node.
				// inherited: Object?
				//		Settings from dir=rtl or lang=... on a node above this node.   Overrides options.inherited.

				var attrData = "data-" + (options.scope || kernel._scopeName) + "-",	// typically "data-dojo-"
				 dataDojoProps = attrData + "props",									// typically "data-dojo-props"
				 extra = node.getAttribute(dataDojoProps),
				 props = lang.mixin({}, mixin);

				for(var attribs = node.attributes, i = attribs.length - 1; i >= 0; i--){
					try{
						var v = eval("(" + attribs[i].value + ")");
						if((v || {}).atsignature == "dojox.mvc.at"){
							props[attribs[i].name.replace(/^data\-dojo\-bind\-text$/i, "value")] = v;
							attribs[i].value = "";
						}
					}catch(e){}
				}

				if(extra){
					try{
						lang.mixin(props, eval("({" + extra + "})"));
					}catch(e){
						// give the user a pointer to their invalid parameters. FIXME: can we kill this in production?
						throw new Error(e.toString() + " in data-dojo-props='" + extra + "'");
					}
				}

				return oldConstruct.call(this, ctor, node, props, options, scripts, inherited);
			};
		}

		parser.scan = /*====== dojo.parser.scan = ======*/ function(/*DomNode?*/ root, /*Object*/ options){
			// summary:
			// root: DomNode?
			//		A default starting root node from which to start the parsing. See dojo.parser.scan() for more details.
			// options: Object
			//		A kwArgs options object, see dojo.parser.parse() for details.

			var list = oldScan.apply(this, lang._toArray(arguments)),
			 dojoType = (options.scope || kernel._scopeName) + "Type",			// typically "dojoType"
			 attrData = "data-" + (options.scope || kernel._scopeName) + "-",	// typically "data-dojo-"
			 dataDojoType = attrData + "type",									// typically "data-dojo-type"
			 dataDojoProps = attrData + "props";								// typically "data-dojo-props"

			for(var nodes = has("dom-qsa") && has("dojox-mvc-binding-in-props-only") ? root.querySelectorAll("[" + dataDojoProps + "]") : root.getElementsByTagName("*"), i = 0, l = nodes.length; i < l; i++){
				var node = nodes[i], foundBindingInAttribs = false;

				if(!has("dojox-mvc-binding-in-props-only")){
					for(var attribs = node.attributes, j = 0, m = attribs && attribs.length; j < m; j++){
						try{
							var v = eval("(" + attribs[j].value + ")");
							if((v || {}).atsignature == "dojox.mvc.at"){
								foundBindingInAttribs = true;
								break;
							}
						}catch(e){}
					}
				}

				if(!node.getAttribute(dataDojoType) && !node.getAttribute(dojoType) && (node.getAttribute(dataDojoProps) || foundBindingInAttribs)){
					list.push({
						"type": /^select|input|textarea$/i.test(node.tagName) ? "dojox/mvc/FormElement" : "dojox/mvc/Element",
						node: node
					});
				}
			}

			return list;
		};
	}

	if(has("dojo-mobile-parser")){
		var oldParse = mobileParser.parse;

		mobileParser.parse = /*====== dojox.mobile.parser.parse = ======*/ function(/*DomNode?*/ root, /*Object*/ options){
			var dojoType = ((options || {}).scope || kernel._scopeName) + "Type",		// typically "dojoType"
			 attrData = "data-" + ((options || {}).scope || kernel._scopeName) + "-",	// typically "data-dojo-"
			 dataDojoType = attrData + "type",											// typically "data-dojo-type"
			 dataDojoProps = attrData + "props",										// typically "data-dojo-props"
			 nodes = has("dom-qsa") && has("dojox-mvc-binding-in-props-only") ? (root || win.body()).querySelectorAll("[" + dataDojoProps + "]") : (root || win.body()).getElementsByTagName("*");

			for(var i = 0, l = nodes.length; i < l; i++){
				var node = nodes[i], foundBindingInAttribs = false, bindingsInAttribs = [];

				if(!has("dojox-mvc-binding-in-props-only")){
					for(var attribs = node.attributes, j = attribs && (attribs.length - 1); j >= 0; j--){
						try{
							var v = eval("(" + attribs[j].value + ")");
							if((v || {}).atsignature == "dojox.mvc.at"){
								bindingsInAttribs.push("'" + [attribs[j].name.replace(/^data\-dojo\-bind\-text$/i, "value")] + "':" + attribs[j].value);
								attribs[j].value = "";
								foundBindingInAttribs = true;
							}
						}catch(e){}
					}
				}

				if(!node.getAttribute(dataDojoType) && !node.getAttribute(dojoType) && (node.getAttribute(dataDojoProps) || foundBindingInAttribs)){
					node.setAttribute(dataDojoType, /^select|input|textarea$/i.test(node.tagName) ? "dojox/mvc/FormElement" : "dojox/mvc/Element");
					if(!has("dojox-mvc-binding-in-props-only")){
						var props = node.getAttribute(dataDojoProps);
						node.setAttribute(dataDojoProps, bindingsInAttribs.concat(props ? [props] : []).join(","));
					}
				}
			}

			return oldParse.apply(this, lang._toArray(arguments));
		};
	}

	return parser || mobileParser;
});
