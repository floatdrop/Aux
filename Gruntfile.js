module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-copy');
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
		copy: {
			client: {
				files: [{expand: true, cwd: 'client', src: ['**'], dest: 'client-build'}]
			}
		},
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
				src: ["tests/server/**/*.js"]
			}
		},
		connect: {
			qunit: {
				options: {
					port: process.env.PORT || 8081,
					base: './'
				}
			},
			test: {
				options: {
					port: process.env.PORT || 8081,
					base: './',
					keepalive: true
				}
			}
		},
		qunit: {
			all: {
				options: {
					urls: ['http://localhost:' + (process.env.PORT || 8081) + '/tests/client/index.html']
				}
			}
		}
	});

	//Load tasks
	grunt.registerTask('default', ['build', 'test']);
	grunt.registerTask('build', ['jshint', 'copy', 'lmd']);
	grunt.registerTask('test', ['vows', 'connect:qunit', 'qunit']);
};