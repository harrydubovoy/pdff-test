const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const browserSync = require('browser-sync').create() 
plugins.sass.compiler = require('node-sass')


gulp.task('yaml', () => {
    return gulp.src('./src/common/**/*.yml')
      .pipe(plugins.yamlMerge('project.yml'))
      .pipe(gulp.dest('./src/'))
      .pipe(browserSync.stream())
})

gulp.task('pug', () => { 
    return gulp.src('./src/common/_pages/**/*.pug')
        .pipe(plugins.pug({
            pretty: true,
            locals: yaml.safeLoad(fs.readFileSync('./src/project.yml', 'utf8'))
        }))
        .pipe(plugins.flatten())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
})

gulp.task('sass', () => {
    return gulp.src('./src/**/*.scss')
        .pipe(plugins.sourcemaps.init())    
        .pipe(plugins.sassGlob())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.csso())
        .pipe(plugins.autoprefixer({
            browsers: ['last 15 versions']
        }))
        .pipe(plugins.flatten())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream())
})


gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    })
})

gulp.task('watch', () => {
    gulp.watch(['./src/common/**/*.yml'], gulp.series('yaml'))
    gulp.watch(['./src/**/*.pug'], gulp.series('pug'))
    gulp.watch(['./src/**/*.scss'], gulp.series('sass'))
})

gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass'),
    gulp.parallel('watch', 'server')
)) 