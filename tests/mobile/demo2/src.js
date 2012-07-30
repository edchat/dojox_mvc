require([
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom",
	"dojo/has",
	"dijit/registry",
	"dojox/mobile/parser",
	"dojox/mobile/ListItem",
	"dojox/mvc/at",
	"dojox/mobile/FixedSplitter",
	"dojox/mobile/ScreenSizeAware",
	"dojox/mobile/Container",
	"dojox/mvc/Generate",
	"dojox/mvc/Group",
	"dojox/mvc/Output",
	"dojox/mvc/Templated",
	"dojox/mvc/WidgetList",
	"dojox/mvc/_InlineTemplateMixin",
	"dojox/mvc/tests/mobile/demo2/MobileDemoContactModel",
	"dojox/mvc/tests/mobile/demo2/MobileDemoContactListModel",
	"dojox/mvc/tests/mobile/demo2/MobileDemoContactController",
	"dojox/mvc/tests/mobile/demo2/MobileDemoContactListController",
	"dojox/mvc/tests/mobile/demo2/MobileDemoGenerateActions",
	"dojox/mobile",
	"dojox/mobile/deviceTheme",
	"dojox/mobile/Button",
	"dojox/mobile/Heading",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/TextArea",
	"dojox/mobile/TextBox",
	"dojox/mobile/Container",
	"dojo/domReady!"
], function(lang, aspect, dom, has, registry, parser, ListItem, at, FixedSplitter, ScreenSizeAware, Container){
	if(!has("webkit")){
		require(["dojox/mobile/compat"]);
	}
 	// A workaround for dojox/mobile/_ItemBase.onTouchStart() running setTimeout() callback even if the 
 	// widget has been destroyed. It causes JavaScript error in our "delete" feature.
 	aspect.around(ListItem.prototype, "_setSelectedAttr", function(oldSetSelectedAttr){
 		return function(){
 			if(!this._beingDestroyed){
 				return oldSetSelectedAttr.apply(this, lang._toArray(arguments));
 			}
 		};
 	});
	window.at = at;
	
	// before parse try to setup FixedSplitter and ScreenSizeAware
	//var sa = new ScreenSizeAware({}, dom.byId("test1"));		
	//sa.startup();
	//var fs = new FixedSplitter({orientation:"H", screenSizeAware:true}, dom.byId("test2"));

	if(dom.byId("test2")){ // skipped for demoDeclarative
		var fs = new FixedSplitter({orientation:"H", screenSizeAware:true});
		dom.byId("test2").appendChild(fs.domNode);
		fs.startup();
		var mc = new Container({
				style: "border-right:1px solid black;"
			});
		mc.startup();
		mc.domNode.appendChild(dom.byId("foo"));
		fs.domNode.appendChild(mc.domNode);
		fs.domNode.appendChild(dom.byId("rightside"));
	}
	
	parser.parse();
	dom.byId("wholepage").style.display = "";
});
