<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="PageSettingsWorkflowSettingsControl.ascx.cs" Inherits="Evoq.Content.Library.UserControls.PageSettingsWorkflowSettingsSection" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<style>
    #WorkflowFields {
        display: inline-block;
        max-width: 445px;
        background-color: #f0f0f0;
        padding: 8px 8px 8px 8px;
        margin-bottom: 18px;
    }
</style>

<div class="dnnFormItem">    
    <div id="WorkflowPropagationWarning" class="dnnFormMessage dnnFormWarning" style="display: none">
        <div><strong><%= Localization.GetString("WorkflowPropagationWarningTitle", LocalResourceFile) %></strong></div>
        <span id="ApplyOnSubpagesNote"><%= Localization.GetString("WorkflowPropagationWarning", LocalResourceFile) %></span>        
    </div>
    <dnn:label id="WorkflowLabel" runat="server" controlname="WorkflowComboBox" sufix=":"/>
    <div id="WorkflowFields">
        <asp:HiddenField runat="server" ID="ManageTabActionHidden"/>
        <dnn:DnnComboBox ID="WorkflowComboBox" runat="server" DataValueField="WorkflowID" DataTextField="WorkflowName"></dnn:DnnComboBox><br/>
        <span runat="server" ID="WorkflowRunningWarning" Visible="False"><%= Localization.GetString("WorkflowRunning", LocalResourceFile) %></span>
        <div id="WorkflowSubFields" class="subFields" style="display: none">
            <asp:CheckBox ID="ApplyOnSubpagesCheckBox" runat="server" resourcekey="ApplyOnSubpagesCheckBox" /><br/>
        </div>
    </div>    
</div>


<script type="text/javascript">
(function ($, Sys) {
    function setUpWorkflowSettings() {
        var workflowSelectId = '<%= WorkflowComboBox.ClientID %>';
        var applyOnSubPagesCheckboxId = '<%= ApplyOnSubpagesCheckBox.ClientID %>';
        var isEditAction = '<%= ManageTabActionHidden.Value %>' == 'edit';

        $("#" + workflowSelectId).off("change");
        $("#" + workflowSelectId).on("change", function() {
            if (!$("div#WorkflowSubFields").is(":visible") && isEditAction) {
                $("div#WorkflowSubFields").slideDown(300);
                if ($("#" + applyOnSubPagesCheckboxId).is(":disabled")) {
                    if (!$("div#WorkflowPropagationWarning").is(":visible")) {
                        $("div#WorkflowPropagationWarning").show();
                    }
                }
            }
        });
    }

    $(document).ready(function () {
        setUpWorkflowSettings();

       
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            setUpWorkflowSettings();
        });
    });
}(jQuery, window.Sys));
</script>