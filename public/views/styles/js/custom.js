// JavaScript Document
$( document ).ready(function() { 


	$(".login_dropdown span").click(function() {
		if($(".login_dropdown ul").hasClass("box_show") == true){
			$(".login_dropdown ul").removeClass("box_show"); 
		} else{
			$(".login_dropdown ul").addClass("box_show"); 
		}
	});

	// $(".app").click(function () {
	// 	console.log("Here");
	// 	if($(".login_dropdown ul").hasClass("box_show") == true){
	// 		$(".login_dropdown ul").removeClass("box_show"); 
	// 	}
	// });
	// $(".login_dropdown ul li ul li").click(function() {
	// 	if($(".login_dropdown ul").hasClass("box_show") == true){
	// 		$(".dropdown-menu li ul").addClass("box_show");  
	// 	} else{
	// 		$(".dropdown-menu li ul").addClass("box_show"); 
	// 	}
			
	// })
	

	$(".login_btn").click(function() {
		$(".login_dropdown ul").removeClass("box_show"); 
	});

	$(".fortgot").click(function() {
		$(".login_dropdown ul").removeClass("box_show"); 
	});




 //    $(".container").click(function() {
	// 	$(".login_dropdown ul").removeClass("box_show"); 
	// });
 function mySlider() {	
	$('.slides').slick({	
	infinite: false,
	speed: 300,
	slidesToShow: 3,	
	slidesToScroll: 1,
	responsive: [
		{
	  breakpoint: 767,
	  settings: {
		slidesToShow: 2,
		slidesToScroll: 1
	  }
	},
	{
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
	arrows : false,
	slidesToShow: 4,
	slidesToScroll: 1,	
	autoplay: true,
    autoplaySpeed: 2000,
	responsive: [
		{
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
    },
    {
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
		
		if(windowWidth <= 768) {
			$('#accordion .panel-collapse').removeClass('in')	
		} else {
			$('#accordion .panel-collapse').addClass('in')	
		}			
		
		
		$('#accordion a[data-toggle="collapse"]').click(function(e){
			if ($(window).width() >= 768) {  
			   e.stopPropagation();			  
			}   
		});	
    }
	myFunction();
	
	$( window ).resize(function() {
	   myFunction();
	   mySlider();
	});
	
	
    function product_slider() {	
		$('.product_slider').slick({	
		infinite: false,
		dots: true,
		arrows : false,
		slidesToShow: 1,
		slidesToScroll: 1,	
		autoplay: false,		
	});		
 }
 product_slider();
	
});





