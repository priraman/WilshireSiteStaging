<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="PageSettingsTrackLinksSettingControl.ascx.cs" Inherits="Evoq.Content.Library.UserControls.PageSettingsTrackSettingSection" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>

<div class="dnnFormItem">    
    <dnn:label id="TrackLinksLabel" runat="server" controlname="WorkflowComboBox" sufix=":"/>
    <div><asp:CheckBox ID="TrackLinksCheckBox" runat="server" /></div>    
</div>
