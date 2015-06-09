/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

/*jshint multistr:true */

/*
 * @class KoBindedDialog
 *
 * @depends jQuery
 * @depends knockout
 *
 * Class for show Dialgo on personaBar, you must have KoBindedDialog.css
 *
 * @param {object} options:
 * {
 *   {jQuery object} inObject (null), object for get innerHeight (visible height of screen)
 *   {bool} animation (true), fadeIn dialog on show
 *   {int} width (650), with of dialog content
 *   {string} title ('Notice'), Title of dialog
 *   {string} innerTitle (''), Title or description on the top of content
 *   {string} acceptBtnLbl ('Accept), Text for accept button, defualt 'Accept'
 *   {bool} showAcceptBtn (true), Show or not Accept button
 *   {string} cancelBtnLblLbl: ('Cancel'), Text for cancel button
 *   {bool} showCancelBtn (true), Show or not Cancel button
 *   {function} onCancelCallback (null), function to call on cancel button click
 *   {function} onAcceptCallback (true), Callback for on click accept button
 *   {function} beforeCloseCallback (null), function called on close but before remove dialog from DOM
 *   {function} onCloseCallback (null), function called on close dialog (and removed from DOM), normally you want use it to enable/disable buttons
 *  }
 *  @param {string} htmlForPannels (''), Html to insert in .panels, the content of dialog
 *  @param {function} koObserveCallback (null), callback for initialize your object, must return the object
 *  @param {function} afterBindCallback (null), function called after bind and before show dialog
 *
 *  For now, there is an option that must be passed on returned viewModel in koObeserveCallback with name enableAcceptForDialog, for pass the function that enable/disable accept
 *  button if you want to use ko validation for this.
 */


// Namespace
window.dnn = window.dnn || {};
window.dnn.utils = window.dnn.utils || {};

(function () {
    var KoBindedDialogClass;

    KoBindedDialogClass = (function IIFE($, ko) {
        'use strict';
        var HEIGHT_DIALOG;

        var _options, _html, _viewModel, _htmlForPannels, _personaBarDialogMask, _personaBarDialog, _originalHeight, _win,
        _expanded, _initialBounds, _msieOrFf;

        var addDialog, applyBindings, closeDialog, acceptDialog, initDialog, showDialog, updateHeight, toggleExpand;

        /* Class Properties */
        KoBindedDialog.class = 'KoBindedDialog';
        KoBindedDialog.type = 'Class';
        KoBindedDialog.active = false; // TODO: Improve dialog with stacked dialogs

        /* Private Constants and Properties */
        HEIGHT_DIALOG = 651;

        // Dialog template. htmlForPannels param will be bind inside dialogHTML,
        // for have information in gray blocks, ad to each block "panel" class
        _html = '<div class="personaBarDialogMask" style="display:none;"></div>\
                <div class="personaBarDialog" style="display:none;">\
                    <div class="container">\
                        <div class="title">\
                            <div class="dialogTitle" data-bind="html: title"></div>\
                            <hr class="bottomTitleHR">\
                            <span class="btn-close" data-bind="visible: !enterprise, click: closeDialog"></span>\
                            <div class="dnnModalCtrl" data-bind="visible: enterprise">\
                                <a href="#" data-bind="click: toggleExpand" class="dnnToggleMax"><span>Max</span></a>\
                                <button data-bind="click: closeDialog" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="close"><span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span><span class="ui-button-text">close</span></button>\
                            </div>\
                        </div>\
                        <div class="superContent">\
                            <div class="content">\
                                <div class="title" data-bind="html: innerTitle"></div>\
                                <div class="panels" data-bind="with: dialogHTML"></div>\
                                <div class="actions">\
                                    <span class="btn btn-accept dnnPrimaryAction" data-bind="visible: showAcceptBtn, text: acceptBtnLbl, click: acceptDialog"></span>\
                                    <span class="btn btn-cancel dnnSecondaryAction" data-bind="visible: showCancelBtn, text: cancelBtnLbl, click: closeDialog"></span>\
                                </div>\
                            </div>\
                            <div class="resizeCorner" data-bind="visible: enterprise"><div class="resizeHandler"></div></div>\
                        </div>\
                    </div>\
                </div>';
        _options = null;
        _viewModel = null;
        _personaBarDialog = null;
        _personaBarDialogMask = null;

        /* Costructor */
        function KoBindedDialog(options, htmlForPannels, koObserveCallback, afterBindCallback) {
            //console.log('~PersonaBarDialog');
            if (KoBindedDialog.active) {
                console.log('KoBindedDialog already opened'); // TODO throw ex or change for stack support
                return;
            }

            KoBindedDialog.active = true;
            _expanded = false;

            // Defaults (must compare falsy values)
            if (!options) {
                options = {
                    enterprise: true,
                    inObject: null,
                    animation: true,
                    width: 650,
                    title: 'Notice',
                    innerTitle: '',
                    showAcceptBtn: true,
                    acceptBtnLbl: 'Accept',
                    showCancelBtn: true,
                    cancelBtnLbl: 'Cancel',
                    onAcceptCallback: null,
                    beforeCloseCallback: null,
                    onCloseCallback: null,
                    closeOnAccept: true
                };
            }

            // Delete on refactor that mix KoBindedDialog with EditBarDialog
            options.enterprise = true;

            _options = options;

            if (options.enterprise !== false) {_options.enterprise = true;}
            if (!options.width) {_options.width = 650;}
            if (!options.title) {_options.title = 'Notice';}
            if (!options.inObject) {_options.inObject = $(document.body);}
            if (options.animation !== false) {_options.animation = true;}
            if (!options.innerTitle) {_options.innerTitle = '';}
            if (!options.acceptBtnLbl) {_options.acceptBtnLbl = 'Accept';}
            if (options.showAcceptBtn !== false) {_options.showAcceptBtn = true;}
            if (!options.cancelBtnLbl) {_options.cancelBtnLbl = 'Cancel';}
            if (options.showCancelBtn !== false) {_options.showCancelBtn = true;}
            if (options.animation !== false) {_options.animation = true;}
            if (options.closeOnAccept !== false) {_options.closeOnAccept = true;}

            _viewModel = {};

            if (!htmlForPannels) htmlForPannels = '';
            _htmlForPannels = htmlForPannels;

            _msieOrFf = navigator.userAgent.search(/msie|\.net|firefox/i) !== -1 ? true : false;

            // Add to DOM
            addDialog();

            // Add to queue
            setTimeout(function () {
                initDialog();
                var personaBarDialog = $('.personaBarDialog');

                personaBarDialog.width(_options.width);

                if (htmlForPannels) personaBarDialog.find('.panels').prepend(htmlForPannels);

                // Add to queue
                setTimeout(function () {
                    if (typeof koObserveCallback === 'function') applyBindings(koObserveCallback());
                    else applyBindings(undefined);

                    setTimeout(function () {
                        if (typeof afterBindCallback === 'function') afterBindCallback();
                    }, 0);

                    showDialog();
                }, 0);
            }, 0);
        }

        /* Private Methods */
        applyBindings = function (viewModel) {
            setTimeout(function () {
                _viewModel = {
                    dialogHTML: '',
                    enterprise: ko.observable(_options.enterprise),
                    title: ko.observable(_options.title),
                    innerTitle: ko.observable(_options.innerTitle),
                    acceptBtnLbl:  ko.observable(_options.acceptBtnLbl),
                    showAcceptBtn: ko.observable(_options.showAcceptBtn),
                    cancelBtnLbl:  ko.observable(_options.cancelBtnLbl),
                    showCancelBtn: ko.observable(_options.showCancelBtn),
                    acceptDialog:  acceptDialog,
                    closeDialog:   closeDialog,
                    enableAccept:  ko.observable(true),
                    toggleExpand:  toggleExpand
                };

                if (typeof viewModel === 'object') {
                    _viewModel.dialogHTML = viewModel;
                    if (viewModel.enableAcceptForDialog) {
                        _viewModel.enableAccept = viewModel.enableAcceptForDialog;
                    }
                }

                ko.applyBindings(_viewModel, _personaBarDialog[0]);
            }, 0);
        };

        addDialog = function () {
            return $('body').prepend(_html);
        };

        closeDialog = function () {
            var node;

            $('body').css('overflow', 'auto');

            // Remove events
            if (_win) _win.off('.personaBarDialog');
            $(document).off('.personaBarDialog');
            if (_personaBarDialog) _personaBarDialog.off('DOMMouseScroll mousewheel');

            node = $('.personaBarDialog');
            if (typeof _options.beforeCloseCallback === 'function') _options.beforeCloseCallback();

            if (node.length > 0) {
                ko.cleanNode($('.personaBarDialog')[0]);
            }
            _options.inObject.height(_originalHeight);
            _personaBarDialog.remove();
            _personaBarDialogMask.remove();
            if (typeof _options.onCloseCallback === 'function') _options.onCloseCallback();

            window.dnn.utils.KoBindedDialog.active = false;
        };

        acceptDialog = function () {
            if (typeof _viewModel.enableAccept === 'boolean' && !_viewModel.enableAccept) return;
            if (typeof _viewModel.enableAccept === 'function' && !_viewModel.enableAccept()) return;
            if (typeof _options.onAcceptCallback === 'function') _options.onAcceptCallback();
            if (_options.closeOnAccept === true) closeDialog();
        };

        initDialog = function () {
            var doc, resizableHandler, mouseMoveHandler, mouseUpHandler, title, superContent, content, dnnModalCtrl, mouseInitDelta;

            _win = $(window);
            doc  = $(document);

            _personaBarDialogMask = $('.personaBarDialogMask');
            _personaBarDialog = $('.personaBarDialog');

            _personaBarDialogMask.css({
                height: doc.height() + _personaBarDialog.height()
            });

            if (_options.enterprise) {
                $('body').css('overflow', 'hidden');
                _personaBarDialog.find('.title:first').css('cursor', 'move');
                _personaBarDialog.find('.content').css({
                    'overflow-y': 'scroll',
                    'height': '550px'
                });

                _personaBarDialog.css({
                    width: _options.width
                });

                _personaBarDialog.position({
                   my: "center",
                   at: "center",
                   of: window
                });

                _personaBarDialog.draggable({
                    handle: '.dialogTitle',
                    cursor: 'move'
                });

                _personaBarDialog.height(HEIGHT_DIALOG);

                // Close on esc keydown
                _win.off('keydown.personaBarDialog').on('keydown.personaBarDialog', function (evt) {
                    if (evt.keyCode === 27) closeDialog();
                });

                // Resize
                resizableHandler = _personaBarDialog.find('.resizeHandler:last');
                title = _personaBarDialog.find('.title:first');
                superContent = _personaBarDialog.find('.superContent:first');
                content = _personaBarDialog.find('.content:first');
                dnnModalCtrl = _personaBarDialog.find('.dnnModalCtrl:first');

                if (title.width() !== 0) dnnModalCtrl.css('left', title.width() - 55);

                mouseInitDelta = {
                    initial: {
                        x: 0, y: 0
                    },
                    final: {
                        x: 0, y: 0
                    }
                };

                mouseMoveHandler = function (evt) {
                    var delta, right;

                    evt.preventDefault();

                    delta = {
                        x: evt.pageX - mouseInitDelta.x,
                        y: evt.pageY - mouseInitDelta.y
                    };

                    mouseInitDelta = {
                        x: evt.pageX,
                        y: evt.pageY
                    };

                    title.width(title.width() + delta.x);
                    superContent.width(superContent.width() + delta.x);
                    dnnModalCtrl.css('left', title.width() - 55);

                    dnnModalCtrl.css('right', right);

                    if (superContent.height() + delta.y < _initialBounds.superContent.height) return;

                    superContent.height(superContent.height() + delta.y);
                    content.height(content.height() + delta.y);
                };

                mouseUpHandler = function () {
                    doc.off('mousemove.personaBarDialog', mouseMoveHandler);
                    doc.off('mouseup.personaBarDialog',   mouseUpHandler);
                };

                resizableHandler.off('mousedown.personaBarDialog').on('mousedown.personaBarDialog', function(evt) {
                    evt.preventDefault();
                    if (!_initialBounds) {
                        _initialBounds = {
                            left: _personaBarDialog.offset().left,
                            title: {
                                width: title.width()
                            },
                            superContent: {
                                height: superContent.height(),
                                width: superContent.width()
                            },
                            content: {
                                height: content.height(),
                                width: content.width()
                            },
                            dnnModalCtrl: {
                                right: parseInt(dnnModalCtrl.css('right'), 10)
                            }
                        };

                        // Block
                        title.css({'max-height': title.height(), 'min-height': title.height(), 'min-width': title.width()});
                        superContent.css({'min-height': superContent.height(), 'min-width': superContent.width()});
                        content.css({'min-height':content.height(), 'min-width': content.width()});
                    }

                    mouseInitDelta = {x: evt.pageX, y: evt.pageY};

                    doc.on('mousemove.personaBarDialog', mouseMoveHandler);
                    doc.on('mouseup.personaBarDialog', mouseUpHandler);
                });
                return;
            }
        };

        showDialog = function () {
            _personaBarDialogMask.show();
            if (_options.animation) {_personaBarDialog.fadeIn(100);} else {_personaBarDialog.show();}
        };

        updateHeight = function () {
            _personaBarDialogMask.css({
                'min-height': $(document).scrollTop() + _personaBarDialog.height() + 400 + 'px'
            });
        };

        toggleExpand = function () {
            var title, superContent, content, dnnModalCtrl;

            title = _personaBarDialog.find('.title:first');
            superContent = _personaBarDialog.find('.superContent:first');
            content = _personaBarDialog.find('.content:first');
            dnnModalCtrl = _personaBarDialog.find('.dnnModalCtrl:first');

            if (!_initialBounds) {
                _initialBounds = {
                    left: _personaBarDialog.offset().left,
                    title: {
                        width: title.width()
                    },
                    superContent: {
                        height: superContent.height(),
                        width: superContent.width()
                    },
                    content: {
                        height: content.height(),
                        width: content.width()
                    },
                    dnnModalCtrl: {
                        right: parseInt(dnnModalCtrl.css('right'), 10)
                    }
                };

                // Block
                title.css({'max-height': title.height(), 'min-height': title.height(), 'min-width': title.width()});
                superContent.css({'min-height': superContent.height(), 'min-width': superContent.width()});
                content.css({'min-height':content.height(), 'min-width': content.width()});
            }

            superContent.css({height: _initialBounds.superContent.height});

            if (_expanded) {
                // Unexpand
                $('body').css('overflow', 'scroll');
                superContent.css({
                    width: _initialBounds.superContent.width,
                    height: _initialBounds.superContent.height
                });
                title.css({width: _initialBounds.title.width});
                initDialog();
                _expanded = false;
            } else {
                // Expand
                var margin;
                margin = 50;

                // Remove parent scroll events
                _win.off('.personaBarDialog');
                _personaBarDialog.off('DOMMouseScroll mousewheel');

                // Remove parent scroll
                $('body').css('overflow', 'hidden');

                // Expand
                _personaBarDialog.css({
                    width:  'calc(100% - 4px)',
                    top:    margin/2 +  $(document).scrollTop() + 'px',
                    'margin-left': '2px',
                    left: 0
                });

                setTimeout(function() {
                    title.width('calc(100% - 4px)');
                    superContent.css({
                        height: $(window).height() - 2*margin - title.height(),
                        width:  'calc(100% - 34px)'
                    });

                    content.css({
                        height: superContent.height() - 100,
                        width: '100%'
                    });

                    dnnModalCtrl.css('left', title.width() - 55);
                }, 0);

                _expanded = true;
            }
        };

        /* Public Methods */
        KoBindedDialog.prototype.updateHeight = updateHeight;
        KoBindedDialog.prototype.close = closeDialog;

        return KoBindedDialog;
    })(jQuery, ko);

    // Add to namespace
    window.dnn.utils.KoBindedDialog = KoBindedDialogClass;

}).call(this);
