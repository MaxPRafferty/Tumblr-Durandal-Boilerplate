/*global module, require */
module.exports = function( grunt ) {
    'use strict';

    // Livereload and connect variables
    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    });
    var mountFolder = function( connect, dir ) {
        return connect.static(require('path').resolve(dir));
    };
    var mixIn = require('mout/object/mixIn');
    var requireConfig = {
        baseUrl: 'app/',
        paths: {
            'jquery': '../bower_components/jquery/jquery',
            'knockout': '../bower_components/knockout.js/knockout',
            'text': '../bower_components/requirejs-text/text',
            'durandal': '../bower_components/durandal/js',
            'plugins': '../bower_components/durandal/js/plugins',
            'transitions': '../bower_components/durandal/js/transitions'
        }
    };

    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            clean: {
                build: ['build/*']
            },
            connect: {
                build: {
                    options: {
                        port: 9001,
                        hostname: 'localhost',
                        base: 'build'
                    }
                },
                dev: {
                    options: {
                        port: 8999,
                        hostname: 'localhost',
                        middleware: function( connect ) {
                            return [lrSnippet, mountFolder(connect, '.')];
                        }
                    }
                }
            },
            copy: {
                lib: {
                    src: 'bower_components/**/**',
                    dest: 'build/'
                },
                index: {
                    src: 'index.html',
                    dest: 'build/'
                },
                css: {
                    src: 'css/**',
                    dest: 'build/'
                }
            },
            open: {
                dev: {
                    path: 'http://localhost:<%= connect.dev.options.port %>/_SpecRunner.html'
                },
                build: {
                    path: 'http://localhost:<%= connect.build.options.port %>'
                }
            },
            durandal: {
                main: {
                    src: ['app/**/*.*', 'bower_components/durandal/**/*.js'],
                    options: {
                        name: '../lib/require/almond-custom',
                        baseUrl: requireConfig.baseUrl,
                        mainPath: 'app/main',
                        paths: mixIn({}, requireConfig.paths, { 'almond': '../lib/require/almond-custom.js' }),
                        exclude: [],
                        optimize: 'none',
                        out: 'build/app/main.js'
                    }
                }
            },
            jasmine: {
                dev: {
                    src: 'app/viewmodels/*.js',
                    options: {
                        specs: 'test/specs/dev/**/*spec.js',
                        keepRunner: true,
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: requireConfig
                        }
                    }
                },
                build: {
                    options: {
                        specs: 'test/specs/build/**/*spec.js',
                        keepRunner: true,
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: requireConfig
                        }
                    }
                }
            },
            bowerInstall: {
              target: {

                // Point to the files that should be updated when
                // you run `grunt bower-install`
                src: [
                  'app/views/**/*.html',   // .html support...
                  'app/views/**/*.jade',   // .jade support...
                  'app/styles/main.scss',  // .scss & .sass support...
                  'app/config.yml'         // and .yml & .yaml support out of the box!
                ],

                // Optional:
                // ---------
                cwd: '',
                dependencies: true,
                devDependencies: false,
                exclude: [],
                fileTypes: {},
                ignorePath: '',
                overrides: {}
              }
            },
            jshint: {
                all: ['Gruntfile.js', 'app/**/*.js', 'test/specs/**/*.js']
            },
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                        '* Copyright (c) <%= grunt.template.today("yyyy") %> YourName/YourCompany \n' +
                        '* Available via the MIT license.\n' +
                        '* see: http://opensource.org/licenses/MIT for blueprint.\n' +
                        '*/\n'
                },
                build: {
                    src: 'build/app/main.js',
                    dest: 'build/app/main-built.js'
                }
            },

            watch: {
                build: {
                    files: ['build/**/*.js'],
                    tasks: ['jasmine:build']
                },
                dev: {
                    files: ['test/specs/dev/**/*spec.js', 'app/**/*.js'],
                    tasks: ['jasmine:dev'],
                    options: {
                        livereload: true
                    }
                }
            }
        }
    );

// Loading plugin(s)
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-durandal');
    grunt.loadNpmTasks('grunt-wiredep');

    grunt.registerTask('default', ['jshint', 'jasmine:dev', 'connect:dev:livereload', 'open:dev', 'watch:dev']);
    grunt.registerTask('build', ['jshint', 'jasmine:dev', 'clean', 'copy', 'durandal:main', 'uglify', 'jasmine:build', 'connect:build', 'open:build', 'watch:build']);

};
