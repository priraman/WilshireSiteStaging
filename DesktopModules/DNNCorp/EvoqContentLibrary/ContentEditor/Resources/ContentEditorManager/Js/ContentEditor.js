if (typeof dnn === "undefined" || dnn === null) { dnn = {}; };

dnn.ContentEditorManager = {
    init: function (options) {
        if (options.type == "moduleManager" && options.panes) {
            var panes = options.panes.split(',');
            for (var i = 0; i < panes.length; i++) {
                (function (paneName) {
                    var pane = paneName.length > 0 ? $('[id$=' + paneName + '][class~="dnnSortable"]') : null;
                    if (pane && pane.length > 0) {
                        pane.dnnModuleManager({
                            pane: paneName,
                            syncHandler: options.syncHandler,
                            supportAjax: options.supportAjax
                        });
                    }
                })(panes[i]);
            }
        }
    }
};

(function ($) {
    $.fn.dnnModuleManager = function (options) {
        if (!this.data("dnnModuleManager")) {
            this.data("dnnModuleManager", new dnnModuleManager(this, options));
        }

        return this;
    };

    var dnnModuleDialogInstance;
    var getModuleDialog = dnn.ContentEditorManager.getModuleDialog = function () {
        if (!dnnModuleDialogInstance) {
            dnnModuleDialogInstance = new dnnModuleDialog();
        }

        return dnnModuleDialogInstance;
    }

    dnn.ContentEditorManager.triggerChangeOnPageContentEvent = function () {
        $(document).trigger("changeOnPageContent");
    };

    ///dnnModuleManager Plugin
    var dnnModuleManager = function (container, options) {
        this.options = options;
        this.container = container;
        this.init();
    };

    dnnModuleManager.prototype = {
        constructor: dnnModuleManager,

        init: function () {
            this.options = $.extend({}, $.fn.dnnModuleManager.defaultOptions, this.options);
            var $this = this.$pane = this.container;

            if ($this.parent().attr('id') && $this.parent().attr('id').indexOf('_SyncPanel') > -1) {
                $this.parent().parent().addClass($this.parent().attr('class'));
                $this.parent().attr('class', '');
            }

            $this.addClass('dnnModuleManager');
            $this.append(this._generateLayout());

            this._injectVisualEffects();

            this._handleEvents();
        },

        getHandler: function () {
            this._handler = this.getPane().find('> .addModuleHandler');

            return this._handler;
        },

        getPane: function () {
            return $('#' + this.$pane.attr('id'));
        },

        _generateLayout: function () {
            var handler = this._handler = $('<a href="#" class="addModuleHandler"><span></span></a>');

            return handler;
        },


        _injectVisualEffects: function () {
            var actionMenus = [];
            var handler = this;

            this.container.find('> div.DnnModule').each(function() {
                var module = $(this);
                var moduleId = handler._findModuleId(module);
                actionMenus.push('#moduleActions-' + moduleId);

                if (module.data('effectsInjected')) {
                    return;
                }

                module.data('effectsInjected', true);
                module.mouseover(function () {
                    if (window['cem_dragging']) {
                        return; //do nothing when dragging module.
                    }

                    if (!module.hasClass('active-module') && !module.hasClass('floating')) {

                        module.parent().find('> div.DnnModule').removeClass('active-module');
                        module.addClass('active-module');
                        $(menusSelector).not('[class~="floating"]').stop(true, true).fadeTo('fast', 0.5, function () {
                            $('#moduleActions-' + moduleId).not('[class~="floating"]').stop(true, true).fadeTo(0).show().fadeTo('fast', 1);
                        });
                    }
                });
            });

            if (this.container.data('effectsInjected')) {
                return;
            }

            this.container.data('effectsInjected', true);
            var menusSelector = actionMenus.join(',');
            this.container.mouseover(function (e) {
                if (window['cem_dragging']) {
                    return false; //do nothing when dragging module.
                }

                if (!$(this).hasClass('active-pane')) {
                    $('.actionMenu').stop(true, true).hide();
                    $(menusSelector).not('[class~="floating"]').show();
                    $('div.dnnSortable').removeClass('active-pane');
                    $(this).addClass('active-pane');
                }
                return false;
            }).mouseout(function (e) {
                if (window['cem_dragging']) {
                    return false; //do nothing when dragging module.
                }

                var target = $(e.relatedTarget);
                if (target.parents('.active-pane').length > 0 || target.hasClass('actionMenu') || target.parents('.actionMenu').length > 0) {
                    if (target.hasClass('actionMenu') && !target.hasClass('floating')) {
                        $('.actionMenu:visible').stop(true, true).css({ opacity: 0.5 });
                        target.stop(true, true).css({ opacity: 1 });
                    } else if (target.parents('.actionMenu').length > 0 && !target.parents('.actionMenu').hasClass('floating')) {
                        $('.actionMenu:visible').stop(true, true).css({ opacity: 0.5 });
                        target.parents('.actionMenu').stop(true, true).css({ opacity: 1 });
                    }
                    return false;
                }

                $(menusSelector).stop(true, true).hide();
                $(this).removeClass('active-pane');
                return false;
            });

            $(document).mouseover(function (e) {
                if (window['cem_dragging']) {
                    return false; //do nothing when dragging module.
                }

                if ($(e.target).parents('.actionMenu').length > 0 || $('.actionMenu:visible').length == 0) {
                    return;
                }

                $('.actionMenu').stop(true, true).hide();
                $('div.dnnSortable').removeClass('active-pane');
                $('div.dnnSortable > div.DnnModule').removeClass('active-module');
            });

            $('.actionMenu').mouseover(function () {
                return false;
            });

            setTimeout(function () {
                $('div.dnnSortable').trigger('mouseout');

                $(menusSelector).find('li[id$="-Delete"] a').each(function () {
                    var $deleteButton = $(this);
                    $deleteButton.off('click').dnnConfirm({
                        text: dnn.ContentEditorManager.resources.deleteModuleConfirm,
                        yesText: dnn.ContentEditorManager.resources.confirmYes,
                        noText: dnn.ContentEditorManager.resources.confirmNo,
                        title: dnn.ContentEditorManager.resources.confirmTitle,
                        isButton: true,
                        callbackTrue: function () {
                            dnn.ContentEditorManager.triggerChangeOnPageContentEvent();
                            location.href = $deleteButton.attr('href');
                        }
                    });
                });
            }, 1000);
        },

        _findModuleId: function (module) {
            return module.find("a").first().attr("name");
        },

        _handleEvents: function () {
            this._handler.click($.proxy(this._addModuleHandlerClick, this));
        },

        _addModuleHandlerClick: function (e) {
            var dialog = getModuleDialog();
            if (!this._handler.hasClass('active')) {
                dialog.apply(this).open();
                this._handler.addClass('active');
            } else {
                dialog.close();
                this._handler.removeClass('active');
            }
            return false;
        }
    };

    $.fn.dnnModuleManager.defaultOptions = {};
    ///dnnModuleManager Plugin END

    ///dnnModuleDialog Plugin

    var dnnModuleDialog = function (options) {
        this.options = options;
        this.init();
    };

    dnnModuleDialog.prototype = {
        constructor: dnnModuleDialog,
        init: function () {
            this.options = $.extend({}, dnnModuleDialog.defaultOptions, this.options);

            var layout = this._generateLayout();
            $(document.body).append(layout);
            layout.hide();

            this._addCloseButton();
            this._addSearchBox();

            this._loadMore = true;
            this._startIndex = 0;
            this._pageSize = 10;
            this._bookmarkedModuleList = [];
            this._minInputLength = 2;
            this._inputDelay = 400;
            this._lastVal = '';

            this._syncCompleteHandler = $.proxy(this._syncComplete, this);
            this._refreshCompleteHandler = $.proxy(this._refreshComplete, this);

            this._attachEvents();
        },

        apply: function (moduleManager) {
            this._moduleManager = moduleManager;

            this.options = $.extend({}, this.options, {
                paneName: moduleManager.options.pane
            });
            return this;
        },

        open: function () {
            this._showDialog();
            this._isOpen = true;
            this._noFloat = false;
            return this;
        },

        close: function (callback) {
            this._isOpen = false;
            this._hideDialog(callback);
            return this;
        },

        getElement: function () {
            return this._dialogLayout;
        },

        getModuleManager: function () {
            if (!this._moduleManager) {
                this._moduleManager = this.getDefaultPane().data('dnnModuleManager');
            }
            return this._moduleManager;
        },

        getDefaultPane: function() {
            return this.getPaneById();
        },

        getPaneById: function (paneName) {
            var defaultPane = null;
            if (!paneName) {
                paneName = 'contentpane';
            } else {
                paneName = paneName.toLowerCase();
            }
            $('div.dnnSortable[id]').each(function () {
                var paneId = $(this).attr('id').toLowerCase();
                if (paneId.length >= paneName.length
                        && paneId.indexOf(paneName) == (paneId.length - paneName.length)) {
                    defaultPane = $(this);
                    return false;
                }

                return true;
            });

            return defaultPane;
        },

        isOpen: function () {
            return this._isOpen;
        },

        addPage: function (id, content) {
            var pageContainer = this._dialogLayout.find('.dnnPageContainer');
            var newPage = $('<div class="dnnPage ' + id + ' id="' + id + '"></div>');
            newPage.append(content);
            pageContainer.append(newPage);
        },

        showPage: function (id, immediate) {
            var pageContainer = this._dialogLayout.find('.dnnPageContainer');
            var page;
            if (typeof id == "number") {
                page = pageContainer.find('.dnnPage').eq(id);
            } else {
                page = pageContainer.find('.dnnPage.' + id);
            }

            var left = page.position().left;
            if (!immediate) {
                var handler = this;
                pageContainer.animate({ marginLeft: 0 - left }, 'fast', function () {
                    handler._dialogLayout.trigger('pageChanged', [page]);
                });
            } else {
                pageContainer.css({ marginLeft: 0 - left });
            }
        },

        refreshPane: function (paneName, args, callback, callOnReload) {
            var paneId;
            if (!paneName) {
                paneId = this.getModuleManager().getPane().attr('id');
            } else {
                paneId = this.getPaneById(paneName).attr('id');
            }

            var pane = $('#' + paneId);
            var parentPane = pane.data('parentpane');
            if (parentPane) {
                this.refreshPane(parentPane, args, callback);
                return;
            }
            //set module manager to current refresh pane.
            this._moduleManager = pane.data('dnnModuleManager');
            var ajaxPanel = $find(paneId + "_SyncPanel");
            if (ajaxPanel) {
                //remove action menus from DOM bbefore fresh pane.
                var handler = this;
                pane.find('div.DnnModule').each(function () {
                    var moduleId = handler._moduleManager._findModuleId($(this));
                    $('#moduleActions-' + moduleId).remove();
                });

                Sys.WebForms.PageRequestManager.getInstance().add_endRequest(this._refreshCompleteHandler);
                this._refreshPaneId = paneId;
                this._refreshCallback = callback;
                ajaxPanel.ajaxRequest(args);
            } else {
                //save the args into cookie, after page reload then catch the cookie
                //and float the module for drag
                if (args && !this._noFloat) {
                    this._setCookie('CEM_CallbackData', args);
                }

                if (callOnReload && typeof callback == "function") {
                    callback.call($('#' + paneId), [true]);
                }

                location.reload();
            }
        },

        noFloat: function() {
            this._noFloat = true;
        },

        addModule: function (moduleId, callback) {
            if (this._working) {
                return false;
            }

            this._working = true;

            var params = {
                Visibility: 0,
                Position: -1,
                Module: moduleId,
                Pane: this.options.paneName,
                AddExistingModule: false,
                CopyModule: false,
                Sort: -1
            };

            this._addingDesktopModuleId = moduleId;
            var handler = this;
            this._getService().request('AddModule', 'POST', params, function(data) {
                handler._addModuleComplete(data, callback);
            });

            return false;
        },

        setModuleId: function (moduleId) {
            if (moduleId <= 0) {
                this._removeCookie('CEM_NewModuleId');
            } else {
                this._setCookie('CEM_NewModuleId', moduleId);
            }
        },

        getModuleId: function () {
            return this._getCookie('CEM_NewModuleId');
        },

        getSiteRoot: function () {
            return dnn.getVar("sf_siteRoot", "/");
        },

        _refreshComplete: function () {
            Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(this._refreshCompleteHandler);

            var handler = this;
            var moduleManager = this.getModuleManager();
            //run inline script execute
            setTimeout(function () {
                if (typeof window.dnnLoadScriptsInAjaxMode === "undefined" || window.dnnLoadScriptsInAjaxMode.length == 0) {
                    handler._executeModuleScripts();
                } else {
                    $(window).one('dnnScriptLoadComplete', function() {
                        handler._executeModuleScripts();
                    });
                }
            }, 50);

            var callback = this._refreshCallback;
            var paneId = this._refreshPaneId;
            var $pane = $('#' + paneId);
            this._refreshPaneId = this._refreshCallback = null;

            if (typeof callback == "function") {
                callback.call($pane);
            }
        },

        _executeModuleScripts: function () {
            $(window).off('load');
            var handler = this;
            var moduleManager = this.getModuleManager();
            moduleManager.getPane().find('div.DnnModule').not('[class~="floating"]').find('script').each(function() {
                var script = $(this).html();
                if (script) {
                    handler._executeScript(script);
                }
            });

            //trigger window load event
            $(window).trigger('load').trigger('resize');
        },

        _executeScript: function(script) {
            if (window.execScript) {
                window.execScript(script);
            } else {
                (function() {
                    window.eval.call(window, script);
                })();
            }
        },

        _calcPosition: function (handler) {
            var left, top;
            var dialogWidth = this._dialogLayout.outerWidth();
            var dialogHeight = this._dialogLayout.outerHeight();
            left = $(document).scrollLeft() + $('#personaBar-iframe').outerWidth() / 2 + ($(window).width() - dialogWidth) / 2;
            top = $(document).scrollTop() + ($(window).height() - dialogHeight) / 2;
            this._dialogLayout.css({
                left: left,
                top: top
            });
        },

        _generateLayout: function () {
            var layout = this._dialogLayout = $('' +
                '<div class="dnnModuleDialog">' +
                    '<div class="dnnPageContainer">' +
                        '<div class="dnnPage">' +
                            '<div class="dnnDialogTitle">' +
                                '<span class="title">' + dnn.ContentEditorManager.resources.title + '</span>' +
                            '</div>' +
                            '<div class="dnnDialogBody dnnModuleList">' +
                                '<div class="listContainer"><ul></ul></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>');

            return layout;
        },

        _addCloseButton: function() {
            var closeButton = this._closeButton = $('<span class="btn-close" />');
            $(".dnnModuleDialog .dnnDialogTitle .title").after(closeButton);

            return closeButton;
        },

        _addSearchBox: function () {
            var searchBox = $(
                    '<div class="search-container"><div class="search-input-container">' +
                    '<input type="text" id="AddModule_SearchModulesInput" class="search-input"/></div>' +
                    '<a href="javascript:void(0);" title="Search" class="search-button"></a>' +
                    '<a href="javascript:void(0);" title="Clear" class="clear-button"></a></div>' +
                    '</div>');

            $(".dnnModuleDialog .dnnDialogTitle .title").after(searchBox);

            return searchBox;
        },

        _showDialog: function () {
            this._createMask();
            this.showPage(0, true);
            this._dialogLayout.show('fast', $.proxy(this._dialogOpened, this));
            $(document).on('keyup', $.proxy(this._handleKeyEvent, this));
            $(window).resize();
        },

        _hideDialog: function (callback) {
            this._destroyMask();
            this._dialogLayout.hide('fast', function() {
                if (typeof callback == "function") {
                    callback.call(this);
                }
            });

            $(document).off('keyup', $.proxy(this._handleKeyEvent, this));
            $(window).resize();
        },

        _createMask: function () {
            var mask = $('<div class="dnnDialogMask"></div>');
            mask.css({
                left: 0,
                top: 0,
                width: '100%',
                height: $(document).outerHeight()
            });

            $(document.body).append(mask).css('overflow', 'hidden');

            this._calcPosition(this._moduleManager.getHandler());
        },

        _destroyMask: function () {
            $(document.body).css('overflow', '').find('.dnnDialogMask').remove();
        },

        _dialogOpened: function () {
            this._calcPosition(this._moduleManager.getHandler());

            //when dialog first open, raise dialog initial event
            if (!this._initialized) {
                this._dialogLayout.trigger('dialoginit');
                this._initialized = true;
            }

            this._dialogLayout.trigger('dialogopen');

            this._loadModuleList('', false);
        },

        _loadModuleList: function (val, isSearch) {
            var cl = "Content Layout";
            if ((this._loadMore || isSearch) && !this._getService().isLoading()) {
                if (isSearch && this._startIndex == 0) {
                    $('.listContainer ul li.dnnModuleItem:not([class~="dnnLayoutItem"])').remove();
                    if ((val.length > 0) && (cl.toLowerCase().indexOf(val.toLowerCase()) == -1)) {
                        $('.listContainer ul li.dnnModuleItem.dnnLayoutItem').css("display", "none");
                    }
                    else {
                        $('.listContainer ul li.dnnModuleItem.dnnLayoutItem').css("display", "inline");
                    }
                    $('.listContainer div.dnnModuleDialog_ModuleListMessage').remove();
                }
                if (this._loadMore) {
                    this._getService().request('GetPortalDesktopModules', 'GET', {
                        category: 'All',
                        loadingStartIndex: this._startIndex,
                        loadingPageSize: this._pageSize,
                        searchTerm: val,
                        excludeCategories: 'Admin,Professional',
                        sortBookmarks: true,
                        topModule: "Html Pro"
                    }, $.proxy(this._renderModuleList, this));
                }
            }
        },

        _renderModuleList: function (data) {
            var container = this._dialogLayout.find(".dnnModuleList .listContainer ul");
            if (data.length > 0) {
                //rearrange data list to place bookmarked modules on top
                var orderedList = [];

                var objHtmlModule = null;
                for (var x = 0; x < data.length; x++) {
                    if (data[x].Bookmarked || data[x].ModuleName == 'HTML Pro') {
                        this._bookmarkedModuleList.push(data[x].ModuleID);
                        if (data[x].ModuleName == 'HTML Pro') {
                            objHtmlModule = data[x];
                        }
                        else {
                            orderedList.unshift(data[x]);
                        }
                    }
                    else {
                        orderedList.push(data[x]);
                    }
                }
                //render rearranged list
                for (var i = 0; i < orderedList.length; i++) {
                    if (orderedList[i].Bookmarked) {
                        container.find('li.dnnModuleItem:eq(0)').after(this._renderItem(orderedList[i]));
                    } else {
                        container.append(this._renderItem(orderedList[i]));
                    }
                }
                //move HTML on top
                if (objHtmlModule) {
                    container.find('li.dnnModuleItem:eq(0)').after(this._renderItem(objHtmlModule));;
                }

                if (data.length < this._pageSize) {
                    this._loadMore = false;
                } else {
                    this._startIndex += data.length;
                }

                this._initScrollView();
            }
            else {
                if (container.has("li").length == 1 && this._startIndex == 0) {
                    $(".jspVerticalBar").hide();
                    //scroll top to render no modules message
                    $(".jspDrag").css("top", "0px");
                    $(".jspPane").css("top", "0px");
                    this._loadMore = false;
                    container.after(this._getNoResultTemplate());
                }
            }
            $("#AddModule_SearchModulesInput").focus();
        },

        _getItemTemplate: function () {
            return '<li class="dnnModuleItem" data-moduleid="[$ModuleID$]">' +
                '<span class="bookmarkholder"><a href="#" class="button bookmarkModule" data-moduleid="[$ModuleID$]"></a></span>' +
                '<span class="icon [$ModuleName|css]"><img src="[$ModuleImage$]" /></span>' +
                '<span class="title {0}">[$ModuleName$]</span>' +
                '<span class="actions">' +
                    '<a href="#" class="button bookmarkModule" data-moduleid="[$ModuleID$]"></a>' +
                    '<a href="#" class="button addModule" data-moduleid="[$ModuleID$]"></a>' +
                '</span>' +
                '</li>';
        },

        _getNoResultTemplate: function () {
            return '<div class="dnnModuleDialog_ModuleListMessage"><span>' + dnn.ContentEditorManager.resources.nomodules + '</span></div>';
        },

        _renderItem: function (item) {
            var extraclass;
            var template = this._getItemTemplate();

            for (var a in item) {
                var shortMatchRegex = new RegExp('\\[\\$' + a + '\\|(\\d+)\\$\\]', 'g');
                var shortMatch = shortMatchRegex.exec(template);
                while (shortMatch) {
                    var val = item[a].toString();
                    var length = parseInt(shortMatch[1], 10);
                    if (val.length > length) {
                        val = val.substr(0, length) + "...";
                    }

                    template = template.replace(shortMatch[0], val);
                    shortMatch = shortMatchRegex.exec(template);

                };

                template = this._replaceAll(template, '[$' + a + '|css]', this._replaceAll(item[a].toString().toLowerCase(), ' ', '-'));
                template = this._replaceAll(template, '[$' + a + '$]', item[a]);

                if (a === 'ModuleName') {
                    extraclass = item[a].length > 20 ? 'longTitle' : '';
                    template = template.replace('{0}', extraclass);    
                }
                
                if (item.Bookmarked || item.ModuleName == "HTML Pro") {
                    item.ModuleName == "HTML Pro" ? template = this._replaceAll(template, 'bookmarkModule', 'bookmarkedHtmlModule') :
                        template = this._replaceAll(template, 'bookmarkModule', 'bookmarkedModule');
                }

            }

            return template;
        },

        _initScrollView: function () {
            var container = this._dialogLayout.find(".dnnModuleList .listContainer");
            if (container.data('jsp')) {
                container.data('jsp').reinitialise();
            } else {
                container.jScrollPane();
                var $this = this;
                container.bind('jsp-scroll-y', function (e, y, atTop, atBottom) {
                    if (atBottom) {
                        if ($("#AddModule_SearchModulesInput").val()) {
                            $this._loadModuleList($("#AddModule_SearchModulesInput").val(), true);
                        } else {
                            $this._loadModuleList('', false);
                        }
                    }
                });
            }
        },

        _getSearchModules: function () {
            var $searchInput = $("#AddModule_SearchModulesInput");
            this._startIndex = 0;
            this._loadMore = true;
            this._loadModuleList($searchInput.val(), true);
        },

        _resetModuleSearch: function () {
            var $searchInput = $("#AddModule_SearchModulesInput");
            $searchInput.val('').focus();
            $('.listContainer ul li.dnnModuleItem:not([class~="dnnLayoutItem"])').remove();
            $('.listContainer div.dnnModuleDialog_ModuleListMessage').remove();
            this._loadMore = true;
            dnnModuleService._loading = false;
            this._startIndex = 0;
            this._loadModuleList('', true);
        },

        _searchKeyPress: function (e) {
            if (e.keyCode == 13) {
                var val = $("#AddModule_SearchModulesInput").val();
                clearTimeout(this._searchTimeout);
                this._startIndex = 0;
                this._loadMore = true;
                this._loadModuleList(val, true);
                return false;
            }
        },

        _searchKeyUp: function () {
            var val = $("#AddModule_SearchModulesInput").val();
            if (this._lastVal.length != val.length &&
                (val.length == 0 || val.length >= this._minInputLength)) {
                this._startIndex = 0;
                this._loadMore = true;
                this._loadModuleList(val, true);
            }
            this._lastVal = val;
        },

        _attachEvents: function () {
            this._dialogLayout.on('click', '.button.addModule', $.proxy(this._doAddModule, this));
            $(window).on('resize', '', $.proxy(this._layoutResized, this));
            this._dialogLayout.on('click', 'span.actions .button.bookmarkModule', $.proxy(this._addBookmarkModule, this));
            this._dialogLayout.on('click', 'span.bookmarkholder .button.bookmarkedModule', $.proxy(this._removeBookmarkModule, this));
            this._dialogLayout.on('click', 'span.btn-close', $.proxy(this._closeButtonHandler, this));
            var $searchButton = $(".dnnModuleDialog .search-container .search-button");
            $searchButton.on('click', $.proxy(this._getSearchModules, this));

            var $clearButton = $(".dnnModuleDialog .search-container .clear-button");
            $clearButton.on('click', $.proxy(this._resetModuleSearch, this));

            var $searchInput = $(".dnnModuleDialog .search-container .search-input");
            $searchInput.on('mouseup', function () { return false; });
            $searchInput.on('keypress', $.proxy(this._searchKeyPress, this));
            $searchInput.on('keyup', $.proxy(this._searchKeyUp, this));

            $(window).on('beforeunload', $.proxy(this._windowBeforeUnload, this));
        },

        _closeButtonHandler: function() {
            this.getModuleManager().getHandler().click();
        },

        _handleKeyEvent: function (e) {
            if (e.keyCode == 27) {
                this._moduleManager.getHandler().click();
            }
        },

        _doAddModule: function (e) {
            var moduleId = $(e.target).data("moduleid");
            if (!moduleId) {
                return false;
            }
            this.addModule(moduleId);

            return false;
        },

        _addModuleComplete: function (data, callback) {
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(this._syncCompleteHandler);

            if (this._noFloat) {
                this._setCookie('noFloat', 'true');
                dnn.ContentEditorManager.triggerChangeOnPageContentEvent();
            }

            this.setModuleId(data.TabModuleID);
            this.refreshPane('', 'module-' + data.TabModuleID, callback, true);
        },

        _bookmarkUpdated: function (data) {
        },

        _saveBookmark: function (item, removeBookmark) {
            var params = {
                Title: 'module',
                Bookmark: this._bookmarkedModuleList.join(',')
            };
            this._getService().request('SaveBookmark', 'POST', params, $.proxy(this._bookmarkUpdated, this));
            if (removeBookmark) {
                $((item).parent()).parent().find("span.bookmarkholder a.button.bookmarkedModule").removeClass("bookmarkedModule").addClass("bookmarkModule").unbind("click");
                $((item).parent()).parent().find("span.actions a.button.bookmarkedModule").removeClass("bookmarkedModule").addClass("bookmarkModule").bind("click");
            }
            else {
                $((item).parent()).parent().find("span.bookmarkholder a.button.bookmarkModule").removeClass("bookmarkModule").addClass("bookmarkedModule").bind("click");
                $((item).parent()).parent().find("span.actions a.button.bookmarkModule").removeClass("bookmarkModule").addClass("bookmarkedModule").unbind("click");
            }

            return false;
        },

        _addBookmarkModule: function (e) {
            var moduleId = $(e.target).data("moduleid");
            if (this._bookmarkedModuleList.indexOf(moduleId) < 0) {
                this._bookmarkedModuleList.push(moduleId);
            }
            this._saveBookmark($(e.target), false);
            return false;
        },

        _removeBookmarkModule: function (e) {
            var moduleId = $(e.target).data("moduleid");
            if (moduleId == 84) {
                return;
            }
            var index = this._bookmarkedModuleList.indexOf(moduleId);
            if (index >= 0) {
                this._bookmarkedModuleList.splice(index, 1);
            }
            this._saveBookmark($(e.target), true);
        },

        _cancelAddModule: function(e) {
            var target = $(e.target);
            var moduleId = target.data('moduleid');

            var handler = this;
            var opts = {
                callbackTrue: function () {
                    //remove all action menus in current layout
                    handler._getEditorService().request('DeleteModule', 'GET', {
                        moduleId: moduleId
                    }, function (data) {
                        if (data.Status != 0) {
                            $.dnnAlert({ text: data.Message });
                        }

                        handler._resetPending();
                        handler.refreshPane('');
                    });
                },
                text: dnn.ContentEditorManager.resources.cancelConfirm,
                yesText: dnn.ContentEditorManager.resources.confirmYes,
                noText: dnn.ContentEditorManager.resources.confirmNo,
                title: dnn.ContentEditorManager.resources.confirmTitle
            };

            $.dnnConfirm(opts);
            return false;
        },

        _processModuleForDrag: function (module) {
            var handler = this;
            var moduleId = this.getModuleManager()._findModuleId(module);

            //hide related modules
            var relatedModules = [];
            $('div.DnnModule').each(function() {
                var id = handler.getModuleManager()._findModuleId($(this));
                if (id > moduleId) {
                    $(this).hide();
                    $('#moduleActions-' + id).hide();
                    relatedModules.push(id);
                }
            });
            module.data('relatedModules', relatedModules);

            module.addClass('floating');
            //move module to current screen
            var left, top;
            var moduleWidth = module.outerWidth();
            var moduleHeight = module.outerHeight();
            left = $('#personaBar-iframe').outerWidth() / 2
                + ($(window).width() - moduleWidth) / 2;
            top = $(window).height() / 2 - moduleHeight;
            module.css({
                left: left,
                top: top
            });

            $('div.dnnDragHint').off('mouseenter').addClass('dnnDragDisabled');

            var $dragHint = module.find('> div.dnnDragHint').removeClass('dnnDragDisabled');
            var $dragContent = $('<div />');
            $dragHint.append($dragContent);

            var moduleItem = this.getElement().find('li[data-moduleid="' + this._addingDesktopModuleId + '"]');
            if (moduleItem.length > 0) {
                var $icon = moduleItem.find('span.icon');
                var $cloneIcon = $icon.clone();
                if ($icon.css('background-image') && $icon.css('background-image') != 'none') {
                    var backImg = $icon.css('background-image').match(/^(url\()?(['"]?)(.+?)\2\)?$/)[3];
                    $cloneIcon.find('img').attr('src', backImg);
                }
                $dragContent.append($cloneIcon);
                $dragContent.append(moduleItem.find('span.title').clone());
            } else {
                $dragHint.append($dragContent);

                var title = module.data('module-title');
                $('<span class="title" />').appendTo($dragContent).html(title);
            }

            $('<a name="' + moduleId + '" href="#" class="cancel-module" data-moduleid="' + moduleId + '" />').appendTo($dragContent).click($.proxy(this._cancelAddModule, this));

            //show the drag tip if user add module first time.
            if (module.hasClass('dragtip')) {
                var dragTip = $('<div class="module-drag-tip"></div>');
                module.before(dragTip.css({opacity: 0}));
                dragTip.html(dnn.ContentEditorManager.resources.dragtip).css({
                    top: module.offset().top - $(document).scrollTop() - dragTip.outerHeight() - 28,
                    left: module.offset().left - $(document).scrollLeft() + 25,
                    width: module.outerWidth() - 50
                });

                dragTip.animate({
                    top: '+=10',
                    opacity: 1
                }, 200);
            }

            module.addClass('drift').mouseover(function() {
                module.removeClass('drift');
            }).mouseout(function() {
                module.addClass('drift');
            });

            this._setPending('module-' + moduleId);
        },

        _syncComplete: function (sender, args) {
            if (args.get_error() != null) {
                args.set_errorHandled(true);
                location.reload();
                return;
            }

            Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(this._syncCompleteHandler);
            var handler = this;
            setTimeout(function() {
                handler._syncCompleteFunc();
            }, 25);
        },

        _syncCompleteFunc: function() {
            var moduleId = this.getModuleId();
            var handler = this;
            var newModule = $('div.DnnModule-' + moduleId);

            if (!this._noFloat) {
                this._processModuleForDrag(newModule);
            } else {
                //animate the new module
                newModule.addClass('highlight');
                setTimeout(function() {
                    newModule.addClass('animate');
                }, 500);
                setTimeout(function() {
                    newModule.removeClass('highlight animate');
                }, 1000);

                // scroll to new added module
                var moduleTop = (newModule.offset().top - 80);
                if (moduleTop > 0) {
                    $('html, body').animate({scrollTop: moduleTop}, 500);
                }

                setTimeout(function () { //execute after inner script executed.
                    if (typeof window.dnnLoadScriptsInAjaxMode === "undefined" || window.dnnLoadScriptsInAjaxMode.length == 0) {
                        newModule.trigger('editmodule');
                    } else {
                        $(window).one('dnnScriptLoadComplete', function() {
                            newModule.trigger('editmodule');
                        });
                    }
                }, 50);

                this.setModuleId(-1);
            }

            this.getElement().trigger('addmodulecomplete');
            this._motionToNewModule(moduleId);

            setTimeout(function() {
                if (!handler._noFloat) {
                    $('#moduleActions-' + moduleId).addClass('floating');
                }

                handler._noFloat = false;
                handler._removeCookie('noFloat');
            }, 250);

            this._working = false;
        },

        _motionToNewModule: function(moduleId) {
            var $listItem = this.getElement().find('li[data-moduleid="' + this._addingDesktopModuleId + '"]');
            if ($listItem.length == 0) {
                $listItem = this.getModuleManager().getHandler();
            }

            var $newModule = $('div.DnnModule-' + moduleId);
            var $motion = $('<div class="module-motion" />').hide().css({
                width: $listItem.width(),
                height: $listItem.height(),
                left: $listItem.offset().left,
                top: $listItem.offset().top
            }).appendTo($(document.body));

            this.close(function() {
                $motion.show().animate({
                    width: $newModule.width(),
                    height: $newModule.height(),
                    left: $newModule.offset().left,
                    top: $newModule.offset().top
                }, 'fast', function() {
                    $motion.remove();
                });
            });
        },

        _layoutResized: function (e) {
            if (this.isOpen()) {
                this._calcPosition(this._moduleManager.getHandler());
            }
        },

        _replaceAll: function (input, find, replace) {
            var str = input;
            str += "";
            var indexOfMatch = str.indexOf(find);

            while (indexOfMatch != -1) {
                str = str.replace(find, replace);
                indexOfMatch = str.indexOf(find);
            }

            return (str);
        },

        _getService: function () {
            if (!this._serviceController) {
                this._serviceController = new dnnModuleService({
                    service: 'internalservices',
                    controller: 'controlbar'
                });
            }

            return this._serviceController;
        },

        _getEditorService: function () {
            if (!this._editorServiceController) {
                this._editorServiceController = new dnnModuleService({
                    service: 'EvoqContentLibrary',
                    controller: 'ContentEditor'
                });
            }

            return this._editorServiceController;
        },

        _setPending: function(data) {
            this._pending = true;
            $('.actionMenu').addClass('floating');
            this._setCookie('cem_pending', data);
        },

        _resetPending: function() {
            this._pending = false;
            $('.actionMenu').removeClass('floating');
            this._removeCookie('cem_pending');
        },

        _windowBeforeUnload: function() {
            if (this._pending) {
                return dnn.ContentEditorManager.resources.pendingsave;
            }

            return;
        },

        _getCookie: function(name) {
            if (dnn.dom) {
                return dnn.dom.getCookie(name);
            } else {
                return '';
            }
        },

        _setCookie: function(name, value) {
            if (dnn.dom) {
                dnn.dom.setCookie(name, value, 0, this.getSiteRoot());
            }
        },

        _removeCookie: function(name) {
            dnn.dom.setCookie(name, '', -1, this.getSiteRoot());
        }
    };

    dnnModuleDialog.defaultOptions = {};

    ///dnnModuleDialog Plugin END

    ///dnnModuleService

    var dnnModuleService = dnn.dnnModuleService = function (options) {
        this.options = options;
        this.init();
    };

    dnnModuleService.prototype = {
        init: function () {
            this.options = $.extend({}, dnnModuleService.defaultOptions, this.options);

            this._service = $.dnnSF();
        },

        isLoading: function () {
            return this._loading;
        },

        request: function (method, type, params, successCallback, errorCallback) {
            var handler = this;
            $.ajax({
                url: this._getServiceUrl() + method,
                type: type,
                data: params,
                async: this.options.async,
                beforeSend: $.proxy(this._beforeSend, this),
                complete: $.proxy(this._completeRequest, this),
                success: function (data) {
                    if (typeof successCallback == "function") {
                        successCallback(data);
                    }
                },
                error: function (xhr) {
                    if (xhr && xhr.status == '401') {
                        var loginUrl = dnn.getVar('cem_loginurl');
                        if (typeof window.dnnModal != "undefined") {
                            window.dnnModal.show(loginUrl + (loginUrl.indexOf('?') == -1 ? '?' : '&') + 'popUp=true', true, 300, 650, true, '');
                        } else {
                            location.href = loginUrl;
                        }

                        return;
                    }

                    if (typeof errorCallback == "function") {
                        errorCallback(xhr);
                        return;
                    }

                    $.dnnAlert({
                        title: 'Error',
                        text: 'Error occurred when request service \'' + method + '\'.'
                    });
                }
            });
        },

        getTabId: function() {
            return this._service.getTabId();
        },

        _beforeSend: function (xhr) {
            this._service.setModuleHeaders(xhr);
            this._loading = true;
        },

        _completeRequest: function (xhr, status) {
            this._loading = false;
        },

        _getServiceUrl: function () {
            return this._service.getServiceRoot(this.options.service) + this.options.controller + '/';
        },
    };

    dnnModuleService.defaultOptions = {
        async: true
    };

    ///dnnModuleService END

    $(window).load(function() {
        //handle the floating module from cookie
        var handleNewModuleFromCookie = function () {
            var moduleDialog = dnn.ContentEditorManager.getModuleDialog();

            var cookieModuleId = moduleDialog._getCookie('CEM_CallbackData');
            if (cookieModuleId && cookieModuleId.indexOf('module-') > -1) {
                var moduleId = cookieModuleId.substr(7);

                var module = $('div.DnnModule-' + moduleId);
                var moduleManager = module.parent().data('dnnModuleManager');

                moduleDialog.apply(moduleManager);
                moduleDialog._processModuleForDrag(module);
                $('#moduleActions-' + moduleId).addClass('floating');
                moduleDialog._removeCookie('CEM_CallbackData');
            } else {
                var cookieNewModuleId = moduleDialog.getModuleId();
                if (cookieNewModuleId) {
                    var newModule = $('div.DnnModule-' + cookieNewModuleId);
                    moduleDialog.setModuleId(-1);

                    dnn.ContentEditorManager.triggerChangeOnPageContentEvent();
                    newModule.trigger('editmodule');
                }
            }
        }

        setTimeout(handleNewModuleFromCookie, 500);
    });
}(jQuery));
