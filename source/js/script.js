//выпадание селекта в нужном направлении:
const modifySelect2 = function() {
    var Defaults = $.fn.select2.amd.require('select2/defaults');

    $.extend(Defaults.defaults, {
        dropdownPosition: 'auto'
    });

    var AttachBody = $.fn.select2.amd.require('select2/dropdown/attachBody');
    var _positionDropdown = AttachBody.prototype._positionDropdown;

    AttachBody.prototype._positionDropdown = function() {
        var $window = $(window);
        var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
        var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');
        var newDirection = null;
        var offset = this.$container.offset();

        offset.bottom = offset.top + this.$container.outerHeight(false);

        var container = {
            height: this.$container.outerHeight(false)
        };

        container.top = offset.top;
        container.bottom = offset.top + container.height;

        var dropdown = {
            height: this.$dropdown.outerHeight(false)
        };

        var viewport = {
            top: $window.scrollTop(),
            bottom: $window.scrollTop() + $window.height()
        };

        var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
        var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

        var css = {
            left: offset.left,
            top: container.bottom
        };

        // Determine what the parent element is to use for calciulating the offset
        var $offsetParent = this.$dropdownParent;

        // For statically positoned elements, we need to get the element
        // that is determining the offset
        if ($offsetParent.css('position') === 'static') {
            $offsetParent = $offsetParent.offsetParent();
        }

        var parentOffset = $offsetParent.offset();

        css.top -= parentOffset.top
        css.left -= parentOffset.left;

        var dropdownPositionOption = this.options.get('dropdownPosition');

        if (dropdownPositionOption === 'above' || dropdownPositionOption === 'below') {
            newDirection = dropdownPositionOption;
        } else {
            if (!isCurrentlyAbove && !isCurrentlyBelow) {
                newDirection = 'below';
            }

            if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
                newDirection = 'above';
            } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
                newDirection = 'below';
            }
        }

        if (newDirection == 'above' || (isCurrentlyAbove && newDirection !== 'below')) {
            css.top = container.top - parentOffset.top - dropdown.height;
        }

        if (newDirection != null) {
          this.$dropdown
            .removeClass('select2-dropdown--below select2-dropdown--above')
            .addClass('select2-dropdown--' + newDirection);
          this.$container
            .removeClass('select2-container--below select2-container--above')
            .addClass('select2-container--' + newDirection);
        }

        this.$dropdownContainer.css(css);
    };
}

//модалки:
let body = $('body'),
    modalOverlay = $('.modal'),
    modals = $('.modal__body');

const openModal = function(id) {
    let targetModal = modalOverlay.children('#'+id);

    body.addClass('fixed');
    modalOverlay.addClass('modal--open');
    targetModal.addClass('modal__body--open');
}

const closeModals = function() {
    body.removeClass('fixed');
    modalOverlay.removeClass('modal--open');
    modals.removeClass('modal__body--open');
}

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

    //избранное и удаление товара (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let productBtns = $('.product__corner-btn'),
        elementFavBtn = $('.catalog-element__fav-btn');
    
    if (productBtns.length) {
        productBtns.each(function() {
            let btn = $(this);
    
            btn.on('click', function() {
                if (btn.hasClass('product__corner-btn--fav')) {
                    btn.toggleClass('product__corner-btn--fav-active');
                } else if (btn.hasClass('product__corner-btn--remove')) {
                    let product = btn.closest('.product');
    
                    product.remove();
                }
            });
        });
    }

    if (elementFavBtn.length) {
        elementFavBtn.on('click', function() {
            $(this).toggleClass('catalog-element__fav-btn--active');
        });
    }

    //имитация счетчика товара (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let productControlsBlock = $('.product__controls');

    if (productControlsBlock.length) {
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
    }

    //открытие списков товаров:
    let productsListHeads = $('.products-list__block-head'),
        aminationInProgress = false;

    if (productsListHeads.length) {
        productsListHeads.each(function() {
            let head = $(this),
                products = head.next('.products-list__products');
    
            head.on('click', function(e) {
                e.preventDefault;
                if (!aminationInProgress) {
                    aminationInProgress = true;
    
                    head.toggleClass('products-list__block-head--open');
                    products.slideToggle(300);
    
                    setTimeout(function() {
                        aminationInProgress = false;
                    }, 300);
                }
            });
        });
    }

    //имитация поиска по товарам (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let searchField = $('.catalog-filters__search'),
        resultBlock = $('.catalog-filters__results'),
        products = $('.products-list'),
        resetBtn = $('.catalog-filters__reset-btn'),
        goodsNotFoundBlock = $('.no-products');

    const cancelFiltering = function() {
        products.show();
        resultBlock.hide();
        goodsNotFoundBlock.hide();
    }

    if (searchField.length) {
        searchField.on('keyup', function() {
            if (searchField.val() != '') {
                products.hide();
                resultBlock.css('display', 'flex');
                goodsNotFoundBlock.css('display', 'flex');
            } else {
                cancelFiltering();
            }
        });

        resetBtn.on('click', function() {
            cancelFiltering();
        });
    }

    //вызовы модалкок (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let sortModalCallBtn = $('.catalog-filters__sort-btn'),
        closeModalBtns = $('.modal__close-btn'),
        modalsOverlay = $('.modal'),
        modals = $('.modal__body');

    sortModalCallBtn.on('click', function() {
        openModal('modalFilter');
    });

    closeModalBtns.on('click', function() {
        closeModals();
    });

    modalsOverlay.click(function (e) {
        if (!modals.is(e.target) && modals.has(e.target).length === 0) {
            closeModals();
        };
    });

    //кастомные селекты:
    let formSelects = $('.form__input--select');

    if (formSelects.length) {
        modifySelect2();

        formSelects.each(function() {
            let select = $(this),
                placeholder = select.data('placeholder');

            select.select2({
                'placeholder': placeholder,
                'minimumResultsForSearch': -1,
                'dropdownPosition': 'below',
                'width': '100%',
            });
        });
    }

    //маски на телефоны:
    let phoneInputs = $('input[name="PHONE"]');

    if (phoneInputs.length) {
        phoneInputs.inputmask({
            'mask': '+7 (999) 999-99-99',
            'clearIncomplete': true,
            'greedy': false,
        });
    }
});

$(window).on('load', function() {
    //preloader:
    let preloader = $('.preloader');

    preloader.removeClass('preloader--loading').fadeOut(1000);
});
