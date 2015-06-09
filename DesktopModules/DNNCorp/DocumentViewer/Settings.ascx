<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="DotNetNuke.Professional.DocumentViewer.Settings" %>
<%@ Register TagPrefix="dnnweb" TagName="Label" Src="~/controls/LabelControl.ascx" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>
<%@ Register TagPrefix="dnnweb" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<asp:Panel runat="server" ID="ScopeWrapper" CssClass="dnnDocumentViewerSettingsScopeWrapper">
    <h2 id="dnnSitePanel-GridAppearanceSettings" class="dnnFormSectionHead"><a href="" class="dnnSectionExpanded"><%=LocalizeString("GridAppearanceSettings")%></a></h2>  
    <fieldset>
        
        <div class="dnnFormItem">
            <dnnweb:Label ID="LayoutLabel" runat="server" CssClass="dnnFormRequired" ResourceKey="Layout" Suffix=":" />
            
            <div class="dnnDocumentViewerSettingControlBox dnnDocumentViewerLayoutSettings">
                
                <dnnweb:DnnComboBox runat="server" ID="LayoutComboBox" OnClientSelectedIndexChanged="updateColorSettingsPanelVisibility" CssClass="dnnDocumentViewerLayoutComboBox">
                    <Items>
                        <dnnweb:DnnComboBoxItem Value="False" ResourceKey="DefaultTemplate"></dnnweb:DnnComboBoxItem>
                        <dnnweb:DnnComboBoxItem Value="True" ResourceKey="CustomizableTemplate"></dnnweb:DnnComboBoxItem>
                    </Items>
                </dnnweb:DnnComboBox>
            
                <asp:Panel runat="server" ID="ColorSettingsPanel" CssClass="dnnDocumentViewerColorSettings">
                    <ul class="dnnAdminTabNav">
                        <li><a href="#dnnDocumentViewerSettingsDrawer"><%= LocalizeString("Drawer") %></a></li>
                        <li><a href="#dnnDocumentViewerSettingsHeader"><%= LocalizeString("Header") %></a></li>
                        <li><a href="#dnnDocumentViewerSettingsBreadcrumbs"><%= LocalizeString("Breadcrumbs") %></a></li>
                        <li><a href="#dnnDocumentViewerSettingsMain"><%= LocalizeString("Main") %></a></li>
                        <li><a href="#dnnDocumentViewerSettingsFooter"><%= LocalizeString("Footer") %></a></li>                
                    </ul>
                    <div id="dnnDocumentViewerSettingsDrawer">
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Background") %></span>
                            <dnnweb:DnnColorPicker ID="DrawerBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Button") %></span>
                            <dnnweb:DnnColorPicker ID="DrawerButtonColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("InactiveButton") %></span>
                            <dnnweb:DnnColorPicker ID="DrawerButtonInactiveColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("ButtonLabel") %></span>
                            <dnnweb:DnnColorPicker ID="DrawerButtonLabelColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Text") %></span>
                            <dnnweb:DnnColorPicker ID="DrawerTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                    </div>
                    <div id="dnnDocumentViewerSettingsHeader">
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Background") %></span>
                            <dnnweb:DnnColorPicker ID="HeaderBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Button") %></span>
                            <dnnweb:DnnColorPicker ID="HeaderButtonColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("ButtonLabel") %></span>
                            <dnnweb:DnnColorPicker ID="HeaderButtonLabelColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                    </div>
                    <div id="dnnDocumentViewerSettingsBreadcrumbs">
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Background") %></span>
                            <dnnweb:DnnColorPicker ID="BreadcrumbsBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Text") %></span>
                            <dnnweb:DnnColorPicker ID="BreadCrumbsTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Link") %></span>
                            <dnnweb:DnnColorPicker ID="BreadcrumbsLinkColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                    </div>
                    <div id="dnnDocumentViewerSettingsMain">
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("MainTitleText") %></span>
                            <dnnweb:DnnColorPicker ID="MainTitleTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("MainTitleBackground") %></span>
                            <dnnweb:DnnColorPicker ID="MainTitleBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Background") %></span>
                            <dnnweb:DnnColorPicker ID="MainBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("RowBackground") %></span>
                            <dnnweb:DnnColorPicker ID="MainRowBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Text") %></span>
                            <dnnweb:DnnColorPicker ID="MainRowTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("ActiveRowBackground") %></span>
                            <dnnweb:DnnColorPicker ID="MainActiveRowBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("ActiveRowText") %></span>
                            <dnnweb:DnnColorPicker ID="MainActiveRowTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                    </div>
                    <div id="dnnDocumentViewerSettingsFooter">
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Background") %></span>
                            <dnnweb:DnnColorPicker ID="FooterBackgroundColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Text") %></span>
                            <dnnweb:DnnColorPicker ID="FooterTextColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                        <div class="dnnDocumentViewerColorSetting"><span><%= LocalizeString("Link") %></span>
                            <dnnweb:DnnColorPicker ID="FooterLinkColorPicker" runat="server" ShowIcon="true" PaletteModes="All"></dnnweb:DnnColorPicker>
                        </div>
                    </div>
                </asp:Panel>
            </div>
        </div>

        <div class="dnnFormItem">
            <div id="ItemsPerPageFormItem">
                <dnnweb:Label ID="ItemsPerPageLabel" runat="server" CssClass="dnnFormRequired" ResourceKey="ItemsPerPage" Suffix=":" />
                <dnnweb:DnnComboBox runat="server" ID="ItemsPerPageComboBox" CssClass="dnnDocumentViewerItemsPerPageComboBox">
                    <Items>
                        <dnnweb:DnnComboBoxItem Value="10" Text="10"></dnnweb:DnnComboBoxItem>
                        <dnnweb:DnnComboBoxItem Value="25" Text="25"></dnnweb:DnnComboBoxItem>
                        <dnnweb:DnnComboBoxItem Value="50" Text="50"></dnnweb:DnnComboBoxItem>
                        <dnnweb:DnnComboBoxItem Value="100" Text="100"></dnnweb:DnnComboBoxItem>
                        <dnnweb:DnnComboBoxItem Value="2147483647" ResourceKey="All" ></dnnweb:DnnComboBoxItem>                        
                    </Items>
                </dnnweb:DnnComboBox>
            </div>
        </div>
    </fieldset>      
    <h2 id="dnnSitePanel-BasicSettings" class="dnnFormSectionHead"><a href="" class="dnnSectionExpanded"><%=LocalizeString("ViewColumnsManagementSettings")%></a></h2>
    <fieldset>
        <div class="dnnFormItem">
            <dnnweb:Label ID="ColumnsLabel" runat="server" CssClass="dnnFormRequired" ResourceKey="Columns" Suffix=":" />
            <div class="dnnDocumentViewerSettingControlBox dnnDocumentViewerSettingColumnsSettings">
                <p><%=LocalizeString("ColumnsInfo")%></p>
                <div class="dnnDocumentViewerSettingsInlinePanel dnnDocumentViewerSettingsColumnsContainer">
                    <div class="dnnDocumentViewerSettingsGridTopHeader">
                        <%=LocalizeString("AvailableColumns")%>
                    </div>
                    <table class="dnnDocumentViewerSettingsGrid dnnGrid">
                        <colgroup>
                            <col style="width: 35px;" />
                            <col />
                            <col style="width: 35px;" />
                        </colgroup>
                        <thead class="dnnGridHeader">
                            <tr>
                                <th class="noBorderLeft center">
                                    <input type="checkbox" data-bind="dnnCheckbox: true, checked: checkAllAvailableColumns" /></th>
                                <th class="noBorderRight"><%=LocalizeString("ColumnName")%></th>
                                <th class="noBorderRight noBorderLeft"></th>
                            </tr>
                        </thead>
                        <tbody data-bind="sortableList: { tmpl: 'column-template', list: availableColumns }" />
                    </table>
                </div>
                <div class="dnnDocumentViewerSettingsInlinePanel">
                    <ul class="pager buttonGroup">
                        <li><a class="pager-next" data-bind="click: selectColumns, css: { 'disabled': isAtLeastOneAvailableColumnChecked }"><span>NEXT</span></a></li>
                        <li><a class="pager-prev" data-bind="click: unselectColumns, css: { 'disabled': isAtLeastOneSelectedColumnChecked }"><span>PRE</span></a></li>
                    </ul>
                </div>
                <div class="dnnDocumentViewerSettingsInlinePanel dnnDocumentViewerSettingsColumnsContainer">
                    <div class="dnnDocumentViewerSettingsGridTopHeader">
                        <%=LocalizeString("SelectedColumns")%>
                    </div>
                    <table class="dnnDocumentViewerSettingsGrid dnnGrid">
                        <colgroup>
                            <col style="width: 35px;" />
                            <col />
                            <col style="width: 35px;" />
                        </colgroup>
                        <thead class="dnnGridHeader">
                            <tr>
                                <th class="noBorderLeft center">
                                    <input type="checkbox" data-bind="checked: checkAllSelectedColumns" />
                                </th>
                                <th><%=LocalizeString("ColumnName")%></th>
                                <th class="noBorderRight"></th>
                            </tr>
                        </thead>
                        <tbody data-bind="sortableList: { tmpl: 'column-withOrder-template', list: selectedColumns }" />
                    </table>
                </div>
            </div>
            <asp:CustomValidator runat="server" Display="Dynamic" resourcekey="AtLeastOneColumnsRequired.ErrorMessage" 
                CssClass="dnnFormMessage dnnFormError" ID="ColumnsRequiredValidator" OnServerValidate="ValidateColumnsRequired" ClientValidationFunction="columnsViewModel.validateColumns"/>
            <input name="selectedColumnsHiddenField" type="hidden" data-bind="value: selectedColumnsToString" />
        </div>
        <div class="dnnFormItem">
            <dnnweb:Label ID="DefaultSortOrderLabel" runat="server" ResourceKey="DefaultSortOrder" Suffix=":" ControlName="DefaultSortOrderComboBox" />
            <div class="dnnDocumentViewerSettingControlBox">
                <dnnweb:DnnComboBox id="DefaultSortOrderComboBox" runat="server" CssClass="dnnFixedSizeComboBox" DataValueField="Key" DataTextField="Name" />
                <div>
                    <asp:RadioButtonList ID="DefaultSortOrderRadioButtonList" runat="server" RepeatDirection="Horizontal" RepeatLayout="Flow">
                        <asp:ListItem Value="asc" resourcekey="Ascending" Selected="True" />
                        <asp:ListItem Value="desc" resourcekey="Descending" />
                    </asp:RadioButtonList>
                </div>
            </div>
        </div>
    </fieldset>
    <h2 id="dnnSitePanel-FilterSettings" class="dnnFormSectionHead"><a href="" class="dnnSectionExpanded"><%=LocalizeString("FilterViewManagementSettings")%></a></h2>
    <fieldset>
        <div class="dnnFormItem">
            <dnnweb:Label ID="ViewConditionLabel" runat="server" ResourceKey="ViewCondition" Suffix=":" />
            <div class="dnnDocumentViewerSettingControlBox">
                <asp:RadioButtonList runat="server" ID="FilterOptionsRadioButtonsList" runat="server" RepeatDirection="Horizontal" RepeatLayout="Flow">
                    <asp:ListItem Value="NoSet" resourcekey="NoSet" Selected="True" />
                    <asp:ListItem Value="FilterByFolder" resourcekey="FilterByFolder" />
                    <asp:ListItem Value="FilterByTags" resourcekey="FilterByTags" />
                </asp:RadioButtonList>
                <div id="FilterByFolderOptions">
                    <dnnweb:DnnFolderDropDownList ID="FilterByFolderDropDownList" runat="server" /><br/>
                    <div>                        
                        <asp:RadioButtonList ID="ExcludeSubfoldersRadioButtonList" runat="server" RepeatDirection="Vertical" RepeatLayout="Flow">
                            <asp:ListItem Value="0" resourcekey="ExcludeSubfolders" Selected="True" />                      
                            <asp:ListItem Value="1" resourcekey="IncludeSubfolders_FilesOnly"/>                      
                            <asp:ListItem Value="2" resourcekey="IncludeSubfolders_ShowFolderStructure"/>
                        </asp:RadioButtonList>
                    </div>                
                    <asp:CustomValidator runat="server" Display="Dynamic" resourcekey="FolderMustBeSelected.ErrorMessage" 
                        CssClass="dnnFormMessage dnnFormError" ID="FolderMustBeSelected" OnServerValidate="ValidateFolderIsSelected" ClientValidationFunction="settingsController.ValidateFolderIsSelected"/>
                </div>
                <div id="FilterByTagsOptions">
                    <asp:TextBox type="text" ID="Tags" runat="server" />                
                    <asp:CustomValidator runat="server" Display="Dynamic" resourcekey="TagsMustBeAdded.ErrorMessage" 
                        CssClass="dnnFormMessage dnnFormError" ID="TagsMustBeAdded" OnServerValidate="ValidateTagsAreAdded" ClientValidationFunction="settingsController.ValidateTagsAreAdded"/>
                </div>
            </div>
        </div>
    </fieldset>
    <script type="text/html" id="column-template">
        <tr class="dnnGridItem">
            <td class="center">
                <input type="checkbox" data-bind="dnnCheckbox: true, checked: checked" />
            </td>
            <td data-bind="text: name"></td>
            <td></td>
        </tr>
    </script>
    <script type="text/html" id="column-withOrder-template">
        <tr class="dnnGridItem">
            <td class="center">
                <input type="checkbox" data-bind="dnnCheckbox: true, checked: checked" />
            </td>
            <td data-bind="text: name"></td>
            <td data-bind="text: index"></td>
        </tr>
    </script>
</asp:Panel>

<script type="text/javascript">

    var columnsViewModel;
    var settingsController;

    function updateColorSettingsPanelVisibility(sender) {
        if (sender.get_value() == "True") {
            $('#<%=ColorSettingsPanel.ClientID%>').show();
        } else {
            $('#<%=ColorSettingsPanel.ClientID%>').hide();
        }
    }

    function init() {
        var moduleSettingsTab = $("li[id$=specificSettingsTab]");
        var userCanManageSettings = ("<%= UserCanManageSettings.ToString().ToLowerInvariant() %>" == "true");
        if (moduleSettingsTab && !userCanManageSettings) {
            moduleSettingsTab.hide();            
            return;
        }

        $('#<%=ColorSettingsPanel.ClientID%>').dnnTabs({ selected: 0 });
        <% if (LayoutComboBox.SelectedValue == "False") 
           { %>
            $('#<%=ColorSettingsPanel.ClientID%>').hide();
        <% } %>

        columnsViewModel = new dnn.ColumnsViewModel($, $find, ko, "<%= DefaultSortOrderComboBox.ClientID %>");
        columnsViewModel.init(selectedItems, availableItems);
        ko.applyBindings(columnsViewModel, document.getElementById("<%= ScopeWrapper.ClientID %>"));

        settingsController = new dnn.DocumentViewerFilterViewSettingsController({ serviceRoot: "DocumentViewer" },
            {
                TagInput: $("#<%= Tags.ClientID%>"),
                FolderDropDownList: $("#<%= FilterByFolderDropDownList.ClientID %>"),
                FilterOptionGroupID: '<%= FilterOptionsRadioButtonsList.ClientID %>',
                moduleId: "<%= ModuleId %>"
            });

        settingsController.initTagsInput({
            width: "96%",
            defaultText: '<%= Localization.GetSafeJSString(LocalizeString("AddTag.Text")) %>',
            maxItemsToShow: 10
        });
        
        settingsController.initFilterOptionsRadioInput();

    }

    $(document).ready(init);
    
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(init);
</script>
