<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="GroupUpdates.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.GroupUpdates" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Professional.DigitalAssets.Components" Assembly="DotNetNuke.Professional.DigitalAssets" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<asp:Panel ID="ScopeWrapper" runat="server" CssClass="dnnForm">
    
    <p><%=HeaderMessage%></p>

    <div class="dnnFormItem">
        <dnn:Label ControlName="TitleTextBox" ResourceKey="Title" runat="server" Suffix=":" />
        <asp:TextBox ID="TitleTextBox" runat="server" CssClass="dnnModuleDigitalAssetsGeneralPropertiesSingleField"/>
    </div>
        
    <div class="dnnFormItem dnnModuleDigitalAssetsPreviewInfoTag">
        <dnn:Label ControlName="TagsTextBox" ResourceKey="Tags" runat="server" Suffix=":" />
        <asp:TextBox ID="TagsTextBox" runat="server" />
    </div>
    
    <div class="dnnFormItem">
        <dnn:Label ControlName="EnablePublishPeriodCheckBox" ResourceKey="PublishPeriod" runat="server" Suffix=":" />
        <div id="FilePublishPeriodFields" class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
            <asp:CheckBox ID="EnablePublishPeriodCheckBox" runat="server" resourcekey="EnablePublishPeriod" /><br />
            <div id="FilePublishPeriodDates">
                <div id="StartDateFieldsContainer">
                    <dnn:Label ID="StartDateLabel" ControlName="StarDatePicker" runat="server" resourcekey="StartDate" />
                    <br />
                    <dnn:DnnDatePicker ID="StartDatePicker" runat="server" resourcekey="StartDatePicker" />
                </div>
                <div id="EndDateFieldsContainer">
                    <dnn:Label ID="EndDateLabel" ControlName="EndDatePicker" runat="server" resourcekey="EndDate" />
                    <br />
                    <dnn:DnnDatePicker ID="EndDatePicker" runat="server" resourcekey="EndDatePicker" />
                </div>
            </div>
            <asp:CustomValidator runat="server" ID="StartDateMustNotBeInThePastValidator" ControlToValidate="StartDatePicker" 
                CssClass="dnnFormMessage dnnFormError" Display="Dynamic" resourcekey="StartDateMustNotBeInThePast.ErrorMessage" 
                EnableClientScript="False" OnServerValidate="StartDateMustNotBeInThePastValidation" />
            <asp:CompareValidator runat="server" ID="EndDateGreaterThanStartDateValidator" CssClass="dnnFormMessage dnnFormError" 
                ControlToValidate="EndDatePicker" Operator="GreaterThan" ControlToCompare="StartDatePicker" Display="Dynamic" 
                resourcekey="EndDateGreaterThanStartDate.ErrorMessage" />
        </div>
    </div>

    <div class="dnnFormItem" runat="server" ID="WorkFlowItem" Visible="false">
        <dnn:Label ControlName="WorkflowRadioButtonList" ResourceKey="Workflow" runat="server" Suffix=":" />
        
        <div class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
            <asp:RadioButtonList ID="WorkflowRadioButtonList" runat="server" RepeatDirection="Horizontal" CssClass="dnnFormRadioButtons" CausesValidation="False" >
                <asp:ListItem Value="NoAction" resourceKey="NoAction" Selected="True" />
                <asp:ListItem Value="Publish" resourceKey="Publish" />
                <asp:ListItem Value="Reject" resourceKey="Reject" />
            </asp:RadioButtonList>
            <br />

            <asp:TextBox TextMode="MultiLine" ID="WorkflowCommentTextBox" runat="server"/>
            <asp:RequiredFieldValidator ID="WorkflowCommentRequiredValidator" CssClass="dnnFormMessage dnnFormError" Display="Dynamic"
                runat="server" resourcekey="WorkflowCommentRequired.ErrorMessage" ControlToValidate="WorkflowCommentTextBox" />
        </div>
    </div>
    
    <div id="dnnModuleDigitalAssetsButtonPane">
        <ul class="dnnActions dnnClear">
            <li>
                <asp:LinkButton ID="SaveButton" CausesValidation="True" runat="server" class="dnnPrimaryAction" resourcekey="SaveButton"  /></li>
            <li>
                <asp:LinkButton ID="CancelButton" CausesValidation="False" runat="server" class="dnnSecondaryAction" resourcekey="CancelButton" /></li>
        </ul>    
    </div>

</asp:Panel>
<script type="text/javascript">

    // IE8 doesn't like using var dnnModule = dnnModule || {}
    if (typeof dnnModule === "undefined" || dnnModule === null) { dnnModule = {}; };

    dnnModule.digitalAssets = dnnModule.digitalAssets || {};
    dnnModule.digitalAssets.groupUpdates = function ($) {
        function init(controls, settings) {
            parent.$("#iPopUp").dialog('option', 'title', '<%=Localization.GetSafeJSString(DialogTitle)%>');
            
            var publishPeridodCheckBox = $("#<%= EnablePublishPeriodCheckBox.ClientID%>");
            var publishPeriodFields = $("#FilePublishPeriodDates");
            if (!publishPeridodCheckBox.is(":checked")) {
                publishPeriodFields.hide();
            }
            publishPeridodCheckBox.change(function () {
                if (!publishPeridodCheckBox.is(":checked")) {
                    publishPeriodFields.hide();
                } else {
                    publishPeriodFields.show();
                }
            });

            var serviceFramework = $.ServicesFramework(<%=ModuleId %>);
            var controller = new dnnModule.DigitalAssetsController(serviceFramework, {});

            controller.initTagsInput($("#<%= TagsTextBox.ClientID%>"), {
                width: "363px",
                defaultText: '<%= Localization.GetSafeJSString(LocalizeString("AddTag")) %>',
                maxItemsToShow: 10
            });

            $('#<%=WorkflowCommentTextBox.ClientID%>').attr('placeholder', '<%=LocalizeString("WorkFlow.Placeholder")%>');
            enableComment($('#<%=WorkflowRadioButtonList.ClientID%> input:checked').val() != 'NoAction');
            
            $('#<%=WorkflowRadioButtonList.ClientID%> input').change(function () {
                if ($(this).is(':checked')) {
                    switch ($(this).val()) {
                        case 'NoAction':
                            enableComment(false);
                            break;
                            
                        case 'Publish':
                        case 'Reject':
                            enableComment(true);
                            break;
                    }
                }
            });
        }
        
        function enableComment(enable) {
            var $comment = $('#<%=WorkflowCommentTextBox.ClientID%>');
            var validator = document.getElementById('<%=WorkflowCommentRequiredValidator.ClientID%>');
            if (validator == null) {
                return;
            }
            if (enable) {
                $comment.show();
                validator.enable = true;
                ValidatorUpdateDisplay(validator);
            } else {
                $comment.hide();
                ValidatorEnable(validator, false);                           
            }
        }

        return {
            init: init
        };
    } (jQuery);

    $(function () {
        dnnModule.digitalAssets.groupUpdates.init({
            scopeWrapperId: '<%=ScopeWrapper.ClientID %> ',
        });
    });
</script>