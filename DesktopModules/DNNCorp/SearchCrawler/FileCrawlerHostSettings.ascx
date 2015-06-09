<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="FileCrawlerHostSettings.ascx.cs" Inherits="DotNetNuke.Professional.SearchCrawler.FileCrawlerHostSettings" %>
<%@ Import Namespace="DotNetNuke.Professional.SearchCrawler" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Register TagPrefix="dnn" TagName="IncludedFileExtensions" Src="~/DesktopModules/DNNCorp/SearchCrawler/IncludedFileExtensionsSettings.ascx" %>
<%@ Register TagPrefix="dnn" TagName="IncludedDirectories" Src="~/DesktopModules/DNNCorp/SearchCrawler/IncludedDirectoriesSettings.ascx" %>

<div id="dnnSearch-FileCrawlerSettings">
    <h4><%= LocalizeString("IncludedFileExtensions") %></h4>
    <dnn:IncludedFileExtensions runat="server" ID="IncludedFileExtensionsSettings"></dnn:IncludedFileExtensions>

    <h4><%= LocalizeString("Directories") %></h4>
    <dnn:IncludedDirectories runat="server" ID="IncludedDirectoriesSettings"></dnn:IncludedDirectories>
</div>
<script type="text/javascript">
    if (typeof dnn !== 'undefined' && typeof dnn.searchAdminPro !== 'undefined') {
        // register to extensions
        if (typeof dnn.searchAdmin == 'undefined' || dnn.searchAdmin == null)
            dnn.searchAdmin = {};

        if (typeof dnn.searchAdmin.extensionsInitializeSettings == 'undefined' || dnn.searchAdmin.extensionsInitializeSettings == null)
            dnn.searchAdmin.extensionsInitializeSettings = {};

        dnn.searchAdmin.extensionsInitializeSettings["dnn.searchAdminPro"] = {
            // included file extension
            msgFileExtensionRequired: '<%= Localization.GetSafeJSString(LocalizeString("errorRequiredFileExtension")) %>',
            msgFileExtensionDuplicated: '<%= Localization.GetSafeJSString(LocalizeString("errorDuplicateFileExtension")) %>',
            msgFileExtensionNotAllowed: '<%= Localization.GetSafeJSString(LocalizeString("errorNotAllowedFileExtension")) %>',

            tooltipContentCrawlingAvailable: '<%= Localization.GetSafeJSString(LocalizeString("tooltipContentCrawlingAvailable")) %>',
            tooltipContentCrawlingUnavailable: '<%= Localization.GetSafeJSString(LocalizeString("tooltipContentCrawlingUnavailable")) %>',

            // directory
            cboFolderClientId: '<%= ((IncludedDirectoriesSettings)IncludedDirectoriesSettings).CboFolderClienteID %>',
            msgDirectoryRequired: '<%= Localization.GetSafeJSString(LocalizeString("errorRequiredDirectory")) %>',
            
            fullTrust: '<%= FullTrust %>'
        };

    }
</script>