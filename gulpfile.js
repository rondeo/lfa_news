"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var rigger = require("gulp-rigger");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var easingGradients = require("postcss-easing-gradients");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var del = require("del");
var cache = require("gulp-cache");
var imagemin = require("gulp-imagemin");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var pump = require("pump");
var rename = require("gulp-rename");
var run = require("run-sequence");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var uglify = require("gulp-uglify");
var webp = require("gulp-webp");
var lost = require("lost");
var sourcemaps = require("gulp-sourcemaps");
var mqpacker = require("css-mqpacker");


function isMax(mq) {
  return /max-width/.test(mq);
}

function isMin(mq) {
  return /min-width/.test(mq);
}

const sortMediaQueries = (a, b) => {
  let A = a.replace(/\D/g, "");
  let B = b.replace(/\D/g, "");

  if (isMax(a) && isMax(b)) {
    return B - A;
  } else if (isMin(a) && isMin(b)) {
    return A - B;
  } else if (isMax(a) && isMin(b)) {
    return 1;
  } else if (isMin(a) && isMax(b)) {
    return -1;
  }

  return 1;
};

//Автопрефиксер и минификация
gulp.task("style", function () {
  gulp.src("src/style/main.{sass,scss}")
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      easingGradients(),
      mqpacker({
        sort: sortMediaQueries
      }),
    ]))
    .pipe(rename("main.min.css"))
    .pipe(csso())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

//Минификация JS
gulp.task("js", function (cb) {
  return gulp.src(["src/js/*.js"])
    .pipe(rigger())
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/js"));
});

//Оптимизация изображений
gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
    .pipe(cache(imagemin([
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo()
    ])))
    .pipe(gulp.dest("build/img"));
});

//Конвертация в webp
// gulp.task("webp", function () {
//   return gulp.src("build/img/**/*.{png,jpg}")
//     .pipe(webp({
//       quality: 80
//     }))
//     .pipe(gulp.dest("build/img"));
// });

//SVG спрайт
// gulp.task("sprite", function () {
//   return gulp.src("src/img/icons/*.svg")
//   .pipe(svgmin({
//     plugins: [{
//       removeAttrs: {attrs: "fill"}
//     }]
//   }))
//   .pipe(svgstore({
//     inlineSvg: true
//   }))
//   .pipe(rename("sprite.svg"))
//   .pipe(gulp.dest("build/img"));
// });

//posthtml-include
gulp.task("html", function () {
  return gulp.src("src/*.html")
    .pipe(rigger())
    .pipe(gulp.dest("build"));
});

//Очистка build
gulp.task("clean", function () {
  return del("build");
});

//Копирование в build
gulp.task("copyfont", function () {
  return gulp.src([
      "src/fonts/**/*.{woff,woff2}"
    ])
    .pipe(gulp.dest("build/font"));
});

gulp.task("copyimg", function () {
  return gulp.src([
      "src/img/**"
    ])
    .pipe(gulp.dest("build/img"));
});

gulp.task("copyjs", function () {
  return gulp.src([
      "src/js/libs/**"
    ])
    .pipe(gulp.dest("build/js/libs"));
});

//Запуск сборки
gulp.task("build", function (done) {
  run(
    "clean",
    "copyfont",
    "copyimg",
    "images",
    // "webp",
    "copyjs",
    "style",
    "js",
    // "sprite",
    "html",
    done
  );
});

gulp.task("serve", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/style/**/*.sass", ["style"]).on("change", server.reload);
  gulp.watch("src/js/**/*.js", ["js"]).on("change", server.reload);
  gulp.watch("src/**/*.html", ["html"]).on("change", server.reload);
});
