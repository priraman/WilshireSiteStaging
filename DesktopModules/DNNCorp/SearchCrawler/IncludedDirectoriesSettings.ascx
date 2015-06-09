<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="IncludedDirectoriesSettings.ascx.cs" Inherits="DotNetNuke.Professional.SearchCrawler.IncludedDirectoriesSettings" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>
<div class="dnnFormItem">
    <p><%=LocalizeString("introDirectories")%></p>
</div>
<div class="dnnFormItem">
    <div class="dnnTableHeader">
        <a class='dnnSecondaryAction dnnRight' id="btnAddDirectory"><%= LocalizeString("btnAddDirectory") %></a>
        <div class="dnnClear"></div>
    </div>
    <table class="dnnTableDisplay" width="100%" id="directoriesTable">
        <tr class="dnnGridHeader">
            <th>
                <span><%= LocalizeString("Directory") %></span>
            </th>

            <th width="15%">
                <span><%= LocalizeString("Actions") %></span>
            </th>
        </tr>


        <tr class="directoryEditRow">
            <td>
                <div class="editDirectoryContainer">
                    <dnnweb:DnnFolderDropDownList ID="cboFolders" runat="server" />
                    <span class="dnnFormMessage dnnFormError"></span>
                </div>
            </td>
            <td>
                <a href="javascript:void(0)" class="btnSaveDirectory"></a>
                <a href="javascript:void(0)" class="btnCancelDirectory"></a>
            </td>
        </tr>
    </table>
</div>