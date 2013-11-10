
var x = require('xon')

angular.module('MyApp', [])
  .factory('getData', function () {
    var q = []
    for (var i=0; i<5; i++) {
      q.push({
        name: 'Dropdown ' + (i+1),
        date: 'Nov ' + new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7 * i).getDate(),
        mastered: x.randInt(0, 100)(),
        total: x.randInt(100, 200)()
      })
    }
    var tpl = {
      quizes: q,
      page: 'main',
      theme: {
        cls: 'default-theme',
        name: 'Default'
      },
      themes: [{
        cls: 'default-theme',
        name: 'Default'
      }, {
        cls: 'second-theme',
        name: 'Second'
      }],
      selectedOption: 'One',
      focusedQuiz: q[0]
    }
    return function (cb) {
      cb(x(tpl), true)
    }
  })
  .controller('MainController', ['$scope', 'getData', function ($scope, getData) {
    getData(function (data, cached) {
      for (var name in data) {
        if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;
        $scope[name] = data[name]
      }
      if (!cached) $scope.$digest()
    })
  }])

module.exports = function (document) {
  var el = document.getElementById('main')
  angular.bootstrap(el, ['MyApp'])
}
