// Load our plugins
var	gulp			 = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'), // Adds vendor prefixes for us
	babel				 = require('gulp-babel'),
	babelify     = require('babelify'),
	browserify   = require('browserify'),
	browserSync	 = require('browser-sync'), // Sends php, js, and css updates to browser for us
	buffer			 = require('vinyl-buffer'),
	coffeeify    = require('coffeeify'),
	concat			 = require('gulp-concat'), // Concat our js
	del					 = require('del'),
	merge 			 = require('merge'),
	notify			 = require('gulp-notify'), // Basic gulp notificatin using OS
	rename 			 = require('gulp-rename'),
	sass				 = require('gulp-sass'),  // Our sass compiler
	size			   = require('gulp-size'),
	source			 = require('vinyl-source-stream'),
	sourceMaps	 = require('gulp-sourcemaps'), // Sass sourcemaps
	uglify			 = require('gulp-uglify');




////////////////////////////////////////////////////////////////////////////////
// Path Configs
////////////////////////////////////////////////////////////////////////////////

var paths = {
	sassPath: 'assets/sass/',
	nodePath: 'node_modules/',
	jsPath: 'assets/dist/js/',
	destPath: 'assets/dist/',
	foundationJSpath: 'node_modules/foundation-sites/js/',
	imgPath: 'assets/images/'
};

var bsProxy = 'mini.dev:5001';


////////////////////////////////////////////////////////////////////////////////
// Our browser-sync task
////////////////////////////////////////////////////////////////////////////////

gulp.task('browser-sync', function() {
	var files = [
		'**/*.js'
	];

	browserSync.init(files, {
		proxy: bsProxy
	});
});


////////////////////////////////////////////////////////////////////////////////
// Styles - Sass
////////////////////////////////////////////////////////////////////////////////

gulp.task('styles', function() {
	gulp.src(paths.sassPath + '**/*.scss')
		.pipe(sourceMaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		})
		.on('error', notify.onError(function(error) {
			return "Error: " + error.message;
		}))
		)
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(sourceMaps.write('.'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(paths.destPath + 'css')) // Location of our app.css file
		.pipe(browserSync.stream({match: '**/*.css'}))
		.pipe(notify({
			message: "✔︎ Styles task complete",
			onLast: true
		}));
});

////////////////////////////////////////////////////////////////////////////////
// Browserify
////////////////////////////////////////////////////////////////////////////////

var browserifyConfig = {
	js: {
		src: 'app/app.js',			 // Entry Point
		outputDir: 'assets/dist/js/', // Directory to save bundle to
		mapDir: 'assets/dist/js/maps/',			 // Subdirectory to save maps to
		outputFile: 'app.js'								 // Name to use for bundle
	},
};

// This method makes it easy to use common bundling options in different tasks

function bundle(bundler) {

    // Add options to add to "base" bundler passed as parameter
    bundler
      .bundle()                                    					 // Start bundle
      .pipe(source(browserifyConfig.js.src))                 // Entry point
      .pipe(buffer())                              					 // Convert to gulp pipeline
      .pipe(rename(browserifyConfig.js.outputFile))          // Rename output from 'main.js' to 'bundle.js'
      .pipe(sourceMaps.init({ loadMaps : true }))  					 // Strip inline source maps
      .pipe(sourceMaps.write(browserifyConfig.js.mapDir))    // Save source maps to their own directory
      .pipe(gulp.dest(browserifyConfig.js.outputDir))        // Save 'bundle' to build/
      .pipe(browserSync.reload({stream:true}))
			.pipe(notify({
				message: "✔︎ Browserify bundle updated",
				onLast: true
			}));              // Reload browser if relevant
}

gulp.task('bundle', function () {
    var bundler = browserify(browserifyConfig.js.src)    // Pass browserify the entry point
      .transform(coffeeify)      						 						 //  Chain transformations: First, coffeeify . . .
      .transform(babelify, { presets : [ 'es2015' ] });  // Then, babelify, with ES2015 preset

    bundle(bundler);  // Chain other options -- sourcemaps, rename, etc.
});

////////////////////////////////////////////////////////////////////////////////
// JS
////////////////////////////////////////////////////////////////////////////////

// gulp.task('js', function() {
// 	return gulp.src(paths.jsPath + '**/*.js')
// 		.pipe(concat('app.js'))
// 		.pipe(gulp.dest(paths.destPath + 'js'))
// 		.pipe(uglify().on('error', notify.onError(function(error) {
// 			return "Error: " + error.message;
// 			}))
// 		)
// 		.pipe(gulp.dest(paths.destPath + 'js'))
// 		.pipe(browserSync.reload({stream:true}))
// 		.pipe(notify({ message: "✔︎ Scripts task complete!"}));
// });


////////////////////////////////////////////////////////////////////////////////
// Foundation JS task, which gives us flexibility to choose what plugins we want
////////////////////////////////////////////////////////////////////////////////

gulp.task('foundation-js', function() {
	return gulp.src([

		/* Choose what JS Plugin you'd like to use. Note that some plugins also
		require specific utility libraries that ship with Foundation—refer to a
		plugin's documentation to find out which plugins require what, and see
		the Foundation's JavaScript page for more information.
		http://foundation.zurb.com/sites/docs/javascript.html */

		// Core Foundation - needed when choosing plugins ala carte
		paths.foundationJSpath + 'foundation.core.js',
		paths.foundationJSpath + 'foundation.util.mediaQuery.js',

		// Choose the individual plugins you want in your project
		paths.foundationJSpath + 'foundation.abide.js',
		paths.foundationJSpath + 'foundation.accordion.js',
		paths.foundationJSpath + 'foundation.accordionMenu.js',
		paths.foundationJSpath + 'foundation.drilldown.js',
		paths.foundationJSpath + 'foundation.dropdown.js',
		paths.foundationJSpath + 'foundation.dropdownMenu.js',
		paths.foundationJSpath + 'foundation.equalizer.js',
		paths.foundationJSpath + 'foundation.interchange.js',
		paths.foundationJSpath + 'foundation.magellan.js',
		paths.foundationJSpath + 'foundation.offcanvas.js',
		paths.foundationJSpath + 'foundation.orbit.js',
		paths.foundationJSpath + 'foundation.responsiveMenu.js',
		paths.foundationJSpath + 'foundation.responsiveToggle.js',
		paths.foundationJSpath + 'foundation.reveal.js',
		paths.foundationJSpath + 'foundation.slider.js',
		paths.foundationJSpath + 'foundation.sticky.js',
		paths.foundationJSpath + 'foundation.tabs.js',
		paths.foundationJSpath + 'foundation.toggler.js',
		paths.foundationJSpath + 'foundation.tooltip.js',
		paths.foundationJSpath + 'foundation.util.box.js',
		paths.foundationJSpath + 'foundation.util.keyboard.js',
		paths.foundationJSpath + 'foundation.util.motion.js',
		paths.foundationJSpath + 'foundation.util.nest.js',
		paths.foundationJSpath + 'foundation.util.timerAndImageLoader.js',
		paths.foundationJSpath + 'foundation.util.touch.js',
		paths.foundationJSpath + 'foundation.util.triggers.js',

	])
	.pipe(babel({
		presets: ['es2015'],
		compact: true
	}))
	.pipe(concat('foundation.js'))
	.pipe(uglify())
	.pipe(gulp.dest(paths.destPath + 'js'));
});


////////////////////////////////////////////////////////////////////////////////
// Watch our files and fire off a task when something changes
////////////////////////////////////////////////////////////////////////////////

gulp.task('watch', function() {
	gulp.watch(paths.sassPath + '**/*.scss', ['styles']);
	//gulp.watch(paths.jsPath + '**/*.js', ['js']);
	gulp.watch(browserifyConfig.js.src, ['bundle']);
});


// Our default gulp task, which runs all of our tasks upon typing in 'gulp' in Terminal
gulp.task('default', ['bundle', 'styles', 'foundation-js', 'watch']);
