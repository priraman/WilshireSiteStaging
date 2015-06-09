; if (typeof window.dnn === "undefined" || window.dnn === null) { window.dnn = {}; }; //var dnn = dnn || {};

// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2014
// by DotNetNuke Corporation
// All Rights Reserved

dnn.DocumentViewerFilterViewSettingsController = function (serviceSettings, serviceControls) {
    var settings = serviceSettings,
        controls = serviceControls,
        _serviceUrl = $.dnnSF().getServiceRoot(settings.serviceRoot),

        getHttpGETHeaders = function () {
            var $dnnSF = $.dnnSF().ServicesFramework(controls.moduleId);
            return "ModuleId=" + $dnnSF.getModuleId() + "&TabId=" + $dnnSF.getTabId();
        },

        initFilterOptionsRadioInput = function () {
            $("input[id^=" + controls.FilterOptionGroupID + "]:radio").change(function () {
                checkFilterOption($(this).val());
            });
            checkFilterOption($("input[id^=" + controls.FilterOptionGroupID + "][checked=checked]:radio").val());
        },
        
        checkFilterOption = function (checkValue) {
            if (checkValue == "FilterByFolder") {
                $("#FilterByFolderOptions").show();
                $("#FilterByTagsOptions").hide();
            } else if (checkValue == "FilterByTags") {
                $("#FilterByFolderOptions").hide();
                $("#FilterByTagsOptions").show();
            } else {
                $("#FilterByFolderOptions").hide();
                $("#FilterByTagsOptions").hide();
            }
        },

        ValidateFolderIsSelected = function (sender, args) {
            if ($("input[id^=" + controls.FilterOptionGroupID + "][checked=checked]:radio").val() == 'FilterByFolder') {
                if (dnn[controls.FolderDropDownList[0].id].selectedItem() == null) {
                    args.IsValid = false;
                    return;
                }
            }
            
            args.IsValid = true;
        },
        
        ValidateTagsAreAdded = function (sender, args) {
            if ($("input[id^=" + controls.FilterOptionGroupID + "][checked=checked]:radio").val() == 'FilterByTags') {
                if (!controls.TagInput.val()) {
                    args.IsValid = false;
                    return;
                }
            }
            args.IsValid = true;
        },

        //TODO: Unify Tags functions and Service Framework methods on DAM and DocumentViewer modules
        initTagsInput = function (tagsInputSettings) {
            controls.TagInput.dnnTagsInput({
                width: tagsInputSettings.width,
                minInputWidth: tagsInputSettings.minInputWidth,
                defaultText: tagsInputSettings.defaultText,
                autocomplete_url: _serviceUrl + 'ContentService/GetFilteredTags?' + getHttpGETHeaders() + '&maxItemsToShow=' + tagsInputSettings.maxItemsToShow,
                maxItemsToShow: tagsInputSettings.maxItemsToShow
            });
        };
    return {
        initTagsInput: initTagsInput,
        initFilterOptionsRadioInput: initFilterOptionsRadioInput,
        ValidateFolderIsSelected: ValidateFolderIsSelected,
        ValidateTagsAreAdded: ValidateTagsAreAdded
    };
};
