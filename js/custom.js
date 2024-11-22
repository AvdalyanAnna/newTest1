var opened_modal, _aus = false, _aum = false, _aut = false;
const _const = {};
function _width() {
    'use strict';
    return $(document).width();
}

function isset(i) {
    'use strict';
    return i.length > 0;
}

function empty(i) {
    'use strict';
    return (i === undefined || i === '' || i === 0 || i === '0' || i === null || i === false || i === '&nbsp;' || i === ' ');
}

function _in(e, t) {
    'use strict';
    return !e.is(t) && !isset(e.has(t));
}

function setGoal(i, c) {
    'use strict';
    if (typeof gtag !== 'undefined' && !empty(gtag) && !empty(i)) gtag('event', i, {'event_category': c});
    if (typeof ym !== 'undefined' && !empty(ym) && typeof yid !== 'undefined' &&  !empty(yid) && !empty(i)) ym(yid, 'reachGoal', i);
    if (typeof fbq !== 'undefined') fbq('trackCustom', i);
}

function _au() {
    'use strict';

    var d = _width() > 990,
        top = d ? 200 : 150,
        t;

    $(window).scroll(function(){
        if ($(this).scrollTop() > top) {
            _aus = true;
        }
    });

    $('body').mousemove(function() {
        _aum = true;
    });

    setTimeout(function () { _aut = true; }, 15000);

    t = setInterval(function () {
        if (_aus && _aut && (_width() > 990 ? _aum : true)) {
            clearInterval(t);
            setGoal('ACTIVE_USER', 'FORMS');
        }
    }, 1000);
}

function ajaxRequest(url, params, is_post, callback) {
    'use strict';

    if (empty(is_post)) is_post = false;
    if (empty(params)) params = {};
    if (typeof params !== 'string') {
        params.forEach(function(item, i) {
            if (item.name === '_csrf') params[i].value = $('[name="csrf-token"]').attr('content');
        });
    }

    $.ajax({
        type: is_post ? 'POST' : 'GET',
        url: url,
        data: params,
        dataType: 'json',
        success: function(data){
            if (appData.statuses[data.code] === 'ok') {
                setTimeout(function () {
                    callback(data);
                }, 100);
            }
            else if (appData.statuses[data.code] === 'wait') {
                setTimeout(function () {
                    ajaxRequest(url, params, is_post, callback);
                }, parseInt(data.value) * 1000);
            }
        }
    });
}

function subpixelFixPost() {
    new LazyLoad({
        callback_loaded: function (e) {
            var it = $('#' + e.getAttribute('id'));
            it.closest('.img-preload').addClass('loaded');
            if (it.hasClass('subpixel-fix-post')) subpixelFix('#' + e.getAttribute('id'));
        }
    });
}

function setSlider(parent) {
    'use strict';

    setTimeout(function () {
        var slider_for = parent.find('.slider-for'), slider_nav = parent.find('.slider-nav'),
            dots = _width() <= 991;

        if (isset(slider_for)) {
            subpixelFix('.subpixel-fix');
            subpixelFixPost();

            slider_for.closest('.product-gallery').addClass('visible');

            slider_for.slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: dots,
                asNavFor: '#' + slider_nav.attr('id'),
                autoplay: false,
                infinite: false,
                vertical: !dots,
                dots: false,
                swipe: dots,
                draggable: dots,
                speed: dots ? 300 : 0,
                //lazyLoad: 'ondemand'
            });

            slider_nav.slick({
                slidesToShow: 5,
                slidesToScroll: 1,
                asNavFor: '#' + slider_for.attr('id'),
                dots: false,
                focusOnSelect: true,
                margin: 10,
                arrows: true,
                adaptiveHeight: true,
                vertical: !dots,
                autoplay: false,
                infinite: false,
                //lazyLoad: 'ondemand',
            });
        }
    }, 10);
}

function unsetSlider(parent) {
    'use strict';

    var slider_for = parent.find('.slider-for.slick-initialized'), slider_nav = parent.find('.slider-nav.slick-initialized');

    if (!empty(slider_for)) {
        subpixelFix('.subpixel-fix');
        subpixelFixPost();

        slider_for.closest('.product-gallery').removeClass('visible');

        slider_for.slick('unslick');
        slider_nav.slick('unslick');
    }
}

function fancyArrows() {
    var l = $('.fancybox-button--arrow_left'),
        r = $('.fancybox-button--arrow_right'),
        c = $('.fancybox-slide--current').find('.fancybox-content'),
        o = 0,
        w = $(window).width();

    if (!empty(c)) {
        if (!empty(c.offset())) {
            o = c.offset().left-100;
            if (w <= 1024) o = c.offset().left-50;
            if (w <= 992) o = c.offset().left;
            l.css('left', o+'px');
            r.css('right', o+'px');
        }
    }
}

function setFancyBox() {
    $('[data-fancybox]:not(.slick-cloned)').fancybox({
        buttons: [
            "close"
        ],
        image: {
            preload: true
        },
        clickContent: function(current, event) {
            if (typeof event != 'undefined') {
                return event.offsetX <= event.target.width/2 ? 'prev' : 'next';
            }
            return false;
        },
        lang: "ru",
        i18n: {
            ru: {
                CLOSE: "Закрыть",
                NEXT: "Следующая",
                PREV: "Предыдущая",
                ERROR: "Мы не смогли обработать запрос. <br/> Пожалуйста, поппробуйте позже.",
                PLAY_START: "Начать слайдшоу",
                PLAY_STOP: "Остановить слайдшоу",
                FULL_SCREEN: "На весь экран",
                THUMBS: "Предпросмотр",
                DOWNLOAD: "Скачать",
                SHARE: "Поделиться",
                ZOOM: "Увеличить/уменьшить"
            }
        },
        afterShow: function() {
            fancyArrows();
        }
    });
}

function endForm(form, data) {
    if (appData.statuses[data.code] === 'ok') {
        $('.modal').modal('hide');

        let modalId = '#' + (data.modal || 'thank-modal'),
            success = $(modalId);

        success.modal('show');

        form.find('button, input, textarea').prop('disabled', false);
        form.find('input[type="text"], textarea').val('');
        form.removeClass('loading');
    } else {
        window.location.reload();
    }
}

function afterLoad() {
    var items, cl = 'm991', cl2 = 'x1';

    if (_width() <= 991) cl = 'l991';
    if (_width() <= 768) cl = 'l991';
    if (_width() <= 540) cl = 'l991';

    if (window.devicePixelRatio > 1) cl2 = 'x2';

    items = $('.hidden-images img.' + cl + ', .hidden-images img.' + cl2);

    items.each(function () {
        $(this).attr('src', $(this).data('src'));
    });
}

$(document).ready(function () {
    'use strict';

    _au();

    $('[name*="phone"]').inputmask('+7 (~~~) ~~~-~~-~{2,3}');

    $(".scroll-a").click(function(){
        var _href = $(this).attr('href');
        if (_href !== '#') {
            $("html, body").animate({scrollTop: $(_href).offset().top + 'px'}, 'slow', 'swing');
            return false;
        }
    });

    var prpage = $('.product-body');
    if (isset(prpage)) setSlider(prpage);

    $('.modal').on('show.bs.modal', function (e) {
        var id = $(this).attr('id'),
            m = $('.modal.fade.in:not(#'+id+')');

        if (isset(m)) {
            m.modal('hide');
            opened_modal = m;
        }
    }).on('shown.bs.modal', function (e) {
        setSlider($(this));
    }).on('hide.bs.modal', function (e) {
        unsetSlider($(this));
        $(this).scrollTop(0);
    }).on('hidden.bs.modal', function (e) {
        if (!empty(opened_modal)) {
            if ($(this).attr('id') !== opened_modal.attr('id')) {
                opened_modal.modal('show');
                opened_modal = null;
            }
        }
    });

    setFancyBox();
    subpixelFixPost();

    setTimeout(function () {
        if (!empty(window.location.hash) && isset(window.location.hash) && $(window.location.hash).hasClass('modal')) $(window.location.hash).modal('show');
    }, 500);

    $('form').submit(function(e) {
        e.preventDefault();

        var form = $(this);
        var data = form.serialize();

        var er = false,
            erGlob = false,
            ph = /^\+7\s\([0-689]\d{2}\)\s[\d]{3}-[\d]{2}-[\d]{2,3}$/ig,
            em = /^[\w][\w-._]*@[\w-_]+\.[a-z]{2,4}$/ig,
            n;

        form.find('input, textarea').each(function(i,e){
            n = $(this).attr('name');
            er = (empty($(this).val()) && $(this).prop('required')) || (n.indexOf('email') !== -1 && !em.test($(this).val())) || (n.indexOf('phone') !== -1 && !ph.test($(this).val()));
            $(this).toggleClass('error', er);
            if (er) erGlob = true;
        });

        if (erGlob) {
            erGlob = false;
            return false;
        }

        form.find('button, input, textarea').prop('disabled', true);
        form.addClass('loading');

        ajaxRequest(form.attr('action'), data, true, function (data) {
            setGoal(data.goal || 'FORM_COMPLETE', 'FORMS');
            endForm(form, data);
        });

        return false;
    });

    afterLoad();

    var top = 100,
        h = $('#button-callback, #button-callback-2');

    if ($(window).scrollTop() > top) {
        h.addClass('active');
    }

    $(window).scroll(function(){
        if ($(this).scrollTop() > top) {
            h.addClass('active');
        }
    });
});

$(window).resize(function() {
    'use strict';

    fancyArrows();
});