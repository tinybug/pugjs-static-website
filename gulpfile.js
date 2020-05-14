const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug-i18n');
const webpack = require('webpack-stream');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const svgSprite = require('gulp-svg-sprite');
const path = require('path');
const fs = require('fs');

sass.compiler = require('node-sass');

let config = {
  dest: './dist',
  isDev: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  openAnalyzer: false
}

const webpackConfig = {
  mode: config.isDev ? 'development' : 'production',
  devtool: config.isDev ? 'eval-source-map' : 'production',
  output: {
    filename: 'main.min.js',
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: config.openAnalyzer,
    }),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          configFile: './.eslintrc'
        }
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.pug$/,
        oneOf: [
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
        ]
      }
    ]
  }
}


function html() {
  return gulp.src('./src/pages/**/*.pug')
    .pipe(pug({
      i18n: {
        locales: './src/locales/*',
        filename: '{{lang}}/{{basename}}.html',
      },
      basedir: './',
      pretty: true,
    }))
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
}


function styles() {
  return gulp.src('./src/common/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.min.css'))
    .pipe(autoprefixer())
    .pipe(gulpif(!config.isDev, cleanCSS({ level: 2 })))
    .pipe(gulpif(config.isDev, sourcemaps.write()))
    .pipe(gulp.dest(config.dest + '/assets/css'))
    .pipe(browserSync.stream());
}


function scripts() {
  return gulp.src('./src/common/js/main.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(config.dest + '/assets/js'))
    .pipe(browserSync.stream());
}


function images() {
  return gulp.src('src/static/img/*')
    .pipe(gulpif(!config.isDev, imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5
    })))
    .pipe(gulp.dest((config.dest + '/assets/img')))
    .pipe(browserSync.stream());
}


function assets() {
  return gulp.src(['!src/static/img', '!src/static/svg', 'src/static/**/*'])
    .pipe(gulp.dest((config.dest + '/assets')))
    .pipe(browserSync.stream());
}


function svg() {
  return gulp.src('src/static/svg/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '',
          sprite: 'symbol.svg'
        }
      }
    }))
    .pipe(gulp.dest('dist/assets/svg'))
    .pipe(browserSync.stream());
}

function copyEnToRoot() {
  return gulp.src(path.join(config.dest, 'en/*'))
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
}


function copyAssetsToLocales() {
  const files = fs.readdirSync(path.join(__dirname, 'src/locales'));
  let pipeLine = gulp.src('dist/assets/**/*');
  files.forEach((file) => {
    const lang = path.basename(file, '.yml');
    pipeLine = pipeLine.pipe(gulp.dest(path.join('dist', lang, 'assets')));
  });
  return pipeLine.pipe(browserSync.stream());
}


function clean() {
  return del(['dist/*'])
}


function build() {
  return gulp.series([clean, svg],
    gulp.parallel(html, styles, scripts, images, assets),
    [copyEnToRoot, copyAssetsToLocales]
  )
}


function watch() {
  browserSync.init({
    open: false,
    port: 9000,
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
  });
  gulp.watch('./src/**/*.pug', gulp.series([html, copyEnToRoot, copyAssetsToLocales]))
  gulp.watch('./src/**/*.yml', gulp.series([html, scripts, copyEnToRoot, copyAssetsToLocales]))
  gulp.watch('./src/**/*.scss', styles)
  gulp.watch('./src/**/*.js', scripts)
  gulp.watch('./src/static/img/*', images)
  gulp.watch('./src/static/*', assets)
  gulp.watch('./src/static/svg/*', svg)
}


gulp.task('build', build());
gulp.task('watch', watch);
gulp.task('dev', gulp.series('build', 'watch'));
