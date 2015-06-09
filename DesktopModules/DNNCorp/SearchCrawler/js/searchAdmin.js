(function ($, Sys, dnn) {
    if (typeof dnn == 'undefined' || dnn == null) dnn = {};
    dnn.searchAdminPro = dnn.searchAdminPro || {};
    dnn.searchAdminPro.init = function (settings) {

        var supportRgba = function () {
            var rgba = null;
            var testSupportRgba = function () {
                if (rgba == null) {
                    var scriptElement = document.getElementsByTagName('script')[0];
                    var prevColor = scriptElement.style.color;
                    var testColor = 'rgba(0, 0, 0, 0.5)';
                    if (prevColor == testColor) {
                        rgba = true;
                    } else {
                        try {
                            scriptElement.style.color = testColor;
                        } catch (e) {
                        }
                        rgba = scriptElement.style.color != prevColor;
                        scriptElement.style.color = prevColor;
                    }
                }
                return rgba;
            };
            return testSupportRgba();
        };

        var flashOnElement = function (element, flashColor, fallbackColor) {
            if (supportRgba()) { // for moden browser, I use RGBA
                var color = flashColor.join(',') + ',',
                transparency = 1,
                timeout = setInterval(function () {
                    if (transparency >= 0) {
                        element.style.backgroundColor = 'rgba(' + color + (transparency -= 0.015) + ')';
                        // (1 / 0.015) / 25 = 2.66 seconds to complete animation
                    } else {
                        clearInterval(timeout);
                    }
                }, 40); // 1000/40 = 25 fps
            } else { // for IE8, I use hex color fallback
                element.style.backgroundColor = fallbackColor;
                setTimeout(function () {
                    element.style.backgroundColor = 'transparent';
                }, 1000);
            }
        };

        var getDnnService = function () {
            if (typeof $.dnnSF != 'undefined')
                return $.dnnSF(settings.moduleId);
            return null;
        };

        var getSearchServiceUrl = function (service) {
            service = service || getDnnService();
            if (service)
                return service.getServiceRoot('SearchCrawler') + 'SearchAdminService/';

            return null;
        };
        
        //Included File extension setup
        var getIconClass = function(isAvailable) {
            return isAvailable ? "indexAvailable" : "indexUnavailable";
        };

        var getIconTooltip = function(isAvailable) {
            return isAvailable ? settings.tooltipContentCrawlingAvailable : settings.tooltipContentCrawlingUnavailable;
        };
        
        var cancelIncludedFileExtensionsOnClick = function() {
            $('#includedFileExtensionsTable tr.includedFileExtensionEditRow').hide();
            $('#includedFileExtensionsTable tr.includedFileExtensionEditRow input[type="text"]').val('');
            return false;
        };

        var deleteIncludedFileExtensionsOnClick = function () {
            // remove all edit row
            cancelIncludedFileExtensionsOnClick();

            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;
            
            var currentRow = $(this).parents('tr');
            var extension = currentRow.find('span.extension').html();

            $.ajax({
                url: serviceUrl + 'RemoveIncludedExtension',
                type: 'POST',
                data: { extension: extension },
                beforeSend: service.setModuleHeaders,
                success: function () {
                    currentRow.remove();
                },
                error: function () {
                }
            });

            return false;
        };

        var addIncludedFileExtensionsOnClick = function () {
            $('#includedFileExtensionsTable tr.includedFileExtensionEditRow').show();
            $('#includedFileExtensionsTable tr.includedFileExtensionEditRow input[type="text"]').trigger('focus');

        };

        var saveIncludedFileExtensionsOnClick = function() {
            var editRow = $('#includedFileExtensionsTable tr.includedFileExtensionEditRow');
            var extension = editRow.find('input[type="text"]').val();
            if (!extension) {
                editRow.find('span.dnnFormError').html(settings.msgFileExtensionRequired).show();
                return false;
            } else {
                editRow.find('span.dnnFormError').html('').hide();
            }
            
            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;

            $.ajax({
                url: serviceUrl + 'AddIncludedExtension',
                type: 'POST',
                data: { extension: extension },
                beforeSend: service.setModuleHeaders,
                success: function (result, textStatus, xhr) {
                    if (xhr.status == 200) {
                        var newRow = '<tr><td><span class="extension">' + result.Extension + '</span></td>' +
                            '<td><span>' + (result.PersistentHandlerName ? result.PersistentHandlerName : settings.msgUnknownContentType) + '</span></td>' +
                            '<td><a class="' + getIconClass(result.IsAvailable) + '" title="' + getIconTooltip(result.IsAvailable) + '" /><td><a href="javascript:void(0)" class="btnDeleteIncludedFileExtension"></a></td></tr>';

                        newRow = $(newRow).insertAfter(editRow);
                        cancelIncludedFileExtensionsOnClick();

                        newRow.find('a.btnDeleteIncludedFileExtension').on('click', deleteIncludedFileExtensionsOnClick);

                        flashOnElement(newRow.get(0), [255, 255, 102], '#FFFF66');

                    }

                },
                error: function (xhr) {
                    switch (xhr.responseText) {
                        case '"NotInWhitelist"':
                            editRow.find('span.dnnFormError').html(settings.msgFileExtensionNotAllowed).show();
                            break;
                        case '"Duplicate"':
                            editRow.find('span.dnnFormError').html(settings.msgFileExtensionDuplicated).show();
                            break;
                    }
                }
            });

            return false;
        };
        
        var getIncludedFileExtensionsOnLoad = function () {
            var editRow = $('#includedFileExtensionsTable tr.includedFileExtensionEditRow');

            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;

            $.ajax({
                url: serviceUrl + 'GetIncludedIFilterExtensions',
                type: 'GET',
                beforeSend: service.setModuleHeaders,
                success: function (result) {
                    for (var i = result.length - 1; i >= 0; i--) {
                        var d = result[i];
                        var row = '<tr><td><span class="extension">' + d.Extension + '</span></td>' +
                                '<td><span>' + (d.PersistentHandlerName? d.PersistentHandlerName : settings.msgUnknownContentType) + '</span></td>' +
                                '<td><a class="' + getIconClass(d.IsAvailable) + '" title="' + getIconTooltip(d.IsAvailable) + '" /></td><td><a href="javascript:void(0)" class="btnDeleteIncludedFileExtension"></a></td></tr>';

                        $(row).insertAfter(editRow);
                    }

                    $('#includedFileExtensionsTable a.btnDeleteIncludedFileExtension').on('click', deleteIncludedFileExtensionsOnClick);

                },
                error: function () {
                }
            });

            return false;
        };

        var includedFileExtensionsSetup = function() {
            getIncludedFileExtensionsOnLoad();
            $('#includedFileExtensionsTable a.btnSaveIncludedFileExtension').on('click', saveIncludedFileExtensionsOnClick);
            $('#includedFileExtensionsTable a.btnCancelIncludedFileExtension').on('click', cancelIncludedFileExtensionsOnClick);
            $('a#btnAddIncludedFileExtension').on('click', addIncludedFileExtensionsOnClick);
            $('#includedFileExtensionsTable tr.includedFileExtensionEditRow input[type="text"]').on('focus', function() {
                $(this).next().empty().hide();
            }).on('keypress', function(e) {
                var k = e.keyCode || e.which;
                if (k == 13) {
                    $('#includedFileExtensionsTable a.btnSaveIncludedFileExtension').trigger('click');
                    e.preventDefault();
                }
            });
        };
        //end included file extension setup

        // directory setup
        var cancelDirectoryOnClick = function() {
            $('#directoriesTable tr.directoryEditRow').hide();
            return false;
        };

        var deleteDirectoryOnClick = function() {
            // remove all edit row
            cancelDirectoryOnClick();

            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;

            var currentRow = $(this).parents('tr');
            var folderId = parseInt(currentRow.attr('data-folderId'), 10);

            $.ajax({
                url: serviceUrl + 'RemoveIncludedDirectory',
                type: 'POST',
                data: { DirectoryId: folderId, DirectoryName: '' },
                beforeSend: service.setModuleHeaders,
                success: function () {
                    currentRow.remove();
                },
                error: function () {
                }
            });

            return false;
        };
        
        var addDirectoryOnClick = function () {
            $('#directoriesTable tr.directoryEditRow').show();
        };
        
        var saveDirectoryOnClick = function () {
            var editRow = $('#directoriesTable tr.directoryEditRow');
            var selectedFolder = dnn[settings.cboFolderClientId].selectedItem();
            
            if (!selectedFolder || !selectedFolder.key) {
                editRow.find('span.dnnFormError').html(settings.msgDirectoryRequired).show();
                return false;
            } else {
                editRow.find('span.dnnFormError').html('').hide();
            }

            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;

            $.ajax({
                url: serviceUrl + 'AddIncludedDirectory',
                type: 'POST',
                data: { DirectoryId: selectedFolder.key, DirectoryName: selectedFolder.value },
                beforeSend: service.setModuleHeaders,
                success: function (result, textStatus, xhr) {
                    if (xhr.status == 200) {
                        var newRow = '<tr data-folderId="' + selectedFolder.key + '"><td><span>' + result + '</span></td>' +
                            '<td><a href="javascript:void(0)" class="btnDeleteDirectory"></a></td></tr>';

                        newRow = $(newRow).insertAfter(editRow);
                        cancelDirectoryOnClick();
                        newRow.find('a.btnDeleteDirectory').on('click', deleteDirectoryOnClick);

                        flashOnElement(newRow.get(0), [255, 255, 102], '#FFFF66');
                    } 
                },
                error: function (xhr) {
                    editRow.find('span.dnnFormError').html(xhr.responseText).show();
                }
            });

            return false;
        };

        var getDirectoriesOnLoad = function () {
            var editRow = $('#directoriesTable tr.directoryEditRow');
            
            var service = getDnnService();
            var serviceUrl = getSearchServiceUrl(service);
            if (!serviceUrl) return false;
            
            $.ajax({
                url: serviceUrl + 'GetIncludedDirectories',
                type: 'GET',
                beforeSend: service.setModuleHeaders,
                success: function (result) {
                    for (var i = 0; i < result.length; i++) {
                        var d = result[i];
                        var row = '<tr data-folderId="' + d.DirectoryId + '"><td><span>' + d.DirectoryName + '</span></td>' +
                        '<td><a href="javascript:void(0)" class="btnDeleteDirectory"></a></td></tr>';

                        $(row).insertAfter(editRow);
                    }
                    
                    $('#directoriesTable a.btnDeleteDirectory').on('click', deleteDirectoryOnClick);

                },
                error: function () {
                }
            });

            return false;
        };
        
        var directoriesSetup = function () {
            getDirectoriesOnLoad();
            $('#directoriesTable a.btnSaveDirectory').on('click', saveDirectoryOnClick);
            $('#directoriesTable a.btnCancelDirectory').on('click', cancelDirectoryOnClick);
            $('a#btnAddDirectory').on('click', addDirectoryOnClick);
            
        };
        // end directory setup
        
        // url setup
        var urlCrawlerSettingSetup = function () {
            $('.btnDeleteUrl').each(function () {
                $(this).dnnConfirm({
                    text: settings.deleteUrlText,
                    yesText: settings.deleteUrlYesText,
                    noText: settings.deleteUrlNoText,
                    title: settings.deleteUrlTitle,
                    isButton: true
                });
            });

            $("#" + settings.chxWindowsAuthenticationClientId).on('click', function() {
                var fields = $("#" + settings.txtWindowsDomainClientId + ", #" + settings.txtWindowsUserClientId + ", #" + settings.txtWindowsPasswordClientId);
                var checked = $("#" + settings.chxWindowsAuthenticationClientId).attr("checked");
                fields.attr("disabled", !checked);
                if (checked) {
                    fields.removeClass("aspNetDisabled");
                } else {
                    fields.addClass("aspNetDisabled");
                }
            });
        };
        // end url setup
        
        var searchAdminSetup = function () {
            $('#dnnSearchSpiderSettings').dnnTabs()
               .find('#sssDocuments').dnnPanels();
            
            $('#sssDocuments .dnnFormExpandContent a').dnnExpandAll({
                expandText: settings.lblExpandAll,
                collapseText: settings.lblCollapseAll,
                targetArea: '#sssDocuments'
            });

            if (settings.fullTrust == "True") {
                includedFileExtensionsSetup();
            }
            directoriesSetup();
            
            urlCrawlerSettingSetup();
        };
        
        $(document).ready(function () {
            searchAdminSetup();
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
                searchAdminSetup();
            });
        });
    };
    dnn.searchAdminPro.directoryChanged = function (selectedNode) {
        if (selectedNode && selectedNode.key)
            $('#directoriesTable tr.directoryEditRow span.dnnFormError').empty().hide();
    };
    
    // register to extensions
    if (typeof dnn.searchAdmin == 'undefined' || dnn.searchAdmin == null)
        dnn.searchAdmin = {};
    
    if (typeof dnn.searchAdmin.extensions == 'undefined' || dnn.searchAdmin.extensions == null)
        dnn.searchAdmin.extensions = {};
        
    dnn.searchAdmin.extensions['dnn.searchAdminPro'] = dnn.searchAdminPro;

})(jQuery, window.Sys, window.dnn);