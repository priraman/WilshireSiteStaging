<%@ Control AutoEventWireup="false" Explicit="True" Inherits="DotNetNuke.UI.Containers.Container" %>
<%@ Register TagPrefix="dnn" TagName="TITLE" Src="~/Admin/Containers/Title.ascx" %>
<div class="DNNContainer_Title_h1">
    <h1><dnn:TITLE runat="server" id="dnnTITLE" CssClass="TitleH1" /></h1>
    <div id="ContentPane" runat="server"></div>
</div>


