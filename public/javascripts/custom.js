// JavaScript Document
$(document).ready(function($timeout) {


	function mySlider() {

		$('.slides').slick({
			infinite: false,
			speed: 300,
			slidesToShow: 3,
			slidesToScroll: 1,
			initOnLoad: true,
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

	}
	mySlider();


	function gallerySlider() {
		$('.gslides').slick({
			infinite: false,
			dots: true,
			arrows: false,
			slidesToShow: 4,
			slidesToScroll: 1,
			autoplay: true,
			autoplaySpeed: 2000,
			responsive: [{
					breakpoint: 767,
					settings: {
						slidesToShow: 3,
					}
				},

				{
					breakpoint: 600,
					settings: {
						slidesToShow: 2,
					}
				}, {
					breakpoint: 480,
					settings: {
						slidesToShow: 1,
					}
				}

			]
		});

	}
	gallerySlider();

	function myFunction() {
		var windowWidth = $(window).width();

		if (windowWidth <= 768) {
			$('#accordion .panel-collapse').removeClass('in')
		} else {
			$('#accordion .panel-collapse').addClass('in')
		}


		$('#accordion a[data-toggle="collapse"]').click(function(e) {
			if ($(window).width() >= 768) {
				e.stopPropagation();
			}
		});
	}
	myFunction();


	$(window).resize(function() {
		myFunction();
		mySlider();
	});



});