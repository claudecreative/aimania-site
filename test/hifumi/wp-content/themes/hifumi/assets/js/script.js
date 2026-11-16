
// page up //
$(document).ready(function() {
    var flag = false;
    var page_up = $('.c-pageup');
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            if (flag == false) {
                flag = true;
                page_up.stop().animate({
                    'right': '3%'
                }, 500);
            }
        } else {
            if (flag) {
                flag = false;
                page_up.stop().animate({
                    'right': '-500px'
                }, 500);
            }
        }
    });
    page_up.click(function() {
        $('body, html').animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});

jQuery(function($) {
    var startPos = 0, winScrollTop = 0;

    $(window).on('scroll', function() {
        winScrollTop = $(this).scrollTop();

        if (winScrollTop > startPos) {
            $('#header').addClass('active');
            if (winScrollTop >= 200) {
                $('#header').addClass('hide');
            }
        } else {
            if (winScrollTop === 0) {
                $('#header').removeClass('active hide');
            } else {
                $('#header').removeClass('hide');
            }
        }

        startPos = winScrollTop;
    });
});

$(window).on('scroll', function() {
    var scrollLeft = $(this).scrollLeft();
    $('#header').css('left', -scrollLeft + 'px');
});

$('body').on('click', '.menu', function () {
    $(this).toggleClass('open');
    $('.sp_menu').toggleClass('open');
    $('.c-header__right').toggleClass('open');
    $('.h_sec').toggleClass('open');
    $('#header').toggleClass('open');

    // Check if menu is open or closed
    if ($(this).hasClass('open')) {
        // Get the current scroll position and store it in a variable
        var scrollPosition = $(window).scrollTop();
        $('body').addClass('no-scroll').css({
            'top': -scrollPosition + 'px'
        });
    } else {
        // When closing the menu, restore the previous scroll position
        var scrollPosition = Math.abs(parseInt($('body').css('top')));
        $('body').removeClass('no-scroll').css({
            'top': ''
        });
        $(window).scrollTop(scrollPosition);
    }
});

$(document).ready(function() {
    $('.c-layout-faq__title').on('click', function() {
      $(this).toggleClass('active'); // Toggle class 'active' cho tiêu đề
      $(this).next('.c-layout-faq__wrap').stop().slideToggle(); // Toggle slide cho phần wrap (dd)
    });
    
  });

  $(document).ready(function () {
    // Lắng nghe sự kiện click trên nút c-btn-3
    $('.c-btn-3').on('click', function (e) {
      e.preventDefault(); // Ngăn chặn hành vi mặc định của link
  
      const $button = $(this); // Nút được click
      const $content = $button.siblings('.p-voice__content'); // Nội dung liên quan
  
      // Toggle nội dung
      $content.slideToggle();
  
      // Thêm/xóa class active cho nút
      $button.toggleClass('active');
    });
  });

 
    // Lấy toàn bộ nội dung trong <body>
    const body = document.body;
    let text = body.innerHTML;

    // Tìm các dấu chấm (。) và dấu phẩy (、) để bao bọc trong <span>
    text = text.replace(/([^\s])。(?![^<>]*>)/g, '$1<span class="no-break">。</span>'); // Bao dấu chấm
    text = text.replace(/([^\s])、(?![^<>]*>)/g, '$1<span class="no-break">、</span>'); // Bao dấu phẩy

    // Cập nhật nội dung trong <body>
    body.innerHTML = text;

  