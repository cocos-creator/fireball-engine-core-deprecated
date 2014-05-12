module.exports = (grunt) ->

    # load task-plugins
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-contrib-uglify'

    # load tasks 
    # grunt.loadTasks 'tasks'

    # Project configuration.
    grunt.initConfig

        # variables
        pkg: grunt.file.readJSON 'package.json'
        files:
            src: [
                'src/__intro.js',
                'src/core.js',
                'src/utils.js',
                'src/rect.js',
                'src/texture.js',
                'src/spriteTexture.js',
                'src/atlas.js',
                'src/__outro.js',
            ]
            dev: 'bin/core.dev.js'
            min: 'bin/core.min.js'

        # task configuration

        # clean
        clean:
            bin:
              src: ['bin/**/*']

        # jshint
        jshint:
            check: 
                src: [
                    '<%= files.src %>', 
                    '!src/__intro.js', 
                    '!src/__outro.js'
                ]

        # concat
        concat: 
            build:
                src: '<%= files.src %>'
                dest: '<%= files.dev %>'

        # uglify
        uglify: 
            build:
                src: '<%= files.dev %>'
                dest: '<%= files.min %>'

    # Default task(s).
    grunt.registerTask 'default', ['min']

    grunt.registerTask 'min', ['jshint', 'concat', 'uglify']
    grunt.registerTask 'dev', ['jshint', 'concat']

