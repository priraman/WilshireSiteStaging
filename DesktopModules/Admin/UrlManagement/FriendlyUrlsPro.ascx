<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="FriendlyUrlsPro.ascx.cs" Inherits="DotNetNuke.Professional.UrlManagement.FriendlyUrlsPro" %>
<%@ Register TagPrefix="dnn" TagName="FriendlyUrls" Src="~/DesktopModules/Admin/HostSettings/FriendlyUrls.ascx" %>
<%@ Register TagPrefix="dnn" TagName="label" Src="~/controls/labelcontrol.ascx" %>

<asp:Placeholder ID="basicUrlPanel" runat="server" Visible="True">
    <div class="dnnFormItem">
        <dnn:Label ID="plUseFriendlyUrls" ControlName="chkUseFriendlyUrls" runat="server" />
        <asp:CheckBox ID="chkUseFriendlyUrls" runat="server" />
    </div>
</asp:Placeholder>
<asp:PlaceHolder ID="advancedUrlPanel" runat="server" Visible="True">
    <div class="dnnFormItem">
        <dnn:Label ID="enable301RedirectsLabel" ControlName="enable301Redirects" runat="server" />
        <asp:CheckBox ID="enable301Redirects" runat="server" resourcekey="enable301Redirects" />
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
</asp:PlaceHolder>
<div id="friendlyUrlsRow" class="dnnFormItem" runat="server">
    <dnn:FriendlyUrls ID="friendlyUrls" runat="server" />
</div>

<script language="javascript" type="text/javascript">
/*globals jQuery, window, Sys */
    (function ($, Sys) {
        
        function setUpDnnFriendlyUrlSettings() {
            if (document.getElementById('<%=chkUseFriendlyUrls.ClientID %>')) {
                toggleSection('friendlyUrlsRow', document.getElementById('<%=chkUseFriendlyUrls.ClientID %>').checked);

                $("#<%=chkUseFriendlyUrls.ClientID %>").change(function (e) {
                    toggleSection('friendlyUrlsRow', this.checked);
                });
            }

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
            setUpDnnFriendlyUrlSettings();
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
                setUpDnnFriendlyUrlSettings();
            });
        });

    }(jQuery, window.Sys));
</script>
