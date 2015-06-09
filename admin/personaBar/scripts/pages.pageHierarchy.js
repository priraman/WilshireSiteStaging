/*
DotNetNuke® - http://www.dotnetnuke.com
Copyright (c) 2002-2014
by DotNetNuke Corporation
All Rights Reserved
*/

/*
* TODO: Document
*/

// Namespace
window.dnn = window.dnn || {};

define(['jquery', 'knockout', '../scripts/config', '../scripts/pages.thumbnails'], function ($, ko, cf) {
    var OVER_TIME_TO_OPEN_PAGE_CHILDS;
    var config, pageHierarchyManager, pageHierarchyDefaultOptions;
    var draggingJqObj, pageDropped;

    OVER_TIME_TO_OPEN_PAGE_CHILDS = 700;

    // Controls if we have a dragging object when open sublist of a page
    // is triggered
    draggingJqObj = null;

    // Store page dropped to other page (not dropped to list), to add when
    // page lists are load
    pageDropped = null;

    // Controls that the drop action occurs over a drop object (page) no over sort list
    // preventing duplicates pages
    dropOnDroppable = false;

    config = cf.init();

    pageHierarchyManager = function(options) {
        this.options = options;
    };

    pageHierarchyManager.prototype = {
        constructor: pageHierarchyManager,

        init: function(initCallback) {
            var handler, viewModel;

            handler = this;
            this.options = $.extend({}, pageHierarchyDefaultOptions, this.options);
            this.panel = $('#pages-panel');
            this.container = $('.pagehierarchy-container', this.panel);
            this.dragContainer = this.container.find('.pages-drag-container');

            this._selectPageInHierarchyHandler = $.proxy(this._selectPageInHierarchy, this);

            $(window).resize(function() {
                handler._resizeContentContainer(true);
            });

            $('.btn_showsite, .btn_panel').click($.proxy(this._leavePanelClickHandler, this));

            viewModel = this._getViewModel();
            ko.applyBindings(viewModel, handler.panel[0]);

            this._initCallback = initCallback;
            this._loadRootPageList();
        },

        load: function() {
            dnn.dnnPageThumbnails.updateThumbnails();
        },

        getElement: function() {
            return this.container;
        },

        addPage: function(newPage) {
            var viewModel, pageItem;

            viewModel = this._getViewModel();
            viewModel.pagesList()[0].pages.push(newPage);
            this._initScrollView();

            // Floating the new pag item
            pageItem = $('li[data-page-id="' + newPage.id + '"] > div');
            pageItem.hide();
            viewModel.inDrag(true);
            viewModel.isNew(true);
            viewModel.dragPage(newPage);

            dnn.dnnPageThumbnails.updateThumbnails();
        },

        addTemplate: function(template) {
            var viewModel;

            if (this._getViewModel().viewType() != 'templates') {
                this.switchView('templates', function() {
                    this.selectPage(template.id, true);
                    this._initScrollView(true);

                    dnn.dnnPageThumbnails.updateThumbnails();
                });
            } else {
                viewModel = this._getViewModel();
                viewModel.pagesList()[0].pages.push(template);
                this.selectPage(template.id, true);
                this._initScrollView(true);

                dnn.dnnPageThumbnails.updateThumbnails();
            }
        },

        editPage: function(newPage) {
            this._updatePageData(newPage.id, newPage);
        },

        selectPage: function(pageId, notFindMore) {
            var handler, pageData, find;

            handler = this;
            find = this._findDataPosition(pageId);

            if (find) {
                pageData = this._getViewModel().pagesList()[find.level].pages()[find.index];
                this._needScrollToSelectedPage = true;
                this._supressUI = false;
                this._getViewModel().selectedPage(pageData);

            } else if (typeof notFindMore === 'undefined' || !notFindMore) {
                this._supressUI = true;
                this.getElement().on('childpagesloaded', this._selectPageInHierarchyHandler);

                this._getService().get('GetPageHierarchy', { pageId: pageId }, function(data) {
                    handler._selectPageInHierarchyPath = data;
                    handler._selectPageInHierarchy();
                });

                return;
            }

            this.getElement().off('childpagesloaded', this._selectPageInHierarchyHandler);
        },

        switchView: function(view, callback) {
            this._viewTypeChangedCallback = callback;
            this._getViewModel().viewType(view);
        },

        hasPendingChanges: function() {
            return this._getViewModel().dragPage().id > 0;
        },

        handlePendingChanges: function (e) {
            this.utility.notify(this.resx.pages_Pending);

            if (e) {
                e.stopImmediatePropagation();
            }
            return false;
        },

        _loadRootPageList: function() {
            var handler, viewModel, params;

            handler = this;
            viewModel = handler._getViewModel();
            viewModel.pagesList.removeAll();

            params = {
                searchKey: viewModel.searchKeyword()
            };

            this._getService().get('GetPageList', params, function (data) {
                if (viewModel.searchKeyword().length > 0) {
                    viewModel.pagesList.removeAll();
                }
                viewModel.pagesList.push({
                    parentId: -1,
                    level: 0,
                    pages: ko.observableArray(data)
                });

                handler._resizeContentContainer(true);
                handler._initDrag();

                dnn.dnnPageThumbnails.updateThumbnails();

                if (typeof handler._initCallback === 'function') {
                    handler._initCallback.call(handler);
                    handler._initCallback = null;
                }
            });
        },

        _loadPageTemplates: function(callback) {
            var handler, viewModel, params;

            handler = this;
            viewModel = handler._getViewModel();
            viewModel.pagesList.removeAll();

            params = {
                searchKey: viewModel.searchKeyword()
            };

            this._getService().get('GetPageTemplates', params, function(data) {
                viewModel.inDrag(false);

                viewModel.pagesList.push({
                    parentId: -1,
                    level: 0,
                    pages: ko.observableArray(data)
                });

                handler._resizeContentContainer(true);
                handler._initDrag();

                dnn.dnnPageThumbnails.updateThumbnails();

                if (typeof callback == "function") {
                    callback.call(handler);
                }

                handler._getService().get('GetDeletedTemplates', {}, function(deletedPages) {
                    viewModel.deletedPagesCount(deletedPages.length);
                });
            });
        },

        _addPagesList: function (parentPage, pagesData) {
            var handler, viewModel, $listItem, $pagesList, level, nextLevel;

            handler = this;
            viewModel = this._getViewModel();
            $listItem = $('li[data-page-id="' + parentPage.id + '"]');
            $pagesList = $listItem.parents('.pages-list');
            level = $pagesList.data('page-level');

            // Hide other list sublevels if we are dragging for not block the ui
            // deleting sortable source oject, else delete all to improve performance
            if (draggingJqObj) {
                $('.pages-list').each(function hideNextLevels() {
                    var self = $(this);
                    if (self.data('page-level') > level) {
                        self.hide();
                        self.addClass('removeMe');
                    }
                });
            } else {
                $('.pages-list').each(function hideNextLevels() {
                    var self = $(this);
                    if (self.data('page-level') > level) {
                        viewModel.pagesList.remove(function(item) {
                            return item.level > level;
                        });
                    }
                });
            }

            nextLevel = viewModel.pagesList().length;
            viewModel.pagesList.push({
                parentId: parentPage.id,
                level: nextLevel,
                pages: ko.observableArray(pagesData || [])
            });

            setTimeout(function() {
                $pagesList.next().addClass('expand');

                handler._initScrollView(true, function () {
                    var listScroller, containerScroller, $nextList, eventTriggeredByHover;

                    eventTriggeredByHover = false;
                    listScroller = $pagesList.data('jsp');
                    containerScroller = handler.container.find('.pages-list-scroller').data('jsp');

                    if (handler._needScrollToSelectedPage) {
                        handler._needScrollToSelectedPage = false; //this should only work for once.
                        if (listScroller) {
                            listScroller.scrollToElement($listItem[0], true, true);
                        }

                        if (containerScroller) {
                            containerScroller.scrollToElement($pagesList[0], true, true);
                        }
                    } else {
                        $nextList = $('div.pages-list[data-page-level="' + nextLevel + '"]');
                        if (containerScroller && $nextList.length > 0) {
                            containerScroller.scrollToElement($nextList[0], true, true);
                        }
                    }

                    handler._initDrag();
                    handler.getElement().trigger('childpagesloaded');
                    dnn.dnnPageThumbnails.updateThumbnails();
                });
            }, 0);
        },

        _leavePanelClickHandler: function (e) {
            if ($(e.target).hasClass('btn_pages')) {
                return;
            }

            dnn.dnnPageThumbnails.removeThumbnailLoader();
            this.container.find('.thumbnail img.loading').removeClass('loading').parent().removeClass('loading');
        },

        _pageItemClickHandler: function (pageData, e) {
            this._getViewModel().selectedPage(pageData);
        },

        _viewPageClickHandler: function (pageData, e) {
            this.utility.closePersonaBar(function() {
                window.top.location.href = pageData.url;
            });
        },

        _editPageClickHandler: function (pageData, e) {
            this._enterEditMode(pageData);
        },

        _enterEditMode: function (pageData) {
            var handler = this;
            setTimeout(function() {
                dnn.dnnPageThumbnails.removeThumbnailLoader();
                handler._getService().get('EditModeForPage', { id: pageData.id }, function() {
                    handler.utility.closePersonaBar(function() {
                        window.top.location.href = pageData.url;
                    });
                });
            }, 100);
            
        },

        _settingsPageClickHandler: function (pageData, e) {
            if (this.callPageSettings) {
                this.callPageSettings('edit', [pageData.id, 0]);
            }
        },

        _deletePageClickHandler: function (pageData, e) {
            var handler, viewModel, viewType, confirmText, deleteText, cancelText;

            handler = this;
            viewModel = this._getViewModel();
            viewType = viewModel.viewType();
            confirmText = viewType == 'templates' ? this.resx.pages_DeleteTemplateConfirm : this.resx.pages_DeletePageConfirm;
            confirmText = confirmText.replace('[NAME]', pageData.name);
            deleteText = this.resx.pages_Delete;
            cancelText = this.resx.pages_Cancel;

            this.utility.confirm(confirmText, deleteText, cancelText, function () {
                handler._getService().get('DeletePage', { pageId: pageData.id }, function () {
                    if (pageData.id == config.tabId) {
                        window.top.location.href = config.siteRoot;
                        return;
                    }

                    var position, level, parentId;

                    position = handler._findDataPosition(pageData.id);
                    level = position.level;
                    viewModel.pagesList.remove(function(data) {
                        return data.level > level;
                    });

                    handler._updatePageData(pageData.id, null); //doesn't transfer second parameter means delete it
                    viewModel.deletedPagesCount(viewModel.deletedPagesCount() + 1);

                    parentId = viewModel.pagesList()[level].parentId;
                    viewModel.selectedPage(parentId > -1 ? handler._findPageData(parentId) : handler._getEmptyPageData());

                    //reduce parent child count
                    if (parentId > -1) {
                        var parentPosition = handler._findDataPosition(parentId);
                        var cloneData = handler._clonePageData(handler._findPageData(parentId));
                        cloneData.childCount -= 1;
                        viewModel.pagesList()[parentPosition.level].pages.splice(parentPosition.index, 1, cloneData);
                    }
                    //CONTENT-3796 - if current page was deleted redirect to Home
                    if (window.top.location.pathname.substr(window.top.location.pathname.lastIndexOf("/") + 1) == pageData.url.substr(pageData.url.lastIndexOf("/") + 1)) {
                        $(".btn_showsite").data('need-homeredirect', true);
                    } else {
                        $(".btn_showsite").data('need-refresh', true);
                    }

                    setTimeout(function() {
                        handler._initScrollView(true);
                    }, 0);
                });
            });
        },

        _toggleViewClickHandler: function (data, e) {
            data.inDrag($(e.target).hasClass('view-drag'));
        },

        _mouseOverThumbnailHandler: function (pageData, e) {
            var handler = this;

            if (this._showPreviewTimeoutHandler) {
                clearTimeout(this._showPreviewTimeoutHandler);
            }

            this._showPreviewTimeoutHandler = setTimeout(function() {
                handler._showPreview(pageData, e.target);
            }, this.options.delayTime);
        },

        _mouseOutThumbnailHandler: function () {
            if (this._showPreviewTimeoutHandler) {
                clearTimeout(this._showPreviewTimeoutHandler);
            }

            this._hidePreview();
        },

        _searchKeywordsChangedHandler: function (e) {
            var handler = this;

            if (this._doSearchTimeoutHandler) {
                clearTimeout(this._doSearchTimeoutHandler);
            }

            this._doSearchTimeoutHandler = setTimeout(function() {
                handler._searchPage();
            }, this.options.delayTime);

            return true;
        },

        _searchPage: function () {
            var viewModel = this._getViewModel();
            if (this.hasPendingChanges()) {
                viewModel.searchKeyword('');
                return this.handlePendingChanges();
            }

            viewModel.selectedPage(this._getEmptyPageData());

            switch (viewModel.viewType()) {
                case "hierarchy":
                    this._loadRootPageList();
                    break;
                case "templates":
                    this._loadPageTemplates();
                    break;
            }
        },

        _toggleViewChanged: function (inDrag) {
            var handler = this;
            this._removeListScrollView();
            this.container.find('.pages-list-container').width(20000);

            setTimeout(function () {
                handler._initScrollView(true);
            }, 120);
        },

        _selectPage: function (pageData) {
            if (this._getViewModel().selectedPage().id != pageData.id) {
                this._needScrollToSelectedPage = true;
                this._getViewModel().selectedPage(pageData);
            }
        },

        _selectedPageChanged: function (newPage) {
            var handler, $listItem, data;

            handler = this;

            $listItem = $('li[data-page-id="' + newPage.id + '"]');
            data = ko.dataFor($listItem[0]);

            if (this._getViewModel().viewType() == 'hierarchy' && newPage.id > 0) {
                if (newPage.childCount > 0) {
                    this._getService().get('GetPageList', { parentId: newPage.id }, function(pageData) {
                        handler._addPagesList(newPage, pageData);
                    });
                } else {
                    handler._addPagesList(newPage, null);
                }
            }

            this._computeSelectedPagePath();
        },

        _viewTypeChanged: function (viewType) {
            var viewModel = this._getViewModel();
            viewModel.selectedPage(this._getEmptyPageData());
            viewModel.searchKeyword('');

            switch(viewType) {
                case "hierarchy":
                    viewModel.deletedPagesCount(0);
                    this._loadRootPageList();
                    break;
                case "templates":
                    this._loadPageTemplates(this._viewTypeChangedCallback);
                    this._viewTypeChangedCallback = null;

                    break;
            }

            viewModel.searchFocus(true);
        },

        // Select page which under hierarchy and need expand level by level.
        _selectPageInHierarchy: function() {
            var pageId, find, pageData;

            if (this._selectPageInHierarchyPath.length == 1) {
                this.selectPage(this._selectPageInHierarchyPath[0], true);
            } else {
                pageId = this._selectPageInHierarchyPath[0];
                this._selectPageInHierarchyPath.splice(0, 1);
                find = this._findDataPosition(pageId);
                if (find) {
                    pageData = this._getViewModel().pagesList()[find.level].pages()[find.index];
                    this._getViewModel().selectedPage(this._clonePageData(pageData));
                }
            }
        },

        _showPreview: function (pageData, element) {
            var handler = this;

            if (!this._previewContainer) {
                this._previewContainer = $('<div class="pages-preview"><img src="" /></div>');
                this._previewContainer.mouseover(function () {
                    handler._mouseOnPreview = true;
                }).mouseout(function (e) {
                    handler._mouseOnPreview = false;
                    handler._hidePreview();
                });
                $(document.body).append(this._previewContainer);
            }
            this._previewContainer.find('img').attr('src', pageData.largeThumbnail);

            this._calcPreviewPosition(element);

            this._previewContainer.show('fast');
        },

        _hidePreview: function () {
            if (this._previewContainer && !this._mouseOnPreview) {
                this._previewContainer.hide('fast');
            }
        },

        _calcPreviewPosition: function(element) {
            var pos, $element, previewHeight, elementWidth, elementHeight, windowHeight, offset;

            pos = {};
            $element = $(element);
            previewHeight = this._previewContainer.outerHeight();
            elementWidth = $element.width();
            elementHeight = $element.height();
            windowHeight = $(window).height();
            offset = $element.offset();

            pos.left = offset.left + elementWidth - 25;
            pos.top = offset.top - previewHeight / 2 + elementHeight / 2;

            if (pos.top < 0) {
                this._previewContainer.removeClass('bottom').addClass('top');
                pos.top = $element.offset().top;
            }else if (pos.top + previewHeight > windowHeight) {
                this._previewContainer.removeClass('top').addClass('bottom');
                pos.top = offset.top - previewHeight + elementHeight;
            } else {
                this._previewContainer.removeClass('top bottom');
            }

            this._previewContainer.css({
                left: pos.left,
                top: pos.top
            });
        },

        // Doesn't transfer second parameter means delete it
        _updatePageData: function(id, newData) {
            var find, pages;

            find = this._findDataPosition(id);
            if (find !== null) {
                pages = this._getViewModel().pagesList()[find.level].pages;
                if (newData) {
                    pages.splice(find.index, 1, newData);
                } else {
                    pages.splice(find.index, 1);
                }
            }
        },

        _findDataPosition: function(pageId) {
            var viewModel, i, j, pagesList, listData;

            viewModel = this._getViewModel();

            for (i = 0; i < viewModel.pagesList().length; i++) {
                pagesList = viewModel.pagesList()[i].pages;
                listData = pagesList();

                for (j = 0; j < listData.length; j++) {
                    if (listData[j].id == pageId) {
                        return { level: i, index: j, parentId: listData[j].parentId, childCount: listData[j].childCount };
                    }
                }
            }
            return null;
        },

        _findPageData: function(pageId) {
            var viewModel, position;

            viewModel = this._getViewModel();
            position = this._findDataPosition(pageId);

            if (position !== null) {
                return viewModel.pagesList()[position.level].pages()[position.index];
            }

            return null;
        },

        _getEmptyPageData: function() {
            return {
                id:   0,
                parentId: 0,
                name: '',
                thumbnail: '',
                largeThumbnail: '',
                childCount: 0,
                isspecial: false,
                publishDate: ''
            };
        },

        _clonePageData: function(data) {
            return {
                id: data.id,
                parentId: data.parentId,
                name: data.name,
                thumbnail: data.thumbnail,
                childCount: data.childCount,
                isspecial: data.isspecial,
                publishDate: data.publishDate,
                pages: data.pages,
                timestamp: (new Date()).getTime()
            };
        },

        _scrollToSelectedPage: function() {
            var selectedPage, $listItem, $pagesList, containerScroller;

            selectedPage = this._getViewModel().selectedPage();

            if (selectedPage.id > 0) {
                // Prevent scroll if click has been triggered by item-can-be-parent-list
                if ($(this.container.selector).find('.item-can-be-parent-list').length > 0) {return;}

                $listItem = this.container.find('li[data-page-id="' + selectedPage.id + '"]');
                $pagesList = $listItem.parents('.pages-list');
                containerScroller = this.container.find('.pages-list-scroller');

                if ($pagesList.hasClass('jspScrollable') && $pagesList.data('jsp')) {
                    $pagesList.data('jsp').scrollToElement($listItem[0], true, true);
                }

                if (containerScroller.hasClass('jspScrollable') && containerScroller.data('jsp')) {
                    containerScroller.data('jsp').scrollToElement($pagesList[0], true, true);
                }
            }
        },

        _pageExist: function(parentId) {
            var pagesList, i;

            pagesList = this._getViewModel().pagesList();

            for (i = 0; i < pagesList.length; i++) {
                if (pagesList[i].parentId == parentId) {
                    return true;
                }
            }

            return false;
        },

        _resizeContentContainer: function(resetContainer) {
            // Resize content container
            var panel, headerHeight, marginTop, restHeight;

            panel = this.panel;
            headerHeight = this.container.parent().prev().outerHeight();
            marginTop = parseInt(this.container.parent().css('margin-top'));
            restHeight = (marginTop > headerHeight ? marginTop : headerHeight) +
                parseInt(this.container.css('margin-top')) +
                panel.find('div.title-container').outerHeight() +
                parseInt(this.container.css('margin-bottom')) +
                this.container.next().outerHeight();

            this.container.css('height', $(window).height() - restHeight);

            this._initScrollView(resetContainer);
        },

        _initScrollView: function (resetContainer, callback) {
            var handler, inDrag, $pagesList, bottomSpace, scrollContainer, totalWidth;

            handler = this;
            inDrag = this._getViewModel().inDrag();

            if (this._supressUI) {
                if (typeof callback == "function") {
                    callback.call(this);
                }

                return;
            }

            $pagesList = this.container.find('.pages-list-container div.pages-list');
            bottomSpace = this._getViewModel().viewType() === 'templates' ? 30 : 54;
            $pagesList.css('height', this.container.height() - bottomSpace).each(function() {
                var scrollContent = $(this);

                scrollContent.removeClass('animate');

                // Update ul opened height (space to drop)
                var padding = parseInt(scrollContent.css('padding-top')) + parseInt(scrollContent.css('padding-bottom'));
                if (padding == 0) { //jspPane may take the padding value
                    padding = parseInt(scrollContent.find('.jspPane').css('padding-top')) + parseInt(scrollContent.find('.jspPane').css('padding-bottom'));
                }

                scrollContent.find('ul:first').css({
                    'min-height': (scrollContent.innerHeight() - padding) + 'px'
                });

                if (scrollContent.data('jsp')) {
                    scrollContent.data('jsp').reinitialise();
                } else {
                    scrollContent.jScrollPane({contentWidth: scrollContent.width()});
                }
            });

            scrollContainer = this.container.find('.pages-list-scroller');

            if (resetContainer) {
                // Reset the list container width
                totalWidth = 0;
                $pagesList.each(function() {
                    var self = $(this);
                    if (self.css('display') === 'none') {return true;} // Continue next elment if this is hidden
                    totalWidth += self.outerWidth() + parseInt(self.css('margin-left'));
                });
                this.container.find('.pages-list-container').width(totalWidth);

                if (scrollContainer.data('jsp')) {
                    scrollContainer.data('jsp').destroy();
                    scrollContainer = this.container.find('.pages-list-scroller');
                }

                scrollContainer.css('height', handler.container.height());
                scrollContainer.find('> .jspContainer .shadow').height($pagesList.outerHeight(true));
                scrollContainer.jScrollPane().on('jsp-scroll-x', function (e, offset, isLeft) {
                    var $this = $(this);
                    if (!isLeft) {
                        if ($this.find('> .jspContainer .shadow').length == 0) {
                            var $shadow = $('<div class="shadow" />');
                            $this.find('> .jspContainer').append($shadow);
                            $shadow.height($pagesList.outerHeight(true));
                        }
                    } else {
                        $this.find('> .jspContainer .shadow').remove();
                    }
                });
                handler.container.find('.pages-list-scroller > .jspContainer').css('height', handler.container.height());

                handler._scrollToSelectedPage();

                if (typeof callback === 'function') {
                    callback.call(this);
                }
            }

            setTimeout(function() {
                $pagesList.addClass('animate');
            }, 100);
        },

        _removeListScrollView: function() {
            this.container.find('.pages-list-container div.pages-list').each(function () {
                var scrollContent = $(this);
                if (scrollContent.data('jsp')) {
                    scrollContent.data('jsp').destroy();
                }
            });

            this.container.find('.pages-list-container div.pages-list').addClass('animate');
        },

        _initDrag: function () {
            var handler, viewModel, lists, droppables;

            handler = this;
            viewModel = this._getViewModel();

            lists = this.container.find('.pages-list ul');

            droppables = $('.pagehierarchy-container .pages-list ul li');

            droppables.droppable({
                hoverClass: 'item-can-be-parent-list',

                // Open childs on over (wating some time)
                over: function () {
                    var self = $(this);
                    setTimeout(function() {
                        if (self.hasClass('item-can-be-parent-list')) {
                            self.trigger('click'); // Triggers _addPagesList
                        }
                    }, OVER_TIME_TO_OPEN_PAGE_CHILDS);
                },

                // Drop directly on item
                drop: function (event, ui) {
                    var self, item;

                    // Prevent add to list (sortable) on drop on droppable element
                    if ($(event.target).hasClass('page-drag-target')) {
                        dropOnDroppable = false;
                        return;
                    }

                    dropOnDroppable = true;

                    if (!uiOnDragStart) {return;}

                    self = $(this);
                    if (self.hasClass('page-drag-target')) {return;}

                    item = jQuery.extend({}, uiOnDragStart.item);
                    uiOnDragStart = null;

                    function updateHirerarchy() {
                        var sourcePageId, sourceIndex, sourceFind, targetId, targetIndex, targetFind;

                        pageDropped = {
                            item: $(ui.draggable[0]),
                            helper: $(ui.helper[0])
                        };

                        sourcePageId = item.data('page-id');
                        sourceUl     = item.parent();
                        sourceFind   = handler._findDataPosition(sourcePageId);
                        source       = viewModel.pagesList()[sourceFind.level].pages()[sourceFind.index];
                        sourceData   = handler._clonePageData(source);

                        targetId     = self.data('page-id');

                        if (targetId === sourceFind.parentId) {return;}

                        targetFind  = handler._findDataPosition(targetId);
                        target      = viewModel.pagesList()[targetFind.level].pages()[targetFind.index];

                        setTimeout(function removeItemAndCallToUpdate() {
                            var newPagesArray, allowDrop;

                            allowDrop = handler._allowDrop(sourcePageId, targetFind.level);
                            if (!allowDrop) {
                                handler.utility.notify(handler.resx.pages_DragInvalid);
                                sourceUl.sortable('cancel');

                                // After call cancel method, refresh page data to let ko populate DOM tree.
                                viewModel.pagesList()[sourceFind.level].pages.splice(sourceFind.index, 1, sourceData);
                                ko.cleanNode(item[0]);
                                item.remove();

                                return;
                            }

                            // Remove page from UI
                            sourceUl.sortable('cancel');
                            viewModel.pagesList()[sourceFind.level].pages.splice(sourceFind.index, 1);
                            ko.cleanNode(item[0]);
                            item.remove();

                            // Add source page as first child of target page
                            params = {
                                pageId:   sourcePageId,
                                parentId: targetId,
                                action:   'parent',
                                relatedPageId: -1 // Not necesary for parent
                            };

                            movePage200Callback = function(data) {
                                var targetDataPosition, targetData, index, sourceParentId, sourceParentFind, sourceParentData;

                                if (data.Status > 0) {
                                    // Error: inform
                                    handler.utility.notify(handler.resx['pagesettings_Errors_' + data.Message]);

                                    // TODO test if elment is restored
                                    viewModel.pagesList()[sourceFind.level].pages.splice(sourceFind.index, 0, sourceData);

                                    draggingJqObj = null;
                                    uiOnDragStart = null;

                                    dropOnDroppable = false;

                                    return;
                                }

                                // No errors, add elemnt to UI
                                sourceData.url = data.Page.url;
                                sourceData.parentId = data.Page.parentId;

                                // Update target child count
                                // If element moved to element below in same list
                                // index will be target - 1
                                if (sourceFind.level === targetFind.level && sourceFind.index < targetFind.index) {
                                    index = targetFind.index - 1;
                                } else {
                                    index = targetFind.index;
                                }

                                targetData = handler._clonePageData(viewModel.pagesList()[targetFind.level].pages()[index]);
                                targetData.childCount += 1;
                                viewModel.pagesList()[targetFind.level].pages.splice(index, 1, targetData);

                                if (sourceFind.parentId != -1) {
                                    sourceParentFind = handler._findDataPosition(sourceFind.parentId);
                                    sourceParentData = handler._clonePageData(viewModel.pagesList()[sourceParentFind.level].pages()[sourceParentFind.index]);
                                    sourceParentData.childCount -= 1;
                                    viewModel.pagesList()[sourceParentFind.level].pages.splice(sourceParentFind.index, 1, sourceParentData);
                                }

                                // If target page is open add page because otherwise it will be painted on wrong level
                                if (self.hasClass('selected') && viewModel.pagesList()[data.Page.level] !== undefined) {
                                    viewModel.pagesList()[data.Page.level].pages.push(sourceData);
                                }

                                // ??
                                $(".btn_showsite").data('need-refresh', true);

                                draggingJqObj = null;
                                uiOnDragStart = null;

                                // Reactivate droppables/sortables
                                setTimeout(function reinitDragAndDrop() {
                                    handler._initDrag();
                                }, 0);
                                viewModel.dragPage(handler._getEmptyPageData());
                                if (viewModel.isNew()) {
                                    viewModel.isNew(false);
                                    handler._enterEditMode(data.Page);
                                }

                                dropOnDroppable = false;
                            };

                            movePageErrorCallback = function (data) {
                                // Error: inform - handler.resx.workflows_unknown_error
                                handler.utility.notify('Unknown error');

                                draggingJqObj = null;
                                uiOnDragStart = null;

                                // TODO test if elment is restored
                                viewModel.pagesList()[sourceFind.level].pages.splice(sourceIndex, 0, sourceData);

                                dropOnDroppable = false;

                                return;
                            };

                            // Tray to move by api call
                            handler._getService().get('MovePage', params, movePage200Callback, movePageErrorCallback);
                        }, 0);
                    }

                    updateHirerarchy();
                }
            });

            lists.each(function () {
                var $self = $(this), triggerClickPage;

                $self.sortable({
                    connectWith: '.pagehierarchy-container .pages-list ul',
                    dropOnEmpty: true,
                    cursor: '',
                    cursorAt: { left: 110, top: 10 },
                    handle: 'span.drag-area',
                    placeholder: 'page-drag-target',
                    tolerance: 'intersect',
                    revert: false,
                    helper: function (event, ui) {
                        var $dragItem, data;

                        $dragItem = $('<div class="page-drag-helper"></div>')
                                            .append('<span class="icon" />')
                                            .append(ui.find('span.field-name').html())
                                            .appendTo(handler.container);

                        data = ko.dataFor(ui[0]);

                        if (data && data.childCount > 0) {
                            $dragItem.addClass('page-drag-multiple');
                        }

                        return $dragItem;
                    },

                    start: function (event, ui) {
                        uiOnDragStart = {
                            item: $(ui.item)
                        };
                        draggingJqObj = $(ui.item[0]);
                        handler.container.find('div.pages-drag-container').hide();
                    },

                    beforeStop: function(event, ui) {
                        if (dropOnDroppable) {
                            $(this).sortable('cancel');
                            dropOnDroppable = false;
                        }
                    },

                    receive: function (event, ui) {
                    },

                    over: function (event, ui) {
                    },

                    sort: function(event, ui) {
                        ui.placeholder.html(ui.helper.html());
                    },

                    stop: function (event, ui) {
                        var item, sourcePageId, sourceUl, sourceFind, sourceParentId, sourceParentFind,
                        isDragItem, $pageList, level, parentId, pageId, index, find,
                        movePageData, allowDrop, pageItem, moveAction, relatedPageId, params;

                        if (!uiOnDragStart) {return;}

                        item = jQuery.extend({}, uiOnDragStart.item);
                        uiOnDragStart = null;
                        draggingJqObj = null;

                        // Remove hidden lists created when dragging for prevent
                        // view change (list/deail list) revelating this lists
                        $('.pages-list.removeMe').each(function removeHiddenLevels() {
                            ko.cleanNode(this);
                            $(this).remove();
                        });

                        // Means drag from drag container, which always need post data.
                        isDragItem = ui.item.find('> div').hasClass('drag-item');

                        $pageList = ui.item.parents('.pages-list:eq(0)');
                        level = $pageList.data('page-level');
                        parentId = $pageList.data('parent-id');
                        pageId = ui.item.data('page-id');
                        index = ui.item.parent().find('> li').index(ui.item);
                        find = handler._findDataPosition(pageId);

                        if (!isDragItem && find && find.level == level && find.index == index) {
                            return;
                        }

                        movePageData = viewModel.pagesList()[find.level].pages()[find.index];

                        allowDrop = handler._allowDrop(pageId, level);
                        if (!allowDrop) {
                            handler.utility.notify(handler.resx.pages_DragInvalid);
                            $self.sortable('cancel');

                            // After call cancel method, refresh page data to let ko populate DOM tree.
                            viewModel.pagesList()[find.level].pages.splice(find.index, 1, handler._clonePageData(movePageData));
                            ko.cleanNode(ui.item[0]);
                            ui.item.remove();

                            return;
                        }

                        moveAction = "after";
                        relatedPageId = -1;

                        if (ui.item.prev().length === 0 && ui.item.next().length === 0) {
                            if (isDragItem && parentId === undefined) {
                                // If release drag item not in pane, then append it as last item in root.
                                ui.item.remove();
                                viewModel.inDrag(false);
                                pageItem = $('li[data-page-id="' + pageId + '"] > div');
                                pageItem.show();

                                handler._needScrollToSelectedPage = true;
                                viewModel.selectedPage(movePageData);
                                viewModel.dragPage(handler._getEmptyPageData());

                                return;
                            } else {
                                moveAction = "parent";
                            }

                        } else if (ui.item.prev().length === 0) {
                            moveAction = "before";
                            relatedPageId = ui.item.next().length > 0 ? ui.item.next().data('page-id') : relatedPageId;
                        } else  {
                            relatedPageId = ui.item.prev().data('page-id');
                        }

                        params = {
                            pageId: pageId,
                            parentId: parentId,
                            action: moveAction,
                            relatedPageId: relatedPageId
                        };

                        handler._getService().get('MovePage', params, function(data) {
                            var pageData, sourceParentFindB, targetId, targetFind, targetFindB;

                            if (data.Status > 0) {
                                handler.utility.notify(handler.resx['pagesettings_Errors_' + data.Message]);
                                $self.sortable('cancel');

                                // After call cancel method, refresh page data to let ko populate DOM tree.
                                viewModel.pagesList()[find.level].pages.splice(find.index, 1, handler._clonePageData(movePageData));
                                ko.cleanNode(ui.item[0]);
                                ui.item.remove();

                                return;
                            }

                            targetId = data.Page.parentId;
                            pageData = ko.dataFor(ui.item[0]);
                            pageData.url = data.Page.url;
                            pageData.parentId = data.Page.parentId;

                            sourceParentFind = handler._findDataPosition(find.parentId);
                            targetFind = handler._findDataPosition(targetId);
                            handler._updatePagePosition(pageData, level, index);
                            targetFindB = handler._findDataPosition(targetId);
                            sourceParentFindB = handler._findDataPosition(find.parentId);

                            // Update source parent child counter if not yet
                            if (find.parentId != -1 && sourceParentFind.childCount === sourceParentFindB.childCount) {
                                sourceParentData = handler._clonePageData(viewModel.pagesList()[sourceParentFind.level].pages()[sourceParentFind.index]);
                                sourceParentData.childCount -= 1;
                                viewModel.pagesList()[sourceParentFind.level].pages.splice(sourceParentFind.index, 1, sourceParentData);
                            }

                            // Update target parent child counter if not yet
                            if (targetFind && targetFind.childCount === targetFindB.childCount) {
                                sourceParentData = handler._clonePageData(viewModel.pagesList()[targetFind.level].pages()[targetFind.index]);
                                sourceParentData.childCount += 1;
                                viewModel.pagesList()[targetFind.level].pages.splice(targetFind.index, 1, sourceParentData);
                            }

                            if (isDragItem) {
                                viewModel.inDrag(false);

                                handler._needScrollToSelectedPage = true;
                                viewModel.selectedPage(pageData);
                                viewModel.dragPage(handler._getEmptyPageData());

                                if (pageData.isCopy) {
                                    handler._enterEditMode(pageData);
                                }
                            }

                            $(".btn_showsite").data('need-refresh', true);

                            ko.cleanNode(ui.item[0]);
                            ui.item.remove();

                            // Reactivate droppables/sortables
                            setTimeout(function reinitDragAndDrop() {
                                // $('.pages-list-container .pages-list li[data-page-id="' + pageId + '"]').removeClass('selected');
                                handler._initDrag();
                            }, 0);

                            //CONTENT-3704 enter into Edit mode
                            if (viewModel.isNew()) {
                                viewModel.isNew(false);
                                handler._enterEditMode(pageData);
                            }
                        });
                    }
                });

                // If we are in middle of dragging action, need to refresh
                // sortable elements to update lists conections
                if (draggingJqObj) {
                    setTimeout(function () {
                        $('.pages-list ul').each(function () {
                            $(this).sortable('refresh');
                        });
                    }, 0);
                }

                return true;
            });
        },

        _allowDrop: function(pageId, level) {
            if (level === 0) {
                return true;
            }

            var $pagesList = this.container.find('.pages-list-container .pages-list');
            var $currentList = this.container.find('.pages-list-container .pages-list[data-parent-id="' + pageId + '"]');

            return $currentList.length === 0 || $pagesList.index($currentList) > level;
        },

        _updatePagePosition: function(page, level, index) {
            var viewModel, pagesList, originalPosition, originalLevel, parentId,
                addOffset, find, pageData;

            viewModel = this._getViewModel();
            pagesList = viewModel.pagesList();
            originalPosition = this._findDataPosition(page.id);

            // Page was moved in other function
            if (!originalPosition) {return;}

            originalLevel = originalPosition.level;

            pagesList[originalLevel].pages.splice(originalPosition.index, 1);
            pagesList[level].pages.splice(index, 0, page);

            // Update child count of parent page
            parentId = -1;
            addOffset = 0;

            if (level > originalLevel) { //move as child so need add parent's child count.
                parentId = pagesList[level].parentId;
                addOffset = 1;
            } else if (level < originalLevel) { //move from child so need reduce parent's child count.
                parentId = pagesList[originalLevel].parentId;
                addOffset = -1;
            }

            if (parentId > 0) {
                find = this._findDataPosition(parentId);

                if (find) {
                    pageData = this._clonePageData(pagesList[find.level].pages()[find.index]);
                    pageData.childCount += addOffset;
                    pagesList[find.level].pages.splice(find.index, 1, pageData);

                    if (viewModel.selectedPage().id == pageData.id) {
                        viewModel.selectedPage(pageData);
                    }
                }
            }

            if (originalLevel != level && viewModel.selectedPage().id == page.id) {

                viewModel.pagesList.remove(function(data) {
                    return data.level >= originalLevel;
                });
                //viewModel.selectedPage(this._getEmptyPageData()); // cannot read property 'nodeType' of undefined
                viewModel.selectedPage(page);
            }

            this._initScrollView();
        },

        _computeSelectedPagePath: function() {
            var selectedPage, selectedPagePath, find, i, parentId, $pageItem, pageData;

            selectedPage = this._getViewModel().selectedPage();
            selectedPagePath = this._getViewModel().selectedPagePath;
            selectedPagePath.removeAll();

            if (selectedPage.id) {
                selectedPagePath.push(selectedPage);
                find = this._findDataPosition(selectedPage.id);

                if (find) {
                    for (i = find.level; i > 0; i--) {
                        parentId = this.container.find('.pages-list[data-page-level="' + i + '"]').data('parent-id');
                        $pageItem = this.container.find('li[data-page-id="' + parentId + '"]');
                        pageData = ko.dataFor($pageItem[0]);
                        selectedPagePath.splice(0, 0, pageData);
                        return;
                    }
                }
            }
        },

        _getViewModel: function() {
            var handler = this;

            if (typeof this._viewModel.pagesList == "undefined") {
                this._viewModel.pagesList = ko.observableArray([]);
                this._viewModel.resx = handler.resx;
                this._viewModel.selectedPage = ko.observable(handler._getEmptyPageData());
                this._viewModel.dragPage = ko.observable({id: 0, name: '', thumbnail: '', status: '', publishDate: '', childCount: 0});
                this._viewModel.inDrag = ko.observable(false);
                this._viewModel.isNew = ko.observable(false);
                this._viewModel.selectedPagePath = ko.observableArray([]);
                this._viewModel.viewType = ko.observable('hierarchy');
                this._viewModel.searchKeyword = ko.observable('');
                this._viewModel.searchFocus = ko.observable(true);
                this._viewModel.deletedPagesCount = ko.observable(0);

                this._viewModel.selectedPage.subscribe($.proxy(this._selectedPageChanged, this));
                this._viewModel.inDrag.subscribe($.proxy(this._toggleViewChanged, this));
                this._viewModel.viewType.subscribe($.proxy(this._viewTypeChanged, this));

                this._viewModel.pageItemClick = $.proxy(this._pageItemClickHandler, this);
                this._viewModel.viewPageClick = $.proxy(this._viewPageClickHandler, this);
                this._viewModel.editPageClick = $.proxy(this._editPageClickHandler, this);
                this._viewModel.settingsPageClick = $.proxy(this._settingsPageClickHandler, this);
                this._viewModel.deletePageClick = $.proxy(this._deletePageClickHandler, this);
                this._viewModel.doSelectPage = $.proxy(this._selectPage, this);

                this._viewModel.searchKeyDown = $.proxy(this._searchKeywordsChangedHandler, this);
                this._viewModel.searchKeyUp = $.proxy(this._searchKeywordsChangedHandler, this);
                this._viewModel.doSearch = $.proxy(this._searchPage, this);

                this._viewModel.mouseOverThumbnail = $.proxy(this._mouseOverThumbnailHandler, this);
                this._viewModel.mouseOutThumbnail = $.proxy(this._mouseOutThumbnailHandler, this);

                this._viewModel.toggleView = $.proxy(this._toggleViewClickHandler, this);
            }
            return this._viewModel;
        },

        _getService: function () {
            this.utility.sf.moduleRoot = "EvoqContentLibrary";
            this.utility.sf.controller = "PageManagement";

            return this.utility.sf;
        },
    };

    pageHierarchyDefaultOptions = {
        delayTime: 500,
        requestDelayTime: 2000,
        requestTimeout: 4000,
        defaultThumbnail: 'fallback-thumbnail.png'
    };

    if (!dnn.dnnPageHierarchy) {
        dnn.dnnPageHierarchy = new pageHierarchyManager();
    }

    return dnn.dnnPageHierarchy;
});
