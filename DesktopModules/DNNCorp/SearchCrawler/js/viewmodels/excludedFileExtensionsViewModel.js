function ExcludedFileExtensionsViewModel() {
    var self = this;

    self.editing = ko.observable(false);
    self.newExtensionName = ko.observable("");
    self.title = "Excluded File Extensions View Model";
    self.fileExtensions = ko.observableArray([]);
    self.settings = "";
    
    self.getDnnService = function (moduleId) {
        if (typeof $.dnnSF != 'undefined') {
            return $.dnnSF(moduleId);
        }
        return null;
    };

    self.getSearchServiceUrl = function (service) {
        service = service || self.getDnnService();
        if (service) {
            return service.getServiceRoot('SearchCrawler') + 'SearchAdminExcludedExtensions/';
        }
        return null;
    };

    self.addExtension = function () {
        self.editing(true);
        var newExt = new FileExtension("", "", false);
        newExt.newExtension(true);
        self.fileExtensions.unshift(newExt);
        newExt.isSelected(true);
        self.focusNewExtension();
    };

    self.removeExtension = function (fileExtension) {
        var searchService = self.getDnnService(self.settings.moduleId);
        var searchServiceUrl = self.getSearchServiceUrl(searchService);
        if (!fileExtension.newExtension()) {
            var jsonData = ko.toJSON(fileExtension);
            $.ajax({
                url: searchServiceUrl,
                type: "DELETE",
                data: jsonData,
                beforeSend: searchService.setModuleHeaders,
                contentType: 'application/json; charset=utf-8',
                success: function (xhr) {
                    self.fileExtensions.remove(fileExtension);
                }
            });
        } else {
            self.fileExtensions.remove(fileExtension);
        }
    };

    self.saveExtension = function (fileExtension) {
        var searchService = self.getDnnService(self.settings.moduleId);
        var searchServiceUrl = self.getSearchServiceUrl(searchService);
        fileExtension.isSelected(false);
        var jsonData = ko.toJSON(fileExtension);
        $.ajax({
            url: searchServiceUrl,
            type: "POST",
            data: jsonData,
            beforeSend: searchService.setModuleHeaders,
            contentType: 'application/json; charset=utf-8',
            success: function (normalizedExtension) {
                fileExtension.newExtension(false);
                fileExtension.extension(normalizedExtension);
            },
            error: function (xhr) {
                switch (xhr.responseText) {
                    case '"NotInWhitelist"':
                        fileExtension.errorHtml = self.settings.msgFileExtensionNotAllowed;
                        fileExtension.showError(true);
                        self.focusNewExtension();
                        break;
                    case '"Duplicate"':
                        fileExtension.errorHtml = self.settings.msgFileExtensionDuplicated;
                        fileExtension.showError(true);
                        self.focusNewExtension();
                        break;
                }
            }
        });
    };
    
    self.loadExtensions = function () {
        var searchService = self.getDnnService(self.settings.moduleId);
        var searchServiceUrl = self.getSearchServiceUrl(searchService);
        $.ajax({
            url: searchServiceUrl,
            type: "GET",
            beforeSend: searchService.setModuleHeaders,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                data.forEach(function(serverExtension) {
                    var ext = new FileExtension(serverExtension.Extension, "", false);
                    ext.newExtension(false);
                    ext.isSelected(false);
                    self.fileExtensions.push(ext);
                });
            }
        });
    };
    
    self.addOnEnter = function (data, event) {
        data.showError(false);
        var keyCode = (event.which ? event.which : event.keyCode);
        if (keyCode === 13) {
            self.saveExtension(data);
            return false;
        }
        return true;
    };

    self.focusNewExtension = function () {
        //Unable to get knockout's 'hasFocus' binding working.  So use jquery focus()
        $('#newExtension').focus();
    };
};