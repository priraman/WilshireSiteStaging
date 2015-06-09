// IE8 doesn't like using var dnnModule = dnnModule || {}
if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };

dnnModule.DigitalAssetsOpenFromServer = function() {

	var controller = null;
	var resources;    
    function init(initResources, initController) {
        resources = initResources;
        controller = initController;    
    }
    
    function getServiceUrl(serviceMethod) {
        
        return controller.getContentProServiceUrl() + serviceMethod;
    }
    
    function getOpenFromServerDialogButtons(item) {
        var itemId = item.ItemID;
        var dialogButtons = [{
                        id: "readOnly_button",
                        text: resources.readOnlyActionText,
                        "class": "dnnPrimaryAction",
                        click: function () {
                            openFromServer(itemId, "readOnly");
                            $(this).dialog("close");
                        }
                    },
                    {
                        id: "cancel_button",
                        text: resources.cancelActionText,
                        click: function () {
                            $(this).dialog("close");
                        },
                        "class": "dnnSecondaryAction"
                    }];
        if (!item.Locked) {
            dialogButtons[0]["class"] = "dnnSecondaryAction";
            dialogButtons.unshift({
                id: "edit_button",
                text: resources.editDocumentActionText,
                "class": "dnnPrimaryAction",
                click: function () {
                    openFromServer(itemId, "edit");
                    $(this).dialog("close");
                }
            });
        }
        return dialogButtons;
    }

    function showOpenFromServerDialog(item) {
        var dialogTitle = resources.openOnServerDialogTitle;
        var dialogText = resources.openOnServerDialogBody;
        var dialogButtons = getOpenFromServerDialogButtons(item);
        $("<div class='dnnDialog'></div>").html(dialogText).dialog({
            modal: true,
            autoOpen: true,
            dialogClass: "dnnFormPopup",
            width: 400,
            height: 200,
            resizable: false,
            title: dialogTitle,
            buttons: dialogButtons
        });
    }
    
    function getDocumentApplicationErrorText(errorKey) {
        if (Boolean(window.ActiveXObject)) {
            return resources["activeX" + errorKey];
        } else {
            return resources["plugin" + errorKey];
        }
    }
        
    function openFromServer(itemId, mode) {        
        var self = this;
        $.ajax({
            url: getServiceUrl("GetOpenFromServerData"),
            data: {
                "fileId": itemId
            },
            type: "GET",
            beforeSend: controller.servicesFramework.setModuleHeaders
        }).done(function (data) {
            var fullUrl = dnnModule.digitalAssets.getFullUrl(data.Url);            
            invokeApplication(mode, itemId, fullUrl, data.ProgId);
        }).fail(function (xhr) {
            if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {                
                dnnModule.digitalAssets.showAlertDialog(self.resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
            }
        }).always(function () {
            dnnModule.digitalAssets.enableLoadingPanel(false);
        });
    }

    function invokeApplication(mode, itemId, url, progId) {
        var documentApplication = GetDocumentApplication();
        if (documentApplication) {
            try {
                if (mode == "edit") {
                    editFromServer(documentApplication, itemId, url, progId);                    
                }
                else if (mode == "readOnly") {
                    viewFromServer(documentApplication, itemId, url, progId);
                }                
            } catch (e) {
                dnnModule.digitalAssets.showAlertDialog(resources.errorText, getDocumentApplicationErrorText("NotAllowedErrorText"));
            }
        } else {
            dnnModule.digitalAssets.showAlertDialog(resources.errorText, getDocumentApplicationErrorText("DoesNotExistErrorText"));
        }
    }

    function viewFromServer(documentApplication, itemId, url, progId) {
        var self = this;
        $.ajax({
            url: getServiceUrl("SetReadOnlyLock"),
            data: {
                "fileId": itemId
            },
            type: "POST",
            beforeSend: controller.servicesFramework.setModuleHeaders
        }).done(function (data) {
            try {
                if (typeof documentApplication.ViewDocument2 != "undefined") {
                    documentApplication.ViewDocument2(window, url, progId);
                } else {
                    documentApplication.ViewDocument(url, progId);
                }
            } catch (e) {
                dnnModule.digitalAssets.showAlertDialog(resources.errorText, getDocumentApplicationErrorText("NotAllowedErrorText"));
            }
        }).fail(function (xhr) {
            if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {
                dnnModule.digitalAssets.showAlertDialog(resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
            }
        }).always(function () {
            dnnModule.digitalAssets.enableLoadingPanel(false);
        });

    }

    function editFromServer(documentApplication, itemId, url, progId) {
        var self = this;
        $.ajax({
            url: getServiceUrl("EnsureEditFromServer"),
            data: {
                "fileId": itemId
            },
            type: "POST",
            beforeSend: controller.servicesFramework.setModuleHeaders
        }).done(function (data) {
            try {
                documentApplication.EditDocument(url, progId);
            } catch (e) {
                dnnModule.digitalAssets.showAlertDialog(resources.errorText, getDocumentApplicationErrorText("NotAllowedErrorText"));
            }
        }).fail(function (xhr) {
            if (!dnnModule.digitalAssets.isXhrHandled(xhr)) {
                dnnModule.digitalAssets.showAlertDialog(resources.errorText, dnnModule.digitalAssets.getExceptionMessage(xhr));
            }
        }).always(function () {
            dnnModule.digitalAssets.enableLoadingPanel(false);
        });        
    }

    function GetDocumentApplication() {
        if (window.ActiveXObject !== undefined) {
            return new ActiveXObject('SharePoint.OpenDocuments.3');
        }
        return CreateBrowserPlugin('application/x-sharepoint');
    }
    
    function IsPluginInstalled(strMimeType) {
        return Boolean(navigator.mimeTypes) && navigator.mimeTypes[strMimeType] && navigator.mimeTypes[strMimeType].enabledPlugin;
    }
	
    function CreateBrowserPlugin(pluginType) {
        var plugin = null;
        
        try {
            plugin = document.getElementById(pluginType);
            if (!Boolean(plugin) && IsPluginInstalled(pluginType)) {
                var pluginNode = document.createElement("object");

                pluginNode.id = pluginType;
                pluginNode.type = pluginType;
                pluginNode.width = "0";
                pluginNode.height = "0";
                pluginNode.style.setProperty("visibility", "hidden", "");
                document.body.appendChild(pluginNode);
                plugin = document.getElementById(pluginType);
            }
        }
        catch (e) {
            plugin = null;
        }
        
        return plugin;
    }
    
    function setupGridContextMenuExtension(contextMenu, selectedItems) {
        if (selectedItems.length == 1) {
            contextMenu.findItemByValue("OpenFromServer").set_visible(selectedItems[0].get_dataItem().IsOpenFromServerAllowed);
        }
    }
    
    function setupToolBarExtension(selectionToolBar, selectedItems) {
        if (selectedItems.length != 1) {
            return;
        }
        var openFromServerButton = selectionToolBar.find("#DigitalAssetsOpenFromServerSelectionBtnId"); 
        if (selectedItems[0].get_dataItem().IsOpenFromServerAllowed) {
            openFromServerButton.css("display", "");
        } else {
            openFromServerButton.hide();
        }
    }

    return {
        init: init,
        showOpenFromServerDialog: showOpenFromServerDialog,
        setupGridContextMenuExtension: setupGridContextMenuExtension,
        setupToolBarExtension: setupToolBarExtension
};
}();