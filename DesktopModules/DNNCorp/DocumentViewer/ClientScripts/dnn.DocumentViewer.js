; if (typeof window.dnn === "undefined" || window.dnn === null) { window.dnn = {}; }; //var dnn = dnn || {};

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

(function ($, ko, window, document, undefined) {
    "use strict";

    var DocumentViewer = this.DocumentViewer = function (options) {
        this.element = $('#' + options.treeElementId)[0];
        this.options = options;

        this.init();
    };

    DocumentViewer.prototype = {
        
        constructor: DocumentViewer,

        init: function () {

            // Place initialization logic here
            // You already have access to the DOM element and the options via the instance, 
            // e.g., this.element and this.options
            this.options = $.extend({}, DocumentViewer.defaults(), this.options);

            this.$this = $(this);
            this.$element = $(this.element);
            this.$dnnSF = $.dnnSF().ServicesFramework(this.options.moduleId);
            this.$scope = $('#' + this.options.scopeWrapperId);

            this._loadingPanel = $('#' + this.options.loadingPanelId, this.$scope);
            this._breadCrumbs = $('#dnnDocumentViewerBreadcrumb ul', this.$scope);
            this._serviceUrl = this.$dnnSF.getServiceRoot(this.options.services.serviceRoot);

            var $contentPane = $('#' + this.options.contentPaneId, this.$scope);

            $('#' + this.options.gridContainerId, this.$scope).jScrollbar();

            this.options.documentViewer = this;

            this._gridViewModel = new GridViewModel(this.options);
            ko.applyBindings(this._gridViewModel, $contentPane[0]);
            ko.applyBindings(this, document.getElementById(this.options.contextMenuId));

            this._initContext();
            this._initByContext(this.selectionContext);
        },

        _initContext: function () {
            if (this.options.filterViewSettings.filterOption == 'FilterByTags') {

                this.selectionContext = this.options.filterViewSettings.filterOption;
            } else if (this.options.filterViewSettings.filterOption == "FilterByFolder" && this.options.filterViewSettings.excludeSubfolders) {

                this.selectionContext = "FilterByFixedFolder";
            } else if (this.options.initialViewSettings.valid) {

                this.selectionContext = this.options.initialViewSettings.initialContext;
            } else {
                this.selectionContext = this.options.defaultSelectionContext;
            }            
        },

        _initByContext: function (context) {

            switch (context) {
            case "Tags":
            case "Folders":
                {
                    if (this.options.filterViewSettings.filterOption == "FilterByFolder") {

                        if (!this.options.filterViewSettings.excludeSubfolders) {
                            this._initTreeView();
                        }
                    } else {

                        var $tagsPanel = $('#' + this.options.tagsPanelId, this.$scope);
                        this._tagsViewModel = new TagsViewModel(this.options);
                        ko.applyBindings(this._tagsViewModel, $tagsPanel[0]);

                        this._initTreeView();
                        this._getTags();
                    }                    
                    break;
                }
            }

            this._getGridContent();
            this._applyFilterViewUIChanges();
        },
        
        _setInitialView: function() {
            if (!this.options.initialViewSettings.valid) {
                return;
            }
            switch(this.options.initialViewSettings.initialContext) {
                case "Folders":
                    this._updateBreadcrumb();
                    this.refresh();
                    break;
                case "Tags":
                    var tags = this._tagsViewModel.tags();
                    for (var i = 0; i < tags.length; i++) {
                        if (tags[i].Name == this.options.initialViewSettings.initialValue) {
                            this._tagsViewModel.selectTag(tags[i]);
                        }
                    }
                    break;
            }
        },

        _initTreeView: function () {
            var stateElementId = this.options.internalStateFieldId;
            if (stateElementId) {
                this._stateElement = document.getElementById(stateElementId);
            }

            if (!this._treeView) {
                this._onItemsLoadedHandler = $.proxy(this._onItemsLoaded, this);
                this._treeView = this._createTreeView();
                if (this.options.initialViewSettings.valid && this.options.initialViewSettings.initialContext == "Folders") {
                    this._treeView.selectedId(this.options.initialViewSettings.initialValue);
                } else {
                    this._treeView.selectedId(this.options.rootFolderId);
                }                
                this._treeView.controller.getTreeWithItem(this._treeView.selectedId(), '', this._onItemsLoadedHandler);
            }
        },

        _onChangeContext: function (oldContext) {
            switch (oldContext) {
            case "Tags":
                {
                    this._tagsViewModel.selectedTag(null);
                    break;
                }
            case "Folders":
                {
                    this._treeView.selectedId(null);
                    break;
                }
            }
        },

        _setContext: function (context) {
            if (context && context != this.selectionContext) {
                this._onChangeContext(this.selectionContext);
                this.selectionContext = context;
            }
        },

        selectedItem: function (item) {
            if (typeof item === "undefined") {
                // getter:
                var state = this._internalState();
                return state ? state.selectedItem : null;
            }
            // setter:
            this._internalState({ selectedItem: item });
            if (this._treeView) {
                this._treeView.selectedId(item ? item.key : null);
            }
            return item;
        },

        openFolder: function (folderId) {
            var nodeContext = this._treeView.selectedNode();
            if (!nodeContext.hasChildren()) {
                var onLoadChildNodesHandler = $.proxy(this._onLoadChildren, this, nodeContext, folderId);
                this._treeView.controller.getChildren(nodeContext.data.id, '', '', onLoadChildNodesHandler);
            } else {
                this._treeView.selectedId(folderId + '');
                this.refresh();
            }
        },

        toggleLeftPane: function (toggleButton) {
            var leftPane = $(".dnnDocumentViewerLeftPane", this.$scope);
            var contentPane = $("#" + this.options.contentPaneId, this.$scope);
            
            var isLeftPaneVisible = leftPane.is(":visible");

            var left = isLeftPaneVisible ? 0 : 220;
            toggleButton.toggleClass("treeViewHide", !isLeftPaneVisible);
            toggleButton.toggleClass("treeViewShow", isLeftPaneVisible);

            leftPane.animate({ width: 'toggle' }, 500);

            var gridContainer = $('#' + this.options.gridContainerId, this.$scope);
            contentPane.animate({ 'margin-left': left }, 500, 'swing', function() {
                gridContainer.jScrollbar("update");
            });
            this._loadingPanel.css({ 'left': left });
        },

        refresh: function () {
            this._gridViewModel.refresh();
        },
        
        _internalState: function (stateObject) {
            if (typeof stateObject === "undefined") {
                // getter:
                if (typeof this._state === "undefined") {
                    try {
                        this._state = (this._stateElement && this._stateElement.value) ?
                            JSON.parse(this._stateElement.value) : null;
                    }
                    catch (ex) {
                    }
                }
                return this._state;
            }
            else {
                // setter:
                if (this._stateElement) {
                    var stateAsJson = stateObject ? JSON.stringify(stateObject) : "";
                    this._stateElement.value = stateAsJson;
                }
                this._state = stateObject;
            }
            return this._state;
        },
        
        _createTreeView: function () {
            var options = this.options.services;
            options.moduleId = this.options.moduleId;

            var controller = new dnn.DynamicTreeViewController(options);
            var treeView = new dnn.DynamicTreeView(this.$element[0], this.options, controller);

            var onChangeNodeHandler = $.proxy(this._onChangeNode, this);
            $(treeView).on("onchangenode", onChangeNodeHandler);

            var onSelectNodeHandler = $.proxy(this._onSelectNode, this);
            $(treeView).on("onselectnode", onSelectNodeHandler);

            $(treeView).on("onexpandnode", $.proxy(this._onExpandNode, this));
            
            var self = this;
            
            $("#" + this.options.treeElementId).on("contextmenu", "li", function (e) {                
                var nodeContext = self._treeView._tree.nodeContext(this);
                if (e.button == 2) {                                      
                    self.contextMenuClick(nodeContext, e);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            return treeView;
        },

        _onItemsLoaded: function (rootNode) {
            this._treeView.rootNode(rootNode);
            this._setInitialView();
        },
        
        _onExpandNode: function (eventObject, nodeContext) {
            var onLoadChildNodesHandler = $.proxy(this._onLoadChildren, this, nodeContext, null);
            this._treeView.controller.getChildren(nodeContext.data.id, '', '', onLoadChildNodesHandler);
        },
        
        _onLoadChildren: function (nodeContext, folderId, children) {
            this._treeView.showChildren(nodeContext, children);
            
            if (folderId) {
                this._treeView.selectedId(folderId + '');
                this.refresh();
            }           
        },
        
        contextMenuClick: function (nodeContext, event) {
            var $menu = $('#' + this.options.contextMenuId);
            $menu.hide();

            this.contextMenuNode = nodeContext;
            var $fileItems = $('#' + this.options.contextMenuId + "> .onlyFiles");
            $fileItems.hide();
            
            $menu.css({ left: event.pageX, top: event.pageY }).slideDown(200);
            $(document).on("click.dnnDocumentViewer", function () {
                $menu.hide();
                $(document).off("click.dnnDocumentViewer");
            });            
        },

        _updateBreadcrumb: function () {
            
            switch (this.selectionContext) {
                case "Tags": {
                    var label = this.options.resources.tagSelectedText.replace("[TAG]", this._tagsViewModel.selectedTag().Name);
                    this._updateStaticBreadcrumb(label);
                    break;
                }
                case "Folders": {
                    this._updateTreeViewBreadcrumb(this._treeView.selectedNode());
                    break;
                }
            }
        },
            
        _updateStaticBreadcrumb: function(text) {
            this._breadCrumbs.html('');
            this._breadCrumbs.append($("<li />").text(text).attr("title", text));
        },
            
        _updateTreeViewBreadcrumb: function (node) {
            if (node == null) return;
            var self = this;
            this._breadCrumbs.html('');
            var path = this._treeView.selectedPath();            
            for (var i = 0; i < path.length - 1; i++) {
                var a = $("<a href='#' />")
                .text(path[i].name)
                .attr("title", path[i].name)
                .attr("data-folderid", path[i].id)
                .click(function (e) {
                    e.preventDefault();
                    self._treeView.selectedId($(this).attr('data-folderid'));
                    self.refresh();
                });

                var li = $("<li class='dnnDocumentViewerBreadcrumbLink' />").append(a);
                this._breadCrumbs.append(li);
            }
            
            this._breadCrumbs.append($("<li />").text(node.data.name).attr("title", node.data.name));
        },
               
        _callGet: function (data, onLoadHandler, onAlwaysHandler, method) {
            //$.extend(data, this.parameters.entries());
            var serviceSettings = {
                url: this._serviceUrl + method,
                beforeSend: this.$dnnSF.setModuleHeaders,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: data,
                type: "GET",
                async: true
            };
            $.ajax(serviceSettings)
                .done(onLoadHandler)
                .fail($.onAjaxError)
                .always(onAlwaysHandler);
        },
        
        _onSelectNode: function (eventObject, node) {
            this._gridViewModel.currentPage(0);
            this._getGridContent("Folders");
        },

        _getTags: function () {
            
            var onGetTagsHandler = $.proxy(this._onGetTags, this);
            var onGetTagsAlways = $.proxy(this._onGetTagsAlways, this);
            
            this._tagsViewModel.isLoadingTags(true);
            
            this._callGet({
                ascending: this._tagsViewModel.sortedOrder() == 'asc',
                numItems: this._tagsViewModel.pageSize(),
                orderBy: this._tagsViewModel.sortedBy(),
                startIndex: this._tagsViewModel.startIndex()
            }, onGetTagsHandler, onGetTagsAlways, this.options.services.getTagsMethod);
        },

        _onGetTags: function (data) {
            this._tagsViewModel.totalCount(data.TotalCount);
            this._tagsViewModel.tags(data.Tags);
            this._setInitialView();
        },
        
        _onGetTagsAlways: function () {
            this._tagsViewModel.isLoadingTags(false);
        },

        _getGridContent: function (context) {

            this._setContext(context);

            var parameters = {
                startIndex: this._gridViewModel.currentPage() * this._gridViewModel.pageSize(),
                numItems: this._gridViewModel.pageSize(),
                sort: this._gridViewModel.sortExpression()
            };
            var serviceUrl = "";
            
            switch (this.selectionContext) {
            
                case "Tags": { 
                        parameters = $.extend(parameters, {
                            tags: (this.options.initialViewSettings.valid && this.options.initialViewSettings.initialContext == "Tags") ? this.options.initialViewSettings.initialValue : this._tagsViewModel.selectedTag().Name
                        });
                        serviceUrl = this.options.services.getFilesByTagMethod;
                        break;
                 }
                 case "Folders": { 
                        parameters = $.extend(parameters, {
                            folderId: this._treeView.selectedId()
                        });
                        serviceUrl = this.options.services.getFolderContentMethod;
                        break;
                 }
                 case "FilterByTags": {
                     parameters = $.extend(parameters, {
                         tags: this.options.filterViewSettings.guidanceTags
                     });
                     serviceUrl = this.options.services.getFilesByTagMethod;
                     break;
                 }
                case "FilterByFixedFolder": {
                     parameters = $.extend(parameters, {
                         folderId: this.options.rootFolderId
                     });
                     serviceUrl = this.options.services.getFolderContentMethod;
                 }
             }
            
            this._getGridContentInternal(serviceUrl, parameters);
        },
        
        _applyFilterViewUIChanges: function () {
            
            if (!this.options.filterViewSettings.isLeftPaneVisible) {
                var contentPane = $("#" + this.options.contentPaneId, this.$scope);
                var loadingPanel = $("#" + this.options.loadingPanelId, this.$scope);
                contentPane.css({ 'margin-left': 0 });
                loadingPanel.css({ 'left': 0 });
            }            
        },

        _getGridContentInternal: function (serviceUrl, parameters) {
            this._loadingPanel.show();
            var onGetFolderContentHandler = $.proxy(this._onGetGridContent, this);
            var onGetGridContentAlways = $.proxy(this._onGetGridContentAlways, this);
            
            this._callGet(parameters, onGetFolderContentHandler, onGetGridContentAlways, serviceUrl);
        },

        _onGetGridContent: function (data) {            
            this._gridViewModel.totalCount(data.TotalCount);
            this._gridViewModel.items(data.Items);
            this._updateBreadcrumb();
        },
        
        _onGetGridContentAlways: function () {
            this._loadingPanel.hide();
        },

        _onChangeNode: function (eventObject, node) {
            var item = node ? dnn.TreeNodeConverter.toKeyValue(node.data) : null;
            this.selectedItem(item);

            if (this.options.onSelectionChanged && this.options.onSelectionChanged.length) {
                for (var i = 0, size = this.options.onSelectionChanged.length; i < size; i++) {
                    dnn.executeFunctionByName(this.options.onSelectionChanged[i], window, item);
                }
            }
            if (typeof this.options.onSelectionChangedBackScript === "function") {
                this.options.onSelectionChangedBackScript.apply(this);
            }
        },
        downloadSelectedItem: function () {
            
            this._gridViewModel.downloadSelectedItem();
        },
        
        folderUrl: function(nodeContext) {            
            var siteUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            return siteUrl + location.pathname + "?folderId=" + nodeContext.data.id;
        },

        getUrlSelectedItem: function () {
            var url, label;
            if (this.contextMenuNode != null) {
                url = this.folderUrl(this.contextMenuNode);
                label = this.options.resources.folderUrlLabel;
                this.contextMenuNode = null;
            } else if (this._tagsViewModel && this._tagsViewModel.contextMenuTag() != null) {
                url = this._tagsViewModel.tagUrl(this._tagsViewModel.contextMenuTag());
                label = this.options.resources.tagUrlLabel;
                this._tagsViewModel.contextMenuTag(null);
            } else {
                url = this._gridViewModel.itemUrl(this._gridViewModel.selectedItem());
                label = this._gridViewModel.selectedItem().IsFolder ? this.options.resources.folderUrlLabel : this.options.resources.fileUrlLabel;
            }
            $('#dnnDocumentViewerGetUrlModal input').val(url).select();
            $('#dnnDocumentViewerGetUrlModal span').html(label);
            $('#dnnDocumentViewerGetUrlModal').dialog({
                modal: true,
                autoOpen: true,
                dialogClass: "dnnFormPopup",
                width: 500,
                height: 250,
                resizable: false,
                title: this.options.resources.getUrlTitle,
                buttons:
                    [
                        {
                            id: "close_button",
                            text: this.options.resources.closeText,
                            click: function () {
                                $(this).dialog("close");
                            },
                            "class": "dnnSecondaryAction"
                        }
                    ]
            });
        }

    };

    DocumentViewer._defaults = {};

    DocumentViewer.defaults = function (settings) {
        if (typeof settings !== "undefined") {
            $.extend(DocumentViewer._defaults, settings);
        }
        return DocumentViewer._defaults;
    };

}).apply(dnn, [jQuery, ko, window, document]);


dnn.createDocumentViewer = function (options, methods) {
    $(document).ready(function () {      
        $.extend(options, methods);
        dnn.dnnDocumentViewer = new dnn.DocumentViewer(options);        
    });
};

