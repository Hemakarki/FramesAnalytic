angular.module('framebridge').directive('slick', function($timeout) {
  return function(scope, el, attrs) {
    $timeout((function() {
      el.slick({
        infinite: false,
        speed: 100,
        dots: true,
        arrows: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [{
            breakpoint: 767,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          }, {
            breakpoint: 480,
            settings: "unslick"
          }

        ]
      });
    }), 100)
  }
})