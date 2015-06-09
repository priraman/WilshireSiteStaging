<%@ Control Inherits="DotNetNuke.Modules.HtmlPro.Settings" CodeBehind="Settings.ascx.cs" language="C#" AutoEventWireup="false"  %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<div class="dnnForm dnnHTMLSettings dnnClear">
	<div class="dnnFormItem">
		<dnn:label id="plReplaceTokens" controlname="chkReplaceTokens" runat="server" />
		<asp:CheckBox ID="chkReplaceTokens" runat="server" />
	</div>
	<div class="dnnFormItem">
        <dnn:label id="plSearchDescLength" runat="server" controlname="txtSearchDescLength" />
        <asp:TextBox ID="txtSearchDescLength" runat="server" />
        <asp:RegularExpressionValidator runat="server" ControlToValidate="txtSearchDescLength"
            Display="Dynamic" CssClass="dnnFormMessage dnnFormError" ValidationExpression="^\d+$" resourcekey="valSearchDescLength.ErrorMessage" />
    </div>    
</div>