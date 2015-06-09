'use strict';
define(['jquery'], function ($) {
    return {
        init: function () {
            var inIframe = window != window.top;
            
            // I dont know why platform sends me those strange json incompatible value and pretends it is json...
            // so now I need to do some dirty work here -- clean the dnnVariable and make it json compatible
            var v = inIframe ? window.parent.document.getElementById('__dnnVariable').value : '';

            // remove the first `
            v = v.replace('`', '');
            // change the rest of ` to "
            var m = new RegExp('`', 'g');
            v = v.replace(m, '"');
            // finish clean dnnVariable
            var dnnVariable = v ? $.parseJSON(v) : null;
            var tabId = dnnVariable ? dnnVariable['sf_tabId'] : '';
            var siteRoot = dnnVariable ? dnnVariable['sf_siteRoot'] : '';
            var antiForgeryToken = inIframe ? window.parent.document.getElementsByName('__RequestVerificationToken')[0].value : '';
            var currentUserId = inIframe ? window.parent.document.getElementsByName('__personaBarUserId')[0].value : '';
            var currentCulture = inIframe ? window.parent.document.getElementsByName('__personaBarCulture')[0].value : 'en-us';
            var resxTimeStamp = inIframe ? window.parent.document.getElementsByName('__personaBarResourceFileModifiedTime')[0].value : '';
            var avatarUrl = currentUserId ? siteRoot + 'profilepic.ashx?userId=' + currentUserId + '&h=64&w=64' : '';
            var logOff = inIframe ? window.parent.document.getElementsByName('__personaBarLogOff')[0].value : '';
            var socialModule = inIframe ? window.parent.document.getElementsByName('__personaBarMainSocialModuleOnPage')[0].value : '';
            var userSettings = inIframe ? window.parent['__personaBarUserSettings'] : null;
            var hasValidLicenseOrTrial = inIframe ? window.parent.document.getElementsByName('__personaBarHasValidLicenseOrTrial')[0].value == 'True' : true;
            var javascriptMainModuleNames = inIframe ? window.parent.document.getElementsByName('__javascriptMainModuleNames')[0].value : '';
            var userMode = inIframe ? window.parent.document.getElementsByName('__userMode')[0].value : 'View';
            var debugMode = window.top['dnn'] && (window.top['dnn'].getVar('pb_debugMode') == "true");
            var rootFolderId = inIframe ? window.parent.document.getElementsByName('__rootFolderId')[0].value : '';
            var defaultFolderMappingId = inIframe ? window.parent.document.getElementsByName('__defaultFolderMappingId')[0].value : '';
            var assetsModuleId = inIframe ? window.parent.document.getElementsByName('__assetsModuleId')[0].value : '';
            var assetsTabId = inIframe ? window.parent.document.getElementsByName('__assetsTabId')[0].value : '';
            var fileUploadClientId = inIframe ? window.parent.document.getElementsByName('__fileUploadClientId')[0].value : '';
            var folderPickerClientId = inIframe ? window.parent.document.getElementsByName('__folderPickerClientId')[0].value : '';
            var sku = inIframe ? window.parent.document.getElementsByName('__sku')[0].value : '';
            var isCommunityManager = inIframe ? window.parent.document.getElementsByName('__isCommunityManager')[0].value == 'true' : false;

            return {
               tabId: tabId,
               siteRoot: siteRoot,
               antiForgeryToken: antiForgeryToken,
               culture: currentCulture,
               resxTimeStamp: resxTimeStamp,
               avatarUrl: avatarUrl,
               logOff: logOff,
               socialModule: socialModule,
               userSettings: userSettings,
               hasValidLicenseOrTrial: hasValidLicenseOrTrial,
               javascriptMainModuleNames: javascriptMainModuleNames,
               userMode: userMode,
               debugMode: debugMode,
               rootFolderId: rootFolderId,
               defaultFolderMappingId: defaultFolderMappingId,
               assetsModuleId: assetsModuleId,
               assetsTabId: assetsTabId,
               fileUploadClientId: fileUploadClientId,
               folderPickerClientId: folderPickerClientId,
               sku: sku,
               isCommunityManager: isCommunityManager
           };   
       } 
    };
});