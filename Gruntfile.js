module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        compress: {
          drop_console: true
        },
        mangle: {
          except: ['require', 'exports', 'module']
        },
        banner: '/* spa-router by zcoding <%= grunt.template.today("yyyy-mm-dd") %> version: <%= pkg.version %> */',
        sourceMap: true,
        sourceMapName: 'build/spa-router.min.map',
      },
      "router": {
        files: {
          "build/spa-router.min.js": ["<%= concat.router.dest %>"]
        }
      }
    },

    concat: {
      options: {
        separator: '',
        banner: '/* spa-router by <%= pkg.author %>, <%= pkg.license %> license, <%= grunt.template.today("yyyy-mm-dd") %> version: <%= pkg.version %> */'
      },
      "router": {
        src: ['src/intro.js', 'src/utils.js', 'src/rnode.js', 'src/listener.js', 'src/router.js', 'src/outro.js'],
        dest: 'build/spa-router.js'
      }
    },

    watch: {
      options: {
        spawn: false
      },
      "router": {
        files: ['src/*.js'],
        tasks: ['concat:router', 'uglify:router']
      }
    },

    compress: {
      'release': {
        options: {
          archive: './release/spa-router-<%= pkg.version %>.zip',
        },
        files: [
          {src: ['src/**', 'build/**', 'demo/**', 'package.json', 'server.js', 'README.md']}
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['concat:router', 'uglify:router', 'watch:router']);
  grunt.registerTask('build', ['concat:router', 'uglify:router']);
  grunt.registerTask('release', ['concat:router', 'uglify:router', 'compress:release']);

};