<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="PageSettings.ascx.cs" Inherits="DotNetNuke.Professional.UrlManagement.PageSettings" %>
<%@ Register TagPrefix="dnn" TagName="Label" Src="~/controls/LabelControl.ascx" %>

<div id="UrlManagementView" class="um-content" runat="server">

    <div class="custom-urls-header">
        <div>
            <dnn:Label resourcekey="CustomUrlsLabel" runat="server" ControlName="custom-urls-header-useCustomUrls" />
        </div>
        <a href="javascript:void(0)" data-bind="click: createCustomUrl" title="<%= LocalizeString("CreateButtonTooltip") %>" class="dnnSecondaryAction"><%= LocalizeString("CreateButton") %></a>
    </div>

    <script type="text/html" id="url-template">

        <div class="um-edit-url-dialog" data-bind="with: $root.editViewModel">
            <div class="dnnForm" data-bind="with: url, initEditRow: true, css: { busy: saving() }">
                <ul class="um-fields">
                    <li class="dnnFormItem um-alias-container">                        
                        <div data-bind="dnnTooltip: true"><dnn:Label resourcekey="EditSiteAliasLabel" runat="server" /></div>
                        <select class="um-edit-url-dialog-aliases required" data-bind="options: $parent.siteAliases, optionsText: 'value', value: siteAlias">
                        </select>
                    </li>
                    <li class="dnnFormItem um-path-container">
                        <div data-bind="dnnTooltip: true"><dnn:Label resourcekey="EditUrlPathLabel" runat="server" /></div>
                        <div class="um-input-container"><input type="text" class="um-edit-url-dialog-path" data-bind="value: path" /></div>
                    </li>
                </ul>

                <ul class="um-fields um-alias-options-fields" data-bind="visible: !$parent.isPrimaryAlias()">
                    <li class="um-alias-options-container">
                        <div data-bind="dnnTooltip: true" class="um-alias-options-caption">
                            <dnn:Label resourcekey="SelectedSiteAliasUsage" runat="server" />
                        </div>
                        <ul class="um-radiobuttons">
                            <li>
                                <input type="radio" id="um-edit-url-dialog-alias-options-0" name="alias-options" data-bind="value: $parent.siteAliasUsages().ChildPagesDoNotInherit, checked: siteAliasUsage" />
                                <label for="um-edit-url-dialog-alias-options-0"><span></span><%= LocalizeString("ThisPageOnly")%></label>
                            </li>
                            <li>
                                <input type="radio" id="um-edit-url-dialog-alias-options-1" name="alias-options" data-bind="value: $parent.siteAliasUsages().ChildPagesInherit, checked: siteAliasUsage" />
                                <label for="um-edit-url-dialog-alias-options-1"><span></span><%= LocalizeString("PageAndChildPages")%></label>
                            </li>
                            <li data-bind="visible: $parent.hasParent()">
                                <input type="radio" id="um-edit-url-dialog-alias-options-2" name="alias-options" data-bind="value: $parent.siteAliasUsages().InheritedFromParent, checked: siteAliasUsage" />
                                <label for="um-edit-url-dialog-alias-options-2"><span></span><%= LocalizeString("SameAsParentPage")%></label>
                            </li>
                        </ul>
                    </li>
                </ul>

                <ul class="um-fields">
                    <li class="dnnFormItem um-locales-container" data-bind="visible: !$root.singleLocale()">
                        <label><%= LocalizeString("EditLanguageLabel") %></label>
                        <select class="um-edit-url-dialog-locales" data-bind="options: $parent.locales, optionsText: 'value', value: locale">
                        </select>
                    </li>
                    <li class="um-statuscodes-and-querystring-container" data-bind="css: { singleLocale: $root.singleLocale() } ">
                        <ul>
                            <li class="dnnFormItem um-statuscodes-container">
                                <div data-bind="dnnTooltip: true"><dnn:Label resourcekey="EditUrlTypeLabel" runat="server" /></div>
                                <select class="um-edit-url-dialog-statuscodes required" data-bind="options: $parent.statusCodes, optionsText: 'value', value: statusCode">
                                </select>
                            </li>
                            <li class="dnnFormItem um-querystring-container" data-bind="css: { disabled: is200() }">
                                <div data-bind="dnnTooltip: true"><dnn:Label resourcekey="EditUrlQueryStringLabel" runat="server" /></div>
                                <div class="um-input-container"><input type="text" class="um-edit-url-dialog-querystring" data-bind="value: queryString, disable: is200" /></div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <ul class="dnnActions dnnClear">
                <li>
                    <a href="javascript:void(0)" data-bind="click: save" title="<%= LocalizeString("Save") %>" class="dnnPrimaryAction"><%= LocalizeString("Save") %></a>
                    <a href="javascript:void(0)" data-bind="click: cancel" title="<%= LocalizeString("Cancel") %>" class="dnnSecondaryAction"><%= LocalizeString("Cancel") %></a>
                </li>
            </ul>

            <!-- ko if: saving -->
            <img src="/Images/icon_wait.gif" class="um-busy-image" alt="" ></img>
            <!-- /ko -->

        </div>

    </script>

    <!-- ko if: $root.creating -->
    <div class="um-create-url-container" data-bind='template: { name: "url-template" }'>
    </div>
    <!-- /ko -->

    <!-- ko if: $root.customUrls.urls().length > 0 -->
    <table class="dnnTableDisplay fixed" id="custom-urls" data-bind="with: customUrls">
        <colgroup>
            <col class="custom-urls-col-default"/>
            <col class="custom-urls-col-path"/>
            <!-- ko ifnot: $root.singleLocale -->
            <col class="custom-urls-col-language"/>
            <!-- /ko -->
            <col class="custom-urls-col-urltype"/>
            <col class="custom-urls-col-actions"/>
        </colgroup>
        <thead>
            <tr>
                <th><a class="no-sort" href="javascript:void(0)"></a></th>
                <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Url }"><%= LocalizeString("ColumnUrl") %></a></th>
                <!-- ko ifnot: $root.singleLocale -->
                <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Locale }"><%= LocalizeString("ColumnLanguage") %></a></th>
                <!-- /ko -->
                <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Status }"><%= LocalizeString("ColumnUrlType") %></a></th>
                <th><a class="no-sort" href="javascript:void(0)"><%= LocalizeString("ColumnActions") %></a></th>
            </tr>
        </thead>
        <tbody>
            <!-- ko foreach: urls -->
            <!-- ko ifnot: editing -->
            <tr data-bind="initViewRow: true">
                <td data-bind="css: { is200: is200() }"></td>
                <td class="wordwrap" data-bind="text: aliasAndPath"></td>
                <!-- ko ifnot: $root.singleLocale -->
                <td data-bind="text: locale().value"></td>
                <!-- /ko -->
                <td data-bind="text: statusCode().value"></td>
                <td>
                    <ul class="actions">
                        <li class="action-edit">
                            <a href="#" data-bind="click: editUrl" title="<%= LocalizeString("ActionEditTooltip") %>">
                            </a>
                        </li>
                        <li class="action-delete last">
                            <a href="#" data-bind="attachDeleteConfirmation: true" title="<%= LocalizeString("ActionDeleteTooltip") %>">
                            </a>
                        </li>
                    </ul>
                </td>
            </tr>
            <!-- /ko -->
            <!-- ko if: editing -->
            <tr class="um-edit-url-row">
                <td data-bind='attr: { colspan: $root.singleLocale() ? "4" : "5" }, template: { name: "url-template" }'>
                </td>
            </tr>
            <!-- /ko -->
            <!-- /ko -->
        </tbody>
    </table>
    <!-- /ko -->

    <!-- ko if: $root.systemGeneratedUrls.urls().length > 0 -->
    <div data-bind="with: systemGeneratedUrls">
        <div class="system-generated-urls-header">
            <dnn:Label ID="SystemGeneratedUrlsLabel" resourcekey="SystemGeneratedUrlsLabel" runat="server" ControlName="system-generated-urls" />
        </div>
        <table class="dnnTableDisplay fixed" id="system-generated-urls">
            <colgroup>
                <col class="custom-urls-col-default"/>
                <col class="custom-urls-col-path"/>
                <!-- ko ifnot: $root.singleLocale -->
                <col class="custom-urls-col-language"/>
                <!-- /ko -->
                <col class="custom-urls-col-urltype"/>
                <col class="custom-urls-col-actions"/>
            </colgroup>
            <thead>
                <tr>
                    <th><a class="no-sort" href="javascript:void(0)"></a></th>
                    <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Url }"><%= LocalizeString("ColumnUrl") %></a></th>
                    <!-- ko ifnot: $root.singleLocale -->
                    <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Locale }"><%= LocalizeString("ColumnLanguage") %></a></th>
                    <!-- /ko -->
                    <th><a href="" data-bind="click: sort, attr: { data: sortingFields().Status }"><%= LocalizeString("ColumnUrlType") %></a></th>
                    <th><a class="no-sort" href="javascript:void(0)"></a></th>
                </tr>
            </thead>
            <tbody>
                <!-- ko foreach: urls -->
                <tr>
                    <td></td>
                    <td class="wordwrap" data-bind="text: aliasAndPath"></td>
                    <!-- ko ifnot: $root.singleLocale -->
                    <td data-bind="text: locale().value"></td>
                    <!-- /ko -->
                    <td data-bind="text: statusCode().value"></td>
                    <td></td>
                </tr>
                <!-- /ko -->
            </tbody>
        </table>
    </div>
    <!-- /ko -->

</div>
