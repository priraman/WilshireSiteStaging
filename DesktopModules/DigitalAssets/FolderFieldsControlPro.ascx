<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="FolderFieldsControlPro.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.FolderFieldsControlPro" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>

<asp:Panel runat="server" ID="FileVersioningContainer">
    <div class="dnnFormItem">
        <dnn:Label ID="EnableVersioningLabel" ControlName="EnableVersioningCheckBox" ResourceKey="EnableVersioning" runat="server" Suffix=":" />
        <div id="EnableVersioningCheckBoxGroup" class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
            <asp:CheckBox ID="EnableVersioningCheckBox" runat="server" resourcekey="Enable" /><br />
            <div id="ApplyVersioningSubCheckbox" class="subField" style="display: none">
                <asp:CheckBox ID="ApplyVersioningToSubfoldersCheckBox" runat="server" resourcekey="ApplySettingToSubfolders" />
            </div>
        </div>
    </div>
    <div class="dnnFormItem">
        <dnn:Label ID="EnableWorkflowLabel" ControlName="EnableWorkflowCheckBox" ResourceKey="EnableWorkflow" runat="server" Suffix=":" />
        <div id="EnableWorkflowCheckBoxGroup" class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
            <asp:DropDownList runat="server" ID="FolderWorkflowDropDownList"/><br />
            <div id="ApplyWorkflowSubCheckbox" class="subField" style="display: none">
                <asp:CheckBox ID="ApplyWorkflowToSubfoldersCheckBox" runat="server" resourcekey="ApplySettingToSubfolders" />
            </div>
            <asp:HiddenField ID="WorkflowUserActionInput" Value="cancel" runat="server"></asp:HiddenField>
        </div>
    </div>
    <div class="dnnDialog" id="dnnModuleDigitalAssetsDisableWorkflowAlertItems" style="display: none;">
        <div id="dnnModuleDigitalAssetsDisableWorkflowAlertItemsSubtext"></div>
        <div id="dnnModuleDigitalAssetsDisableWorkflowAlertItemsScroll" class="dnnScroll" style="margin-top:10px; height: 116px; width: 590px;">
            <table class="dnnModuleDigitalAssetsAlertItemsTable"></table>
        </div>
    </div>
</asp:Panel>
<script type="text/javascript">

    $(document).ready(function () {

        var saveButton = $("a.dnnModuleDigitalAssetsSaveFolderPropertiesButton:first");
        var versioningCheckbox = $("#<%= EnableVersioningCheckBox.ClientID%>");        
        var workflowDropDown = $("#<%= FolderWorkflowDropDownList.ClientID%>");

        var hrefAction = saveButton.attr("href").replace("javascript:", "");
        saveButton.attr("href", "#");
        saveButton.click(function (event) {
            event.stopPropagation();

            var propagationVersioningCheckBoxId = '<%=ApplyVersioningToSubfoldersCheckBox.ClientID %>';
            var propagationVersioningEnabled = $('#' + propagationVersioningCheckBoxId).is(':checked');
            var propagationWorkflowCheckBoxId = '<%=ApplyWorkflowToSubfoldersCheckBox.ClientID %>';
            var propagationWorkflowEnabled = $('#' + propagationWorkflowCheckBoxId).is(':checked');

            var isVersioningEnabled = versioningCheckbox.is(":checked");

            var initialFolderWorkflow = '<%=WorkflowName%>';
            var hasWorkflowChanged = initialFolderWorkflow != workflowDropDown.text();

            if (!propagationVersioningEnabled && !propagationWorkflowEnabled) {
                confirmWorkflowAction(propagationWorkflowEnabled, hrefAction, hasWorkflowChanged);
                return false;
            }

            var dialogTitle = '<%= Localization.GetSafeJSString(LocalizeString("PropagationConfirmTitle.Text")) %>';
            var dialogText = getPropagationConfirmText(propagationVersioningEnabled, propagationWorkflowEnabled, isVersioningEnabled, hasWorkflowChanged);

            $("<div class='dnnDialog'></div>").html(dialogText).dialog({
                modal: true,
                autoOpen: true,
                dialogClass: "dnnFormPopup",
                position: "center",
                width: 350,
                height: 250,
                resizable: false,
                title: dialogTitle,
                buttons:
                    [
                        {
                            id: "confirm_button",
                            text: '<%= Localization.GetSafeJSString(LocalizeString("YesButton.Text"))%>',
                            "class": "dnnPrimaryAction",
                            click: function () {
                                $(this).dialog("close");
                                confirmWorkflowAction(propagationWorkflowEnabled, hrefAction, hasWorkflowChanged);
                            }
                        },
                        {
                            id: "cancel_button",
                            text: '<%= Localization.GetSafeJSString(LocalizeString("CancelButton.Text"))%>',
                            click: function () {
                                $(this).dialog("close");
                            },
                            "class": "dnnSecondaryAction"
                        }
                    ]
            });

            return false;
        });

        versioningCheckbox.change(function() {
            if (!$("#ApplyVersioningSubCheckbox").is(":visible")) {
                $("#ApplyVersioningSubCheckbox").slideDown(300);
            }
        });

        workflowDropDown.change(function () {
            if (!$("#ApplyWorkflowSubCheckbox").is(":visible")) {
                $("#ApplyWorkflowSubCheckbox").slideDown(300);
            }
        });


    });

    function getPropagationConfirmText(propagationVersioning, propagationWorkflow, isVersioningEnabled, hasWorkflowChanged) {

        var text = '<%=  Localization.GetSafeJSString(LocalizeString("PropagationConfirmText.Text")) %>';
        var versioningSetting = '<%=  Localization.GetSafeJSString(LocalizeString("VersioningSetting.Text")) %>';
        var workflowSetting = '<%=  Localization.GetSafeJSString(LocalizeString("WorkflowSetting.Text")) %>';        
        var versioningElement = '';
        var workflowElement = '';

        if (propagationVersioning) {
            versioningElement = getEnableSettingElement(isVersioningEnabled, versioningSetting);
        }
        if (propagationWorkflow) {
            workflowElement = getChangeSettingElement(hasWorkflowChanged, workflowSetting);
        }
        return text + '<ul>' + versioningElement + workflowElement +'</ul>';
    }
    
    function getChangeSettingElement(hasSettingChanged, settingName) {
        if (!hasSettingChanged) {
            return '';
        }
        var settingText = '<%=  Localization.GetSafeJSString(LocalizeString("ChangeSetting.Text")) %>';
        return getSettingElement(settingText, settingName);
    }

    function getEnableSettingElement(isSettingEnabled, settingName) {
        var settingText = isSettingEnabled ? '<%=  Localization.GetSafeJSString(LocalizeString("EnableSetting.Text")) %>'
                                            : '<%=  Localization.GetSafeJSString(LocalizeString("DisableSetting.Text")) %>';

        return getSettingElement(settingText, settingName);        
    }

    function getSettingElement(settingText, settingName) {
        
        settingText = settingText.replace('[FOLDERSETTINGS]', settingName);
        return (settingText != '') ? '<li>' + settingText + '</li>' : '';
    }

    function confirmWorkflowAction(propagationWorkflow, hrefAction, hasWorkflowChanged) {

        if (!hasWorkflowChanged) {
            eval(hrefAction);
            return;
        }

        var workflowItemsCurrentFolder = "<%= Localization.GetSafeJSString(string.Join(",", GetRunningWorkflowsItemsInCurrentFolder)) %>";
        workflowItemsCurrentFolder = workflowItemsCurrentFolder == "" ? [] : workflowItemsCurrentFolder.split(",");
        
        var workflowItemsSubFolders = "<%= Localization.GetSafeJSString(string.Join(",", GetRunnginWorkflowsItemsInSubfolders)) %>";
        workflowItemsSubFolders = workflowItemsSubFolders == "" ? [] : workflowItemsSubFolders.split(",");

        var items = propagationWorkflow ? workflowItemsCurrentFolder.concat(workflowItemsSubFolders) : workflowItemsCurrentFolder;
        if (items.length == 0) {
            eval(hrefAction);
            return;
        }
        if ((workflowItemsCurrentFolder.length > 0) || (propagationWorkflow && workflowItemsSubFolders.length > 0)) {
            openWorkflowActionDialog(items, hrefAction);
        }
    }

    function openWorkflowActionDialog(items, hrefAction) {
        var dialogTitle = '<%= Localization.GetSafeJSString(LocalizeString("PendingWorkflowItemsDialogTitle.Text")) %>';
        var workflowActionInput = $("#<%= WorkflowUserActionInput.ClientID %>");
        
        $("#dnnModuleDigitalAssetsDisableWorkflowAlertItemsSubtext").html(getPendingItemsWorkflowDialogText(items.length));
        $("#dnnModuleDigitalAssetsDisableWorkflowAlertItems").dialog({
            modal: true,
            autoOpen: true,
            dialogClass: "dnnFormPopup",
            position: "center",
            width: 600,
            height: 315,
            resizable: false,
            title: dialogTitle,
            buttons:
                [
                    {
                        id: "publishAll_button",
                        text: '<%= Localization.GetSafeJSString(LocalizeString("PublishAllButton.Text"))%>',
                        "class": "dnnSecondaryAction",
                        click: function () {
                            $(this).dialog("close");
                            workflowActionInput.val("publishAll");
                            eval(hrefAction);
                        }
                    },
                    {
                        id: "discardAll_button",
                        text: '<%= Localization.GetSafeJSString(LocalizeString("DiscardAllButton.Text"))%>',
                        "class": "dnnSecondaryAction",
                        click: function () {
                            $(this).dialog("close");
                            workflowActionInput.val("discardAll");
                            eval(hrefAction);
                        }
                    },
                    {
                        id: "cancelPendingItems_button",
                        text: '<%= Localization.GetSafeJSString(LocalizeString("CancelButton.Text"))%>',
                        click: function () {
                            $(this).dialog("close");
                            workflowActionInput.val("cancel");
                        },
                        "class": "dnnSecondaryAction"
                    }
                ]
        });

        var table = $("#dnnModuleDigitalAssetsDisableWorkflowAlertItemsScroll table");
        table.empty();
        for (var i = 0; i < items.length; i++) {
            table.append("<tr><td>" + items[i] + "</td></tr>");
        }
        $("#dnnModuleDigitalAssetsDisableWorkflowAlertItemsScroll").jScrollPane();
    }

    function getPendingItemsWorkflowDialogText(workflowCounts) {

        var textPluralItems = '<%= Localization.GetSafeJSString(LocalizeString("PendingWorkflowPluralItemsDialogText.Text"))%>';
        var textSingleItem = '<%= Localization.GetSafeJSString(LocalizeString("PendingWorkflowSingleItemsDialogText.Text"))%>';
        var workflowName = '<%= Localization.GetSafeJSString(WorkflowName)%>';
        var result;

        if (workflowCounts > 1) {
            result = textPluralItems.replace('[COUNT]', workflowCounts);
        } else {
            result = textSingleItem.replace('[COUNT]', workflowCounts);
        }
        return result.replace('[WORKFLOWNAME]', workflowName);
    }
</script>
