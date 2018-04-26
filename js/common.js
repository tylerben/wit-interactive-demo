/**
 * Function used to define form steps navigation behavior
 * @param  {object} e [javascript event object]
 * @return {[type]}   [description]
 */
function stepper(e) {
    var $steps = jQuery( '.form-step' ); 
    $steps.each(function() {
       jQuery( this ).removeClass('bg-highlight');
       jQuery( this ).removeClass('text-white');
       jQuery( this ).addClass('text-highlight');
       jQuery( this ).addClass('bg-light-gray');
    })

    if ( e.target.type.toLowerCase() === "checkbox" ) {
    	var target = jQuery( e.target ).parent().parent().parent().parent().prev();
    } else {
    	var target = jQuery( e.target ).parent().parent().prev();
    }

    $activeStep = target.find(".form-step");
    $activeStep.addClass("bg-highlight");
    $activeStep.addClass("text-white");
    $activeStep.removeClass("text-highlight");
    $activeStep.removeClass("bg-light-gray");
}

/**
 * Function used to toggle between sections
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function navbarToggle(e) {
  var $target = jQuery( e.target );
  if ( $target.prop("tagName").toLowerCase() === "li" ){
    $target.siblings().removeClass('active');
    $target.addClass('active');
    var sectionID = $target.attr('data-section');
    var $dataSections = jQuery( '.data-nav-section' );
    jQuery.each($dataSections, function() {
      jQuery( this ).hide();
    })
    jQuery( '#' + sectionID ).show();
  }
}

/**
 * Function used to show a specific navbar tab
 * @param  {string} section [CSS selector for section to show]
 */
function showNavbarSection(section) {
  jQuery( section ).show();
} 