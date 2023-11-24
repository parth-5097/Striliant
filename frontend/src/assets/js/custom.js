$(function() {
	$(".toggle-icon-main").on("click", function(e) {
		e.preventDefault();
		$(".dash-wrapper").toggleClass("toggled-custom-class");
	});

	$(".header-user-profile-inner-cust").on("click", function(e) {
		$(this).toggleClass("active");
		e.stopPropagation();
	});
	$(document).on("click", function(e) {
		if ($(e.target).closest(".header-user-profile-inner-cust").length > 0)
			return;
		if ($(e.target).is(".header-user-profile-inner-cust") === false) {
			$(".header-user-profile-inner-cust").removeClass("active");
		}
	})

	$(document).mouseup((e) => {
		if (!$(".calc-main").is(e.target) && $(".calc-main").has(e.target).length === 0) {
      $(".calc-main").removeClass("active");
		}
	});
	$(".calc-click").on("click", () => {
    $(".calc-main").toggleClass("active");
	});

	$(".hdr-top-box-inr-icon").click(function () {
		$(".search-form-wrapper").toggleClass("active")
	});

	$(".hdr-top-box i").click(function () {
		$(".responsive-view-menu").toggleClass("active")
	});

	$(".hdr-top-box i").click(function () {
		$(".search-form-wrapper").removeClass("active")
	});

	$(".hdr-top-box-inr-icon").click(function () {
		$(".responsive-view-menu").removeClass("active")
	});

	$('.sidebar-main-section-inner').perfectScrollbar();
	$('.filter-src-inner').perfectScrollbar();

	$('.nav-link').on('click',(e)=>{
		if($('.nav-link').hasClass('active')){
			$('.nav-link').removeClass('active')
		}else{
			$(e).addClass('active')
		}
	})

	/*$(document).ready(function() {
		$('.minus').click(function () {
			var $input = $(this).parent().find('input');
			var count = parseInt($input.val()) - 1;
			count = count < 1 ? 1 : count;
			$input.val(count);
			$input.change();
			return false;
		});
		$('.plus').click(function () {
			var $input = $(this).parent().find('input');
			$input.val(parseInt($input.val()) + 1);
			$input.change();
			return false;
		});
	});*/
});


$(function(){
	var current = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
  $('.sidebar-main-inner-menu li a').each(function(){
    var $this = $(this);
		if($this.attr('href').indexOf(current) !== -1){
			$this.addClass('active');
		}
	});

	$(document).mouseup((e) => {
		if (!$(".notification-custom-main").is(e.target) && $(".notification-custom-main").has(e.target).length === 0) {
      $(".notification-custom-main").removeClass("active");
		}
	});
	$(".notification-click").on("click", () => {
    $(".notification-custom-main").toggleClass("active");
	});

});

$(".filter-Btn").on("click", function (e) {
	$('body').addClass('filter-pop-open');
	e.stopPropagation();
	$("body").after('<div class="filter-src-backdroup"></div');
});
$(".filter-src-close").on("click", function (e) {
	$('body').removeClass('filter-pop-open');
	$('.filter-src-backdroup').remove()
});
$(document).on("click", function (e) {
	if ($(e.target).closest(".filter-src-main").length > 0)
		return;
	$('.filter-src-backdroup').remove()
	if ($(e.target).is("body") === false) {
		$('body').removeClass('filter-pop-open');
	}
});

$('.dash-comn-bx-style ul li, .shap-dash-info').on('click', function () {
	if ($(this).hasClass('active')) {
		$(this).removeClass('active');
	} else {
		$(this).addClass('active');
	}
})



