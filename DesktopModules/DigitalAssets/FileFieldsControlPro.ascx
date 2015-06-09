<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="FileFieldsControlPro.ascx.cs" Inherits="DotNetNuke.Professional.DigitalAssets.FileFieldsControlPro" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Import Namespace="DotNetNuke.UI.Utilities" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.Client.ClientResourceManagement" Assembly="DotNetNuke.Web.Client" %>

<asp:Panel runat="server" ID="ScopeWrapper">
    <dnn:DnnJsInclude ID="DnnJsInclude4" runat="server" FilePath="~/Resources/Shared/Components/Tokeninput/jquery.tokeninput.js" Priority="101" />
    <dnn:DnnCssInclude ID="DnnCssInclude3" runat="server" FilePath="~/Resources/Shared/Components/Tokeninput/Themes/token-input-facebook.css" />

    <div class="dnnFormItem">
        <dnn:Label ID="FileTitleLabel" ControlName="FileTitleInput" ResourceKey="FileTitleLabel" runat="server" Suffix=":" />
        <asp:TextBox type="text" ID="FileTitleInput" runat="server" CssClass="dnnModuleDigitalAssetsGeneralPropertiesSingleField" MaxLength="256" />
        <%-- TODO Max lenght should be filled from MetadataInfo --%>
    </div>
    <div class="dnnFormItem">
        <dnn:Label ID="FileNameLabel" ControlName="FileNameInput" CssClass="dnnFormRequired" ResourceKey="FileNameLabel" runat="server" Suffix=":" />
        <asp:TextBox type="text" ID="FileNameInput" CssClass="dnnModuleDigitalAssetsGeneralPropertiesSingleField" runat="server" />
        <asp:RequiredFieldValidator ID="FileNameValidator" CssClass="dnnFormMessage dnnFormError"
            runat="server" resourcekey="FileNameRequired.ErrorMessage" Display="Dynamic" ControlToValidate="FileNameInput" />
        <asp:RegularExpressionValidator runat="server" Display="Dynamic" ControlToValidate="FileNameInput" CssClass="dnnFormMessage dnnFormError"
            ID="FileNameInvalidCharactersValidator" />
    </div>
    <div class="dnnFormItem dnnModuleDigitalAssetsPreviewInfoTag">
        <dnn:Label ID="TagsLabel" runat="server" Suffix=":" ControlName="TagsTokenInput" Resourcekey="TagsLabel" />
        <asp:TextBox type="text" ID="Tags" CssClass="dnnModuleDigitalAssetsGeneralPropertiesSingleField" runat="server" />
    </div>
    <asp:Panel runat="server" ID="FileAttributesContainer">
        <div class="dnnFormItem">
            <dnn:Label ID="FileAttributesLabel" ControlName="FileAttributArchiveCheckBox" ResourceKey="FileAttributesLabel" runat="server" Suffix=":" />
            <div id="FileAttrbituesCheckBoxGroup" class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
                <asp:CheckBox ID="FileAttributeArchiveCheckBox" runat="server" resourcekey="FileAttributeArchive" /><br />
                <asp:CheckBox ID="FileAttributeHiddenCheckBox" runat="server" resourcekey="FileAttributeHidden" /><br />
                <asp:CheckBox ID="FileAttributeReadonlyCheckBox" runat="server" resourcekey="FileAttributeReadonly" /><br />
                <asp:CheckBox ID="FileAttributeSystemCheckBox" runat="server" resourcekey="FileAttributeSystem" />
            </div>
        </div>
    </asp:Panel>
    <div class="dnnFormItem">
        <dnn:Label ID="FilePublishPeriodLabel" ControlName="FileEnablePublishPeriodCheckBox" ResourceKey="FilePublishPeriodLabel" runat="server" Suffix=":" />
        <div id="FilePublishPeriodFields" class="dnnModuleDigitalAssetsGeneralPropertiesGroupedFields">
            <asp:CheckBox ID="FileEnablePublishPeriodCheckBox" runat="server" resourcekey="FileEnablePublishPeriodCheckBox" /><br />
            <div id="FilePublishPeriodDates">
                <div id="StartDateFieldsContainer">
                    <dnn:Label ID="StartDateLabel" ControlName="StarDatePicker" runat="server" resourcekey="StartDateLabel" />
                    <br />
                    <dnn:DnnDatePicker ID="StartDatePicker" runat="server" resourcekey="StartDatePicker" />
                </div>
                <div id="EndDateFieldsContainer">
                    <dnn:Label ID="EndDateLabel" ControlName="EndDatePicker" runat="server" resourcekey="EndDateLabel" />
                    <br />
                    <dnn:DnnDatePicker ID="EndDatePicker" runat="server" resourcekey="EndDatePicker" />
                </div>
            </div>
            <asp:RequiredFieldValidator runat="server" ID="StartDateValidator" CssClass="dnnFormMessage dnnFormError" resourcekey="StartDateRequired.ErrorMessage" Display="Dynamic" ControlToValidate="StartDatePicker" />
            <asp:CustomValidator runat="server" ID="StartDateMustNotBeInThePastValidator" ControlToValidate="StartDatePicker" CssClass="dnnFormMessage dnnFormError" Display="Dynamic" resourcekey="StartDateMustNotBeInThePast.ErrorMessage" EnableClientScript="False" OnServerValidate="StartDateMustNotBeInThePastValidation" />
            <asp:CompareValidator runat="server" ID="EndDateGreaterThanStartDateValidator" CssClass="dnnFormMessage dnnFormError" ControlToValidate="EndDatePicker" Operator="GreaterThan" ControlToCompare="StartDatePicker" Display="Dynamic" resourcekey="EndDateGreaterThanStartDate.ErrorMessage" />
        </div>
    </div>
</asp:Panel>
<script type="text/javascript">
    $(document).ready(function () {

        var publishPeridodCheckBox = $("#<%= FileEnablePublishPeriodCheckBox.ClientID%>");
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

        var $tags = $("#<%= Tags.ClientID%>");
        controller.initTagsInput($tags, {
                width: "280px",
                defaultText: '<%= Localization.GetSafeJSString(LocalizeString("AddTag.Text")) %>',
                maxItemsToShow: 10,
                lessThanMinCharsErrorTitle: '<%= Localization.GetSafeJSString(LocalizeString("LessThanMinCharsError.Title")) %>',
                moreThanMaxCharsErrorTitle: '<%= Localization.GetSafeJSString(LocalizeString("MoreThanMaxCharsError.Title")) %>',
                moreThanMaxTagsErrorTitle: '<%= Localization.GetSafeJSString(LocalizeString("MoreThanMaxTagsError.Title")) %>',
                lessThanMinCharsErrorText: '<%= Localization.GetSafeJSString(LocalizeString("LessThanMinCharsError.Text")) %>',
                moreThanMaxCharsErrorText: '<%= Localization.GetSafeJSString(LocalizeString("MoreThanMaxCharsError.Text")) %>',
                moreThanMaxTagsErrorText: '<%= Localization.GetSafeJSString(LocalizeString("MoreThanMaxTagsError.Text")) %>'
            });
        
        var tagEnabled = !$tags.is(":disabled");
        if (!tagEnabled) {
            $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput").addClass("dnnModuleDigitalAssetsPreviewInfoTagDisabled");
            $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput input").remove();
            $(".dnnModuleDigitalAssetsPreviewInfoTag .dnnTagsInput .tag > a").remove();
        }
    });
</script>
