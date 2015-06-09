/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

 /*jshint multistr:true */

/***
 * @class InlineEditing
 *
 * This class manage the redactor cycle (init, save, destroy) for one module
 *
 * @depends jQuery
 * @depends window.dnn.HTMLPro.ImageEditing
 *
 * @param {object} options
 * {
 *   @param {int} moduleId
 *   @param {string} clientId
 *   @param {boolean} canUpload
 *   @param {string} editUrl
 * }
 *
 * @param {object} resx, contain translation for UI
 * {
 *   @param {string} culture, localization culture to be applied
 *   @param {object} inlineEditor, key values for inline editor localization
 *   @param {object} imageEditing, key values for image manupulation localization
 *   @param {object} redactor, key values for redactor localization
 * }
 *
 */

// Namespace
window.dnn = window.dnn || {};
window.dnn.HTMLPro = window.dnn.HTMLPro || {};

(function IIFE() {
  var InlineEditingClass;

  InlineEditingClass = (function IIFE() {
    'use strict';

    /* Private Constants */
    var TIME_TO_AOUTOSAVE, TIME_PROGRESS_BAR_SAVE_LAYER, ESC,

    /* Private properties */
    _imageEditing, isRedactorInit, _history, _editUrl, _modalBlur, _culture,
    _resxInlineEditor, _resxImageEditing, _resxRedactor, _maxFileSize,
    _savingLayer, _inFullscren, _beforeAdvancedWasInFullScreen, _moduleWithRedactor,

    /* Private methods */
    configServiceFramework, bindModule, initRedactor, isTheSameHtmlContent,
    saveEditor, autosaveEditor, destroyEditor, initInterval, endInterval, showHideCodeEditor,
    initImageEditing, bindImageEditing, unbindImageEditing, injectAdvancedButton,
    advancedButtonSaveCallback, localize, linkImage, unlinkImage;

    /* Class properties */
    InlineEditing.class = 'InlineEditing';
    InlineEditing.type  = 'Class';

    /* Private Constants and Properties */
    TIME_TO_AOUTOSAVE = 5000;
    TIME_PROGRESS_BAR_SAVE_LAYER = 4000;
    ESC = 27;

    _savingLayer = '<div class="dnnInlineEditingSavingLayer">\
      <div class="loopBar">\
        <div class="progressA" style="width: 0;"></div>\
      </div>\
      <div class="optacityLayer">\
        <h1 style="">{0}</h1>\
      </div>\
    </div>';

    // Default locale values (en)
    _resxInlineEditor = {
      emptyEditContentText: 'Click here to edit content',
      advancedEditor: 'Advanced Editor',
      errorSavingText: 'Error saving the HTML content',
      savingChanges: 'Saving changes...'
    };

    /* Constructor */
    function InlineEditing(options, resx) {
      //console.log('~InlineEditing');
      var moduleId;

      /* Private Instance properties */
      this.moduleId = null;
      this.clientId = null;
      this.emptyEditContentText = null;
      this.module = null;
      this.sfImage = null;
      this.siteRoot = null;
      this.storedHtml = null;
      this.destroyed = null;
      this.changes = null;
      this.uploadUrl = null;
      this.getImage = null;
      this.saveInterval = null;
      this.visual = false;

      // Default redactor values are in redactor
      _resxRedactor     = {};

      moduleId = parseInt(options.moduleId, 10);
      if (isNaN(moduleId)) {throw 'moduleId not present';}
      this.moduleId = moduleId;

      if (!options.clientId) {throw 'clientId not present';}
      this.clientId = ''+options.clientId;

      if (resx.culture && typeof resx.culture === 'string') {
        _culture = resx.culture.replace('-', '_');
      } else {
        _culture = 'en';
      }

      if (resx.inlineEditor && typeof resx.inlineEditor === 'object' && Object.keys(resx.inlineEditor).length > 0) {
        _resxInlineEditor = resx.inlineEditor;
      }

      if (resx.imageEditing && typeof resx.imageEditing === 'object' && Object.keys(resx.imageEditing).length > 0) {
        _resxImageEditing = resx.imageEditing;
      }

      if (resx.redactor && typeof resx.redactor === 'object' && Object.keys(resx.redactor).length > 0) {
        _resxRedactor = resx.redactor;
      }

      if (options.canCropRotateResizeImages === false) {
        window.dnn.HTMLPro.ImageEditing.setCanvasActions(false);
        window.dnn.HTMLPro.ImageEditing.localize();
      }

      _maxFileSize = options.maxFileSize || 5000000;
      localize();

      if (!options.canUpload) {options.canUpload = false;}
      this.canUpload = options.canUpload;

      if (!options.editUrl) {throw 'editUrl not present';}
      this.editUrl = options.editUrl;

      this.module = $('#' + this.clientId);

      $.dnnRedactor.opts.maxFileSize = _maxFileSize;

      configServiceFramework.call(this);
      bindModule.call(this, this);
    }

    /* Private Methods */
    configServiceFramework = function configServiceFramework() {
      var antiForgeryToken;

      antiForgeryToken = $('input[name="__RequestVerificationToken"]').val();

      this.sfImage  = $.ServicesFramework(this.moduleId);
      this.siteRoot = dnn.getVar('cem_resourceroot') + '/../../../../Html/';
      this.siteImageRoot = this.sfImage.getServiceRoot('DNNCorp/EvoqLibrary') + 'Redactor/';

      this.uploadUrl = this.canUpload ? this.siteImageRoot + 'postimages?__RequestVerificationToken=' + antiForgeryToken : null;
      this.getImage  = this.siteImageRoot + 'getimages?__RequestVerificationToken='  + antiForgeryToken;
    };

    bindModule = function bindModule(self) {
      $('div.DnnModule-' + this.moduleId).on('editmodule', function () {
        var $module = $(this);

        if (self.isRedactorInit) {return;}
        initRedactor.call(self);

        // If the module has images content as initial, enter the image edit mode
        setTimeout(function () {
          var $img, src;

          // TODO: Bug. If no added image this code put in edit mode any last image.
          $img = $module.find('.redactor_editor img').last();

          if ($img.length > 0) {
            src = $img.attr('src');

            $img.on('load', function load() {
              var $editor, offsetTop;

              $editor = $module.find('.redactor_editor');
              offsetTop = $img.offset().top - $editor.offset().top - $('#image-edit-bar').outerHeight(true);

              setTimeout(function () {
                $img.click();
                $editor.scrollTop(offsetTop);
              }, 100); // Why 100? - Please put constant with an autoexplanation name here
            }).attr('src', '').attr('src', src);
          }

          // Put in fullscreen if necesary
          if (_beforeAdvancedWasInFullScreen) {
            $('.re-fullscreen').trigger('click');
            _beforeAdvancedWasInFullScreen = false;
          }
        }, 0);
      });

      this.module.on('click', function(evt) {
        evt.preventDefault();
        if (self.isRedactorInit) {return;}
        initRedactor.call(self);
      });
    };

    initInterval = function initInterval() {
      var self;
      self = this;

      endInterval.call(this);
      this.saveInterval = setInterval(
        function() {
          autosaveEditor.call(self);
        },
        TIME_TO_AOUTOSAVE
      );
    };

    endInterval = function endInterval() {
      if (this.saveInterval) {clearInterval(this.saveInterval);}
    };

    showHideCodeEditor = function () {
        var self = this;
        this.visual = !this.visual;
        unbindImageEditing.call(this);

        if(_imageEditing) {
            _history = _imageEditing.getHistory();

            _imageEditing.destroy(function nullifyImageAndSyncEditing() {
                _imageEditing = null;
                self.module.dnnRedactor('sync');
            });
        } else {
            initImageEditing.call(this);

            if (_history) {
                _imageEditing.setHistory(_history);
                _history = null;
            }
        }

        // Trigger show/hide redactor code view
        this.module.dnnRedactor('toggle');

        // Return to text mode, enable autosave
        if (!this.visual) { this.changes = true; }
    }

    initRedactor = function initRedactor() {
      var self, redactorHTMLButton, redactorImageButton;

      if (window.dnn.HTMLPro.redactorActive) {return;}
      window.dnn.HTMLPro.redactorActive = true;

      this.isRedactorInit = true;
      self = this;
      self.visual = false;

      // Clear default text on edit
      if (self.module.html() === _resxInlineEditor.emptyEditContentText) {
        self.module.html('');
      }

      _inFullscren = false;

      self.module.dnnRedactor({
        allowedTags: ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo',
        'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del',
        'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame',
        'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label',
        'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup',
        'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
        'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
        'tt', 'u', 'ul', 'var', 'video', 'wbr'],

        deniedTags: [],

        buttons: [
        'formatting', '|', 'bold', 'italic', 'underline', '|', 'orderedlist', 'unorderedlist', '|', 'outdent', 'indent', '|',
        '|', 'link' ,'file', '|', 'html', '|'
        ],

        plugins: ['dnnImageUpload', 'advancedmode'],

        //emptyHtml: _resxInlineEditor.emptyEditContentText,
        maxFileSize:      _resxRedactor.maxFileSize,
        paragraphy:       false,
        focus:            true,
        shortcuts:        false,
        convertDivs:      false,
        imageResizable:   false,
        allowImageEditor: false,
        observeImages:    false,
        cleanFontTag:     false,

        imageUpload:  this.uploadUrl,
        imageGetJson: this.getImage,
        zIndexMax: 1100,

        initCallback: function() {
          var toolbar, originalEvent;

          $('.redactor_toolbar li a i.fa').hide();

          self.module.css('min-width', self.module.css('width'));

          // Toolbar buttons pressed
          this.$toolbar.off('click.customToolbarEvents').on('click.customToolbarEvents', function stopEditingImage(evt) {
            var eventTarget, redactorToolbar, controlBar, controlBarHeight, moduleMarginTop,
            redactorBox, style, imageToLink, imageToUnlink, imageParent,
            modal, modalLink, modalLinkURL, modalLinkTargetBlank, modalLinkBtnAccept, modalLinkBtnClose;

            eventTarget = $(evt.target);

            // Add link to image
            if (eventTarget.hasClass('redactor_dropdown_link') && _imageEditing && _imageEditing.isEsditingInProcess()) {
              imageToLink = _imageEditing.getActiveImage();
              imageParent = imageToLink.parent();

              modalLink = $('#redactor-modal-link-insert');
              modalLink.find('#redactor_link_url_label').hide();
              modalLink.find('#redactor_link_url_text').hide();

              modalLinkURL         = modalLink.find('input#redactor_link_url');
              modalLinkTargetBlank = modalLink.find('#redactor_link_blank');

              if (imageParent.is('a')) {
                modalLinkURL.val(imageParent.attr('href'));
                if (imageParent.attr('_target') === 'blank') {
                  modalLinkTargetBlank[0].checked = true;
                }
              } else {
                modalLinkURL.val('');
                modalLinkTargetBlank[0].checked = false;
              }

              modal = modalLink.closest('#redactor_modal_inner');
              modalLinkBtnClose  = modal.find('.redactor_btn_modal_close');
              modalLinkBtnAccept = modal.find('#redactor_insert_link_btn');

              // Override modal link action
              modalLinkBtnAccept.off('click').on('click', function() {
                _imageEditing.removeWrappers();

                linkImage(imageToLink, modalLinkURL.val(), modalLinkTargetBlank.is(':checked'));

                _imageEditing.addWrappers();
                modalLinkBtnClose.trigger('click');
              });
            }

            // Remove link from image
            if (eventTarget.hasClass('redactor_dropdown_unlink') && _imageEditing && _imageEditing.isEsditingInProcess()) {
              imageToUnlink = _imageEditing.getActiveImage();
              _imageEditing.removeWrappers();

              modalLink = $('#redactor-modal-link-insert');
              modal = modalLink.closest('#redactor_modal_inner');
              modalLinkBtnClose = modal.find('.redactor_btn_modal_close');

              unlinkImage(imageToUnlink);

              _imageEditing.addWrappers();
              modalLinkBtnClose.trigger('click');
            }

            // Change to full/normal screen
            if (eventTarget.hasClass('re-fullscreen')) {
              if (eventTarget.hasClass('re-normalscreen')) {
                _inFullscren = true;
              } else {
                _inFullscren = false;
              }
              controlBar = $('#ControlBar');

              if (_inFullscren) {
                setTimeout(function() {
                  var finalPadding, personabar, personaBarIframe;

                  self.module.data('original-padding-top', parseInt(self.module.css('padding-top'), 10));
                  redactorToolbar = self.module.closest('.redactor_box').find('.redactor_toolbar');
                  controlBarHeight = controlBar.length === 0 || !eventTarget.hasClass('re-normalscreen') ? 0 : controlBar.height();
                  finalPadding = controlBarHeight + redactorToolbar.height();

                  self.module.css('padding-top', 0);
                  style = self.module.attr('style').replace(/padding\-top:\s[0-9]+(px)?\s?(\!important)?/, 'padding-top: ' + finalPadding + 'px !important;');
                  self.module.attr('style', style);

                  self.module.data('finalMargin', finalPadding);

                  personaBarIframe = $('#personaBar-iframe');

                  if (personaBarIframe.length > 0) {
                    personabar = personaBarIframe.contents().find('.personabar');
                    redactorToolbar.css('width', 'calc(100% - ' + personabar.width() + 'px)');
                  }

                }, 0);
              } else {
                style = self.module.attr('style').replace(/padding\-top:\s[0-9]+(px)?\s?(\!important)?/, 'padding-top: ' + self.module.data('original-padding-top') + 'px !important;');
                self.module.attr('style', style);
              }

              self.module.data('inFullScreen', eventTarget.hasClass('re-normalscreen'));
            }

            if (_imageEditing) {
              _imageEditing.stopEditingImage();
              _imageEditing.addWrappers();
            }
          });

          $(window).on('keydown.dnnRedactorIE', function quitFullScreen(evt) {
            if (evt.keyCode == ESC && _inFullscren && (!_imageEditing || !_imageEditing.isEsditingInProcess())) {
              $('.re-fullscreen').trigger('click');
            }
          });

          toolbar = $(this.$element).closest('.redactor_box').find('.redactor_toolbar');

          redactorHTMLButton = toolbar.find('li a[title="HTML"]:first');

          // Disable show code button click for trigger manually
          redactorHTMLButton.off('click');

          // Redactor show/hide code view button event
          redactorHTMLButton.on('click.redactorHTMLButton', function () {
              if (_imageEditing) {
                  _imageEditing.executeAfterSaving(function() {
                      showHideCodeEditor.call(self);
                  });
              } else {
                  showHideCodeEditor.call(self);
              }
          });

          // Store html text for compare changes
          self.storedHtml = this.content;

          // Init image editing after store html
          initImageEditing.call(self);

          // Controls if redactor is destroyed
          self.destroyed = true;

          // Controls if redactor is initialized
          self.isRedactorInit = false;

          // Controls aoutsave
          self.changes = false;

          // Initialize interval for autosave editor
          initInterval.call(self);

          // Set editor to not destroyed
          self.destroyed = false;

          // Add Advanced Editor
          injectAdvancedButton.call(self, toolbar);
        },

        blurCallback: function(evt) {
          var uiDialog, redactorLinkTooltip;

          uiDialog = $('.ui-dialog');
          redactorLinkTooltip = $('.redactor-link-tooltip');

          // Controls that blur is from modal action and not for exit redactor
          if (evt.namespace !== 'redactor' ||
          $('#redactor-modal-link-insert').length > 0 ||
          (uiDialog.length > 0 && uiDialog.is(':visible')) ||
          (redactorLinkTooltip.length > 0 && redactorLinkTooltip.is(':visible'))) {
            return;
          }

          if (self.visual) {
            unbindImageEditing.call(self);

            if(_imageEditing) {
              _history = _imageEditing.getHistory();

              _imageEditing.destroy(function nullifyImageAndSyncEditing() {
                _imageEditing = null;
                self.module.dnnRedactor('sync');
              });
            } else {
              initImageEditing.call(self);

              if (_history) {
                _imageEditing.setHistory(_history);
                _history = null;
              }
            }

            // Trigger show/hide redactor code view
            self.module.dnnRedactor('toggle');
          }

          redactorHTMLButton.off('.redactorHTMLButton');
          self.module.off('.imageEditing');

          destroyEditor.call(self);
        },

        focusCallback: function(evt) {
          self.module.dnnRedactor('sync');

          setTimeout(function addWrappers() {
            if (_imageEditing) {_imageEditing.addWrappers();}
          }, 0);

        },

        changeCallback: function() {
          self.changes = true;
        },

        imageUploadCallback: function(e, image, json) {
          var $element, $img, src;

          if (image && image.filelink) {
            $element = this.$element;
            $img = $element.find('img[src$="' + image.filelink + '"]');

            if ($img.length > 0) {
              src = $img.attr('src');

              $img.on('load', function () {
                var offsetTop = $img.offset().top - $element.offset().top - $('#image-edit-bar').outerHeight(true);

                setTimeout(function () {
                  $img.click();
                  $element.scrollTop(offsetTop);
                }, 100);

              }).attr('src', '').attr('src', src);

            }
          }
        }
      });

      if (_culture &&  Object.keys(_resxRedactor).length > 0) {
        $.dnnRedactor.opts.langs[_culture] = _resxRedactor;
        self.module.dnnRedactor({lang: _culture});
      }

      $.dnnRedactor.opts.maxFileSize = _maxFileSize;

      _moduleWithRedactor = self.module;
    };

    isTheSameHtmlContent = function isTheSameHtmlContent(html) {
      return this.storedHtml.replace(/^[a-zA-Z0-9]/gm, '') === html.replace(/^[a-zA-Z0-9]/gm, '');
    };

    saveEditor = function saveEditor(successCallback, redactorWillBeDestroyed) {
      var self, currentHtml, sf, savingLayer, progress, redactorBox;
      self = this;

      if (this.destroyed) {
        if (typeof successCallback === 'function') {
          successCallback.call(this);
        }
        return;
      }

      // Prevent autosave
      this.changes = false;

      // Clean html: Remove the wrappers for ie fixing
      if (_imageEditing) {_imageEditing.removeWrappers();}

      this.module.dnnRedactor('sync');
      currentHtml = this.module.dnnRedactor('get');

      // Add the wrappers for ie fixing
      if (_imageEditing) {
        _imageEditing.addWrappers();
      }

      // Prevent api call if content does not change
      if (isTheSameHtmlContent.call(this, currentHtml)) {
        if (typeof successCallback === 'function') {
          successCallback.call(this);
        }

        return;
      }

      // Store new html text
      this.storedHtml = currentHtml;

      if (currentHtml === '') {currentHtml = _resxInlineEditor.emptyEditContentText;}

      if (redactorWillBeDestroyed) {
        savingLayer = $(_savingLayer);

        $('body').append(savingLayer);

        self.savingLayer = $('.dnnImageEditingSavingLayer');
        progress     = savingLayer.find('.progressA');
        redactorBox  = self.module.closest('.DNNContainer_Title_h2');

        savingLayer.css({
          width:  redactorBox.css('width'),
          height: redactorBox.css('height')
        });

        savingLayer.offset(redactorBox.offset());

        progress.animate({width: '99%'}, TIME_PROGRESS_BAR_SAVE_LAYER);
      }

      sf = $.ServicesFramework(this.moduleId);
      $.ajax({
        type: 'POST',
        url: sf.getServiceRoot('HtmlPro') + 'HtmlTextPro/Save',
        beforeSend: sf.setModuleHeaders,
        data: {
          HtmlText: currentHtml
        },
        success: function(data) {
          if (savingLayer) {
            savingLayer.remove();
            savingLayer = null;
          }

          if (data.NewVersion) {
            // Update UI: Buttons publish/discard in footer actions bar
            $(document).trigger("changeOnPageContent");
          }

          if (typeof successCallback === 'function') {
            successCallback.call(self);
          }
        },
        error: function(xhr, status, error) {
          var response, message;

          if (savingLayer) {savingLayer.remove();}

          response = $.parseJSON(xhr.responseText);
          message = response.ExceptionMessage || response.Message;

          $.dnnAlert({
            title: _resxInlineEditor.errorSavingText,
            text: message ? message.replace(/^"(.+(?="$))"$/, '$1') : ""
          });
        }
      });
    };

    autosaveEditor = function autosaveEditor() {
      //return; // Uncomment to prevent autosave for debug
      if (this.changes === false || this.visual) {return;}

      // Not save while image is being edited
      if (_imageEditing && _imageEditing.isEsditingInProcess()) {return;}

      saveEditor.call(this);
    };

    destroyEditor = function destroyEditor(finalCallback) {
      var self, saveCallback, destroyCallback;

      if (this.destroyed) {return;}
      this.isRedactorInit = false;

      // Stop autosave
      this.changes = false;
      endInterval.call(this);
      self = this;

      // Destroy redactor on save
      saveCallback = function saveCallback() {
        if (_imageEditing) {
          _imageEditing.removeSavingLayer();
          _imageEditing = null;
        }

        $(window).off('keydown.dnnRedactorIE');
        _moduleWithRedactor = null;
        self.module.dnnRedactor('destroy');
        self.destroyed = true;

        // Add default text if empty
        if (self.storedHtml === '') {
            setTimeout(function() {
                self.module.html(_resxInlineEditor.emptyEditContentText);
            }, 100); // 100 is from old code and not tested why
        }

        // Optional final callback before save
        if (typeof finalCallback === 'function') {
          finalCallback.call(self);
        }

        window.dnn.HTMLPro.redactorActive = false;
      };

      // Save on destroy image
      destroyCallback = function destroyImageEditingCallback() {
        saveEditor.call(self, saveCallback, /*redactorWillBeDestroyed*/ true);
      };

      // Destroy image editing and save
      if (_imageEditing) {
        _imageEditing.destroy(destroyCallback);
      } else {
        destroyCallback.call(this, /*saveCallback*/ null, /*redactorWillBeDestroyed*/ true);
      }
    };

    initImageEditing = function initImageEditing() {
      _imageEditing = new window.dnn.HTMLPro.ImageEditing(
        this.module,
        this.siteRoot.replace('API/', ''),
        this.sfImage,
        this.siteImageRoot+'/SaveImageStream',
        this.siteImageRoot+'/PostImageUrl',
        _resxImageEditing
      );
      bindImageEditing.call(this);
    };

    bindImageEditing = function bindImageEditing() {
      var self = this;

      this.module.on('hideToolbar.imageEditing', function enableAutosave() {
        self.module.dnnRedactor('sync');
        initInterval.call(self);
      });

      this.module.on('showToolbar.imageEditing', function disableAutosave() {
        endInterval.call(self);
      });
    };

    unbindImageEditing = function unbindImageEditing() {
      this.module.off('.imageEditing');
    };

    injectAdvancedButton = function injectAdvancedButton(redactorToolbar) {
      var self, advancedButton;
      self = this;

      advancedButton = redactorToolbar.find('.re-advancedmode');

      advancedButton.on('click', function(evt) {
        if (_inFullscren) {
          $('.re-fullscreen').trigger('click');
          _beforeAdvancedWasInFullScreen = true;
        } else {
          _beforeAdvancedWasInFullScreen = false;
        }
        evt.preventDefault();
        destroyEditor.call(self, advancedButtonSaveCallback);
      });
    };

    advancedButtonSaveCallback = function advancedButtonSaveCallback() {
      //show the edit popup in full screen
      location.href = this.editUrl;
        setTimeout(function() {
            var $modal = $('#iPopUp');

            var $window = $(window);
            var newHeight = $window.height() - 46;
            var newWidth = $window.width() - 220;

            $modal.dialog({ height: newHeight, width: newWidth });
            $modal.dialog({ position: 'center' });

            var loading = $modal.prev("div.dnnLoading");
            loading.css({
                width: $modal.width(),
                height: $modal.height()
            });
        }, 0);
    };

    localize = function localize() {
      if (!_resxInlineEditor || Object.keys(_resxInlineEditor).length === 0) {return;}
      _savingLayer = _savingLayer.replace('{0}', _resxInlineEditor.savingChanges);
    };

    linkImage = function linkImage(image, url, newTag) {
      var tag;
      if (!image || !url || typeof url !== 'string') {return;}

      tag = '<a href="';

      if (url.search(/^https?:\/\//) !== 0) {url = 'http://' + url;}
      tag += url + '"';

      if (newTag) {tag += ' target="_blank"';}
      tag += '></a>';

      if (image.parent().is('a')) {image.unwrap();}
      image.wrap(tag);
    };

    unlinkImage = function unlinkImage(image) {
      if (!image) {return;}
      if (image.parent().is('a')) {image.unwrap();}
    };

    /* Class methods */
    InlineEditing.setCulture = function setResx(culture) {
      _culture = culture.replace('-', '_');
    };

    InlineEditing.setResx = function setResx(resx) {
      _resxInlineEditor = resx;
      localize();
    };

    InlineEditing.setRedactorResx = function setRedactorResx(resx, culture) {
      _resxRedactor = resx;
      if (_moduleWithRedactor) {
        _moduleWithRedactor.dnnRedactor({lang: _culture});
      }
      $.dnnRedactor.opts.langs[_culture] = _resxRedactor;
    };

    InlineEditing.setImageEditingResx = function setImageEditingResx(resx) {
      _resxImageEditing = resx;
      window.dnn.HTMLPro.ImageEditing.localize(_resxImageEditing);
    };

    return InlineEditing;
  }());

  window.dnn.HTMLPro.InlineEditing = InlineEditingClass;

}).call(this);
