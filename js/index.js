
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("jaredly-xon/index.js", Function("exports, require, module",
"\n\
var lib = require('./lib')\n\
\n\
module.exports = lib.resolve\n\
\n\
for (var name in lib.bound) {\n\
  module.exports[name] = lib.bound[name]\n\
}\n\
\n\
module.exports.register = function (name, fn) {\n\
  if (arguments.length === 1) {\n\
    fn = name\n\
    name = fn.name\n\
  }\n\
  module.exports[name] = lib.binder(fn)\n\
}\n\
//@ sourceURL=jaredly-xon/index.js"
));
require.register("jaredly-xon/lib/index.js", Function("exports, require, module",
"// people\n\
\n\
var consts = require('./consts')\n\
\n\
var helpers = {\n\
  ObjectId: function (len) {\n\
    var id = ''\n\
      , chars = 'abcdef0123456789'\n\
    len = len || 32\n\
    for (var i=0; i<len; i++) {\n\
      id += helpers.choice(chars)\n\
    }\n\
    return id\n\
  },\n\
  choice: function (items) {\n\
    return items[helpers.randInt(items.length)]\n\
  },\n\
  fullName: function (/*maxlen*/) {\n\
    // maxlen = maxlen || 23\n\
    return helpers.choice(consts.name.first) + ' ' + helpers.choice(consts.name.last)\n\
  },\n\
  randInt: function (min, max) {\n\
    if (arguments.length === 1) {\n\
      max = min\n\
      min = 0\n\
    }\n\
    return parseInt(Math.random() * (max - min)) + min\n\
  },\n\
  city: function () {\n\
    return helpers.choice(consts.cities)\n\
  },\n\
  /*\n\
  lipsum: function (min, max) {\n\
    return consts.lipsum.split(' ').slice(0, helpers.randInt(min, max)).join(' ')\n\
  },\n\
  image: function (width, height) {\n\
  },\n\
  */\n\
  some: function (min, max, fix) {\n\
    var num, results = []\n\
    if (arguments.length === 2) {\n\
      fix = max\n\
      num = min\n\
    } else {\n\
      num = helpers.randInt(min, max + 1)\n\
    }\n\
    for (var i=0; i<num; i++) {\n\
      results.push(resolve(fix))\n\
    }\n\
    return results\n\
  }\n\
}\n\
\n\
function binder(fn) {\n\
  return function () {\n\
    var args = arguments\n\
      , self = this\n\
      , res = function () {\n\
          return fn.apply(self, args)\n\
        }\n\
    res._bound_fixture = true\n\
    return res\n\
  }\n\
}\n\
\n\
var bound = {}\n\
for (var name in helpers) {\n\
  bound[name] = binder(helpers[name])\n\
}\n\
\n\
function resolve(fix) {\n\
  if ('function' === typeof fix && fix._bound_fixture) {\n\
    return fix()\n\
  }\n\
  if ('object' !== typeof fix) return fix\n\
  if (Array.isArray(fix)) {\n\
    return fix.map(resolve)\n\
  }\n\
  var res = {}\n\
  for (var name in fix) {\n\
    res[name] = resolve(fix[name])\n\
  }\n\
  return res\n\
}\n\
\n\
module.exports = {\n\
  helpers: helpers,\n\
  resolve: resolve,\n\
  binder: binder,\n\
  bound: bound\n\
}\n\
\n\
//@ sourceURL=jaredly-xon/lib/index.js"
));
require.register("jaredly-xon/lib/consts.js", Function("exports, require, module",
"\n\
var consts = module.exports = {\n\
  name: {\n\
    male: ['James', 'John', 'Peter', 'Sam', 'Kevin', 'Joseph', 'Luke', 'Nephi'],\n\
    female: ['Samantha', 'Jane', 'Judy', 'Anna', 'Maria', 'Lucy', 'Lisa', 'Daphne', 'Pollyanna'],\n\
    last: ['Smith', 'Jorgensen', 'Kaiser', 'Brown', 'Olsen', 'Neuman', 'Frank', 'Schwartz']\n\
  },\n\
  cities: ['Budabest', 'Boston', 'Detroit', 'Paris', 'Athens', 'New Orleans', 'Moscow', 'Berlin', 'San Jose', 'Monta Ray']\n\
}\n\
consts.name.first = consts.name.female.concat(consts.name.male)\n\
\n\
//@ sourceURL=jaredly-xon/lib/consts.js"
));
require.register("b/index.js", Function("exports, require, module",
"\n\
var x = require('xon')\n\
\n\
angular.module('MyApp', [])\n\
  .factory('getData', function () {\n\
    var q = []\n\
    for (var i=0; i<5; i++) {\n\
      q.push({\n\
        name: 'Dropdown ' + (i+1),\n\
        date: 'Nov ' + new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7 * i).getDate(),\n\
        mastered: x.randInt(0, 100)(),\n\
        total: x.randInt(100, 200)()\n\
      })\n\
    }\n\
    var tpl = {\n\
      quizes: q,\n\
      page: 'login',\n\
      theme: {\n\
        cls: 'default-theme',\n\
        name: 'Default'\n\
      },\n\
      themes: [{\n\
        cls: 'default-theme',\n\
        name: 'Default'\n\
      }, {\n\
        cls: 'second-theme',\n\
        name: 'Second'\n\
      }],\n\
      selectedOption: 'One',\n\
      focusedQuiz: q[0]\n\
    }\n\
    return function (cb) {\n\
      cb(x(tpl), true)\n\
    }\n\
  })\n\
  .controller('MainController', ['$scope', 'getData', function ($scope, getData) {\n\
    getData(function (data, cached) {\n\
      for (var name in data) {\n\
        if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;\n\
        $scope[name] = data[name]\n\
      }\n\
      if (!cached) $scope.$digest()\n\
    })\n\
  }])\n\
\n\
module.exports = function (document) {\n\
  var el = document.getElementById('main')\n\
  angular.bootstrap(el, ['MyApp'])\n\
}\n\
//@ sourceURL=b/index.js"
));
require.alias("jaredly-xon/index.js", "b/deps/xon/index.js");
require.alias("jaredly-xon/lib/index.js", "b/deps/xon/lib/index.js");
require.alias("jaredly-xon/lib/consts.js", "b/deps/xon/lib/consts.js");
require.alias("jaredly-xon/index.js", "b/deps/xon/index.js");
require.alias("jaredly-xon/index.js", "xon/index.js");
require.alias("jaredly-xon/index.js", "jaredly-xon/index.js");
require.alias("b/index.js", "b/index.js");