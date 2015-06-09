<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="SiteSettingsVersionSettingsControl.ascx.cs" Inherits="Evoq.Content.Library.UserControls.SiteSettingsVersionSettingsSection" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>


<div class="dnnFormItem">
    <dnn:label id="PageVersionEnabledLabel" runat="server" controlname="chkFileVersionEnabled" />
    <asp:CheckBox ID="PageVersionEnabledCheckBox" runat="server" />
</div>
<div class="dnnFormItem">
    <dnn:label id="PageMaxVersionsLabel" runat="server" controlname="txtFileMaxVersions" CssClass="dnnFormRequired" />
    <asp:TextBox ID="PageMaxVersionsTextbox" runat="server" />
    <asp:RangeValidator ID="PageMaxVersionsRangeValidator" runat="server" ControlToValidate="PageMaxVersionsTextbox" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" MaximumValue="20" MinimumValue="1" Type="Integer" resourcekey="PageVersionSize.Error" style="right:51%"></asp:RangeValidator>
    <asp:RequiredFieldValidator runat="server" ControlToValidate="PageMaxVersionsTextbox" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" resourcekey="PageVersionRequired.Error" style="right:51%"></asp:RequiredFieldValidator>
</div>
<div class="dnnFormItem">
    <dnn:label id="FileVersionEnabledLabel" runat="server" controlname="chkFileVersionEnabled" />
    <asp:CheckBox ID="FileVersionEnabledCheckBox" runat="server" />
</div>
<div class="dnnFormItem">
    <dnn:label id="FileMaxVersionsLabel" runat="server" controlname="txtFileMaxVersions" CssClass="dnnFormRequired" />
    <asp:TextBox ID="FileMaxVersionsTextbox" runat="server" />
    <asp:RangeValidator ID="RangeValidatorVersions" runat="server" ControlToValidate="FileMaxVersionsTextbox" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" MaximumValue="25" MinimumValue="5" Type="Integer" resourcekey="FileVersionSize.Error" style="right:51%"></asp:RangeValidator>
    <asp:RequiredFieldValidator runat="server" ControlToValidate="FileMaxVersionsTextbox" Display="Dynamic" CssClass="dnnFormMessage dnnFormError" resourcekey="FileVersionRequired.Error" style="right:51%" ></asp:RequiredFieldValidator>
</div>