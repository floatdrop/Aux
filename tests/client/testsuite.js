/* global requirejs, define, QUnit */

requirejs.config({
	baseUrl: '/tests/client/unit/'
});

define(function (require) {
	var testModules = [
		'main'
	];

	// Resolve all testModules and then start the Test Runner.
	require(testModules, function () {
		QUnit.start();
	});
});