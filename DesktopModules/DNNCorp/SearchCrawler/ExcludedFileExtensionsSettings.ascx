<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="ExcludedFileExtensionsSettings.ascx.cs" Inherits="DotNetNuke.Professional.SearchCrawler.ExcludedFileExtensionsSettings" %>
<div class="dnnFormItem">
    <p><%=LocalizeString("introExcludedExtensions")%></p>
</div>
<div class="dnnFormItem">
    <div id="excludedExtensionsContainer">
        <div class="dnnTableHeader">
            <a class='dnnSecondaryAction dnnRight' id="btnAddExcludedFileExtension" data-bind="click: addExtension"><%= LocalizeString("btnAddFileType") %></a>
            <div class="dnnClear"></div>
        </div>
        <table class="dnnTableDisplay" width="100%" id="excludedFileExtensionsTable">
            <thead>
                <tr class="dnnGridHeader">
                    <th><span>File Extension</span></th>
                    <th width="15%"><span>Actions</span></th>
                </tr>
            </thead>
            <tbody data-bind="foreach: { data: fileExtensions}">
                <tr data-bind="css: { excludedFileExtensionEditRow: newExtension() }">
                    <!-- ko if: newExtension -->
                    <td>
                        <div class="editExcludedFileExtensionContainer">
                            <input type="text" id="newExtension" data-bind="value: extension, valueUpdate: 'afterkeydown', event: { keypress: $parent.addOnEnter }" />
                            <span class="dnnFormMessage dnnFormError" data-bind="css: { displayError: showError }, html: errorHtml"></span>
                        </div>
                    </td>
                    <!-- /ko -->
                    <!-- ko ifnot: newExtension -->
                    <td data-bind="text: extension"></td>
                    <!-- /ko -->
                    <td>
                        <!-- ko if: newExtension -->
                        <a data-bind="click: $parent.saveExtension" class="btnSaveExcludedFileExtension"></a>
                        <a data-bind="click: $parent.removeExtension" class="btnCancelExcludedFileExtension"></a>
                        <!-- /ko -->
                        <!-- ko ifnot: newExtension -->
                        <a data-bind="click: $parent.removeExtension" class="btnDeleteExcludedFileExtension"></a>
                        <!-- /ko -->
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
<script type="text/javascript">
    var vm = new ExcludedFileExtensionsViewModel();
    function init() {
        vm.settings = dnn.searchAdmin.extensionsInitializeSettings["dnn.searchAdminPro"];
        vm.loadExtensions();
    }
    $(document).ready(init);
    ko.applyBindings(vm, document.getElementById('excludedExtensionsContainer'));
</script>


