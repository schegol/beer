$(function () {
	//слайдеры:
    let sliders = $('.slider__items');

    if (sliders.length) {
        sliders.each(function() {
            let slider = $(this);

            slider.slick({
                touchThreshold: 30,
                infinite: false,
                autoplay: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
                dotsClass: 'slider__dots-list',
                appendDots: slider.closest('.slider').find('.slider__dots'),
            });
        });
    }

    //избранное (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let productFavBtns = $('.product__corner-btn--fav');
    
    productFavBtns.each(function() {
        let btn = $(this);

        btn.on('click', function() {
            btn.toggleClass('product__corner-btn--fav-active');
        });
    });

    //имитация счетчика товара (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let productControlsBlock = $('.product__controls');

    productControlsBlock.each(function() {
        let block = $(this),
            btns = block.find('.product__controls-btn');

        btns.on('click', function() {
            let btn = $(this),
                valueField = block.find('.product__controls-counter'),
                value = parseInt(valueField.val()),
                newValue;

            if (!btn.hasClass('product__controls-btn--disabled')) {
                if (btn.hasClass('product__controls-btn--plus')) {
                    newValue = value+1;
                } else {
                    newValue = value-1;
                }

                valueField.val(newValue);
                if (newValue > 0) {
                    btns.removeClass('product__controls-btn--disabled');
                    block.addClass('product__controls--active');
                } else if (newValue === 0) {
                    btns.filter('.product__controls-btn--minus').addClass('product__controls-btn--disabled');
                    block.removeClass('product__controls--active');
                }
            }
        });
    });
});

$(window).on('load', function() {
    //preloader:
    let preloader = $('.preloader');

    preloader.removeClass('preloader--loading').fadeOut(1000);
});