module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-vows');
    grunt.loadNpmTasks('grunt-lmd');

    //Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            jshintrc: ".jshintrc"
        },
        lmd: {
            build_name: 'client'
        },
        vows: {
            all: {
                options: {
                    reporter: "spec"
                },
                src: ["test/*.js", "spec/*"]
            }
        },
        connect: {
            qunit: {
                options: {
                    port: process.env.PORT || 9002,
                    base: './'
                }
            },
            test: {
                options: {
                    port: process.env.PORT || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['http://localhost:' + (process.env.PORT || 9002) + '/client/test/index.html']
                }
            }
        }
    });

    //Load tasks
    grunt.registerTask('default', ['build', 'test']);
    grunt.registerTask('build', ['jshint', 'lmd', 'vows']);
    grunt.registerTask('test', ['connect:qunit', 'qunit']);
};