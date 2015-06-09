if (!RedactorPlugins) var RedactorPlugins = {};

// TODO: Global vars are evil
var isCustomImage = false;
var imageUploaded = 0;

RedactorPlugins.dnnImageUpload = {
    FAKE_PROGRESS_TIME: 5000,
    init: function () {
        this.buttonAdd('dnnImageUpload', 'Insert image', this.dnnImageShow);
        this.buttonAwesome('dnnImageUpload', 'fa-bullhorn');
    },

    // IMAGE
    dnnImageEditText: function () {
        var dnnInsertImage;

        this.opts.curLang.exceedLimit = this.opts.curLang.exceedLimit.replace('{0}', this.opts.maxFileSize/(1024 * 1024));

        dnnInsertImage = '<section id="redactor-modal-image-insert">' +
               '<div id="redactor_tabs">' +
                    '<a href="#" id="redactor-tab-control-1" class="redactor_tabs_act leftside">' + this.opts.curLang.uploadFile + '</a>' +
                    '<a href="#" id="redactor-tab-control-2">' + this.opts.curLang.storedLocation + '</a>' +
                    '<a href="#" id="redactor-tab-control-3" class="rightside">' + this.opts.curLang.fromUrl + '</a>' +
               '</div>' +
               '<form id="redactorInsertImageForm" method="post" action="" enctype="multipart/form-data">' +
                    '<div id="redactor_tab1" class="redactor_tab">' +
                    '<input type="file" id="redactor_file" name="' + this.opts.imageUploadParam + '" />' +
                    '</div>' +
                    '<div id="redactor_tab2" class="redactor_tab" style="display: none;">' +
                       // DNN Component //
                       '<div class="redactor_content" style="display:none;"><div class="redactor_search"><input type="text" name="redactor_search_file" id="redactor_search_file" class="redactor_input" placeholder="Search"></div></div>' +
                       // End - DNN Component //
                       '<div id="redactor_image_box"></div>' +
                    '</div>' +
                '</form>' +
                '<div id="redactor_tab3" class="redactor_tab redactor_tab_url" style="display: none;">' +
                    '<div class="link_form">' +
                        '<label>' + this.opts.curLang.enterResourceUrl + '</label>' +
                        '<input type="text" name="redactor_file_link" id="redactor_file_link" class="redactor_input"  />' +
                    '</div>' +
                    '<div class="preview-main">' +
                        '<div class="preview-img">' +
                            '<img />' +
                        '</div>' +
                        '<div class="preview-name">' +
                        '</div>' +
                    '</div>' +
               '</div>' +
               '<div id="redactor-modal-image-upload-status">' +
                   '<div class="upload-status-container">' +
                       '<div class="upload-status-caption">' + this.opts.curLang.uploadStatusTitle + '</div>' +
                       '<div class="upload-status-main">' +
                           '<div class="upload-status-preview">' +
                               '<img />' +
                           '</div>' +
                           '<div class="upload-status-name">' +
                           '</div>' +
                           '<div class="upload-status-progress">' +
                               '<div class="bar"><span /></div>' +
                               '<span class="btn-cancel" />' +
                           '</div>' +
                           '<div class="upload-status-message">' +
                           '</div>' +
                       '</div>' +
                    '</div>' +
                '</div>' +
           '</section>' +
           '<footer>' +// DNN Component //
               '<button class="redactor_modal_btn redactor_modal_action_btn redactor_upload_btn_1 redactor-img-btn" id="redactor_upload_btn1" disabled="disabled">' + this.opts.curLang.insertImage + '</button>' +
               '<button class="redactor_modal_btn redactor_modal_action_btn redactor_upload_btn_2 redactor-img-btn" id="redactor_upload_btn2" disabled="disabled">' + this.opts.curLang.insertImage + '</button>' +
               '<button class="redactor_modal_btn redactor_modal_action_btn redactor_upload_btn_3 redactor-img-btn" id="redactor_upload_btn" disabled="disabled">' + this.opts.curLang.insertImage + '</button>' +
               '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>' +
            '</footer>';
        return dnnInsertImage;
    },
    dnnImageShow: function () {

        this.selectionSave();
        var callback = $.proxy(function () {
            var context = this;
            // json
            if (this.opts.imageGetJson) {
                // folders
                if (typeof redactorDropDownOptions != "undefined") {

                    redactorDropDownOptions.onSelectionChangedBackScript = function () {
                        var folderId = context._folderPicker.selectedItem().key;
                        context.dnnLoadImages($('#redactor_search_file').val(), folderId);
                    };
                    redactorDropDownOptions.itemList.containerCss = 'dt-container redactor_box';

                    this._folderPicker = new dnn.DropDownList(null, redactorDropDownOptions);
                    $('#redactor_image_box').before(this._folderPicker.$element);
                    this._folderPicker.$element.wrapAll('<div id="dnnRedactor_select" />');
                }

                var searchKeyChangedHandler;
                $('#redactor_search_file').keyup(function () {
                    if (searchKeyChangedHandler) {
                        clearTimeout(searchKeyChangedHandler);
                    }

                    searchKeyChangedHandler = setTimeout(function () {
                        var folderId = -1;
                        if (typeof context._folderPicker != "undefined") {
                            folderId = context._folderPicker.selectedItem().key;
                        }

                        context.dnnLoadImages($('#redactor_search_file').val(), folderId);
                    }, 500);
                });

                $(".redactor_upload_btn_2").on('click', function () {
                    var $selectedImg = $('.redactor_thumb_wrapper.checked img').eq(0);
                    if ($selectedImg.length > 0) {
                        var loadImg = '<p><img src="' + $selectedImg.attr('src') + '" /></p>';
                        context.dnnImageInsert(loadImg, true);
                    }
                });

                this.dnnLoadImages('', -1);
            }
            else {
                $('#redactor-modal-tab-2').remove();
            }

            if (this.opts.imageUpload || this.opts.s3) {
                // dragupload
                if (!this.isMobile() && !this.isIPad() && this.opts.s3 === false) {
                    if ($('#redactor_file').length) {
                        this.draguploadInit('#redactor_file', {
                            url: this.opts.imageUpload,
                            uploadFields: this.opts.uploadFields,
                            success: $.proxy(this.dnnImageCallback, this),
                            error: $.proxy(function (obj, json) {
                                this.callback('imageUploadError', json);

                            }, this),
                            uploadParam: this.opts.imageUploadParam
                        });
                    }
                }

                if (this.opts.s3 === false) {
                    // ajax upload
                    this.dnnUploadInit('redactor_file', {
                        auto: true,
                        url: this.opts.imageUpload,
                        success: $.proxy(this.dnnImageCallback, this),
                        error: $.proxy(function (obj, json) {
                            this.callback('imageUploadError', json);

                        }, this)
                    });
                }
                    // s3 upload
                else {
                    $('#redactor_file').on('change.redactor', $.proxy(this.s3handleFileSelect, this));
                }

            }
            else {
                $('.redactor_tab').hide();
                if (!this.opts.imageGetJson) {
                    $('#redactor_tabs').remove();
                    $('#redactor_tab3').show();
                    $('.redactor_modal_action_btn').hide().eq(2).show();
                }
                else {
                    $('#redactor-tab-control-1').remove();
                    $('#redactor-tab-control-2').addClass('redactor_tabs_act leftside');
                    $('.redactor_modal_action_btn').hide().eq(1).show();
                    $('#redactor_tab2').show();
                }
            }

            if (!this.opts.imageTabLink && (this.opts.imageUpload || this.opts.imageGetJson)) {
                $('#redactor-tab-control-3').hide();
            }

            $('#redactor_upload_btn').click($.proxy(this.dnnImageCallbackLink, this));

            if (!this.opts.imageUpload && !this.opts.imageGetJson) {
                setTimeout(function () {
                    $('#redactor_file_link').focus();

                }, 200);
            }

            $('#redactor_file_link').on('propertychange change click keyup input paste', function (e) {
                if ($(this).data('oldvar') && $(this).data('oldvar') == $(this).val()) {
                    return;
                }

                if (context._previewFromUrlHandler) {
                    clearTimeout(context._previewFromUrlHandler);
                }
                context._previewFromUrlHandler = setTimeout($.proxy(context.dnnPreviewFromUrl, context), 500);
            });
            $('#redactor_modal').addClass('redactor_blockBlur');
        }, this);

        this.dnnModalInit(this.opts.curLang.image, this.dnnImageEditText(), 610, callback);

    },
    dnnLoadImages: function (keyword, folderId, callback) {
        var context = this;
        var loadRecent = false;
        if (folderId == "-1") {
            if (this.dnnGetUploadPath() !== '') {
                folderId = this.dnnGetUploadPath();
            }
            loadRecent = true;
        }

        var permission = typeof redactorDropDownOptions !== 'undefined' ? redactorDropDownOptions.services.parameters.permission : '';
        $.getJSON(this.opts.imageGetJson, { keyword: keyword, folderId: folderId, loadRecent: loadRecent, permission: permission }, function (data) {
            $('#redactor_image_box').empty();
            $(".redactor_upload_btn_2").prop('disabled', true);
            $.each(data, function (key, val) {
                if (val.type == 'switch') {
                    var item = { key: val.id.toString(), value: val.title };
                    context._folderPicker.selectedItem(item);
                } else {
                    // title
                    var thumbtitle = '';
                    if (typeof val.title !== 'undefined') thumbtitle = val.title;
                    // DNN Customized Adding span around image
                    var img = $('<span class="redactor_thumb_wrapper"><span class="redactor_thumb_holder"><img src="' + val.thumb + '" class="redactorfolder" rel="' + val.image + '" title="' + thumbtitle + '" /><span class="active-state"></span></span><p>' + thumbtitle.substring(0, 20) + '</p></span>');
                    // End DNN Customized Adding span around image
                    $('#redactor_image_box').append(img);
                    // DNN Customized
                    if (val.type == 'file') {
                        $(img).click(function () {
                            $('.redactor_thumb_wrapper').removeClass('checked');
                            $(this).addClass('checked');
                            $(".redactor_upload_btn_2").prop('disabled', false);
                        });
                    } else if (val.type == 'folder') {
                        $(img).dblclick(function (e) {
                            var item = { key: val.id.toString(), value: val.title };
                            if (typeof context._folderPicker != "undefined") {
                                context._folderPicker.selectedItem(item);
                                dnn.setVar(context._folderPicker.id() + '_expandPath', val.path);
                                context.dnnLoadImages($('#redactor_search_file').val(), val.id);
                            }

                            e.preventDefault();
                        });
                    }
                }
            });

            if (typeof callback == "function") {
                callback.call(context);
            }
        });
    },
    dnnImageThumbClick: function (e) {
        var img = '<img id="image-marker" src="' + $(e.target).attr('rel') + '" alt="' + $(e.target).attr('title') + '" />';
        var parent = this.getParent();
        if (this.opts.paragraphy && $(parent).closest('li').size() === 0) img = '<p>' + img + '</p>';

        this.dnnImageInsert(img, true);
    },
    dnnImageCallbackLink: function () {
        var val = $('#redactor_file_link').val();

        if (val !== '') {
            var data = '<img id="image-marker" src="' + val + '" />';
            if (this.opts.linebreaks === false) data = '<p>' + data + '</p>';

            this.dnnImageInsert(data, true);

        }
        else this.modalClose();
    },
    dnnImageCallback: function (data) {
        this.dnnImageInsert(data);
    },
    dnnImageInsert: function (json, link) {
        var html;

        if (this._isworking) {
            return;
        }
        this._isworking = true;

        if (json.hasOwnProperty('message')) {
            html = '<p>' + json.message + '</p>';
            this.insertNode($(html));
            this.sync();

            this.dnnModalClose();
            return;
        }

        this.selectionRestore();

        if (json !== false) {
            html = '';
            if (link !== true) {
                html = '<img id="image-marker" src="' + json.filelink + '" />';

                var parent = this.getParent();
                if (this.opts.paragraphy && $(parent).closest('li').size() === 0) {
                    html = '<p>' + html + '</p>';
                }
            }
            else {
                html = json;
            }
            this.insertNode($(html));

            var image = $(this.$editor.find('img#image-marker'));

            if (image.length) image.removeAttr('id');
            else image = false;

            this.sync();

            // upload image callback
            link !== true && this.callback('imageUpload', image, json);
        }

        this.dnnModalClose();
        this.observeImages();

        this._isworking = false;
    },
    dnnPreviewFromUrl: function () {
        var redactorModalInner, fakeloader, progress;

        var $urlElement = $('#redactor_file_link');
        var url = $urlElement.val();

        var $insertButton = $('#redactor_upload_btn');
        var $previewArea = $('#redactor_tab3 .preview-main');
        var $previewImg = $previewArea.find('img');
        var $previewName = $previewArea.find('.preview-name');

        $urlElement.data('oldvar', url);
        if (url === '') {
            $insertButton.prop('disabled', 'disabled');
            $previewArea.hide();
            return;
        }

        if (!$previewImg.data('loadEventBinded')) {
            // Init fakeProgressBar
            redactorModalInner = $('#redactor_modal_inner');
            redactorModalInner.prepend('<div class="fakeloader"><div class="progress"></div><div>');
            fakeloader = redactorModalInner.find('.fakeloader:first');
            progress = fakeloader.find('.progress:first');

            progress.animate({width: '98%'}, this.FAKE_PROGRESS_TIME);

            $previewImg.on('load', function() {
                $previewArea.show();
                $urlElement.removeClass('error');
                var name = $previewImg.attr('src').replace('\\', '/').split('/').pop().split('?')[0];
                $previewName.html(name);
                $insertButton.prop('disabled', '');

                // Stop fakeProgressBar
                progress.stop(true, true).css('width', '100%');
                fakeloader.fadeOut();
            }).on('error', function() {
                $previewArea.hide();
                $urlElement.addClass('error');
                $insertButton.prop('disabled', 'disabled');

                // Stop fakeProgressBar
                progress.stop(true, true).css('width', '100%');
                fakeloader.fadeOut();
            });
            $previewImg.data('loadEventBinded', true);
        }

        $previewImg.attr('src', url);
    },
    imageInsert: function (json, link) {
        this.selectionRestore();

        if (json !== false) {
            var html = '';
            if (link !== true) {
                html = '<img id="image-marker" src="' + json.filelink + '" />';

                var parent = this.getParent();
                if (this.opts.paragraphy && $(parent).closest('li').size() === 0) {
                    html = '<p>' + html + '</p>';
                }
            }
            else {
                html = json;
            }

            this.execCommand('inserthtml', html, false);

            var image = $(this.$editor.find('img#image-marker'));

            if (image.length) image.removeAttr('id');
            else image = false;

            this.sync();

            // upload image callback
            link !== true && this.callback('imageUpload', image, json);
        }

        this.dnnModalClose();
        this.observeImages();
    },
    // MODAL
    dnnModalInit: function (title, content, width, callback) {
        isCustomImage = true;
        this.modalSetOverlay();
        this.$redactorModal = $('#redactor_modal');

        if (!this.$redactorModal.length) {
            this.$redactorModal = $('<div id="redactor_modal" style="display: none;" />');
            this.$redactorModal.append($('<div id="redactor_modal_close">&times;</div>'));
            this.$redactorModal.append($('<header id="redactor_modal_header" />'));
            this.$redactorModal.append($('<div id="redactor_modal_inner" />'));
            $('body').append(this.$redactorModal);
        }

        $('#redactor_modal_close').on('click', $.proxy(this.dnnModalClose, this));
        $('#redactor_modal_overlay').off('click');
        $(document).keyup($.proxy(this.dnnModalCloseHandler, this));
        this.$editor.keyup($.proxy(this.dnnModalCloseHandler, this));

        this.modalSetContent(content);
        this.modalSetTitle(title);
        this.modalSetDraggable();
        this.dnnModalLoadTabs();
        this.modalOnCloseButton();
        this.modalSetButtonsWidth(width);

        this.saveModalScroll = this.document.body.scrollTop;
        if (this.opts.autoresize === false) {
            this.saveModalScroll = this.$editor.scrollTop();
        }

        if (this.isMobile() === false) this.modalShowOnDesktop(width);
        else this.modalShowOnMobile();

        // modal actions callback
        if (typeof callback === 'function') {
            callback();
        }

        // modal shown callback
        setTimeout($.proxy(function () {
            this.callback('modalOpened', this.$redactorModal);

        }, this), 11);

        // fix bootstrap modal focus
        $(document).off('focusin.modal');

        // DNN customised
        if (window.jQuery && window.jQuery.ui.dialog) {
            $(document).unbind("focusin.dialog");
        }
        // END DNN customised

        // enter
        this.$redactorModal.find('input[type=text]').on('keypress', $.proxy(function (e) {
            if (e.which === 13) {
                this.$redactorModal.find('.redactor_modal_action_btn').click();
                e.preventDefault();
            }
        }, this));
        $('input#redactor_file').on('change', function () {
            imageUploaded = 1000;
        });

        return this.$redactorModal;

    },
    dnnModalCloseHandler: function (e) {
        if (e.keyCode === this.keyCode.ESC) {
            this.modalClose();
            isCustomImage = false;
            return false;
        }
    },
    dnnModalClose: function () {
        if (this.xhr) {
            this.xhr.abort();
            this.dnnUploadAsyncAborted();
        }

        $('#redactor_modal_close').off('click', this.dnnModalClose);
        $('#redactor_modal').fadeOut('fast', $.proxy(function () {
            var redactorModalInner = $('#redactor_modal_inner');

            if (this.modalcontent !== false) {
                this.modalcontent.html(redactorModalInner.html());
                this.modalcontent = false;
                isCustomImage = false;

            }

            redactorModalInner.html('');

            if (this.opts.modalOverlay) {
                $('#redactor_modal_overlay').hide().off('click', this.dnnModalClose);
                isCustomImage = false;

            }

            $(document).unbind('keyup', this.hdlModalClose);
            this.$editor.unbind('keyup', this.hdlModalClose);
            isCustomImage = false;

            this.selectionRestore();

            // restore scroll
            if (this.opts.autoresize && this.saveModalScroll) {
                $(this.document.body).scrollTop(this.saveModalScroll);
            }
            else if (this.opts.autoresize === false && this.saveModalScroll) {
                this.$editor.scrollTop(this.saveModalScroll);
            }

            this.callback('modalClosed');

        }, this));


        if (this.isMobile() === false) {
            $(document.body).css('overflow', this.modalSaveBodyOveflow ? this.modalSaveBodyOveflow : 'visible');
        }

        return false;
    },
    dnnModalLoadTabs: function () {
        var $redactor_tabs = $('#redactor_tabs');
        if (!$redactor_tabs.length) return false;

        var that = this;
        $redactor_tabs.find('> a').each(function (i, s) {
            i++;
            $(s).on('click', function (e) {
                e.preventDefault();
                $('.redactor_modal_action_btn').hide();
                $('.redactor_upload_btn_' + i).show();
                $redactor_tabs.find('a').removeClass('redactor_tabs_act');
                $(this).addClass('redactor_tabs_act');
                $('.redactor_tab').hide();
                $('#redactor_tab' + i).show();
                $('#redactor_tab_selected').val(i);

                if (that.isMobile() === false) {
                    var height = that.$redactorModal.outerHeight();
                    that.$redactorModal.css('margin-top', '-' + (height + 10) / 2 + 'px');
                }
            });
        });

    },


    // UPLOAD
    dnnUploadInit: function (el, options) {
        this.dnnUploadOptions = {
            url: false,
            success: false,
            error: false,
            start: false,
            trigger: false,
            auto: false,
            input: false
        };

        $.extend(this.dnnUploadOptions, options);

        var $el = $('#' + el);

        // Test input or form
        if ($el.length && $el[0].tagName === 'INPUT') {
            this.dnnUploadOptions.input = $el;
            this.el = $($el[0].form);
        }
        else this.el = $el;

        this.element_action = this.el.attr('action');

        //handle the drag/drop process
        var $dropbox = this.el.find('.redactor_dropareabox');
        if ($dropbox.length > 0) {
            this.el.find('.redactor_dropareabox').get(0).ondrop = undefined;
            this.el.find('.redactor_dropareabox').on('drop', $.proxy(this.dnnUploadOnDrop, this));
        }
        // Auto or trigger
        if (this.dnnUploadOptions.auto) {
            $(this.dnnUploadOptions.input).change($.proxy(function (e) {
                if (this.dnnUploadOptions.input.val() === '') {
                    return;
                }

                this.el.submit(function (e) {
                    return false;
                });
                this.dnnUploadSubmit(e);

            }, this));

        }
        else if (this.dnnUploadOptions.trigger) {
            $('#' + this.dnnUploadOptions.trigger).click($.proxy(this.dnnUploadSubmit, this));
        }
    },
    dnnUploadSubmit: function (e) {
        //this.showProgressBar();

        this.dnnUploadForm(this.element, this.dnnUploadFrame());
    },
    dnnUploadFrame: function () {
        this.id = 'f' + Math.floor(Math.random() * 99999);
        var d = this.document.createElement('div');
        var iframe = '<iframe style="display:none" id="' + this.id + '" name="' + this.id + '"></iframe>';

        d.innerHTML = iframe;
        $(d).appendTo("body");

        // Start
        if (this.dnnUploadOptions.start) this.dnnUploadOptions.start();

        $('#' + this.id).load($.proxy(this.dnnUploadLoaded, this));

        return this.id;
    },
    dnnUploadForm: function (f, name) {
        if (this.dnnUploadOptions.input) {
            if (typeof FormData != "undefined" && typeof XMLHttpRequest != "undefined" && typeof FileReader != "undefined") {
                this.dnnUploadAsync();
                return;
            }
            var formId = 'redactorUploadForm' + this.id,
                fileId = 'redactorUploadFile' + this.id;

            var extension = this.dnnUploadOptions.input.val().split('.').pop().toLowerCase();
            if ('jpg|jpe|bmp|gif|png|jpeg|ico'.indexOf(extension) == -1) {
                alert(invalidFileMessage);
                return;
            }

            this.form = $('<form  action="' + this.dnnUploadOptions.url + '" method="POST" target="' + name + '" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data" />');

            // append hidden fields
            if (this.opts.uploadFields !== false && typeof this.opts.uploadFields === 'object') {
                $.each(this.opts.uploadFields, $.proxy(function (k, v) {
                    if (v && v.toString().indexOf('#') === 0) {v = $(v).val();}
                    var hidden = $('<input/>', {
                        'type': "hidden",
                        'name': k,
                        'value': v
                    });

                    $(this.form).append(hidden);

                }, this));
            }

            var oldElement = this.dnnUploadOptions.input;
            var newElement = $(oldElement).clone();

            $(oldElement).attr('id', fileId).before(newElement).appendTo(this.form);
            var uploadPath = this.dnnGetUploadPath();
            $('<input type="text" name="uploadPath" id="uploadPath" />').val(uploadPath).appendTo(this.form);

            $(this.form).css('position', 'absolute')
                    .css('top', '-2000px')
                    .css('left', '-2000px')
                    .appendTo('body');

            this.form.submit();

        }
        else {
            f.attr('target', name)
                .attr('method', 'POST')
                .attr('enctype', 'multipart/form-data')
                .attr('action', this.dnnUploadOptions.url);

            this.element.submit();
        }
    },
    dnnUploadOnDrop: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.dnnUploadFileByAjax(e.originalEvent.dataTransfer.files[0]);
        $('.redactor_drag_drop_text').hide();
    },
    dnnUploadAsync: function () {
        this.dnnUploadFileByAjax(this.dnnUploadOptions.input.get(0).files[0]);
    },
    dnnUploadFileByAjax: function (file) {
        this.showUploadStatus(file);

        var $status = $('#redactor-modal-image-upload-status');
        var extension = file.name.split('.').pop().toLowerCase();
        if ('jpg|jpe|bmp|gif|png|jpeg|ico'.indexOf(extension) == -1) {
            this.dnnUploadAsyncFailed(this.opts.curLang.invalidFileMessage);
            $status.find('img').attr('src', '');
            return;
        }

        if (file.size > this.opts.maxFileSize) {   //this.options.maxFileSize equiv 30000000  - EP change after localize all resources
            this.dnnUploadAsyncFailed(this.opts.curLang.exceedLimit);    //message = this.options.resources.fileIsTooLarge;
            $status.find('img').attr('src', '');
            return;
        }

        var formData = new FormData();
        formData.append("file", file);
        formData.append("uploadPath", this.dnnGetUploadPath());

        this.xhr = new XMLHttpRequest();
        this.xhr.upload.addEventListener("progress", $.proxy(this.uploadProgressChanged, this), false);
        this.xhr.addEventListener("load", $.proxy(this.dnnUploadAsyncLoaded, this), false);
        this.xhr.addEventListener("error", $.proxy(this.dnnUploadAsyncFailed, this), false);
        this.xhr.addEventListener("abort", $.proxy(this.dnnUploadAsyncAborted, this), false);

        this.xhr.open("POST", this.dnnUploadOptions.url);
        this.xhr.send(formData);
    },
    dnnGetUploadPath: function() {
        var moduleId = this.opts.dnnModuleId;
        if (typeof moduleId == "undefined" || typeof window.dnn == "undefined" || typeof window.dnn.getVar == "undefined") {
            return '';
        }

        var path = window.dnn.getVar('redactor_uploadpath_' + moduleId);
        return path || '';
    },
    showUploadStatus: function (file) {
        var context = this;
        var $status = $('#redactor-modal-image-upload-status');
        $status.show();
        $status.find('.upload-status-progress').removeClass('failed abort complete');
        $status.find('.upload-status-progress .bar span').width(0);
        $status.find('.upload-status-message').html('');

        $status.find('.upload-status-name').html(file.name);
        $status.find('img').attr('src', URL.createObjectURL(file));

        this.cancelUploadAsyncHandler = $.proxy(this.cancelUploadAsync, this);
        context.$redactorModal.find('.redactor_modal_btn').hide();
        context.$redactorModal.find('.redactor_modal_btn.redactor_btn_modal_close').show().click(this.cancelUploadAsyncHandler).each(function() {
            var events = $._data(this, 'events')['click'];
            var fisrt = events.pop();
            events.splice(0, 0, fisrt);
        });
        $status.find('.btn-cancel').click(this.cancelUploadAsyncHandler);
    },
    hideUploadStatus: function () {
        var $status = $('#redactor-modal-image-upload-status');
        $status.hide();
        $status.find('.btn-cancel').off('click');
        this.$redactorModal.find('#redactor_upload_btn1').show();
        this.$redactorModal.find('.redactor_modal_btn.redactor_btn_modal_close').off('click', this.cancelUploadAsyncHandler);
    },
    uploadProgressChanged: function(e) {
        var percentValue = Math.round(e.loaded * 100 / e.total);
        var $status = $('#redactor-modal-image-upload-status');
        $status.find('.upload-status-progress .bar span').width(percentValue + '%');
    },
    dnnUploadLoaded: function () {
        var i = $('#' + this.id)[0], d;

        if (i.contentDocument) d = i.contentDocument;
        else if (i.contentWindow) d = i.contentWindow.document;
        else d = window.frames[this.id].document;
        // Success
        if (this.dnnUploadOptions.success) {
            //this.hideProgressBar();

            if (typeof d !== 'undefined') {
                // Remove bizarre <pre> tag wrappers around our json data:
                var rawString = d.body.innerHTML;

                // DNN customised
                if (!rawString) return;
                // END DNN customised

                var jsonString = rawString.match(/\{(.|\n)*\}/)[0];

                jsonString = jsonString.replace(/^\[/, '');
                jsonString = jsonString.replace(/\]$/, '');

                var json = $.parseJSON(jsonString);

                if (this.dnnUploadOptions.input) {
                    this.dnnUploadOptions.input.val('');
                }

                //select recent uploads folder and refresh
                if (this._folderPicker) {
                    if (this._folderPicker.selectedItem().key != "-1") {
                        var item = { key: "-1", value: this.opts.curLang.recentUploads };
                        this._folderPicker.selectedItem(item);
                    }
                    $('#redactor_search_file').val('');
                    this.dnnLoadImages('', -1, function() {
                        $('#redactor_image_box').find('.redactor_thumb_wrapper:eq(0)').click();
                    });
                    $('#redactor_tabs').find('> a').eq(1).click();
                } else {
                    if (typeof json.error == 'undefined') {
                        this.dnnUploadOptions.success(json);
                    } else {
                        this.dnnUploadOptions.error(this, json);
                        this.modalClose();
                    }
                }
            }
            else {
                this.modalClose();
                alert('Upload failed!');
            }
        }

        this.el.attr('action', this.element_action);
        this.el.attr('target', '');
    },
    dnnUploadAsyncLoaded: function () {
        if (this.xhr.status != 200) {
            this.dnnUploadAsyncFailed();
            return;
        }
        var $status = $('#redactor-modal-image-upload-status');
        $status.find('.upload-status-progress').addClass('complete');
        // Success
        if (this.dnnUploadOptions.success) {
            // Remove bizarre <pre> tag wrappers around our json data:
            var rawString = this.xhr.response;

            // DNN customised
            if (!rawString) return;
            // END DNN customised

            var jsonString = rawString.match(/\{(.|\n)*\}/)[0];

            jsonString = jsonString.replace(/^\[/, '');
            jsonString = jsonString.replace(/\]$/, '');

            var json = $.parseJSON(jsonString);
            this.xhr = null;

            if (this.dnnUploadOptions.input) {
                this.dnnUploadOptions.input.val('');
            }

            this.hideUploadStatus();
            //select recent uploads folder and refresh
            if (this._folderPicker) {
                if (this._folderPicker.selectedItem().key != "-1") {
                    var item = { key: "-1", value: this.opts.curLang.recentUploads };
                    this._folderPicker.selectedItem(item);
                }
                $('#redactor_search_file').val('');
                this.dnnLoadImages('', -1, function() {
                    $('#redactor_image_box').find('.redactor_thumb_wrapper:eq(0)').click();
                });
                $('#redactor_tabs').find('> a').eq(1).click();
            } else {
                if (typeof json.error == 'undefined') {
                    this.dnnUploadOptions.success(json);
                } else {
                    this.dnnUploadOptions.error(this, json);
                    this.modalClose();
                }
            }
        }

        this.el.attr('action', this.element_action);
        this.el.attr('target', '');
    },
    dnnUploadAsyncFailed: function (message) {
        var $status = $('#redactor-modal-image-upload-status');
        $status.find('.upload-status-progress').addClass('failed');

        if (typeof message == "undefined" && this.xhr) {
            switch(this.xhr.status) {
                case 404:
                    message = this.opts.curLang.exceedLimit;
                    break;
                case 500:
                    var content = this.xhr.response;
                    if (content.indexOf('{') === 0) {
                        message = eval('(' + content + ')')['message'];
                    } else {
                        message = content;
                    }
                    break;
            }
        }
        $status.find('.upload-status-message').html(message);

        if (this.dnnUploadOptions.input) {
            this.dnnUploadOptions.input.val('');
        }
    },
    dnnUploadAsyncAborted: function () {
        var $status = $('#redactor-modal-image-upload-status');
        $status.find('.upload-status-progress').addClass('abort');
    },
    cancelUploadAsync: function (e) {
        if (this.xhr) {
            this.xhr.abort();
            this.xhr = null;
            this.dnnUploadAsyncAborted();

            if (this.dnnUploadOptions.input) {
                this.dnnUploadOptions.input.val('');
            }
        }
        this.hideUploadStatus();
        e.stopImmediatePropagation();
        $('.redactor_drag_drop_text').show();
    },
    dnnLinkObserver: function (e) {
        var $link = $(e.target);

        if ($link.size() === 0 || $link[0].tagName !== 'A') return;

        var pos = $link.offset();
        if (this.opts.iframe) {
            var posFrame = this.$frame.offset();
            pos.top = posFrame.top + (pos.top - $(this.document).scrollTop());
            pos.left += posFrame.left;
        }

        var tooltip = $('<span class="redactor-link-tooltip"></span>');

        var href = $link.attr('href');
        if (href === undefined) {
            href = '';
        }

        if (href.length > 24) href = href.substring(0, 24) + '...';

        var aLink = $('<a href="' + $link.attr('href') + '" target="_blank">' + href + '</a>').on('click', $.proxy(function (e) {
            this.linkObserverTooltipClose(false);
        }, this));

        var aEdit = $('<a href="#">' + this.opts.curLang.edit + '</a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.linkShow();
            this.linkObserverTooltipClose(false);

        }, this));

        var aUnlink = $('<a href="#">' + this.opts.curLang.unlink + '</a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.execCommand('unlink');
            this.linkObserverTooltipClose(false);

        }, this));


        tooltip.append(aLink);
        tooltip.append(' | ');
        tooltip.append(aEdit);
        tooltip.append(' | ');
        tooltip.append(aUnlink);
        tooltip.css({
            top: (pos.top + 20) + 'px',
            left: pos.left + 'px'
        });

        $('.redactor-link-tooltip').remove();
        $('body').append(tooltip);
    },

};
