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
        src: ['src/intro.js', 'src/utils.js', 'src/rnode.js', 'src/router.js', 'src/outro.js'],
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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch:router']);
  grunt.registerTask('build', ['concat:router', 'uglify:router']);

};