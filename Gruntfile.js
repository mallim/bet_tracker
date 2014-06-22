"use strict";

var path = require("path");
var minifyify = require('minifyify');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Task configuration.
    jshint: {
      files: ['Gruntfile.js',
              'server.js',
              './client/**/app.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    express: {
      dev: {
        options: {
          port: 3000,
          livereload: true,
          hostname: "0.0.0.0",
          server: "server.js",
          bases: path.resolve(__dirname, 'public') // Replace with the directory you want the files served from
          // Make sure you don't use `.` or `..` in the path as Express
          // is likely to return 403 Forbidden responses if you do
          // http://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
        }
      },
      release: {
        options: {
          port: 3000,
          hostname: "0.0.0.0",
          server: "server.js",
          bases: path.resolve(__dirname, 'public') // Replace with the directory you want the files served from
        }
      }
    },
    watch: {
      express: {
        files:['./public/index.html',"./public/**/*.js","./public/**/*.css","server.js"],
        options: {
          livereload: true
        }
      },
      client:{
        files:['Gruntfile.js','./client/**/app.js'],
        tasks:["jshint"]
      }
    },
    browserify: {
      dev: {
        files: { './public/app.js':[ './client/app.js' ]},
        bundleOptions: {
          debug: true
        },
        options:{
          watch:true
        }
      },
      release: {
        files: { './public/app.js':[ './client/app.js' ]},
        bundleOptions: {
          debug: true
        },
        options:{
          preBundleCB: function (b) {
            b.plugin( minifyify,
              { output: './public/app.map',
                map:'app.map'
              });
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask("dev", ["jshint","browserify:dev","express:dev","watch" ] );

  grunt.registerTask("release",["jshint","browserify:release","express:release","express-keepalive"]);

  grunt.registerTask("default",["express:release","express-keepalive"]);

};