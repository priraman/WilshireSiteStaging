<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="View.ascx.cs" Inherits="DotNetNuke.Professional.DocumentViewer.View" %>
<%@ Import Namespace="DotNetNuke.Services.Localization" %>

<asp:Panel ID="ScopeWrapper" runat="server" class="dnnDocumentViewerBackground" oncontextmenu="return false;">
    
    <% if (IsLeftPaneVisible)
       { %>
    <div class="dnnDocumentViewerLeftPane">     
        <% if (IsTreeViewVisible && IsTagsViewVisible)
           { %>   
        <ul class="dnnAdminTabNav dnnDocumentViewerTabNav buttonGroup">
            <li><a href="#dnnDocumentViewerLeftPaneFilesTabContent"><%= LocalizeString("LeftPaneFilesTab") %></a></li>
            <li><a href="#dnnDocumentViewerLeftPaneTagsTabContent"><%= LocalizeString("LeftPaneTagsTab") %></a></li>
        </ul>
        <% } %>
        <% if (IsTreeViewVisible)
           { %>   
        <div id="dnnDocumentViewerLeftPaneFilesTabContent">
            <div id="dnnDocumentViewerTreeContainer">
                <div id="dnnDocumentViewerTree" class="dnnDocumentViewerTree"></div>
            </div>
        </div>
        <% } %>
        <% if (IsTagsViewVisible)
           { %>
        <div id="dnnDocumentViewerLeftPaneTagsTabContent">
            <div id="dnnDocumentViewerLeftPaneFilesTabTags">

                <div class="toolbar">
                    <ul class="sorting buttonGroup">
                        <li class="ui-tabs-active" data-bind="css: { 'ui-tabs-active': sortedBy() == 'alpha' }">
                            <a title="<%= LocalizeString("OrderByAlphabetical") %>" class="sorting-alpha enabled" data-bind="click: function () { sortBy('alpha'); }">
                                <span class="icon">A-Z</span>
                                <span class="sort" data-bind="css: {asc: sortedBy() == 'alpha' && sortedOrder() == 'asc', desc: sortedBy() == 'alpha' && sortedOrder() == 'desc'}">sort</span>
                            </a>
                        </li>
                        <li data-bind="css: { 'ui-tabs-active': sortedBy() == 'count' }">
                            <a title="<%= LocalizeString("OrderByNumberOfResult") %>" class="sorting-count enabled" data-bind="click: function () { sortBy('count'); }">
                                <span class="icon">*</span>
                                <span class="sort" data-bind="css: { asc: sortedBy() == 'count' && sortedOrder() == 'asc', desc: sortedBy() == 'count' && sortedOrder() == 'desc'}">sort</span>
                            </a>
                        </li>
                    </ul>

                    <ul class="pager buttonGroup" style="display: block;" data-bind="visible: hasMultiplePages">
                        <li><a class="pager-prev" data-bind="css: { disabled: isFirstPage, enabled: !isFirstPage() }, click: prevPage"><span>PREV</span></a></li>
                        <li><a class="pager-next" data-bind="css: { disabled: isLastPage, enabled: !isLastPage() }, click: nextPage"><span>NEXT</span></a></li>
                    </ul>

                    <div class="loading" data-bind="visible: isLoadingTags"></div>
                </div>

                <ul class="tags" data-bind="foreach: tags, as: 'tag'">
                    <li data-bind="css: { selected: $parent.selectedTag() && TermID == $parent.selectedTag().TermID }, event: { contextmenu: $parent.contextMenuClick }">
                        <a href="#" data-bind="text: Name, click: $parent.selectTag, clickBubble: false"></a><span data-bind="text: Count"></span>
                    </li>
                </ul>

                <div id="dnnDocumentViewerLeftPaneFilesTabTagsPager" data-bind="visible: hasMultiplePages, html: pagerLabel"></div>
            </div>
        </div>
        <% } %>

    </div>
    <% } %>
    <div id="dnnDocumentViewerContentPane">

        <div id="dnnDocumentVewerLoadingPanel" class="dnnDocumentViewerLoading"></div>
        
        <% if (IsLeftPaneVisible)
        { %>
        <div id="dnnDocumentViewerMainBar">            
            <button title="<%= LocalizeString("Toggle") %>" class="dnnDocumentViewerMainButton" id="dnnDocumentViewerToggleButton">
                <span class="treeViewHide"><%= LocalizeString("Toggle") %></span>
            </button>            

            <button title="<%=LocalizeString("Refresh")%>" class="dnnDocumentViewerMainButton dnnDocumentViewerRightAlign" id="dnnDocumentViewerRefreshButton">
                <span><%=LocalizeString("Refresh")%></span>
            </button>           
            
            <% if (IsCustomTemplate)
               { %>

            <button title="<%= LocalizeString("ToggleSort") %>" class="dnnDocumentViewerMainButton dnnDocumentViewerRightAlign" id="dnnDocumentViewerToggleSortButton" data-bind="click: toggleSort">
                <span data-bind="css: { descending: sortedByOrder() == 'desc' }"><%= LocalizeString("ToggleSort") %></span>
            </button>
            
            <select class="dnnDocumentViewerMainSelect dnnDocumentViewerRightAlign" 
                data-bind="options: columns, optionsText: 'name', optionsValue: 'key', value: sortedByColumnName, optionsCaption: '<%=LocalizeString("SortBy")%>', event:{ change: sortColumnChange }">            
            </select>            
            
            <% } %>
        </div>
        <% } %>

        <div id="dnnDocumentViewerSelectionToolbar">
            
            <div id="dnnDocumentViewerBreadcrumb">
                <ul></ul>
            </div>
            
            <button id="dnnDocumentViewerGetUrlButton" title="<%=LocalizeString("GetUrl")%>" data-bind="visible: canViewItemOptions(), click: getUrlSelectedItem">
                <span><%=LocalizeString("GetUrl")%></span>
            </button>

            <button id="dnnDocumentViewerDownloadButton" title="<%=LocalizeString("Download")%>" data-bind="visible: canViewFile(), click: downloadSelectedItem">
                <span><%=LocalizeString("Download")%></span>
            </button>
            
        </div>

        <div id="dnnDocumentViewerContainer">
                        
            <div id="dnnDocumentViewerGridContainer">
                <table class="dnnGrid dnnDocumentViewerGrid">
                    <colgroup data-bind="foreach: columns">
                    <col data-bind="attr: { id: key }, style: { width: columnWidth }">
                    </colgroup>
                    <thead class="dnnGridHeader">
                        <tr data-bind="foreach: columns">
                            <th>
                                <div>
                                    <span class="title" data-bind="text: name, click: $parent.sortColumn"></span>
                                    <span data-bind="css: sortCss, click: $parent.sortColumn"></span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody data-bind="foreach: { data: items, as: 'item' }, visible: totalCount() > 0">
                        <tr class="dnnGridItem" data-bind="foreach: { data: $root.columns, as: 'column' },
                                                            click: $root.selectItem,
                                                            css: { dnnDocumentViewerSelectedRow: $root.selectedItem() && ItemId == $root.selectedItem().ItemId },
                                                            event: { contextmenu: $root.contextMenuClick }">
                            <td>
                                <div data-bind="css: columnCss, attr: { title: item[key] }">
                                <!-- ko if: key == "Name" -->
                                    <a href="#" data-bind="click: function () { $root.itemAction(item) }, clickBubble: false">
                                        <img data-bind="attr: { src: item.IconUrl }" class="ItemIcon" />
                                        <span data-bind="text: item.Name"></span>
                                    </a>
                                <!-- /ko -->
                                <!-- ko if: key != 'Name' -->
                                    <span data-bind="text: item[key]"></span>
                                <!-- /ko -->
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>            
            </div>

            <div class="dnnDocumentViewerPager">
                <div class="dnnDocumentViewerPagerLeft" data-bind="if: pages().length > 1">
                    <a href="#" data-bind="click: function () { changePage(0) }, css: { dnnDocumentViewerPagerDisabled: currentPage() == 0 }"><%=LocalizeString("First")%></a>
                    <a href="#" data-bind="click: function () { changePage(currentPage() - 1) }, css: { dnnDocumentViewerPagerDisabled: currentPage() == 0 }"><%=LocalizeString("Prev")%></a>
                    <ul data-bind="foreach: pages">
                        <li><a href="#" data-bind="click: function () { $parent.changePage($data - 1) }, text: $data, css: { dnnDocumentViewerPagerCurrentPage: $data - 1 == $parent.currentPage() }"></a></li>
                    </ul>
                    <a href="#" data-bind="click: function () { changePage(currentPage() + 1) }, css: { dnnDocumentViewerPagerDisabled: currentPage() == lastPage() - 1 }"><%=LocalizeString("Next")%></a>
                    <a href="#" data-bind="click: function () { changePage(lastPage() - 1) }, css: { dnnDocumentViewerPagerDisabled: currentPage() == lastPage() - 1 }"><%=LocalizeString("Last")%></a>
                </div>

                <div class="dnnDocumentViewerPagerRight" data-bind="visible: totalCount() > 0, text: totalItemsText"></div>
            </div>

            <div data-bind="visible: totalCount() === 0" class="dnnDocumentViewerNoItems">
                <span><%=LocalizeString("EmptyFolder")%></span>
            </div>
            
        </div>
    </div>
    
    <div id="dnnDocumentViewerGetUrlModal" style="display: none;">
        <br />
        <span><%=LocalizeString("GetFileUrlLabel") %></span>
        <input type="text" readonly="readonly" onclick="this.select()" title="<%=LocalizeString("GetUrlAltText") %>" />
    </div>
    
    <ul id="dnnDocumentViewerContextMenu" style="display: none;">
        <li class="onlyFiles">
            <a href="#" data-bind="click: downloadSelectedItem" style="background-image: url(<%= ResolveUrl("~/icons/sigma/FileDownload_16x16_Black.png") %>);"><%=LocalizeString("Download")%></a>
        </li>
        <li>
            <a href="#" data-bind="click: getUrlSelectedItem" style="background-image: url(<%= ResolveUrl("~/icons/sigma/FileLink_16x16_Black.png") %>);"><%=LocalizeString("GetUrl")%></a>
        </li>
    </ul>

</asp:Panel>

<script type="text/javascript">
    $(function () {

        $('.dnnDocumentViewerLeftPane', "#<%=ScopeWrapper.ClientID%>").dnnTabs({ selected: parseInt("<%= InitialTab %>") });

        $('> #dnnDocumentViewerContextMenu', $(document.body)).remove();
        $('#dnnDocumentViewerContextMenu').appendTo(document.body);

        dnn.createDocumentViewer({
            scopeWrapperId: "<%=ScopeWrapper.ClientID%>",
            treeElementId: "dnnDocumentViewerTreeContainer",
            treeContainerCss: "dnnDocumentViewerTree",
            tagsPanelId: "dnnDocumentViewerLeftPaneFilesTabTags",
            loadingPanelId: "dnnDocumentVewerLoadingPanel",
            contextMenuId: "dnnDocumentViewerContextMenu",
            contentPaneId: "dnnDocumentViewerContentPane",
            gridContainerId: "dnnDocumentViewerGridContainer",
            moduleId: "<%= ModuleId %>",
            rootFolderId: "<%=RootFolderId%>",
            defaultSelectionContext: "Folders",
            gridSettings: {
                columns: columns,
                defaultSortColumnName: "<%= DefaultSortColumnName %>",
                defaultSortOrder: "<%= DefaultSortOrder %>",
                pageSize: "<%= PageSize %>"
            },
            resources: {
                itemsOnPage: "<%=Localization.GetSafeJSString(LocalizeString("ItemsOnPage"))%>",
                items: "<%=Localization.GetSafeJSString(LocalizeString("Items"))%>",
                oneItem: "<%=Localization.GetSafeJSString(LocalizeString("OneItem"))%>",
                tagPagerText: "<%=Localization.GetSafeJSString(LocalizeString("TagsPager"))%>",
                getUrlTitle: "<%=Localization.GetSafeJSString(LocalizeString("GetUrl.Title"))%>",
                fileUrlLabel: "<%= Localization.GetSafeJSString(LocalizeString("GetFileUrlLabel"))%>",
                tagUrlLabel: "<%= Localization.GetSafeJSString(LocalizeString("GetTagUrlLabel"))%>",
                folderUrlLabel: "<%= Localization.GetSafeJSString(LocalizeString("GetFolderUrlLabel"))%>",    
                closeText: "<%=Localization.GetSafeJSString(LocalizeString("Close"))%>",
                tagSelectedText: "<%=Localization.GetSafeJSString(LocalizeString("TagSelected"))%>",
                tagsSelectedText: "<%=Localization.GetSafeJSString(LocalizeString("TagsSelected"))%>",
                filterByFolderText: "<%=Localization.GetSafeJSString(LocalizeString("FilterByFolder"))%>"
            },
            filterViewSettings: {
                filterOption: "<%= FilterOption %>",
                excludeSubfolders: ("<%= ExcludeSubfolders.ToString().ToLowerInvariant() %>" == "true"),
                isLeftPaneVisible: ("<%= IsLeftPaneVisible.ToString().ToLowerInvariant() %>" == "true"),
                guidanceTags: "<%= GuidanceTags %>"
            },
            initialViewSettings: {
                valid: ("<%= IsInitialViewReceived.ToString().ToLowerInvariant() %>" == "true"),
                initialContext: "<%= InitialPanel %>",
                initialValue: "<%= InitialValue %>"                
            }
        }, {
            services: {
                getFolderContentMethod: "ContentService/GetFolderContent",
                getTreeMethod: "ContentService/GetFolders",
                getNodeDescendantsMethod: "ContentService/GetFolderDescendants",
                getTreeWithNodeMethod: "ContentService/GetTreePathForFolder",
                getTagsMethod: "ContentService/GetTags",
                getFilesByTagMethod: "ContentService/GetFilesByTags",
                serviceRoot: "DocumentViewer"
            }
        });

        $("#dnnDocumentViewerToggleButton", "#<%=ScopeWrapper.ClientID%>").click(function (e) {
            dnn.dnnDocumentViewer.toggleLeftPane($(this).find("span"));
            e.preventDefault();
        });

        $("#dnnDocumentViewerRefreshButton", "#<%=ScopeWrapper.ClientID%>").click(function (e) {
            dnn.dnnDocumentViewer.refresh();
            e.preventDefault();
        });
        
    });

</script>
