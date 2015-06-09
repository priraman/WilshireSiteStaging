<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="IncludedFileExtensionsSettings.ascx.cs" Inherits="DotNetNuke.Professional.SearchCrawler.IncludedFileExtensionsSettings" %>

<div class="dnnFormItem">
    <p><%=LocalizeString("introIncludedExtensions")%></p>
</div>
<% if (FullTrust)
    { %>
<div class="dnnFormItem">
    <div class="dnnTableHeader">
        <a class='dnnSecondaryAction dnnRight' id="btnAddIncludedFileExtension"><%= LocalizeString("btnAddFileType") %></a>
        <div class="dnnClear"></div>
    </div>
    <table class="dnnTableDisplay" width="100%" id="includedFileExtensionsTable">
        <tr class="dnnGridHeader">
            <th width="30%">
                <span><%= LocalizeString("FileExtension") %></span>
            </th>
            <th>
                <span><%= LocalizeString("FileType") %></span>
            </th>
            <th width="20%">
                <span><%= LocalizeString("ContentCrawling") %></span>
            </th>
            <th width="15%">
                <span><%= LocalizeString("Actions") %></span>
            </th>
        </tr>


        <tr class="includedFileExtensionEditRow">
            <td>
                <div class="editIncludedFileExtensionContainer">
                    <input type="text" value="" /><span class="dnnFormMessage dnnFormError"></span>
                </div>
            </td>
            <td></td>
            <td></td>
            <td>
                <a href="javascript:void(0)" class="btnSaveIncludedFileExtension"></a>
                <a href="javascript:void(0)" class="btnCancelIncludedFileExtension"></a>
            </td>
        </tr>
    </table>
</div>
<% }
    else
    { %>
<div class="dnnFormItem">
        <div class="dnnFormMessage dnnFormError">
            <%= LocalizeString("FullTrustDisableWarning") %>
    </div>
</div>
<% } %>