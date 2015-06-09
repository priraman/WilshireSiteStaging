<%@ Control AutoEventWireup="false" Explicit="True" Inherits="DotNetNuke.UI.Containers.Container" %>
<%@ Register TagPrefix="dnn" TagName="TITLE" Src="~/Admin/Containers/Title.ascx" %>
<div class="DNNContainer_Title_h5 spacingBottom">
    <h5><dnn:TITLE runat="server" id="dnnTITLE" CssClass="TitleH5" /></h5>
    <div id="ContentPane" runat="server"></div>
</div>

