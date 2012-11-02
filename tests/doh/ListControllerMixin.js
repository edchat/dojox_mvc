define([
	"doh",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/Stateful",
	"../../ModelRefController",
	"../../EditControllerMixin",
	"../../ListControllerMixin",
	"../../at",
	"../../sync",
	"../../getStateful"
], function(doh, array, declare, Stateful, ModelRefController, EditControllerMixin, ListControllerMixin, at, sync, getStateful){
	var data = [
		{uniqueId: 0, value: "Index 0"},
		{uniqueId: 1, value: "Index 1"},
		{uniqueId: 2, value: "Index 2"},
		{uniqueId: 3, value: "Index 3"},
		{uniqueId: 4, value: "Index 4"}
	], clz = declare([ModelRefController, EditControllerMixin, ListControllerMixin], {});

	doh.register("dojox.mvc.tests.doh.ListControllerMixin", [
		function commit(){
			var ctrl = new clz({sourceModel: getStateful(data), cursorIndex: 2});
			ctrl.set("value", "3rd");
			doh.is("3rd", ctrl.sourceModel[2].value, "sourceModel should be updated as soon as there is a change in value");
			doh.is("Index 2", ctrl.originalModel[2].value, "originalModel shouldn't be updated until commit() is called");
			ctrl.commitCurrent();
			doh.is("3rd", ctrl.originalModel[2].value, "originalModel should be updated as commit() is called");
		},
		function commitHoldModel(){
			var ctrl = new clz({sourceModel: getStateful(data), cursorIndex: 2, holdModelUntilCommit: true});
			ctrl.set("value", "3rd");
			doh.is("Index 2", ctrl.sourceModel[2].value, "sourceModel shouldn't be updated until commit() is called");
			doh.is("Index 2", ctrl.originalModel[2].value, "originalModel shouldn't be updated until commit() is called");
			ctrl.commitCurrent();
			doh.is("3rd", ctrl.sourceModel[2].value, "sourceModel should be updated as commit() is called");
			doh.is("3rd", ctrl.originalModel[2].value, "originalModel should be updated as commit() is called");
		},
		function reset(){
			var ctrl = new clz({sourceModel: getStateful(data), cursorIndex: 2});
			ctrl.set("value", "3rd");
			ctrl.commitCurrent();
			ctrl.set("value", "Third");
			ctrl.resetCurrent();
			doh.is("3rd", ctrl.get("value"), "Model should be updated as reset() is called");
			doh.is("3rd", ctrl.model[2].value, "Model should be updated as reset() is called");
			doh.is("3rd", ctrl.sourceModel[2].value, "sourceModel should be updated as reset() is called");
			doh.is("3rd", ctrl.originalModel[2].value, "originalModel should be updated as reset() is called");
		},
		function resetHoldModel(){
			var ctrl = new clz({sourceModel: getStateful(data), cursorIndex: 2, holdModelUntilCommit: true});
			ctrl.set("value", "3rd");
			ctrl.commitCurrent();
			ctrl.set("value", "Third");
			ctrl.resetCurrent();
			doh.is("3rd", ctrl.get("value"), "Model should be updated as reset() is called");
			doh.is("3rd", ctrl.model[2].value, "Model should be updated as reset() is called");
			doh.is("3rd", ctrl.sourceModel[2].value, "sourceModel should be updated as reset() is called");
			doh.is("3rd", ctrl.originalModel[2].value, "originalModel should be updated as reset() is called");
		},
		function commitWithWrongIdProperty(){
			var ctrl = new clz({idProperty: "id", sourceModel: getStateful(data), cursorIndex: 2});
			ctrl.set("value", "foo");
			ctrl.commitCurrent();
			doh.t(array.every(data, function(item, idx){ return idx != 2 || ctrl.originalModel[idx].value == item.value; }), "originalModel of non-target index shouldn't be updated, even if idProperty is not correctly set");
		},
		{
			name: "commitHoldModelToBindTarget",
			runTest: function(){
				var ctrlSource = new (declare([ModelRefController, ListControllerMixin], {}))({model: getStateful(data), cursorIndex: 2}),
				 ctrlEdit = this.ctrlEdit = new clz({sourceModel: at(ctrlSource, "model"), cursorIndex: 2, holdModelUntilCommit: true}),
				 target = new Stateful();
				this.h = sync(ctrlSource, "value", target, "value");
				ctrlEdit.set("value", "3rd");
				doh.is("Index 2", target.value, "sourceModel shouldn't be updated until commit() is called");
				ctrlEdit.commitCurrent();
				doh.is("3rd", target.value, "sourceModel should be updated as commit() is called");
			},
			tearDown: function(){
				this.ctrlEdit && this.ctrlEdit.destroy();
				this.h && this.h.remove();
			}
		}
	]);
});