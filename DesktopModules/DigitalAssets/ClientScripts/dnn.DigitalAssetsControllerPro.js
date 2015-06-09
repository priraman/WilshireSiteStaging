// IE8 doesn't like using var dnnModule = dnnModule || {}
if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };
dnnModule.DigitalAssetsController = dnnModule.DigitalAssetsController || {};

dnnModule.DigitalAssetsController.prototype.isDownloadAvailable = function (items) {
    return true;
};

dnnModule.DigitalAssetsController.prototype.getThumbnailUrl = function(item) {    
    return item.ThumbnailAvailable ? item.ThumbnailUrl + "&" + this.getHttpGETHeaders.call(this) : item.IconUrl;
};

dnnModule.DigitalAssetsController.prototype.getThumbnailClass = function (item) {    
    return !item.ThumbnailAvailable ? 'dnnModuleDigitalAssetsThumbnailNoThumbnail' : 'dnnModuleDigitalAssetsThumbnailImage';
};

dnnModule.DigitalAssetsController.prototype.getContentProServiceUrl = function () {
    return this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/';
};

dnnModule.DigitalAssetsController.prototype.download = function (items, settings) {

    if (!this.isDownloadAvailable.call(this, items)) {
        return false;
    }

    if (items.length == 1 && !items[0].IsFolder) {
        settings.downloadUrl(this.getDownloadServiceUrl.call(this) + "Download?fileId=" + items[0].ItemId + "&" + this.getHttpGETHeaders.call(this));
    } else {
        var contentProServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/';
        var downloadProServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'DownloadServicePro/';

        settings.enableLoadingPanel(true);
        var self = this;
        $.ajax({                        
            url: contentProServiceUrl + "ZipCreate",
            data: {
                Items: items
            },
            type: "POST",
            beforeSend: this.servicesFramework.setModuleHeaders
        }).done(function (data) {
            settings.downloadUrl(downloadProServiceUrl + "ZipDownload?tempFilename=" + encodeURIComponent(data) + "&" + self.getHttpGETHeaders.call(self));
        }).fail(function (xhr) {
            if(!dnnModule.digitalAssets.isXhrHandled(xhr)){
                dnnModule.digitalAssets.showAlertDialog(self.resources.couldNotDownloadItemsErrorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
            }
        }).always(function () {
            settings.enableLoadingPanel(false);
        });
    }
    
    return true;
};

dnnModule.DigitalAssetsController.prototype.initTags = function () {
    var self = this;
    
    $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .sorting-alpha").click(function () {
        if (!$(this).parent().hasClass("ui-tabs-active")) {
            $(this).parent().addClass("ui-tabs-active");
            $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .sorting-count")
                .parent().removeClass("ui-tabs-active")
                .find("span.sort").removeClass("asc desc");
            $(this).find("span.sort").addClass('asc');
            self.orderBy = 'alpha';
            self.ascending = true;
        } else {
            $(this).find("span.sort").toggleClass('asc desc');
            self.ascending = !self.ascending;
        }
        self.startIndex = 0;
        self.refreshTags.call(self);        
    });

    $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .sorting-count").click(function () {
        if (!$(this).parent().hasClass("ui-tabs-active")) {
            $(this).parent().addClass("ui-tabs-active");
            $(this).parent().addClass("ui-tabs-active");
            $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .sorting-alpha")
                .parent().removeClass("ui-tabs-active")
                .find("span.sort").removeClass("asc desc");
            $(this).find("span.sort").addClass('desc');
            self.orderBy = 'count';
            self.ascending = false;
        } else {
            $(this).find("span.sort").toggleClass('asc desc');
            self.ascending = !self.ascending;
        }
        self.startIndex = 0;
        self.refreshTags.call(self);        
    });

    $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .pager-next").click(function () {
        if ($(this).is(".enabled")) {
            self.startIndex += self.numItems;
            self.refreshTags.call(self);
        }
    });
    
    $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags .pager-prev").click(function () {
        if ($(this).is(".enabled")) {
            self.startIndex -= self.numItems;
            self.refreshTags.call(self);
        }
    });
};

dnnModule.DigitalAssetsController.prototype.initTagsInput = function($tag, tagsInputSettings) {
    $tag.dnnTagsInput({
        width: tagsInputSettings.width,
        minInputWidth: tagsInputSettings.minInputWidth,
        defaultText: tagsInputSettings.defaultText,
        autocomplete_url: this.getContentProServiceUrl.call(this) + 'GetFilteredTags?' + this.getHttpGETHeaders.call(this) + '&maxItemsToShow=' + tagsInputSettings.maxItemsToShow,
        maxItemsToShow: tagsInputSettings.maxItemsToShow,
        lessThanMinCharsErrorTitle: tagsInputSettings.lessThanMinCharsErrorTitle,
        moreThanMaxCharsErrorTitle: tagsInputSettings.moreThanMaxCharsErrorTitle,
        moreThanMaxTagsErrorTitle: tagsInputSettings.moreThanMaxTagsErrorTitle,
        lessThanMinCharsErrorText: tagsInputSettings.lessThanMinCharsErrorText,
        moreThanMaxCharsErrorText: tagsInputSettings.moreThanMaxCharsErrorText,
        moreThanMaxTagsErrorText: tagsInputSettings.moreThanMaxTagsErrorText
    });
    
    var tagEnabled = !$tag.is(":disabled");
    if (!tagEnabled) {
        $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput").addClass("dnnModuleDigitalAssetsPreviewInfoTagDisabled");
        $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput input").remove();
        $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput .tag > a").remove();
    }        
};

dnnModule.DigitalAssetsController.prototype.refreshTags = function () {
    var self = this;

    self.startIndex = self.startIndex || 0;
    self.numItems = self.numItems || 15;
    self.orderBy = self.orderBy || 'alpha';
    self.selectedTerm = self.selectedTerm || null;
    if (typeof self.ascending === "undefined" || self.ascending === null) {
        self.ascending = true;
    }

    var $tags = $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags", "#" + self.scopeId);
    var contentProServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/';    
    $tags.find("div.loading").show();

    $.ajax({
        url: contentProServiceUrl + "GetTags",
        data: { startIndex: self.startIndex, numItems: self.numItems, orderBy: self.orderBy, ascending: self.ascending },
        type: "GET",
        beforeSend: this.servicesFramework.setModuleHeaders
    }).done(function(data) {

        $tags.find("ul.tags").empty();

        for (var i = 0; i < data.Tags.length; i++) {
            var tag = data.Tags[i];
            var li = $("<li><a href='#'></a><span>" + tag.Count + "</span></li>");
            if (self.selectedTerm && self.selectedTerm.Name == tag.Name) li.addClass('selected');
            $("a", li).attr('data-termid', tag.TermID)
                .attr('data-termname', tag.Name)
                .text(tag.Name);
            $("span", li).text(tag.Count);
            $tags.find("ul.tags").append(li);
        }
        $tags.find("div.loading").hide();
        
        if (data.TotalCount <= self.numItems) {
            $tags.find("ul.pager").hide();
            $tags.find("#dnnModuleDigitalAssetsLeftPaneFilesTabTagsPager").hide();            
        } else {
            self.startIndex = data.StartIndex;
            
            $tags.find("ul.pager").show();
            
            if (self.startIndex == 0) {
                $tags.find(".pager-prev").removeClass("enabled").addClass("disabled");
            } else {
                $tags.find(".pager-prev").removeClass("disabled").addClass("enabled");
            }

            if (self.startIndex + self.numItems >= data.TotalCount) {
                $tags.find(".pager-next").removeClass("enabled").addClass("disabled");
            } else {
                $tags.find(".pager-next").removeClass("disabled").addClass("enabled");
            }

            var text = self.resources.pagerText.replace("[FIRST]", self.startIndex + 1)
                                                .replace("[LAST]", self.startIndex + data.Tags.length)
                                                .replace("[TOTAL]", data.TotalCount);
            $tags.find("#dnnModuleDigitalAssetsLeftPaneFilesTabTagsPager").html(text).show();
        }

        $tags.find("ul.tags li").mousedown(function (e) {
            if (e.button == 2 && e.target.tagName.toUpperCase() == "LI") {
                dnnModule.DigitalAssetsTagsListMenu.showTagsListMenu(e);
            }
        });

        $tags.find("ul.tags a").click(function (e) {
            // TODO: dnnModule.digitalAssets.resetSearch();
            self.loadContentByTag.call(self, ({ Id: $(this).attr("data-termid"), Name: $(this).attr("data-termname") }));
            self.selectedTerm = dnnModule.DigitalAssetsTagsListMenu.selectTerm($(this).attr("data-termname"), $(this));
            e.preventDefault();
        });
    }).fail(function (xhr) {
        if(!dnnModule.digitalAssets.isXhrHandled(xhr)){
            dnnModule.digitalAssets.showAlertDialog(self.resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
        }
    });
};

dnnModule.DigitalAssetsController.prototype.loadContentByTag = function (term, startIndex, numItems, sortExpression) {
    // TODO: Get default values from gridview paging/sorting
    startIndex = startIndex || 0;
    numItems = numItems || 10;
    sortExpression = sortExpression || '';
    var self = this;
    
    var searchProvider = dnnModule.digitalAssets.getSearchProvider();
    if (searchProvider) {
        var searchKeywords = searchProvider.getSearchKeywords();
        var searchKeywordsWithTerm = searchKeywords + ((term.Name != '') ? ' [' + term.Name + ']' : '');

        searchProvider.doSearch(dnnModule.digitalAssets.getRootFolderId(), searchKeywordsWithTerm, startIndex, numItems, sortExpression,
            function () {
                dnnModule.digitalAssets.prepareForFilteredContent(true);
                dnnModule.digitalAssets.enableLoadingPanel(true);
            },
            function (data) {
                dnnModule.digitalAssets.setCurrentFolder(null);
                dnnModule.digitalAssets.itemsDatabind(data, self.resources.noItemsTagsText);
                self.updateBreadCrumbForTags.call(self, term, searchKeywords);
            },
            function (xhr, status, error) {
                if(!dnnModule.digitalAssets.isXhrHandled(xhr)){
                    dnnModule.digitalAssets.showAlertDialog(self.resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
                }
            },
            function () {
                dnnModule.digitalAssets.enableLoadingPanel(false);
            }
        );
        if (term.Name != '') {
            self.updateModuleState.call(self, dnnModule.digitalAssets.createModuleState("tagName", term.Name));
        }
    }
};

dnnModule.DigitalAssetsController.prototype.loadContentBySubscriptions = function (settings, startIndex, numItems, sortExpression) {
    startIndex = startIndex || 0;
    numItems = numItems || 10;
    sortExpression = sortExpression || '';

    var subscriptionServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'SubscriptionService/';
    
    this.showSubscriptions = true;

    dnnModule.digitalAssets.prepareForFilteredContent(true);
    dnnModule.digitalAssets.enableLoadingPanel(true);
    var self = this;
    $.ajax({
        url: subscriptionServiceUrl + "GetSubscriptions",
        data: {
            "portalId": 0,
            "startIndex": startIndex,
            "numItems": numItems,
            "sortExpression": sortExpression,
            "groupId": settings.groupId || -1
        },
        type: "GET",
        beforeSend: this.servicesFramework.setModuleHeaders
    }).done(function(data) {
        dnnModule.digitalAssets.setCurrentFolder(null);        
        dnnModule.digitalAssets.itemsDatabind(data, self.resources.noItemsSusbcriptionsText);
        $('#dnnModuleDigitalAssetsBreadcrumb ul').html($("<li />").text(self.resources.subscriptionsText));
        dnnModule.digitalAssets.setupDnnMainToolbarTitles();
    }).fail(function (xhr) {
        if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {
            dnnModule.digitalAssets.showAlertDialog(self.resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
        }
    }).always(function () {
        dnnModule.digitalAssets.enableLoadingPanel(false);
    });
};

dnnModule.DigitalAssetsController.prototype.updateBreadCrumbForTags = function(term, pattern) {
    var self = this;
    var li;
    if (pattern && pattern != "") {        
        li = $("<li class='dnnModuleDigitalAssetsBreadcrumbLink'><a href='#'></a></li>");
        $("a", li).attr("data-termid", term.Id)
            .attr("data-termname", term.Name)
            .text(this.resources.breadCrumbTagsTitle.replace("[TAG]", term.Name));
        $('#dnnModuleDigitalAssetsBreadcrumb ul')
            .html(li)
            .append($("<li />").text(this.resources.breadCrumbTagsSearchTitle));
    } else {
        li = $("<li />").text(this.resources.breadCrumbTagsTitle.replace("[TAG]", term.Name));
        $('#dnnModuleDigitalAssetsBreadcrumb ul').html(li);
    }
        
    $('#dnnModuleDigitalAssetsBreadcrumb a').click(function (e) {
        e.preventDefault();
        dnnModule.digitalAssets.getSearchProvider().clearSearch();
        self.loadContentByTag.call(self, { Id: $(this).attr("data-termid"), Name: $(this).attr("data-termname") });        
    });
};

dnnModule.DigitalAssetsController.prototype.loadContent = function (folderId, startIndex, numItems, sortExpression, settings, scopeId) {
    var self = this;
    self.scopeId = self.scopeId || scopeId;
    
    if ($("#dnnModuleDigitalAssetsLeftPaneTagsTab").is(":visible")) {
        this.refreshTags.call(this);
    }

    if (self.selectedTerm) {
        self.loadContentByTag.call(self, self.selectedTerm, startIndex, numItems, sortExpression);
        return true;
    }

    if (self.showSubscriptions === true) {
        self.loadContentBySubscriptions.call(self, settings, startIndex, numItems, sortExpression);
        return true;
    }

    var $wfLabel = $(".dnnModuleDigitalAssetsWorkflowLabel", "#" + scopeId);
    if (settings.isHostMenu === false && settings.isFilteredContent === false) {
        $wfLabel.addClass("folderRequired");
        
        var contentProServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'ContentServicePro/';
        $.ajax({
            url: contentProServiceUrl + "GetFolderWorkflow",
            data: {
                "folderId": folderId
            },
            type: "GET",
            beforeSend: this.servicesFramework.setModuleHeaders
        }).done(function(data) {
            var wfName = data ? data.WorkflowName : self.resources.noWorkflowText;
            var title = data ? self.resources.workflowActiveText.replace("[WORKFLOWNAME]", data.WorkflowName) : self.resources.workflowNotAppliedText;
            
            if (settings.isAuthenticated && $wfLabel.find('a.help').length == 0) {
                $('<a class="help" href="#" />').attr('title', self.resources.workflowHelpTitle).appendTo($wfLabel).click(function (e) {
                    $('<div></div>').html(self.resources.workflowHelpText).dialog({
                        modal: true,
                        autoOpen: true,
                        dialogClass: "dnnFormPopup",
                        position: "center",
                        width: 350,
                        height: 180,
                        resizable: false,
                        title: self.resources.workflowHelpTitle
                    });
                    e.preventDefault();
                });
            }
            $wfLabel.show().attr('title', title)
                .get(0).childNodes[0].nodeValue = wfName;

            dnnModule.digitalAssets.setupDnnMainToolbarTitles();
        }).fail(function(xhr) {
            if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {
                dnnModule.digitalAssets.showAlertDialog(self.resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
            }
        });
    } else {
        $wfLabel.removeClass("folderRequired");
    }
    return false;
};

dnnModule.DigitalAssetsController.prototype.onLoadFolder = function () {
    $("#dnnModuleDigitalAssetsLeftPaneFilesTabTags ul li.selected").removeClass("selected");
    this.selectedTerm = null;
    this.showSubscriptions = null;
};

dnnModule.DigitalAssetsController.prototype.gridOnGridCreated = function (grid) {
    //TODO: check if tag is requested initially
    var state = this.getCurrentState.call(this, grid, "");
    switch(state.stateMode) {
        case "folderId":
            dnnModule.digitalAssets.loadInitialContent();
            break;
        case "tagName":
            this.selectedTerm = {Id: "0", Name: state.stateValue}; //Initial term
            dnnModule.digitalAssets.loadInitialContent();
            break;
    }
    
    if (grid.getColumnByUniqueName("IsUserSubscribed")) {
        var c = grid.getColumnByUniqueName("IsUserSubscribed").get_element();
        $(c).addClass('dnnModuleDigitalAssetsGrid-SubscribedColumn');
    }    
};

dnnModule.DigitalAssetsController.prototype.getCurrentState = function(grid, view) {
    var stateMode = "folderId";
    var stateValue = this.getParameterByName.call(this, stateMode);
    if (stateValue == "") {
        stateMode = "tagName";
        stateValue = this.getParameterByName.call(this, stateMode);
    }
    if (stateValue != "") {
        return {
            stateMode: stateMode,
            stateValue: stateValue,
            currentView: view,
            pageSize: grid.get_pageSize(),
            userId: this.settings.userId
        };        
    }
    
    var storedState = this.getStoredState.call(this);
    if (storedState == null) {
        return {
            stateMode: "folderId",
            stateValue: dnnModule.digitalAssets.getRootFolderId(),
            currentView: view,
            pageSize: grid.get_pageSize(),
            userId: this.settings.userId
        };        
    }
    return storedState;
        
};

dnnModule.DigitalAssetsController.prototype.getParameterByName = function (name, source) {
    var search = source || location.search;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

dnnModule.DigitalAssetsController.prototype.getStoredState = function () {
    var name = "damState-" + this.settings.userId;
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    if (!value || (value.length && value.length < 2)) {
        return null;
    }
    var storedValue = decodeURIComponent(value[1]);
    return {
        stateMode: storedValue.split("&")[0].split("=")[0],
        stateValue: storedValue.split("&")[0].split("=")[1],
        currentView: this.getParameterByName.call(this, "view", storedValue),
        pageSize: this.getParameterByName.call(this, "pageSize", storedValue),
        userId: this.settings.userId
    };
};

dnnModule.DigitalAssetsController.prototype.gridOnRowDataBound = function(grid, item) {

    // Locked
    var cellLocked = $(grid.get_cell("Locked"));
    cellLocked.empty();

    if (item.Locked) {
        cellLocked.addClass("dnnModuleDigitalAssetsGrid-LockColumn");
        cellLocked.attr("title", item.LockReason);
    } else {
        cellLocked.removeClass("dnnModuleDigitalAssetsGrid-LockColumn");
        cellLocked.attr("title", "");
    }
    
    // Subscribed
    var cellIsUserSubscribed = $(grid.get_cell("IsUserSubscribed"));
    if (cellIsUserSubscribed) {
        cellIsUserSubscribed.empty();

        if (item.IsUserSubscribed) {
            cellIsUserSubscribed.addClass("dnnModuleDigitalAssetsGrid-SubscribedColumn");
            cellIsUserSubscribed.attr("title", this.resources.subscribedText);
        } else {
            cellIsUserSubscribed.removeClass("dnnModuleDigitalAssetsGrid-SubscribedColumn");
            cellIsUserSubscribed.attr("title", "");
        }
    }    
};

dnnModule.DigitalAssetsController.prototype.executeCommandOnSelectedItems = function (commandName, items) {

    switch (commandName) {
        case "GroupUpdates":
            var itemIds = new Array();
            for (var i = 0; i < items.length; i++) {
                itemIds.push(items[i].get_dataItem().ItemID);
            }
            
            dnnModule.digitalAssets.showDialog('GroupUpdates', { itemIds: itemIds.join() }, 800, 500);
            break;
        case 'Subscribe':
            this.subscribeGridItems.call(this, items, true);
            break;
        case 'Unsubscribe':
            this.subscribeGridItems.call(this, items, false);
            break;
        case "GetFolderUrl":
            if (items.length > 1) {
                return;
            }
            this.getUrlFromFolderId.call(this, items[0].get_dataItem().ItemID);
            break;
        case "OpenFromServer":        
            if (items.length > 1) {
                return;
            }
            dnnModule.DigitalAssetsOpenFromServer.showOpenFromServerDialog(items[0].get_dataItem());
            break;
    }
};

dnnModule.DigitalAssetsController.prototype.executeCommandOnSelectedNode = function (commandName, node) {

    switch (commandName) {
        case 'Subscribe':
            this.subscribeNodeItem.call(this, node, true);
            break;
        case 'Unsubscribe':
            this.subscribeNodeItem.call(this, node, false);
            break;
        case "GetFolderUrl":
            this.getUrlFromFolderId.call(this, node.get_value());
            break;
    }
};

dnnModule.DigitalAssetsController.prototype.setupGridContextMenuExtension = function (contextMenu, gridItems) {

    var subscribeMenu = contextMenu.findItemByValue("Subscribe");
    subscribeMenu && subscribeMenu.set_visible(this.isUnsubscribedFromAllGridItems(gridItems));

    var unsubscribeMenu = contextMenu.findItemByValue("Unsubscribe");
    unsubscribeMenu && unsubscribeMenu.set_visible(this.isSubscribedToAllGridItems(gridItems));

    dnnModule.DigitalAssetsOpenFromServer.setupGridContextMenuExtension(contextMenu, gridItems);
};

dnnModule.DigitalAssetsController.prototype.setupTreeViewContextMenuExtension = function (contextMenu, node) {

    var isUserSubscribed = node.get_attributes().getAttribute("IsUserSubscribed");

    isUserSubscribed = (isUserSubscribed.constructor === Boolean) ? isUserSubscribed : isUserSubscribed == "true";

    var subscribeMenu = contextMenu.findItemByValue("Subscribe");
    subscribeMenu && subscribeMenu.set_visible(!isUserSubscribed);

    var unsubscribeMenu = contextMenu.findItemByValue("Unsubscribe");
    unsubscribeMenu && unsubscribeMenu.set_visible(isUserSubscribed);
       
};

dnnModule.DigitalAssetsController.prototype.updateSelectionToolBar = function (selectionToolbar, gridItems) {
    
    var subscribeToolBarButton = selectionToolbar.find("#DigitalAssetsSubscribeSelectionBtnId");
    if (this.isUnsubscribedFromAllGridItems(gridItems)) {
        subscribeToolBarButton.css("display", "");
    } else {
        subscribeToolBarButton.hide();
    }
    
    var unSubscribeToolBarButton = selectionToolbar.find("#DigitalAssetsUnSubscribeSelectionBtnId");
    if (this.isSubscribedToAllGridItems(gridItems)) {
        unSubscribeToolBarButton.css("display", "");
    } else {
        unSubscribeToolBarButton.hide();
    }
    
    dnnModule.DigitalAssetsOpenFromServer.setupToolBarExtension(selectionToolbar, gridItems);
};

dnnModule.DigitalAssetsController.prototype.isSubscribedToAllGridItems = function (gridItems) {
    var isSubscribeToAllItems = true;
    for (var i = 0; i < gridItems.length; i++) {
        var item = gridItems[i].get_dataItem();
        if (gridItems[i].get_visible() && item && !item.IsUserSubscribed) {
            isSubscribeToAllItems = false;
            break;
        }
    }
    return isSubscribeToAllItems;
};

dnnModule.DigitalAssetsController.prototype.isUnsubscribedFromAllGridItems = function(gridItems) {
    var isUnSubscribeToAllItems = true;
    for (var i = 0; i < gridItems.length; i++) {
        var item = gridItems[i].get_dataItem();
        if (gridItems[i].get_visible() && item && item.IsUserSubscribed) {
            isUnSubscribeToAllItems = false;
            break;
        }
    }
    return isUnSubscribeToAllItems;
};

dnnModule.DigitalAssetsController.prototype.subscribe = function(items, subscribe, onSuccess) {
    var subscriptionServiceUrl = this.servicesFramework.getServiceRoot('DigitalAssetsPro') + 'SubscriptionService/';
    
    dnnModule.digitalAssets.enableLoadingPanel(true);
    var self = this;
    $.ajax({
        url: subscriptionServiceUrl + (subscribe ? "Subscribe" : "UnSubscribe"),
        data: {
            Items: items
        },
        type: "POST",
        beforeSend: this.servicesFramework.setModuleHeaders
    }).done(onSuccess)
      .fail(function (xhr) {
        if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {
            var alertTitle = subscribe ? self.resources.subscriptionError : self.resources.unSubscriptionError;
            dnnModule.digitalAssets.showAlertDialog(alertTitle, dnnModule.digitalAssets.getExceptionMessage(xhr));
        }
    }).always(function () {
        dnnModule.digitalAssets.enableLoadingPanel(false);
    });
};

dnnModule.DigitalAssetsController.prototype.subscribeGridItems = function(items, subscribe) {

    var itemsDto = new Array();
    for (var i = 0; i < items.length; i++) {
        var dataItem = items[i].get_dataItem();
        itemsDto.push({ 'ItemId': dataItem.ItemID, 'IsFolder': dataItem.IsFolder });
    }

    this.subscribe.call(this, itemsDto, subscribe,
        // on success
        function () {
            dnnModule.digitalAssets.refreshFolder(true);
        }
    );
};

dnnModule.DigitalAssetsController.prototype.subscribeNodeItem = function(node, subscribe) {
    this.subscribe.call(this, [{ 'ItemId': node.get_value(), 'IsFolder': true }], subscribe, 
        // on success
        function () {
            node.get_attributes().setAttribute("IsUserSubscribed", subscribe);
            dnnModule.digitalAssets.refreshFolder();
        }
    );
};

dnnModule.DigitalAssetsController.prototype.getUrlFromFolderId = function(folderId) {
    var url = dnnModule.digitalAssets.getFullUrl("?folderId=" + folderId);    
    dnnModule.digitalAssets.openGetUrlModal(url, this.resources.getFolderUrlLabel);
};

dnnModule.DigitalAssetsController.prototype.getLeftPaneActions = function (settings) {
    var self = this;
    
    if (settings.isHostMenu === true || settings.isAuthenticated === false) {
        return [];        
    }

    return [{
        id: 'dnnModuleDigitalAssetsSubscriptions',
        text: this.resources.subscriptionsText,
        method: function () {
            self.loadContentBySubscriptions.call(self, settings);
        }
    }];
};

dnnModule.DigitalAssetsController.prototype.leftPaneTabActivated = function (id) {
    if (id == "dnnModuleDigitalAssetsLeftPaneTagsTab") {
        this.refreshTags.call(this);
    }
};

dnnModule.DigitalAssetsController.prototype.initMainMenuButtons = function (settings) {
    var workflowLabel = $("<span class='dnnModuleDigitalAssetsWorkflowLabel  folderRequired' style='display: none'>WF Name</span>");
    if (settings.isHostMenu === true || settings.isAuthenticated === false) {
        workflowLabel.addClass('hidden');        
    }
    $("#dnnModuleDigitalAssetsMainToolbar").prepend(workflowLabel);
};
