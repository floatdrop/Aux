requirejs.config({
    baseUrl: '/test/unit/'
});

define(function(require) {
    var testModules = [
        'Link',
        'MovieClipManager',
        'Layers',
    ];

    // Resolve all testModules and then start the Test Runner.
    require(testModules, function() {
        QUnit.start();
    });
});