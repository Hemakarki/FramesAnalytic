'use strict';

/**
 * @ngdoc directive
 * @name dynamicBindHtml.directive:dynamicBindHtml
 * @restrict A
 * @param {(string|Object)} dynamic-bind-html Angular code that compiles to a
 * valid html string (or object returned from a call to $sce.trustAs).
 *
 * @description
 * A directive inspired by `ng-bind-html` that accepts uncompiled angular code
 * in addition to raw html.
 *
 * @example
   <div dynamic-bind-html="{{generatesHtmlContainingDirectives()}}"></div>
 */
angular.module('dynamicBindHtml', [])
.directive('dynamicBindHtml', ["$compile", function($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      let compileHtml = () => {
        ele.html(attrs.dynamicBindHtml);
        $compile(ele.contents())(scope);
      };
      compileHtml();
      scope.$on('updateDynamicBindHtml', () => {
        compileHtml();
      });
    }
  };
}]);
