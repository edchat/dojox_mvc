define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/when",
	"./getStateful",
	"./getPlainValue"
], function(declare, lang, when, getStateful, getPlainValue){
	return declare("dojox.mvc.StoreControllerMixin", null, {
		// summary:
		//		A mixin class to dojox.mvc.ModelRefController, which keeps a reference to Dojo Object Store (in store property).
		// description:
		//		Has several methods to work with the store:
		//
		//		- queryStore(): Runs query() against the store, and creates a data model from retrieved data
		//		- getStore(): Runs get() against the store, and creates a data model from retrieved data
		//		- putStore(): Runs put() against the store
		//		- addStore(): Runs add() against the store
		//		- removeStore(): Runs remove() against the store
		//
		//		dojo.Stateful get()/set()/watch() interfaces in dojox.mvc.StoreControllerMixin will work with the data model from queryStore() or getStore().
		// example:
		//		The text box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property, from the data coming from data store ("store" property in the controller).
		//		Two seconds later, the text box changes from "Foo" to "Bar" as the controller gets new data from data store.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/parser", "dojo/when", "dojo/store/Memory", "dijit/registry", "dojo/domReady!"
		// |					], function(parser, when, Memory, registry){
		// |						store = new Memory({data: [{id: "Foo", value: "Foo"}, {id: "Bar", value: "Bar"}]});
		// |						when(parser.parse(), function(){
		// |							registry.byId("ctrl").getStore("Foo");
		// |							setTimeout(function(){ registry.byId("ctrl").getStore("Bar"); }, 2000);
		// |						});
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/StoreControllerMixin" data-dojo-props="store: store"></span>
		// |				<input type="text" data-dojo-type="dijit/form/TextBox" data-dojo-props="value: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>
		// example:
		//		The check box refers to "value" property in the controller (with "ctrl" ID).
		//		The controller provides the "value" property, from the data coming from data store ("store" property in the controller), using the first one in array.
		//		Two seconds later, the check box changes from unchecked to checked.
		//		The change is committed to the data store, which is reflected to dojo/store/Observable callback.
		// |		<html>
		// |			<head>
		// |				<script src="/path/to/dojo-toolkit/dojo/dojo.js" type="text/javascript" data-dojo-config="parseOnLoad: 0"></script>
		// |				<script type="text/javascript">
		// |					require([
		// |						"dojo/dom", "dojo/parser", "dojo/store/Observable", "dojo/store/Memory", "dijit/registry", "dojo/domReady!"
		// |					], function(ddom, parser, Observable, Memory, registry){
		// |						store = Observable(new Memory({data: [{id: "Foo", value: false}]}));
		// |						parser.parse();
		// |						registry.byId("ctrl").queryStore().observe(function(object, previousIndex, newIndex){
		// |							alert("ID: " + object.id + ", value: " + object.value);
		// |						}, true);
		// |						var count = 0;
		// |						var h = setInterval(function(){
		// |							ddom.byId("check").click();
		// |							registry.byId("ctrl").commitCurrent();
		// |							if(++count >= 2){ clearInterval(h); }
		// |						}, 2000);
		// |					});
		// |				</script>
		// |			</head>
		// |			<body>
		// |				<script type="dojo/require">at: "dojox/mvc/at"</script>
		// |				<span id="ctrl" data-dojo-type="dojox/mvc/ModelRefController" data-dojo-mixins="dojox/mvc/EditControllerMixin,dojox/mvc/StoreControllerMixin,dojox/mvc/ListControllerMixin"
		// |				 data-dojo-props="uniqueId: 'id', store: store, cursorIndex: 0"></span>
		// |				<input id="check" type="checkbox" data-dojo-type="dijit/form/CheckBox" data-dojo-props="checked: at('widget:ctrl', 'value')">
		// |			</body>
		// |		</html>

		// store: dojo/store/*
		//		The Dojo Object Store in use.
		store: null,

		// getStatefulOptions: dojox.mvc.getStatefulOptions
		//		The options to get stateful object from plain value.
		getStatefulOptions: null,

		// getPlainValueOptions: dojox/mvc/getPlainValueOptions
		//		The options to get plain value from stateful object.
		getPlainValueOptions: null,

		// _removals: Object[]
		//		The list of removed elements.
		_removals: [],

		// _resultsWatchHandle: dojox/mvc/StatefulArray.watchElements.handle
		//		The watch handle for model array elements.
		_resultsWatchHandle: null,

		constructor: function(){
			if(!this[this._refSourceModelProp]){
				this[this._refSourceModelProp] = "model";
			}
		},

		queryStore: function(/*Object*/ query, /*dojo/store/api/Store.QueryOptions?*/ options){
			// summary:
			//		Queries the store for objects.
			// query: Object
			//		The query to use for retrieving objects from the store.
			// options: dojo/store/api/Store.QueryOptions?
			//		The optional arguments to apply to the resultset.
			// returns: dojo/store/api/Store.QueryResults
			//		The results of the query, extended with iterative methods.

			if(!(this.store || {}).query){ return; }
			if(this._queryObserveHandle){ this._queryObserveHandle.cancel(); }
			if(this._resultsWatchHandle){ this._resultsWatchHandle.unwatch(); }
			this._removals = [];

			var _self = this,
			 queryResult = this.store.query(query, options),
			 result = when(queryResult, function(results){
				if(_self._beingDestroyed){ return; }
				results = getStateful(results, _self.getStatefulOptions);
				_self.set(_self._refSourceModelProp, results);
				if(lang.isArray(results)){
					_self._resultsWatchHandle = results.watchElements(function(idx, removals, adds){
						[].push.apply(_self._removals, removals);
					});
				}
				return results;
			});
			// For dojo/store/Observable, which adds a function to query result
			for(var s in queryResult){
				if(isNaN(s) && queryResult.hasOwnProperty(s) && lang.isFunction(queryResult[s])){
					result[s] = queryResult[s];
				}
			}
			return result;
		},

		getStore: function(/*Number*/ id, /*Object*/ options){
			// summary:
			//		Retrieves an object by its identity.
			// id: Number
			//		The identity to use to lookup the object.
			// options: Object
			//		The options for dojo/store.*.get().
			// returns: Object
			//		The object in the store that matches the given id.

			if(!(this.store || {}).get){ return; }
			if(this._queryObserveHandle){ this._queryObserveHandle.cancel(); }
			if(this._resultsWatchHandle){ this._resultsWatchHandle.unwatch(); }
			var _self = this;
			return when(this.store.get(id, options), function(result){
				if(_self._beingDestroyed){ return; }
				result = getStateful(result, _self.getStatefulOptions);
				_self.set(_self._refSourceModelProp, result);
				return result;
			});
		},

		putStore: function(/*Object*/ object, /*dojo/store/api/Store.PutDirectives?*/ options){
			// summary:
			//		Stores an object.
			// object: Object
			//		The object to store.
			// options: dojo/store/api/Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id" property if a specific id is to be used.
			// returns: Number

			if(!(this.store || {}).put){ return; }
			return this.store.put(object, options);
		},

		addStore: function(object, options){
			// summary:
			//		Creates an object, throws an error if the object already exists.
			// object: Object
			//		The object to store.
			// options: dojo/store/api/Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id" property if a specific id is to be used.
			// returns: Number

			if(!(this.store || {}).add){ return; }
			return this.store.add(object, options);
		},

		removeStore: function(/*Number*/ id, /*Object*/ options){
			// summary:
			//		Deletes an object by its identity
			// id: Number
			//		The identity to use to delete the object
			// options: Object
			//		The options for dojo/store/*.remove().
			// returns: Boolean
			//		Returns true if an object was removed, falsy (undefined) if no object matched the id.

			if(!(this.store || {}).remove){ return; }
			return this.store.remove(id, options);
		},

		commit: function(){
			// summary:
			//		Send the change back to the data source.

			if(this._removals){
				for(var i = 0; i < this._removals.length; i++){
					this.store.remove(this.store.getIdentity(this._removals[i]));
				}
				this._removals = [];
			}
			var data = getPlainValue(this.get(this._refEditModelProp), this.getPlainValueOptions);
			if(lang.isArray(data)){
				for(var i = 0; i < data.length; i++){
					this.store.put(data[i]);
				}
			}else{
				this.store.put(data);
			}
			this.inherited(arguments);
		},

		commitCurrent: function(){
			// summary:
			//		Send the change of currently selected list item back to the data source for the current index.

			this.inherited(arguments);
			this.store.put(this.cursor);
		},

		reset: function(){
			// summary:
			//		Change the model back to its original state.

			this.inherited(arguments);
			this._removals = [];
		},

		destroy: function(){
			// summary:
			//		Clean up model watch handle as this object is destroyed.

			if(this._resultsWatchHandle){ this._resultsWatchHandle.unwatch(); }
			this.inherited(arguments);
		}
	});
});
