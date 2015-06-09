<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="TagsTabContentControl.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.TagsTabContentControl" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Import Namespace="DotNetNuke.Professional.DigitalAssets.Components" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>

<div id="dnnModuleDigitalAssetsLeftPaneFilesTabTags">
    
    <div class="toolbar">
         
        <ul class="sorting buttonGroup">
            <li class="ui-tabs-active">
                <a class="sorting-alpha enabled" title="<%= LocalizeString("OrderByAlpha")%>"><span class="icon">A-Z</span><span class="sort asc">sort</span></a>
            </li>
            <li>
                <a class="sorting-count enabled" title="<%= LocalizeString("OrderByCount")%>"><span class="icon">*</span><span class="sort">sort</span></a>
            </li>
        </ul>

        <ul class="pager buttonGroup">
            <li><a class="pager-prev enabled"><span>PREV</span></a></li>
            <li><a class="pager-next disabled"><span>NEXT</span></a></li>            
        </ul>
        
        <div class="loading"></div>
        
    </div>

    <ul class="tags"></ul>
    
    <div id="dnnModuleDigitalAssetsLeftPaneFilesTabTagsPager"></div>

</div>

<dnnweb:DnnContextMenu ID="TagsListMenu" runat="server" CssClass="dnnModuleDigitalAssetsContextMenu" 
    OnClientItemClicked="dnnModule.DigitalAssetsTagsListMenu.tagsListMenuOnItemClicked" 
    OnClientLoad="dnnModule.DigitalAssetsTagsListMenu.initTagsListMenu">
</dnnweb:DnnContextMenu>  
  
<script type="text/javascript">
    
    $(function () {        
        dnnModule.digitalAssets.getController().extendResources(
            {
                breadCrumbTagsTitle: '<%= Localization.GetSafeJSString(LocalizeString("BreadCrumbTagsTitle"))%>',
                breadCrumbTagsSearchTitle: '<%= Localization.GetSafeJSString(LocalizeString("BreadCrumbTagsSearch"))%>',
                errorText: '<%= Localization.GetSafeJSString(LocalizeString("Error"))%>',
                couldNotDownloadItemsErrorText: '<%= Localization.GetSafeJSString(LocalizeString("CouldNotDownloadItems"))%>',
                noWorkflowText: '<%= Localization.GetSafeJSString(LocalizeString("NoWorkflow"))%>',
                workflowNotAppliedText: '<%= Localization.GetSafeJSString(LocalizeString("NoWorkflowApplied"))%>',
                workflowActiveText: '<%= Localization.GetSafeJSString(LocalizeString("WorkflowActive"))%>',
                workflowHelpTitle: '<%= Localization.GetSafeJSString(LocalizeString("WorkflowHelp.Title"))%>',
                workflowHelpText: '<%= Localization.GetSafeJSString(LocalizeString("WorkflowHelp"))%>',
                pagerText: '<%= Localization.GetSafeJSString(LocalizeString("Pager"))%>',
                subscriptionError: '<%= Localization.GetSafeJSString(LocalizeString("SubscribeError"))%>',
                unSubscriptionError: '<%= Localization.GetSafeJSString(LocalizeString("UnsubscribeError"))%>',
                subscribedText: '<%= Localization.GetSafeJSString(LocalizeString("Subscribed"))%>',
                subscriptionsText: '<%= Localization.GetSafeJSString(LocalizeString("Subscriptions"))%>',
                noItemsTagsText: '<%= Localization.GetSafeJSString(LocalizeString("NoItemsTags"))%>',
                noItemsSusbcriptionsText: '<%= Localization.GetSafeJSString(LocalizeString("NoItemsSusbcriptions"))%>',
                getFolderUrlLabel: '<%= Localization.GetSafeJSString(LocalizationHelper.GetString("GetFolderUrlLabel")) %>'                
            });
        dnnModule.DigitalAssetsTagsListMenu.init({            
            getTagUrlLabel: '<%= Localization.GetSafeJSString(LocalizeString("GetTagUrlLabel")) %>' 
        });
        dnnModule.DigitalAssetsOpenFromServer.init({
                openOnServerDialogTitle: '<%= LocalizationHelper.GetSafeJSString("OpenOnServerDialogTitle") %>',
                openOnServerDialogBody: '<%= LocalizationHelper.GetSafeJSString("OpenOnServerDialogBody") %>',
                readOnlyActionText: '<%= LocalizationHelper.GetSafeJSString("ReadOnlyAction") %>',
                editDocumentActionText: '<%= LocalizationHelper.GetSafeJSString("EditDocumentAction") %>',
                cancelActionText: '<%= Localization.GetSafeJSString(LocalizeString("Cancel.Action")) %>',
                errorText: '<%= LocalizationHelper.GetSafeJSString("OpenningDocumentError") %>',
                pluginNotAllowedErrorText: '<%= LocalizationHelper.GetSafeJSString("PluginNotAllowedError") %>',
                activeXNotAllowedErrorText: '<%= LocalizationHelper.GetSafeJSString("ActiveXNotAllowedError") %>',
                pluginDoesNotExistErrorText: '<%= LocalizationHelper.GetSafeJSString("PluginDoesNotExistError") %>',
                activeXDoesNotExistErrorText: '<%= LocalizationHelper.GetSafeJSString("ActiveXDoesNotExistError") %>'
            },
            dnnModule.digitalAssets.getController()
        );
        dnnModule.digitalAssets.getController().initTags();
    });
</script>