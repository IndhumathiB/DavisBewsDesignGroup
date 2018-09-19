$(document).ready(function () { 
   
    function resizeWindow() {
    
    $(window).resize(function () {
        var tableWidth = $(".table-responsive.cus-cards").width();
        $(".cus-scroll-container").width(tableWidth);
    });
    }
    
     $(window).trigger('resize');
    $(window).bind('resizeWindow', resizeWindow);

});