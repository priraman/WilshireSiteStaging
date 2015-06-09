<%@ Control language="C#" Inherits="DotNetNuke.Modules.HtmlPro.HtmlModule" CodeBehind="HtmlModule.ascx.cs" AutoEventWireup="false"  %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.UI.WebControls" Assembly="DotNetNuke.Web" %>

<div runat="server" id="lblContent"></div>
<div id="dialog-modal" title="Basic modal dialog" style="display: none;"></div>

<asp:Panel runat="server" ID="InLineEditorScript">

<script type="text/javascript">
    $(document).ready(function addInlineEditingToModule() {
        var options, localizationOptionsRedactor, localizationOptionsInlineEditor, localizationOptionsImageEditing;

        window.dnn = window.dnn || {};
        window.dnn.HTMLPro = window.dnn.HTMLPro || {};

        if (!window.dnn.HTMLPro.resx) {
            window.dnn.HTMLPro.resx = {
                culture: 'en',
                redactor: false,
                inlineEditor: false,
                imageEditing: false
            };
        }

        // Get redactor and plugins localization
        if (!window.dnn.HTMLPro.resx.redactor) {
            window.dnn.HTMLPro.resx.redactor = true;
            localizationOptionsRedactor = {
                service: 'DNNCorp/EvoqLibrary',
                controller: 'Localization',
                resxName: 'RedactorResx',
                resourceSettings: {
                    method: 'GetRedactorSettings',
                    callback200: function (data) {
                        if (!window.dnn.HTMLPro.resx.culture) {window.dnn.HTMLPro.resx.culture = data.culture;}
                    }
                },
                resources: {
                    method: 'GetRedactor',
                    callback200: function (data) {
                        window.dnn.HTMLPro.InlineEditing.setRedactorResx(data.localization, window.dnn.HTMLPro.resx.culture);
                    },
                    callbackError: function (data) {console.log('Error', data);}
                }
            };

            new dnn.utils.Localization(localizationOptionsRedactor);
        }

        // Get inline editor localization
        if (!window.dnn.HTMLPro.resx.inlineEditor) {
            window.dnn.HTMLPro.resx.inlineEditor = true;
            localizationOptionsInlineEditor = {
                service: 'DNNCorp/EvoqLibrary',
                controller: 'Localization',
                resxName: 'InlineEditorResx',
                resourceSettings: {
                    method: 'GetInlineEditorSettings'
                },
                resources: {
                    method: 'GetInlineEditor',
                    callback200: function (data) {
                        window.dnn.HTMLPro.InlineEditing.setResx(data.localization);
                    },
                    callbackError: function (data) {console.log('Error', data)}
                }
            };

            new dnn.utils.Localization(localizationOptionsInlineEditor);
        }

        // Get image editing localization
        if (!window.dnn.HTMLPro.resx.imageEditing) {
            window.dnn.HTMLPro.resx.imageEditing = true;
            localizationOptionsImageEditing = {
                service: 'DNNCorp/EvoqLibrary',
                controller: 'Localization',
                resxName: 'ImageEditingResx',
                resourceSettings: {
                    method: 'GetImageEditingSettings'
                },
                resources: {
                    method: 'GetImageEditing',
                    callback200: function (data) {
                        window.dnn.HTMLPro.InlineEditing.setImageEditingResx(data.localization);
                    },
                    callbackError: function (data) { console.log('Error', data); }
                }
            };

            new dnn.utils.Localization(localizationOptionsImageEditing);
        }

        options = {
            moduleId:  <%= ModuleId %>,
            clientId:  '<%= lblContent.ClientID %>',
            canUpload: <%= CanUpload.ToString().ToLower() %>,
            canCropRotateResizeImages: <%= CanCropRotateResizeImages.ToString().ToLower() %>,
            editUrl:   "<%= EditUrl() %>",
            maxFileSize: '<%= MaxFileSize %>'
        };

        // Create inline editing Object
        new window.dnn.HTMLPro.InlineEditing(options, window.dnn.HTMLPro.resx);
    });
</script>

</asp:Panel>
