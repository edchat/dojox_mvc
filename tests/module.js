define(["doh/runner"], function(doh){
	try{
		var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g, "").replace(/^&/, "?");
		// DOH
		doh.registerUrl("dojox.mvc.tests.doh_mvc_new_shipto-billto-simple", require.toUrl("dojox/mvc/tests/doh_mvc_new_shipto-billto-simple.html" + userArgs), 999999);
		doh.registerUrl("dojox.mvc.tests.doh_mvc_new_ref-set-repeat", require.toUrl("dojox/mvc/tests/doh_mvc_new_ref-set-repeat.html" + userArgs), 999999);
		doh.registerUrl("dojox.mvc.tests.multiattrib.doh_mvc_test_Toolbar", require.toUrl("dojox/mvc/tests/multiattrib/doh_mvc_test_Toolbar.html" + userArgs), 999999);
		doh.registerUrl("dojox.mvc.tests.doh_mvc_search-results-repeat", require.toUrl("dojox/mvc/tests/doh_mvc_search-results-repeat.html" + userArgs), 999999);
		doh.registerUrl("dojox.mvc.tests.doh_new-mvc_input-output-simple", require.toUrl("dojox/mvc/tests/doh_new-mvc_input-output-simple.html" + userArgs), 999999);
		doh.registerUrl("dojox.mvc.tests.doh_new-mvc_label_and_totals", require.toUrl("dojox/mvc/tests/doh_new-mvc_label_and_totals.html" + userArgs), 999999);
		// Robot
		doh.registerUrl("dojox.mvc.tests.regression.robot.mvc_loan-stateful", require.toUrl("dojox/mvc/tests/regression/robot/mvc_loan-stateful.html" + userArgs), 999999);
	}catch(e){
		doh.debug(e);
	}
});

