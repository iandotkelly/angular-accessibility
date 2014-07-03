/**
 * Gruntfile for Angular-Accessibility
 */

'use strict';

module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({

		jshint: {
			// general jshint settings
			all: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'Gruntfile.js',
					'angular-accessibility.js'
				]
			}
		},

		uglify: {
			dist: {
				files: {
					'angular-accessibility.min.js': 'angular-accessibility.js'
				}
			}
		},

		karma: {
			unit: {
				configFile: 'test/karma.conf.js'
			},
		}

	});

	grunt.registerTask('test', ['jshint', 'karma']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('dist', ['jshint', 'uglify']);
};
