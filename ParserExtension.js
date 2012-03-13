define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/json",
	"dojo/parser",
	"dojox/mvc/Element"
], function(kernel, lang, djson, parser){

	// module:
	//		dojox/mvc/_ParserExtension
	// summary:
	//		A extension of Dojo parser that allows data binding without specifying data-dojo-type.

	var reSetAttr = /^_set.*Attr$/, oldScan = parser.scan;

	parser.scan = /*====== dojo.parser.scan= ======*/ function(/*DomNode?*/ root, /*Object*/ options){
		// summary:
		// root: DomNode?
		//		A default starting root node from which to start the parsing. See dojo.parser.scan() for more details.
		// options: Object
		//		A kwArgs options object, see dojo.parser.parse() for details.

		var list = oldScan.apply(this, lang._toArray(arguments));

		var dojoType = (options.scope || kernel._scopeName) + "Type",			// typically "dojoType"
			attrData = "data-" + (options.scope || kernel._scopeName) + "-",	// typically "data-dojo-"
			dataDojoType = attrData + "type",									// typically "data-dojo-type"
			dataDojoProps = attrData + "props";									// typically "data-dojo-props"

		for(var nodes = root.getElementsByTagName("*"), i = 0, l = nodes.length; i < l; i++){
			var node = nodes[i], props = !node.getAttribute(dataDojoType) && !node.getAttribute(dojoType) && node.getAttribute(dataDojoProps);
			if(props){
				try{
					props = djson.fromJson.call(options.propsThis, "{" + props + "}");
				}catch(e){
					// give the user a pointer to their invalid parameters. FIXME: can we kill this in production?
					throw new Error(e.toString() + " in data-dojo-props='" + props + "'");
				}
				var nodeReferred = props.value;
				if(!nodeReferred){
					for(var s in props){
						if(reSetAttr.test(s)){
							nodeReferred = true;
							break;
						}
					}
				}
				if(nodeReferred){
					list.push({
						"type": "dojox/mvc/Element",
						node: node
					});
				}
			}
		}

		return list;
	};

	return parser;
});
