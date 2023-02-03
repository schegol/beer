//форматирование размера загружаемого файла:
const formatFileSize = function(bytes) {
    let i = -1,
        byteUnits = [' кб', ' Мб', ' Гб', ' Тб'];
    do {
        bytes /= 1024;
        i++;
    } while (bytes > 1024);

    return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
}

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

//ПОСЛЕ ПЕРЕНОСА ПЕРЕДЕЛАТЬ УДАЛЕНИЕ ТОВАРА:
const openModal = function(id, itemToRemove = false) {
    let targetModal = modalOverlay.children('#'+id);

    body.addClass('fixed');
    modalOverlay.addClass('modal--open');
    targetModal.addClass('modal__body--open');

    if (itemToRemove !== false) {
        let confirmBtn = targetModal.find('.modal__confirm-btn');

        confirmBtn.on('click', function(e) {
            e.preventDefault();

            itemToRemove.remove();
            closeModals();
        });
    }
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
                touchThreshold: 5,
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

                    openModal('removeProduct', product);
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
        let allProducts = productsListHeads.parent().children('.products-list__products');

        productsListHeads.each(function() {
            let head = $(this),
                products = head.next('.products-list__products'),
                parentBlock = head.parent(),
                otherBlocks = parentBlock.siblings(),
                otherBlocksHeads = otherBlocks.find('.products-list__block-head'),
                otherBlocksProducts = otherBlocks.find('.products-list__products');
    
            head.on('click', function(e) {
                e.preventDefault;

                if (!aminationInProgress) {
                    aminationInProgress = true;

                    if (!head.hasClass('products-list__block-head--open')) {
                        otherBlocksHeads.removeClass('products-list__block-head--open');
                        otherBlocksProducts.slideUp(300);
                    }
    
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
        closeModalBtns = $('.modal__close-btn, .modal__ok-btn'),
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

    //раскрытие групп полей:
    let inputGroupToggles = $('.form__group-toggle');

    if (inputGroupToggles.length) {
        inputGroupToggles.each(function() {
            let toggle = $(this),
                inputsBlock = toggle.next('.form__group-minimized');
    
            toggle.on('click', function() {
                toggle.toggleClass('form__group-toggle--open');
                inputsBlock.slideToggle(300);
            });
        });
    }

    //загрузка файлов (ПОПРАВИТЬ ПОСЛЕ ПЕРЕНОСА):
    let fileInputs = $('.form__input--file');

    if (fileInputs.length) {
        fileInputs.each(function() {
            let fileInput = $(this),
                visualBtn = fileInput.parent().children('.form__input-label--file');

            fileInput.on('change', function(e) {
                e.preventDefault();

                let file = fileInput[0].files[0],
                    fileName = file.name,
                    //fileSize = file.size,
                    //fileSizeFormatted = formatFileSize(fileSize),
                    fileBlock;

                fileBlock = '<a class="form__uploaded-file" href="#">\n'+fileName+'</a>';

                visualBtn.before(fileBlock);
            });
        });
    }

    body.on('click', '.form__uploaded-file', function(e) {
        e.preventDefault();

        $(this).remove();
    });

    //имитация отправки формы на модерацию (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let cabinetFormSubmitBtn = $('#cabinetFormSaveBtn');

    if (cabinetFormSubmitBtn.length) {
        cabinetFormSubmitBtn.on('click', function(e) {
            e.preventDefault();

            let form = $(this).closest('form'),
                inputs = form.find('input');

            form.addClass('form--on-moderation');
            inputs.prop('disabled', 'disabled');
            openModal('modalCabinetFormModeration');
        });
    }

    //модалка об успешной смене пароля в ЛК (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let cabinetPassChangeBtn = $('#cabinetPassChangeBtn');

    if (cabinetPassChangeBtn.length) {
        cabinetPassChangeBtn.on('click', function(e) {
            e.preventDefault();

            openModal('modalCabinetPasswordChanged');
        });
    }

    //модалка о выходе из ЛК (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА?):
    let cabinetExitBtn = $('#cabinetExit');

    if (cabinetExitBtn.length) {
        cabinetExitBtn.on('click', function(e) {
            e.preventDefault();

            openModal('modalCabinetExit');
        });
    }

    //запрос акта сверки - декалитры (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА?):
    let decaCheckbox = $('#formInputDeca');

    if (decaCheckbox.length) {
        decaCheckbox.on('change', function() {
            let submitBtn = decaCheckbox.closest('form').find('.form__submit-btn'),
                radios = decaCheckbox.closest('form').find('.form__input-wrapper--radio');
            
            if (decaCheckbox.is(':checked')) {
                submitBtn.text('Запросить акт сверки (декалитры)');
                radios.show();
            } else {
                submitBtn.text('Запросить акт сверки');
                radios.hide();
            }
        });
    }

    //модалка фильтрации заказов по датам (УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА):
    let ordersFilterCallBtn = $('.orders-requests__list-filter-toggle');

    if (ordersFilterCallBtn.length) {
        ordersFilterCallBtn.on('click', function() {
            openModal('modalOrdersSort');
        });
    }

    //открытие инпутов с датами через клик по лейблу:
    //TODO: прикрутить datepicker!!!
    // let dateInputLabels = $('.date-input__label');

    // if (dateInputLabels.length) {
    //     dateInputLabels.each(function() {
    //         let label = $(this),
    //             input = label.prev('input[type="date"]');

    //         label.on('click', function() {
    //             input.click();
    //         });
    //     });
    // }

    //добавление адреса (УБРАТЬ ПОСЛЕ ПЕРЕНОСА?):
    let addAddressBtn = $('.form__add-btn');

    if (addAddressBtn.length) {
        addAddressBtn.on('click', function() {
            let btn = $(this),
                prevAddressBlock = btn.closest('.form__input-group').prev('.form__input-group'),
                prevAddressCount = prevAddressBlock.data('address');

            if (prevAddressCount >= 1) {
                let newAddressCount = prevAddressCount+1,
                    newAddressHtml = '<div class="form__input-group" data-address="'+newAddressCount+'">\n'+
                        '<div class="form__input-block">\n'+
                            '<label class="form__input-label" for="formInput0_'+newAddressCount+'">\n'+
                                'Адрес №'+newAddressCount+'<span class="form__input-required"> *</span>\n'+
                            '</label>\n'+
                            '<div class="form__input-wrapper">\n'+
                                '<textarea class="form__input form__input--textarea textarea textarea--small" name="ADDRESS_'+newAddressCount+'" id="formInput0_'+newAddressCount+'" placeholder="Введите данные"></textarea>\n'+
                            '</div>\n'+
                        '</div>\n'+
                        '<div class="form__input-block">\n'+
                            '<label class="form__input-label" for="formInput00_'+newAddressCount+'">\n'+
                                'Время приёма отгрузок (Адрес №'+newAddressCount+')<span class="form__input-required"> *</span>\n'+
                            '</label>\n'+
                            '<div class="form__input-wrapper">\n'+
                                '<select class="form__input form__input--half form__input--select" type="text" name="FROM_'+newAddressCount+'" id="formInput00_'+newAddressCount+'" data-placeholder="с --:--">\n'+
                                    '<option></option>\n'+
                                    '<option value="9">с 9:00</option>\n'+
                                    '<option value="10">с 10:00</option>\n'+
                                    '<option value="11">с 11:00</option>\n'+
                                    '<option value="12">с 12:00</option>\n'+
                                '</select>\n'+
                                '<select class="form__input form__input--half form__input--select" type="text" name="TO_'+newAddressCount+'" id="formInput000_'+newAddressCount+'" data-placeholder="до --:--">\n'+
                                    '<option></option>\n'+
                                    '<option value="17">до 17:00</option>\n'+
                                    '<option value="18">до 18:00</option>\n'+
                                    '<option value="19">до 19:00</option>\n'+
                                    '<option value="20">до 20:00</option>\n'+
                                '</select>\n'+
                            '</div>\n'+
                        '</div>\n'+
                    '</div>';

                prevAddressBlock.after(newAddressHtml);

                let formSelects = $('.form__input-group[data-address="'+newAddressCount+'"] .form__input--select');

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

            }
        });
    }
});

$(window).on('load', function() {
    //preloader:
    let preloader = $('.preloader');

    preloader.removeClass('preloader--loading').fadeOut(1000);
});
