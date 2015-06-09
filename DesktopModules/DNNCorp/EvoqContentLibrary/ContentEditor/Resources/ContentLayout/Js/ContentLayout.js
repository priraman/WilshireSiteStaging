if (typeof dnn === "undefined" || dnn === null) { dnn = {}; };

dnn.ContentLayout = {
};

(function($) {
    ///dnnModuleLayout Plugin
    $.fn.dnnModuleLayout = function(dialog, options) {
        if (!this.data("dnnModuleLayout")) {
            this.data("dnnModuleLayout", new dnnModuleLayout(this, dialog, options));
        }

        return this;
    };

    var dnnModuleLayout = function(container, moduleDialog, options) {
        this.options = options;
        this.container = container;
        this.moduleDialog = moduleDialog;
        this.init();
    };

    dnnModuleLayout.prototype = {
        constructor: dnnModuleLayout,

        init: function() {
            this.options = $.extend({}, $.fn.dnnModuleLayout.defaultOptions, this.options);
            this._getService().request('GetContentLayoutTemplates', 'GET', {}, $.proxy(this._getLayoutTemplates, this));
        },

        _getLayoutTemplates: function(data) {
            var list = this.container.find('.dnnLayoutList .listContainer ul');
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    var dataItem = data[i];

                    var item = $('<li class="">' +
                        '<a href="#">' +
                        '<img src="' + dataItem.icon + '" />' +
                        '<span class="title">' + dataItem.name + '</span>' +
                        '<span class="button"></span>' +
                        '</a>' +
                        '</li>');

                    item.data('layout', dataItem);

                    item.click($.proxy(this._itemClick, this));

                    list.append(item);
                }
            }

            this._initScrollView();
        },

        _itemClick: function (e) {
            if (this._working) {
                return false;
            }

            this._working = true;

            var dataItem = $(e.currentTarget).data('layout');

            var pane = this.moduleDialog.options.paneName;
            var templateId = dataItem.id;

            this._addingLayout = $(e.currentTarget);
            this._getService().request('AddLayout', 'POST', {
                PaneName: pane,
                TemplateId: templateId
            }, $.proxy(this._addLayoutComplete, this));

            return false;
        },

        _addLayoutComplete: function(data) {
            var handler = this;
            this.moduleDialog.refreshPane('', 'layout-' + data, function () {
                dnnLayoutEditor.refreshContent(this);

                var layout = this.find('.layoutContainer[data-layoutid=' + data + ']');

                //float the layout if there is no modules in parent pane
                if (!handler.moduleDialog._noFloat || this.find('div.DnnModule, .layoutContainer').length > 1) {
                    layout.data("dnnLayoutEditor").readyForDrag();
                } else {
                    layout.parent().addClass('dnn-cl');
                }

                handler._motionToNewLayout(layout);

                handler._working = false;
            });
        },

        _motionToNewLayout: function(layout) {
            var $listItem = this._addingLayout;
            var $motion = $('<div class="module-motion" />').hide().css({
                width: $listItem.width(),
                height: $listItem.height(),
                left: $listItem.offset().left,
                top: $listItem.offset().top
            }).appendTo($(document.body));

            this.moduleDialog.close(function() {
                $motion.show().animate({
                    width: layout.width(),
                    height: layout.height(),
                    left: layout.offset().left,
                    top: layout.offset().top
                }, 'fast', function() {
                    $motion.remove();
                });
            });
        },

        _initScrollView: function () {
            var container = this.container.find(".dnnLayoutList .listContainer");
            if (container.data('jsp')) {
                container.data('jsp').reinitialise();
            } else {
                container.jScrollPane();
            }
        },

        _getService: function() {
            if (!this._serviceController) {
                this._serviceController = new dnn.dnnModuleService({
                    service: 'EvoqContentLibrary',
                    controller: 'ContentEditor'
                });
            }

            return this._serviceController;
        }
    }

    $.fn.dnnModuleLayout.defaultOptions = {};

    ///dnnModuleLayout Plugin END

    ///dnnLayoutEditor Plugin

    $.fn.dnnLayoutEditor = function (options) {
        if (!this.data("dnnLayoutEditor")) {
            this.data("dnnLayoutEditor", new dnnLayoutEditor(this, options));
        }

        return this;
    };

    var dnnLayoutEditor = function (container, options) {
        this.options = options;
        this.container = container;
        this.init();
    };

    dnnLayoutEditor.prototype = {
        constructor: dnnLayoutEditor,

        init: function() {
            this.options = $.extend({}, $.fn.dnnLayoutEditor.defaultOptions, this.options);

            this._addResizer();
            this._addToolbar();
            this._adjustColumnHeight();
            dnnLayoutEditor.catchSortEvents();
        },

        updatePosition: function(layoutId, paneName, position, callback) {
            this._getService().request('UpdateLayoutPosition', 'GET', {
                layoutId: layoutId,
                paneName: paneName,
                position: position
            }, callback);
        },

        readyForDrag: function() {
            
            //move module to current screen
            var left, top;
            var moduleWidth = this.container.outerWidth();
            var moduleHeight = this.container.outerHeight();
            this.container.addClass('floating');

            this.container.width(moduleWidth * 0.8);
            moduleWidth = this.container.outerWidth();

            left = $('#personaBar-iframe').outerWidth() / 2
                        + ($(window).width() - moduleWidth) / 2;
            top = $(window).height() / 2 - moduleHeight;
            this.container.css({
                left: left,
                top: top
            });

            this.container.addClass('drift').mouseover(function() {
                $(this).removeClass('drift');
            }).mouseout(function() {
                $(this).addClass('drift');
            });

            //change item width to percent value
            this._updateColumnWidth();

            //update pending status
            var moduleDialog = dnn.ContentEditorManager.getModuleDialog();
            var layoutId = this.container.data('layoutid');
            moduleDialog._setPending('layout-' + layoutId);

            $('div.dnnDragHint').off('mouseenter').addClass('dnnDragDisabled');
        },

        _updateColumnWidth: function() {
            var totalWidth = 0;
            var columns = this.container.find('> div.row > .pane');
            columns.each(function() {
                totalWidth += $(this).outerWidth();
            });

            var totalPercent = 0;
            for(var i = 0; i < columns.length; i++){
                var $this = $(columns[i]);
                if (i < columns.length - 1) {
                    var percentWidth = parseFloat((($this.outerWidth() / totalWidth) * 100).toFixed(2));
                    totalPercent += percentWidth;
                    $this.css({ width: percentWidth + '%' });
                } else {
                    $this.css({ width: (100 - totalPercent) + '%' });
                }
            };
        },

        _addResizer: function () {
            var handler = this;
            var columns = this.container.find('[class~="pane"]');
            for(var i = 0; i < columns.length; i++){
                var $item = $(columns[i]);
                if (i != columns.length - 1) {
                    $item.resizable({
                        handles: 'e',
                        containment: 'parent',
                        minWidth: handler.options.colMinWidth,
                        maxWidth: $item.outerWidth() + $item.next().outerWidth() - handler.options.colMinWidth - 1,
                        start: $.proxy(handler._onResizeStart, handler),
                        resize: $.proxy(handler._onResize, handler),
                        stop: $.proxy(handler._onResizeStop, handler)
                    });
                }
            }

            $(window).resize(function () {
                //do not change option if resize call from resizable
                if (arguments.length == 2 && arguments[1].element && arguments[1].element.hasClass('ui-resizable')) {
                    return;
                }

                for (var index = 0; index < columns.length - 1; index++) {
                    var $col = $(columns[index]);
                    var maxWidth = $col.outerWidth() + $col.next().outerWidth() - handler.options.colMinWidth - 1;
                    $col.resizable('option', 'maxWidth', maxWidth);
                }
            });
        },

        _onResizeStart: function(event, ui) {
        },

        _onResizeStop: function (event, ui) {
            var handler = this;

            //save the custom size
            var sizes = [];
            var columns = this.container.find('[class~="pane"]');
            var totalWidth = 0;
            columns.each(function() {
                totalWidth += $(this).outerWidth();
            });

            var totalPercent = 0;
            for(var i = 0; i <= columns.length - 1; i++){
                var $item = $(columns[i]);

                if (i < columns.length - 1) {
                    var percentWidth = parseFloat((($item.outerWidth() / totalWidth) * 100).toFixed(2));
                    sizes.push(percentWidth);
                    totalPercent += percentWidth;
                    $item.css({ width: percentWidth + '%' });
                    var maxWidth = $item.outerWidth() + $item.next().outerWidth() - handler.options.colMinWidth - 1;
                    $item.resizable('option', 'maxWidth', maxWidth);
                } else {
                    $item.css({ width: (100 - totalPercent) + '%' });
                }
            };

            this._getService().request('UpdateColumnSize', 'GET', {
                layoutId: this.container.data('layoutid'),
                sizes: sizes.join()
            });
        },

        _onResize: function(event, ui) {
            var width = ui.element.outerWidth();
            var totalWidth = ui.element.resizable("option", "maxWidth") + this.options.colMinWidth;
            ui.element.next().css('width', totalWidth - width);
        },

        _addToolbar: function() {
            var toolbar = this._toolbar = $('<div class="layout-toolbar"></div>');
            this.container.append(toolbar);

            if ($('div.DnnModule', this.container).length == 0) {
                this._addToolButton('btn-delete', $.proxy(this._deleteLayoutHandler, this));
                var moveButton = this._addToolButton('btn-move');
            } else {
                toolbar.hide();
            }
        },

        _addToolButton: function (cssClass, action) {
            var button = $('<a class="toolbar-button ' + cssClass + '" href="#"><span /></span></a>');
            this._toolbar.append(button);

            if (typeof action == "function") {
                button.click(action);
            } else {
                button.click(function() {
                    return false;
                });
            }

            return button;
        },

        _adjustColumnHeight: function () {
            var handler = this;
            this.container.find('> div.row > .pane').each(function() {
                var $col = $(this);
                $col.data('o-height', $col.height()).on('heightChange', $.proxy(handler._adjustColumnHeightHandler, handler));
            });

            handler._adjustColumnHeightHandler();

            //set a global timeout to catch height change event
            if (!dnnLayoutEditor['LayoutHeightChange']) {
                dnnLayoutEditor['LayoutHeightChange'] = setTimeout(function() {
                    handler._checkColumnHeight();
                }, 20);
            }
        },

        _checkColumnHeight: function () {
            var handler = this;
            $('div.layoutContainer > div.row > .pane').each(function() {
                var $col = $(this);
                var height = handler._getColumnHeight($col);
                if (height != $col.data('o-height')) {
                    $col.trigger('heightChange');
                    $col.data('o-height', height);
                }
            });

            dnnLayoutEditor['LayoutHeightChange'] = setTimeout(function() {
                handler._checkColumnHeight();
            }, 20);
        },

        _getColumnHeight: function(col) {
            var height = 0;
            col.children('.DnnModule:not([class~="floating"]), .handlerContainer:visible').each(function() {
                height += $(this).outerHeight(true);
            });
            if (height > 0) {
                height += parseInt(col.css('border-top-width'))
                    + parseInt(col.css('border-bottom-width'))
                    + parseInt(col.css('padding-top'))
                    + parseInt(col.css('padding-bottom'));
            }

            return parseInt(height);
        },

        _adjustColumnHeightHandler: function () {
            var handler = this;
            var maxHeight = 0, maxCol;
            this.container.find('> div.row > .pane').each(function() {
                if ($(this).find('> .DnnModule').length > 0) {
                    var $col = $(this);
                    var height = handler._getColumnHeight($col);
                    if (height > maxHeight) {
                        maxHeight = height;
                        maxCol = $col;
                    }
                }
            });

            if (maxHeight > 0) {
                if (maxHeight < 110) {
                    maxHeight = 110;
                }
                 this.container.find('> div.row > .pane').each(function () {
                    this.style.setProperty('min-height', maxHeight + 'px', 'important');
                 });
            }
        },

        _deleteLayoutHandler: function (e) {
            var handler = this;
            var opts = {
                callbackTrue: function () {
                    //remove all action menus in current layout
                    handler.container.find('div.DnnModule').each(function() {
                        var moduleId = $(this).find("a").first().attr("name");
                        var menu = $('#moduleActions-' + moduleId);
                        menu.remove();
                    });

                    handler._getService().request('DeleteLayout', 'GET', {
                        layoutId: handler.container.data('layoutid')
                    }, function (data) {
                        if (data.Status != 0) {
                            $.dnnAlert({ text: data.Message });
                        }

                        dnn.ContentEditorManager.getModuleDialog()._resetPending();

                        handler._refreshPane('', '', function () {
                            dnnLayoutEditor.refreshContent(this);
                            handler._refreshPane('ContentPane', '', function() {
                                dnnLayoutEditor.refreshContent(this);
                            });
                        });
                    }, function (xhr) {
                        handler._refreshPane('', '', function () {
                            dnnLayoutEditor.refreshContent(this);
                        });
                    });
                },
                text: dnn.ContentLayout.resources.deleteConfirm,
                yesText: dnn.ContentLayout.resources.confirmYes,
                noText: dnn.ContentLayout.resources.confirmNo,
                title: dnn.ContentLayout.resources.confirmTitle
            };

            $.dnnConfirm(opts);

            return false;
        },

        _getLayoutIndex: function(container) {
            var parentPane = container.parent();
            var layoutId = container.data('layoutid');
            var items = parentPane.find('> .DnnModule, > .layoutContainer').not('[data-layoutid=' + layoutId + '][id]');

            if (items.length == 1) {
                return -1;
            }

            var findIndex = -1;
            items.each(function (index, item) {
                if ($(item).data('layoutid') && $(item).data('layoutid') == layoutId) {
                    findIndex = index;
                }
            });

            return findIndex;
        },

        _refreshPane: function (paneName, args, callback) {
            if (!paneName) {
                paneName = this.container.parent().attr('id');
            }
            var moduleDialog = dnn.ContentEditorManager.getModuleDialog();
            moduleDialog.refreshPane(paneName, args, callback);
        },

        _getService: function() {
            if (!this._serviceController) {
                this._serviceController = new dnn.dnnModuleService({
                    service: 'EvoqContentLibrary',
                    controller: 'ContentEditor'
                });
            }

            return this._serviceController;
        }
    };

    dnnLayoutEditor.catchSortEvents = function () {
        $('.dnnSortable').each(function () {
            var instance = this;
            setTimeout(function () {
                var handle = $(instance).sortable('option', 'handle');
                handle += ', div.layout-toolbar a.btn-move';
                $(instance).sortable('option', 'handle', handle);
                $(instance).sortable('option', 'helper', function (event, element) {
                    if (element.hasClass('floating')) {
                        return element.addClass('forDrag');
                    }

                    var helper = element.clone();
                    helper.addClass('floating forDrag');

                    var $dragHint = helper.find('> div.dnnDragHint');
                    var $dragContent = $('<div />');
                    $dragHint.append($dragContent);

                    var title = helper.find('span[id$="titleLabel"]:eq(0)').html();
                    $('<span class="title" />').appendTo($dragContent).html(title);

                    return helper;
                });
                $(instance).sortable('option', 'cursorAt', { left: 0, top: 0 });
                

                //catch stop event
                if ($(instance).sortable('option', 'start') == dnnLayoutEditor.sortStart) {
                    return;
                }

                $(instance).data('sortStartEvent', $(instance).sortable('option', 'start'));
                $(instance).sortable('option', 'start', dnnLayoutEditor.sortStart);

                
                if (!$(instance).data('eventCatched')) {
                    $(instance).on('sortbeforestop', function(event, ui) {
                        //catch stop event
                        var $newPane = ui.item.parent();
                        if ($newPane.sortable('option', 'stop') == dnnLayoutEditor.sortStop) {
                            return;
                        }

                        $newPane.data('sortStopEvent', $newPane.sortable('option', 'stop'));
                        $newPane.sortable('option', 'stop', dnnLayoutEditor.sortStop);

                        //catch stop event on original pane
                        var $oldPane = $(event.target);
                        if ($oldPane.sortable('option', 'stop') == dnnLayoutEditor.sortStop) {
                            return;
                        }

                        $oldPane.data('sortStopEvent', $oldPane.sortable('option', 'stop'));
                        $oldPane.sortable('option', 'stop', dnnLayoutEditor.sortStop);
                    });

                    $(instance).find('div.dnnDragHint').on('mousedown', dnnLayoutEditor.dragHandlerCheck);

                    $(instance).data('eventCatched', true);
                }

                
            }, 500);
        });
    };

    dnnLayoutEditor.refreshContent = function(pane) {
        setTimeout(function() {
            dnnLayoutEditor.catchSortEvents();

            $('div.actionMenu').show();

            //try to catch new add module and trigger addmodule event.
            var moduleDialog = dnn.ContentEditorManager.getModuleDialog();
            var cookieNewModuleId = moduleDialog.getModuleId();
            if (cookieNewModuleId) {
                var newModule = pane.find('div.DnnModule-' + cookieNewModuleId);
                if (newModule.length > 0) {
                    moduleDialog.setModuleId(-1);
                    newModule.trigger('editmodule');
                }
            }
        }, 100);
    };

    dnnLayoutEditor.sortStart = function(event, ui) {
        window['cem_dragging'] = true; //add a global status when dragging module/layout.
        if (!ui.item.hasClass('layoutContainer')) {
            $(this).data('sortStartEvent').call(this, event, ui);
        } else {
            $('div.layoutContainer').addClass('dragging');
        }
    };

    dnnLayoutEditor.sortStop = function (event, ui) {
        var newPane = ui.item.parent(), oldPane = $(this);
        var moveLayout = ui.item.hasClass('layoutContainer');
        var instance = this;
        var $item = ui.item;
        if ($item.hasClass('layoutContainer')) {
            $item.removeClass('floating');
            newPane.addClass('dnn-cl');
            $('div.layoutContainer').removeClass('dragging');
        } else {
            $item.removeClass('floating').css({left: '', top: '', position: '', zIndex: ''});
            $('.actionMenu').removeClass('floating');
        }

        newPane.find('div.handlerContainer').hide(); // hide quick add module handler.

        $item.addClass('highlight').removeClass('drift forDrag');
        setTimeout(function() {
            $item.addClass('animate');
        }, 1000);
        setTimeout(function() {
            $item.removeClass('highlight animate');
        }, 1500);

        $('div.dnnDragHint').removeClass('dnnDragDisabled');

        window['cem_dragging'] = false;

        //if move is module, then also move related modules into same pane
        if (!$item.hasClass('layoutContainer')) {
            var relatedModules = $item.data('relatedModules');
            if (relatedModules && relatedModules.length > 0) {
                var serviceController = new dnn.dnnModuleService({
                    service: 'InternalServices',
                    controller: 'ModuleService',
                    async: false
                });
                var tabId = serviceController.getTabId();
                for (var i = 0; i < relatedModules.length; i++) {
                    var moduleId = relatedModules[i];
                    var dataVar = {
                        TabId: tabId,
                        ModuleId: moduleId,
                        Pane: newPane.attr('id').replace('dnn_', ''),
                        ModuleOrder: -1
                    };

                    var onSuccess = function() {
                        dnn.ContentEditorManager.triggerChangeOnPageContentEvent();
                    }
                    serviceController.request('MoveModule', 'POST', dataVar, onSuccess);
                }
            }
        }

        var updatePosition = function (pane, callback) {
            var totalLayout = pane.children('div.layoutContainer').length;
            var updated = 0;

            if (totalLayout == 0) {
                callback.call(pane);
            }
            pane.children('div.DnnModule, div.layoutContainer').each(function(index, item) {
                var $layout = $(item);
                if ($layout.hasClass('layoutContainer')) {
                    var layoutEditor = $layout.data('dnnLayoutEditor');
                    var layoutId = $layout.data('layoutid');
                    var paneName = pane.attr('id').replace('dnn_', '');
                    layoutEditor.updatePosition(layoutId, paneName, index, function() {
                        updated++;
                        if (updated == totalLayout) {
                            callback.call(pane);
                        }
                    });
                }
            });
        }

        var moduleDialog = dnn.ContentEditorManager.getModuleDialog();

        var refreshPane = function () {
            var oldPaneId = oldPane.attr('id');
            var newPaneId = newPane.attr('id');

            if (oldPane.data('parentpane')) {
                oldPaneId = $('[id$=' + oldPane.data('parentpane') + '][class~="dnnSortable"]').attr('id');
            }

            if (newPane.data('parentpane')) {
                newPaneId = $('[id$=' + newPane.data('parentpane') + '][class~="dnnSortable"]').attr('id');
            }

            moduleDialog.refreshPane(oldPaneId, '', function() {
                dnnLayoutEditor.refreshContent(this);

                if (newPaneId != oldPaneId) {
                    moduleDialog.refreshPane(newPaneId, '', function() {
                        dnnLayoutEditor.refreshContent(this);
                    });
                }
            });
        }

        var refreshContent = function() {
            moduleDialog._resetPending();
            
            if (!moveLayout) {
                $(instance).data('sortStopEvent').call(instance, event, ui, function () {
                    dnn.ContentEditorManager.triggerChangeOnPageContentEvent();
                    refreshPane();
                });
            } else {
                refreshPane();
            }
        }

        updatePosition(newPane, function () {
            if (newPane.attr('id') != oldPane.attr('id')) {
                updatePosition(oldPane, function() {
                    refreshContent();
                });
            } else {
                refreshContent();
            }
        });

        
    };

    dnnLayoutEditor.dragHandlerCheck = function(e) {
        if ($(this).hasClass('dnnDragDisabled')) {
            e.stopImmediatePropagation();
        }
    };

    $.fn.dnnLayoutEditor.defaultOptions = {colMinWidth: 10};

    ///dnnLayoutEditor Plugin END

    $(document).ready(function() {
        var moduleDialog = dnn.ContentEditorManager.getModuleDialog();

        moduleDialog.getElement().on('dialoginit', function (e) {
            var $this = $(this);
            var moduleList = $this.find('.dnnModuleList ul');

            var layoutItem = $('<li class="dnnModuleItem dnnLayoutItem">' +
                '<span class="icon content-layout"></span>' +
                '<span class="title">' + dnn.ContentLayout.resources.title + '</span>' +
                '<span class="actions">' +
                    '<a href="#" class="button addModule"></a>' +
                '</span>' +
                '</li>');

            moduleList.append(layoutItem);

            var pageLayout = generateLayout();
            moduleDialog.addPage('dnnLayout', pageLayout);

            layoutItem.click(function() {
                moduleDialog.showPage('dnnLayout');
            });

            pageLayout.find('.dnnButton.back').click(function() {
                moduleDialog.showPage(0);
            });
        });

        moduleDialog.getElement().on('dialogopen', function(e) {
            var $this = $(this);
            var moduleList = $this.find('.dnnModuleList ul');

            var parentPane = moduleDialog.getModuleManager().getPane().data('parentpane');

            //if have parent pane, then doesn't show content layout item.
            if (parentPane != null) {
                moduleList.find('li.dnnLayoutItem').hide();
            } else {
                moduleList.find('li.dnnLayoutItem').show();
            }
        });
        moduleDialog.getElement().on('addmodulecomplete', function(e) {
            dnnLayoutEditor.catchSortEvents();
        });
        var _layoutInitialized = false;
        moduleDialog.getElement().on('pageChanged', function (e, page) {
            if (!_layoutInitialized && page.hasClass('dnnLayout')) {
                page.dnnModuleLayout(moduleDialog, {});
                _layoutInitialized = true;
            }
        });

        dnnLayoutEditor.catchSortEvents();

        function generateLayout() {
            return $('<div class="dnnDialogTitle">' +
                '<span class="dnnButton back"></span>' +
                '<span class="title">' + dnn.ContentLayout.resources.title + '</span>' +
                '</div>' +
                '<div class="dnnDialogBody dnnLayoutList">' +
                '<div class="listContainer"><ul></ul></div>' +
                '</div>');
        }
    });

    $(window).load(function() {
        //handle the floating module from cookie
        var handleNewLayoutFromCookie = function() {
            var cookieModuleId = dnn.dom.getCookie('CEM_CallbackData');
            if (cookieModuleId && cookieModuleId.indexOf('layout-') > -1) {
                var layoutId = cookieModuleId.substr(7);

                var layout = $('.layoutContainer[data-layoutid=' + layoutId + ']');

                //float the layout if there is no modules in parent pane
                if (layout.parent().find('div.DnnModule, .layoutContainer').length > 1) {
                    layout.data("dnnLayoutEditor").readyForDrag();
                }

                var moduleDialog = dnn.ContentEditorManager.getModuleDialog();
                dnn.dom.setCookie('CEM_CallbackData', '', -1, moduleDialog.getSiteRoot());
            }
        }

        setTimeout(handleNewLayoutFromCookie, 250);
    });
})(jQuery);