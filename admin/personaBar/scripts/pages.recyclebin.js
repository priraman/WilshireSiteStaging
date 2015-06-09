'use strict';
define(['jquery', 'knockout', 'text!templatePath/pages-recyclebin.html'], function ($, ko, template) {
    var recycleBin = function (options) {
        this.options = options;
    };

    recycleBin.prototype = {
        constructor: recycleBin,
        init: function () {
            var handler = this;
            this.options = $.extend({}, recycleBinDefaultOptions, this.options);
            this.container = $('<div class="recycleBinContainer" />');
            $('#pages-panel').append(this.container);
            this._form = $('<div class="recycleBinForm" />');
            this._form.append(template);
            this.container.append(this._form);
            $(window).resize(function () {
                handler._resizeContentContainer();
                dnn.dnnPageRecycleBin._addScroll('#pageList');
                dnn.dnnPageRecycleBin._addScroll('#moduleList');
                dnn.dnnPageRecycleBin._addScroll('#templateList');
            });

            this._initUI();
            this._addEventListeners();

            var viewModel = this._getViewModel();
            this._getDeletedPageList();
            this._getDeletedModuleList();
            ko.applyBindings(viewModel, this._form[0]);
        },

        getElement: function () {
            return this.container;
        },

        show: function (callback) {
            var handler = this;
            handler._resizeContentContainer();
            dnn.dnnPageRecycleBin._addScroll('#pageList');
            dnn.dnnPageRecycleBin._addScroll('#moduleList');
            dnn.dnnPageRecycleBin._addScroll('#templateList');

            var formContainer = this.container;
            formContainer.css({
                top: 0,
                left: 0 - formContainer.outerWidth()
            }).show().animate({
                left: 0
            }, 'fast', function () {
                handler._formOpened = true;
            });
        },

        close: function (callback) {
            var handler = this;
            var formContainer = this.container;

            formContainer.animate({
                top: $(document).scrollTop() + $(window).height()
            }, 'fast', function () {
                handler._formOpened = false;
                formContainer.hide();

                if (typeof callback == "function") {
                    callback.call(handler);
                }
            });
        },

        _resizeContentContainer: function () {
            //resize content container
            var contentContainer = this._form.find('.content-container');
            var restHeight = this._form.find('div.title').outerHeight()
                + parseInt(this._form.find('div.body').css('margin-top'))
                + this._form.find('div.body > ul').outerHeight()
                + parseInt(this._form.find('div.actions').css('margin-top'))
                + this._form.find('div.actions').outerHeight()
                + 2;

            contentContainer.css('height', (this.container).height() - restHeight);
        },

        _initUI: function () {
            var handler = this;
            this._form.find('div.body').tabs({
                activate: function (event, ui) {
                    setTimeout(function () {
                        handler._resizeContentContainer();
                    }, 0);
                }
            });
        },

        _addEventListeners: function () {
        },

        _selectPageHandler: function (pageData, e) {
            var handler = this;
            if (e.target.checked) {
                handler.selectedPages.push(pageData);
            }
            else {
                handler.selectedPages.remove(pageData);
            }
            return true;
        },
       
        _selectModuleHandler: function (moduleData, e) {
            var handler = this;
            if (e.target.checked) {

                handler.selectedModules.push(moduleData);
            }
            else {
                handler.selectedModules.remove(moduleData);
            }
            return true;
        },
        
        _selectTemplateHandler: function (templateData, e) {
            var handler = this;
            if (e.target.checked) {

                handler.selectedTemplates.push(templateData);
            }
            else {
                handler.selectedTemplates.remove(templateData);
            }
            return true;
        },
        
        _restoreSelectedPagesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var pagesList = (handler.selectedPages()).slice(0);
            if (pagesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = pagesList.length > 1 ? this.resx.recyclebin_RestorePagesConfirm : this.resx.recyclebin_RestorePageConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function () {
                
                    dnn.dnnPageRecycleBin._getService().post('RestorePage', pagesList, function(data) {
                        for (var i = 0; i < pagesList.length; i++) {
                            if (data.Status > 0) {
                                // Error: inform
                                dnn.dnnPageRecycleBin.utility.notify(data.Message);
                            } else
                            {
                                handler.deletedpagesList.remove(pagesList[i]);
                                handler.selectedPages.remove(pagesList[i]);
                            }
                            //CONTENT-4010 - call refresh in person bar
                            $(".btn_showsite").data('need-refresh', true);
                        }
                    });
                
                });
            }
        },
        
        _removeSelectedPagesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var pagesList = (handler.selectedPages()).slice(0);
            if (pagesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = pagesList.length > 1? this.resx.recyclebin_RemovePagesConfirm : this.resx.recyclebin_RemovePageConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {  
                    dnn.dnnPageRecycleBin._getService().post('RemovePage', pagesList, function(data) {
                            for (var i = 0; i < pagesList.length; i++) {
                                handler.deletedpagesList.remove(pagesList[i]);
                                handler.selectedPages.remove(pagesList[i]);
                            }
                        });
                });
            }
        },
        
        _restoreSelectedModulesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var modulesList = (handler.selectedModules()).slice(0);
            if (modulesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = modulesList.length > 1 ? this.resx.recyclebin_RestoreModulesConfirm : this.resx.recyclebin_RestoreModuleConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                    dnn.dnnPageRecycleBin._getService().post('RestoreModule', modulesList, function() {
                            for (var i = 0; i < modulesList.length; i++) {
                                handler.deletedmodulesList.remove(modulesList[i]);
                                handler.selectedModules.remove(modulesList[i]);
                            }
                        });
                });
            }
        },
        
        _removeSelectedModulesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var modulesList = (handler.selectedModules()).slice(0);
            if (modulesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = modulesList.length > 1 ? this.resx.recyclebin_RemoveModulesConfirm : this.resx.recyclebin_RemoveModuleConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                    dnn.dnnPageRecycleBin._getService().post('RemoveModule', modulesList, function() {
                            for (var i = 0; i < modulesList.length; i++) {
                                handler.deletedmodulesList.remove(modulesList[i]);
                                handler.selectedModules.remove(modulesList[i]);
                            }
                        });
                });
            }
        },
            
        _restoreSelectedTemplatesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var templatesList = (handler.selectedTemplates()).slice(0);
            if (templatesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = templatesList.length > 1 ? this.resx.recyclebin_RestoreTemplatesConfirm : this.resx.recyclebin_RestoreTemplateConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                    dnn.dnnPageRecycleBin._getService().post('RestorePage', templatesList, function() {
                            for (var i = 0; i < templatesList.length; i++) {
                                handler.deletedtemplatesList.remove(templatesList[i]);
                                handler.selectedTemplates.remove(templatesList[i]);
                            }
                        });
                });
            }
        },
        
        _removeSelectedTemplatesHandler: function () {
            var handler = dnn.dnnPageRecycleBin._getViewModel();
            var templatesList = (handler.selectedTemplates()).slice(0);
            if (templatesList.length > 0) {
                var confirmText, yesText, noText;
                confirmText = templatesList.length > 1 ? this.resx.recyclebin_RemoveTemplatesConfirm : this.resx.recyclebin_RemoveTemplateConfirm;
                yesText = this.resx.recyclebin_YesConfirm;
                noText = this.resx.recyclebin_NoConfirm;

                dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                    dnn.dnnPageRecycleBin._getService().post('RemovePage', templatesList, function() {
                            for (var i = 0; i < templatesList.length; i++) {
                                handler.deletedtemplatesList.remove(templatesList[i]);
                                handler.selectedTemplates.remove(templatesList[i]);
                            }
                        });
                });
            }
        },
        
        _restorePageHandler: function (pageData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RestorePageConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var pagesList = [];
                pagesList.push({ id: pageData.id });
                dnn.dnnPageRecycleBin._getService().post('RestorePage', pagesList, function(data) {
                    if (data.Status > 0) {
                        // Error: inform
                        dnn.dnnPageRecycleBin.utility.notify(data.Message);
                    } else {
                        handler.deletedpagesList.remove(pageData);
                        handler.selectedPages.remove(pageData);
                        //CONTENT-4010 - call refresh in person bar
                        $(".btn_showsite").data('need-refresh', true);
                    }
                });
            });
        },
        
        _removePageHandler: function (pageData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RemovePageConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var pagesList = [];
                pagesList.push({ id: pageData.id });
                dnn.dnnPageRecycleBin._getService().post('RemovePage', pagesList, function() {
                    handler.deletedpagesList.remove(pageData);
                    handler.selectedPages.remove(pageData);
                });
            });
        },
        
        _restoreModuleHandler: function (moduleData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RestoreModuleConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var moduleList = [];
                moduleList.push({
                    Id: moduleData.Id,
                    TabModuleId: moduleData.TabModuleId,
                    TabID: moduleData.TabID
                });
                dnn.dnnPageRecycleBin._getService().post('RestoreModule', moduleList, function() {
                    handler.deletedmodulesList.remove(moduleData);
                    handler.selectedModules.remove(moduleData);
                });
            });
        },
        
        _removeModuleHandler: function (moduleData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RemoveModuleConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var moduleList = [];
                moduleList.push({
                    Id: moduleData.Id,
                    TabModuleId: moduleData.TabModuleId,
                    TabID: moduleData.TabID
                });
                dnn.dnnPageRecycleBin._getService().post('RemoveModule', moduleList, function() {
                    handler.deletedmodulesList.remove(moduleData);
                    handler.selectedModules.remove(moduleData);
                });
            });
        },
        
        _restoreTemplateHandler: function (templateData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RestoreTemplateConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var templateList = [];
                templateList.push({ id: templateData.id });
                dnn.dnnPageRecycleBin._getService().post('RestorePage', templateList, function() {
                    handler.deletedtemplatesList.remove(templateData);
                    handler.selectedTemplates.remove(templateData);
                });
            });
        },
        
        _removeTemplateHandler: function (templateData, e) {
            var handler, confirmText, yesText, noText;
            handler = this;
            confirmText = this.resx.recyclebin_RemoveTemplateConfirm;
            yesText = this.resx.recyclebin_YesConfirm;
            noText = this.resx.recyclebin_NoConfirm;

            dnn.dnnPageRecycleBin.utility.confirm(confirmText, yesText, noText, function() {
                var templateList = [];
                templateList.push({ id: templateData.id });
                dnn.dnnPageRecycleBin._getService().post('RemovePage', templateList, function() {
                    handler.deletedtemplatesList.remove(templateData);
                    handler.selectedTemplates.remove(templateData);
                });
            });
        },
        
        _emptyRecycleBinHandler: function () {
            var handler = dnn.dnnPageRecycleBin;
            var viewModel = handler._getViewModel();
            var confirmText = handler.resx.recyclebin_EmptyRecycleBinConfirm;
            var deleteText = handler.resx.recyclebin_DeleteConfirm;
            var cancelText = handler.resx.recyclebin_CancelConfirm;

            handler.utility.confirm(confirmText, deleteText, cancelText, function () {
                handler._getService().get('EmptyRecycleBin', { t: (new Date).getTime() }, function () {
                    viewModel.deletedpagesList.removeAll();
                    viewModel.deletedmodulesList.removeAll();
                    viewModel.deletedtemplatesList.removeAll();
                });
            });

        },
        
        _addScroll: function (containerSelector) {
            var contentContainer = this._form.find(containerSelector);
            var restHeight = this._form.find('div.title').outerHeight()
                + parseInt(this._form.find('div.body').css('margin-top'))
                + this._form.find('div.body > ul').outerHeight()
                + parseInt(this._form.find('div.actions').css('margin-top'))
                + this._form.find('div.actions').outerHeight()
                + this._form.find('div.rbactions').outerHeight()
                + (parseInt(this._form.find('div.rbactions').css('padding-top'))*2);
            

            contentContainer.css('height', (this.container).height() - restHeight);
            var scrollContent = contentContainer;
            if (scrollContent.data('jsp')) {
                scrollContent.data('jsp').reinitialise();
            } else {
                scrollContent.jScrollPane({ autoReinitialise: true });

            }
        },
        
        _refreshPagesHandler: function () {
            dnn.dnnPageRecycleBin._getDeletedPageList();
            dnn.dnnPageRecycleBin._addScroll('#pageList');
        },
        
        _refreshModulesHandler: function () {
            dnn.dnnPageRecycleBin._getDeletedModuleList();
            dnn.dnnPageRecycleBin._addScroll('#moduleList');
        },
        
        _refreshTemplatesHandler: function () {
            dnn.dnnPageRecycleBin._getDeletedTemplateList();
            dnn.dnnPageRecycleBin._addScroll('#templateList');
        },
        
        _viewPageHierarchyHandler: function () {
            dnn.dnnPageRecycleBin._closeForm(function () {
                if (typeof callback == "function") {
                    callback.call(this);
                }

                //page hierarchy should be refreshed to reflect changes in recycle bin (in case when page was restored)
                //this.getElement().trigger('viewPageHierarchy');
                dnn.dnnPageHierarchy._viewTypeChanged('hierarchy');
            });
        },
        
        _closeForm: function (callback) {
            var handler = this;
            var formContainer = this.container;
            formContainer.animate({
                left: 0 - formContainer.outerWidth()
            }, 'fast', function () {
                handler._formOpened = false;
                formContainer.hide();

                if (typeof callback == "function") {
                    callback.call(handler);
                }
            });
        },
        
        _getDeletedPageList: function () {
            var handler = this;
            var viewModel = handler._getViewModel();
            viewModel.deletedpagesList.removeAll();
            viewModel.selectedPages.removeAll();

            this._getService().get('GetDeletedPageList', {}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    viewModel.deletedpagesList.push(data[i]);
                }
            });
        },
        
        _getDeletedModuleList: function () {
            var handler = this;
            var viewModel = handler._getViewModel();
            viewModel.deletedmodulesList.removeAll();
            viewModel.selectedModules.removeAll();

            this._getService().get('GetDeletedModuleList', {}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    viewModel.deletedmodulesList.push(data[i]);
                }
            });
        },
        
        _getDeletedTemplateList: function () {
            var handler = this;
            var viewModel = handler._getViewModel();
            viewModel.deletedtemplatesList.removeAll();
            viewModel.selectedTemplates.removeAll();

            this._getService().get('GetDeletedTemplates', {}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    viewModel.deletedtemplatesList.push(data[i]);
                }
            });
        },
        
        _mouseOverThumbnailHandler: function (pageData, e) {
            //var handler = this;

            if (this._showPreviewTimeoutHandler) {
                clearTimeout(dnn.dnnPageRecycleBin._showPreviewTimeoutHandler);
            }

            dnn.dnnPageRecycleBin._showPreviewTimeoutHandler = setTimeout(function () {
                dnn.dnnPageRecycleBin._showPreview(pageData, e.target);
            }, dnn.dnnPageHierarchy.options.delayTime);
        },

        _mouseOutThumbnailHandler: function () {
            if (dnn.dnnPageRecycleBin._showPreviewTimeoutHandler) {
                clearTimeout(dnn.dnnPageRecycleBin._showPreviewTimeoutHandler);
            }

            dnn.dnnPageRecycleBin._hidePreview();
        },
        
        _showPreview: function (pageData, element) {
            var handler = this;

            if (!this._previewContainer) {
                this._previewContainer = $('<div class="pages-preview"><img src="" /></div>');
                this._previewContainer.mouseover(function () {
                    handler._mouseOnPreview = true;
                }).mouseout(function (e) {
                    handler._mouseOnPreview = false;
                    handler._hidePreview();
                });
                $(document.body).append(this._previewContainer);
            }
            this._previewContainer.find('img').attr('src', pageData.largeThumbnail);

            this._calcPreviewPosition(element);

            this._previewContainer.show('fast');
        },

        _hidePreview: function () {
            if (this._previewContainer && !this._mouseOnPreview) {
                this._previewContainer.hide('fast');
            }
        },
        
        _calcPreviewPosition: function (element) {
            var pos = {};
            var $element = $(element);
            var previewHeight = this._previewContainer.outerHeight();
            var elementWidth = $element.width();
            var elementHeight = $element.height();
            var windowHeight = $(window).height();
            var offset = $element.offset();
            pos.left = offset.left + elementWidth - 25;
            pos.top = offset.top - previewHeight / 2 + elementHeight / 2;

            if (pos.top < 0) {
                this._previewContainer.removeClass('bottom').addClass('top');
                pos.top = $element.offset().top;
            } else if (pos.top + previewHeight > windowHeight) {
                this._previewContainer.removeClass('top').addClass('bottom');
                pos.top = offset.top - previewHeight + elementHeight;
            } else {
                this._previewContainer.removeClass('top bottom');
            }

            this._previewContainer.css({
                left: pos.left,
                top: pos.top
            });
        },
        _getViewModel: function () {
            var handler = this;
            if (!this.viewModel) {
                this.viewModel = new (function () {
                    this.resx = handler.resx;
                    
                    this.deletedpagesList = ko.observableArray([]);
                    this.deletedmodulesList = ko.observableArray([]);
                    this.deletedtemplatesList = ko.observableArray([]);

                    this.selectedPages = ko.observableArray([]);
                    this.selectedModules = ko.observableArray([]);
                    this.selectedTemplates = ko.observableArray([]);

                    this.removePage = $.proxy(handler._removePageHandler, this);
                    this.removeModule = $.proxy(handler._removeModuleHandler, this);
                    this.removeTemplate = $.proxy(handler._removeTemplateHandler, this);

                    this.restorePage = $.proxy(handler._restorePageHandler, this);
                    this.restoreModule = $.proxy(handler._restoreModuleHandler, this);
                    this.restoreTemplate = $.proxy(handler._restoreTemplateHandler, this);
                    
                    this.selectPage = $.proxy(handler._selectPageHandler, this);
                    this.selectModule = $.proxy(handler._selectModuleHandler, this);
                    this.selectTemplate = $.proxy(handler._selectTemplateHandler, this);
                    
                    this.restoreSelectedPages = $.proxy(handler._restoreSelectedPagesHandler, this);
                    this.restoreSelectedModules = $.proxy(handler._restoreSelectedModulesHandler, this);
                    this.restoreSelectedTemplates = $.proxy(handler._restoreSelectedTemplatesHandler, this);
                    
                    this.removeSelectedPages = $.proxy(handler._removeSelectedPagesHandler, this);
                    this.removeSelectedModules = $.proxy(handler._removeSelectedModulesHandler, this);
                    this.removeSelectedTemplates = $.proxy(handler._removeSelectedTemplatesHandler, this);

                    this.refreshPages = $.proxy(handler._refreshPagesHandler, this);
                    this.refreshModules = $.proxy(handler._refreshModulesHandler, this);
                    this.refreshTemplates = $.proxy(handler._refreshTemplatesHandler, this);
                    
                    this.emptyRecycleBin = $.proxy(handler._emptyRecycleBinHandler, this);
                    this.viewPageHierarchy = $.proxy(handler._viewPageHierarchyHandler, this);
                    this.mouseOverThumbnail = $.proxy(handler._mouseOverThumbnailHandler, this);
                    this.mouseOutThumbnail = $.proxy(handler._mouseOutThumbnailHandler, this);
                    
                })();
            }

            return this.viewModel;
        },

        _getService: function () {
            this.utility.sf.moduleRoot = "EvoqContentLibrary";
            this.utility.sf.controller = "PageManagement";

            return this.utility.sf;
        },
    };

    var recycleBinDefaultOptions = {

    };

    if (!dnn.dnnPageRecycleBin) {
        dnn.dnnPageRecycleBin = new recycleBin();
    }

    return dnn.dnnPageRecycleBin;
});