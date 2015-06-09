// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

function TagsViewModel(options) {
    var self = this;

    self.isLoadingTags = ko.observable(false);

    self.tags = ko.observableArray();

    self.totalCount = ko.observable(0);

    self.pageSize = ko.observable(15);

    self.startIndex = ko.observable(0);

    self.sortedBy = ko.observable('alpha');

    self.sortedOrder = ko.observable('asc');

    self.sortBy = function (sortByParameter) {

        if (self.sortedBy() == sortByParameter) {

            self.sortedBy(sortByParameter);

            if (self.sortedOrder() == 'asc') {
                self.sortedOrder('desc');
            } else {
                self.sortedOrder('asc');
            }
        } else {

            self.sortedBy(sortByParameter);
            self.sortedOrder('asc');
        }

        self.startIndex(0);
        options.documentViewer._getTags();
    };
    
    self.contextMenuClick = function (tag, event) {
        var $menu = $('#' + options.contextMenuId);
        $menu.hide();

        self.contextMenuTag(tag);
        var $fileItems = $('#' + options.contextMenuId + "> .onlyFiles");
        $fileItems.hide();
        
        $menu.css({ left: event.pageX, top: event.pageY }).slideDown(200);
        $(document).on("click.dnnDocumentViewer", function () {
            $menu.hide();
            $(document).off("click.dnnDocumentViewer");
        });
        
    };

    self.tagUrl = function(tag) {
        var siteUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');        
        return siteUrl + location.pathname + "?tagName=" + encodeURIComponent(tag.Name);        
    };

    self.hasMultiplePages = ko.computed(function () {
        return self.totalCount() > self.pageSize();
    });

    self.pagerLabel = ko.computed(function () {
        return options.resources.tagPagerText
            .replace('[FIRST]', self.startIndex() + 1)
            .replace('[LAST]', self.startIndex() + self.tags().length)
            .replace('[TOTAL]', self.totalCount());
    });

    self.isFirstPage = ko.computed(function () {
        return self.startIndex() == 0;
    });

    self.isLastPage = ko.computed(function () {
        return self.startIndex() + self.pageSize() >= self.totalCount();
    });

    self.prevPage = function () {
        if (self.isFirstPage()) return;

        var startIndex = self.startIndex() - self.pageSize();
        self.startIndex(startIndex);

        options.documentViewer._getTags();
    };

    self.nextPage = function () {
        if (self.isLastPage()) return;

        var startIndex = self.startIndex() + self.pageSize();
        self.startIndex(startIndex);

        options.documentViewer._getTags();
    };

    self.selectedTag = ko.observable(null);
    
    self.contextMenuTag = ko.observable(null);

    self.selectTag = function (data) {
        self.selectedTag(data);
        options.documentViewer._getGridContent("Tags");
    };
}

function ColumnViewModel(name, key, align, width, grid) {
    var self = this;

    self.name = name;
    self.key = key;
    self.align = align;
    self.width = width;

    self.columnWidth = ko.computed(function() {
        if (width == 0) {
            return "inherit";
        }
        return width + "px";
    });

    self.columnCss = ko.computed(function() {
        var result = "";
        if (width == 0) {
            result = "dnnModuleDocumentViewerNoWidthFixedColumn "; 
        }
        if (align == "left") {
            result = result + "dnnModuleDocumentViewerLeftAlignColumn";
        }
        if (align == "right") {
            result = result + "dnnModuleDocumentViewerRightAlignColumn";
        }

        return result;
    });

    self.sortCss = ko.computed(function () {
        if (grid.sortedByColumnName() == key) {
            if (grid.sortedByOrder() == 'asc') return 'sortAsc';

            if (grid.sortedByOrder() == 'desc') return 'sortDesc';
        }
        return 'noSort';
    });
}

function GridViewModel(options) {
    var self = this;

    self.selectedItem = ko.observable(null);

    self.selectItem = function (item) {
        self.selectedItem(!self.selectedItem() || self.selectedItem().ItemId != item.ItemId ? item : null);
    };

    self.itemAction = function (item) {
        if (item.IsFolder) {
            options.documentViewer.openFolder(item.ItemId);
        } else if (item.ViewPermission) {
            window.open(setTimeStamp(self.itemUrl(item)));            
        }
    };

    self.downloadSelectedItem = function () {
        var url = options.documentViewer._serviceUrl + "ContentService/Download?fileId=" + self.selectedItem().ItemId +
            "&ModuleId=" + options.documentViewer.$dnnSF.getModuleId() + "&TabId=" + options.documentViewer.$dnnSF.getTabId() + "&forceDownload=true";

        var $idown = $('#dnnDocumentViewerDownloadIframe');
        if ($idown.length == 0) {
            $idown = $('<iframe>', { id: 'idown' }).hide().appendTo('body');
        }

        $idown.attr('src', url);

    };

    function getTimeStamp() {
        var timestamp = new Date();
        timestamp = timestamp.getTime();
        return "timestamp=" + timestamp;
    }

    function setTimeStamp(url) {
        if (url.indexOf("?") == -1) {
            return url + "?" + getTimeStamp();
        }
        return url + "&" + getTimeStamp();
    }

    self.itemUrl = function(item) {
        if (item.Url.indexOf("http://") == 0 || item.Url.indexOf("https://") == 0) {
            return item.Url;
        }
        var siteUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        if (item.IsFolder) {
            return siteUrl + location.pathname + "?folderId=" + item.ItemId;
        }
        return siteUrl + item.Url;
    };

    self.getUrlSelectedItem = function () {
        var url = self.itemUrl(self.selectedItem());
        $('#dnnDocumentViewerGetUrlModal input').val(url).select();
        $('#dnnDocumentViewerGetUrlModal').dialog({
            modal: true,
            autoOpen: true,
            dialogClass: "dnnFormPopup",
            width: 500,
            height: 250,
            resizable: false,
            title: options.resources.getUrlTitle,
            buttons:
                [
                    {
                        id: "close_button",
                        text: options.resources.closeText,
                        click: function () {
                            $(this).dialog("close");
                        },
                        "class": "dnnSecondaryAction"
                    }
                ]
        });
    };

    self.contextMenuClick = function (item, event) {
        var $menu = $('#' + options.contextMenuId);
        $menu.hide();

        self.selectedItem(item);
        var $fileItems = $('#' + options.contextMenuId + "> .onlyFiles");
        if (self.selectedItem().IsFolder) {            
            $fileItems.hide();
        } else {
            $fileItems.show();
        }

        if (self.canViewItemOptions()) {
            self.openContextMenu($menu, event);
        }        
    };

    self.openContextMenu = function($menu, event) {
        $menu.css({ left: event.pageX, top: event.pageY }).slideDown(200);
        $(document).on("click.dnnDocumentViewer", function () {
            $menu.hide();
            $(document).off("click.dnnDocumentViewer");
        });
    };

    self.canViewFile = ko.computed(function () {
        if (self.selectedItem()) {
            return self.selectedItem().ViewPermission && !self.selectedItem().IsFolder;
        }
        return false;
    });

    self.canViewItemOptions = ko.computed(function () {
        if (self.selectedItem()) {
            return self.canViewFile() || self.selectedItem().IsFolder;
        }
        return false;
    });

    self.sortedByColumnName = ko.observable(options.gridSettings.defaultSortColumnName);
    self.sortedByOrder = ko.observable(options.gridSettings.defaultSortOrder);

    self.sortExpression = ko.computed(function () {
        return self.sortedByColumnName() + ' ' + self.sortedByOrder();
    });

    var columns = [];
    for (var i = 0; i < options.gridSettings.columns.length; i++) {
        var column = options.gridSettings.columns[i];
        columns.push(new ColumnViewModel(column.name, column.key, column.align, column.width, self));
    }

    self.columns = columns;

    self.sortColumn = function (selectedColumn) {

        var sort = '';
        if (self.sortedByColumnName() == selectedColumn.key) {
            if (self.sortedByOrder() == 'asc') sort = 'desc';
            if (self.sortedByOrder() == '') sort = 'asc';
        } else {
            sort = 'asc';
            self.sortedByColumnName(selectedColumn.key);
        }
        
        self.sortedByOrder(sort);
        self.currentPage(0);

        options.documentViewer._getGridContent();
    };

    self.toggleSort = function () {
        var sort = self.sortedByOrder() == 'asc' ? 'desc' : 'asc';
        self.sortedByOrder(sort);
        self.currentPage(0);
        options.documentViewer._getGridContent();
    };

    self.sortColumnChange = function() {
        self.currentPage(0);
        self.sortedByOrder('asc');
        options.documentViewer._getGridContent();
    };

    self.items = ko.observableArray();

    self.items.subscribe(function () {
        if (!self.selectedItem()) return;

        var selectedItem = ko.utils.arrayFirst(self.items(), function (item) {
            return item.ItemId == self.selectedItem().ItemId;
        });

        if (!selectedItem) {
            self.selectedItem(null);
        }
    });

    self.totalCount = ko.observable(0);

    self.pageSize = ko.observable(options.gridSettings.pageSize);

    self.currentPage = ko.observable(0);

    self.pageSlide = ko.observable(2);

    self.lastPage = ko.computed(function () {
        return Math.ceil(self.totalCount() / self.pageSize());
    });

    self.pages = ko.computed(function () {
        var pageCount = self.lastPage();
        var pageFrom = Math.max(1, self.currentPage() - self.pageSlide());
        var pageTo = Math.min(pageCount, self.currentPage() + self.pageSlide());
        pageFrom = Math.max(1, Math.min(pageTo - 2 * self.pageSlide(), pageFrom));
        pageTo = Math.min(pageCount, Math.max(pageFrom + 2 * self.pageSlide(), pageTo));

        var result = [];
        for (var i = pageFrom; i <= pageTo; i++) {
            result.push(i);
        }

        return result;
    });

    self.changePage = function (page) {
        self.currentPage(page);
        options.documentViewer._getGridContent();
        return page;
    };

    self.totalItemsText = ko.computed(function () {
        if (self.totalCount() == 1) {
            return options.resources.oneItem;
        } else if (self.totalCount() < self.pageSize()) {
            return options.resources.items
                .replace('[ITEMS]', self.totalCount());
        } else {
            return options.resources.itemsOnPage
                .replace('[ITEMS]', self.totalCount())
                .replace('[PAGES]', Math.ceil(self.totalCount() / self.pageSize()));
        }
    });

    self.refresh = function () {
        self.currentPage(0);
        options.documentViewer._getGridContent();
    };
};