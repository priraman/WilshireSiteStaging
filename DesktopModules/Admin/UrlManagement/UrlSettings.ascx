<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UrlSettings.ascx.cs" Inherits="DotNetNuke.Professional.UrlManagement.UrlSettings" %>
<%@ Register TagPrefix="dnn" TagName="label" Src="~/controls/labelcontrol.ascx" %>

<div class="dnnFormItem">
    <dnn:Label ID="enable301RedirectsLabel" ControlName="enable301Redirects" runat="server" />
    <asp:CheckBox ID="enable301Redirects" runat="server" resourcekey="enable301Redirects" />
</div>
<div class="dnnFormItem">
    <dnn:Label ID="enableLowerCaseLabel" ControlName="enableLowerCase" runat="server" />
    <asp:CheckBox ID="enableLowerCase" runat="server" resourcekey="enable" />
</div>
<div class="dnnFormItem">
    <dnn:Label ID="enableSystemGeneratedUrlsLabel" ControlName="enableSystemGeneratedUrls" runat="server" />
    <div class="dnnFormGroup">
        <div>
            <asp:CheckBox ID="enableSystemGeneratedUrls" runat="server" resourcekey="enableSystemGeneratedUrls" />
        </div>
        <div id="CharacterSubSection">
            <dnn:Label runat="server" ID="CharacterSubListLabel" ControlName="CharacterSubList" CssClass="NormalBold" />
            <asp:DropDownList runat="server" ID="CharacterSubList" CssClass="dnnCharacterList">
                <Items>
                    <asp:ListItem Value="-" resourcekey="minusCharacter"></asp:ListItem>
                    <asp:ListItem Value="_" resourcekey="underscoreCharacter"></asp:ListItem>
                </Items>
            </asp:DropDownList>
        </div>
    </div>
</div>
<div class="dnnFormItem">
    <dnn:Label ID="pageExtensionHandlingLabel" ControlName="pageExtensionHandling" runat="server" />
    <asp:RadioButtonList ID="pageExtensionHandling" runat="server" RepeatDirection="Vertical" CssClass="dnnFormRadioButtons" />
</div>
<div class="dnnFormItem">
    <dnn:label id="plDeletedPages" runat="server" controlname="optDeletedPageHandling" />
    <asp:RadioButtonList ID="optDeletedPageHandling" runat="server" RepeatDirection="Vertical" CssClass="dnnFormRadioButtons">
        <asp:ListItem Value="Do301RedirectToPortalHome" resourcekey="Do301RedirectToPortalHome" />
        <asp:ListItem Value="Do404Error" resourcekey="Do404Error" />
    </asp:RadioButtonList>
</div>

<script language="javascript" type="text/javascript">
/*globals jQuery, window, Sys */
(function ($, Sys) {

    function setupUrlSettings() {
        if (document.getElementById('<%=enableSystemGeneratedUrls.ClientID %>')) {
            toggleSection('CharacterSubSection', document.getElementById('<%=enableSystemGeneratedUrls.ClientID %>').checked);

            $("#<%=enableSystemGeneratedUrls.ClientID %>").change(function (e) {
                toggleSection('CharacterSubSection', this.checked);
            });
        }
    }

    function toggleSection(id, isToggled) {
        $("div[id$='" + id + "']").toggle(isToggled);
    }

    $(document).ready(function () {
        setupUrlSettings();
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            setupUrlSettings();
        });
    });

} (jQuery, window.Sys));
</script>

