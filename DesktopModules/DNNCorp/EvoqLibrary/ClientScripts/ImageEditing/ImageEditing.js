/*
  DotNetNuke® - http://www.dotnetnuke.com
  Copyright (c) 2002-2014
  by DotNetNuke Corporation
  All Rights Reserved
 */

 /*jshint multistr:true */

/***
 * @class ImageEditing
 *
 * This class manage toolbar and image modification inside of redactor (inline editing)
 * It can: Rotate, Crop, Resize, Undo, change Padding, Chnage align (left and right) and Delete.
 *
 * For undo actions it uses _history array with this sctructure:
 * [{
 *   imgHist: [{
 *     type: 'code for action that change the image: resize, rotate, crop, padding, float, delete'
 *     prop: 'current properties that especified action will change'
 *   }, ...]
 * }, ...]
 *
 * @depends jQuery
 * @depends jQuery.ui
 * @depends jCrop
 *
 * @param {type} contructorParam (default value), explanation
 *
 */

// Namespace
window.dnn = window.dnn || {};
window.dnn.HTMLPro = window.dnn.HTMLPro || {};

(function IIFE() {
    var ImageEditingClass;

    ImageEditingClass = (function IIFE() {
        'use strict';
        /* Private constants */
        var CROP_ACTIONS_SIZE, ANGLE_90_DEGREES, DEGREES, ENTER, ESC, KEY_NUMBER_0, KEY_NUMBER_9,
        KEY_BACKSPACE, KEY_SHIFT, KEY_CTRL, KEY_LEFT_ARROW, KEY_RIGHT_ARROW,
        KEY_LEFT_WNDOW_KEY, NOTIF_DOWNLOADING_EXTERNAL_HEIGHT, NOTIF_DOWNLOADING_EXTERNAL_PROGRESS_TIME,
        FROM_EXTERNAL_URL_UPDATE_GUI_TIME, TIME_TO_SHOW_PROGRESS_AT_100, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT,
        ALTTEXT_PANEL_WIDTH,

        /* Private methods */
        initTemplate, initImages, getLastImageHistObj, removeLastHistObj, showDownloadDialog,
        getImageActionRotate, getImageActionResize, getImageActionCrop, getImageActions,
        setImageActionRotate, setImageActionResize, setImageActionCrop, getLocation,
        getImageHistIdx, setImageHistIdx, disableFloatButtons, disableFloatLeftButton,
        disableFloatRightButton, enableFloatLeftButton, enableFloatRightButton,
        enableIfNededFloatBtn, disableCrop, removeActionsWithWrappers, ensureClean,
        enableResizable, disableEditingImage, destroy, getResizeHistObject, rotateImage,
        addActionToImageHistChanges, enableUndo, disableUndo, showToolbar, hideToolbar,
        getImageSize, setImageSizes, applyResizeWithCanvas, notifCantSaveImage,
        getFloatObject, setImageFloat, disableResizable, restoreOriginalInlineStyle,
        disableFloat, undoResize, undoFloat, undoDelete, undoPadding, updatePaddingPanelValues,
        undoAltText, undoCrop, bindCropKeys, showNotifWidthUpload, closeNotif, addWrappersToAllImages,
        removeWrappersOfAllImages, removeWrappersOfOneImage, enableContentEditable, getImageSizesForWrappers,
        updateImageWrappersSize, updateImageWrappers, isCropping, addWrappersToAnImage, imageSizeExceded,
        localizeTemplates,

        // Toolbar butons actions
        bindRotateBtn, bindCropBtn, bindCropButtons, bindUndoBtn, bindPaddingBtn, bindAltTextBtn,
        bindDeleteBtn, bindAlignLeftBtn, bindAlignRightBtn, alignButtonAction, bindResizeBtn,
        bindToolbarButtonsActions, activeBtn, disableActiveBtn, disablePanel, enablePanel,
        bindPaddingLockUnlockBtn, bindAreasAndInputsSelection, unbindAreasAndInputsSelection,
        bindPaddingInputsKeydown, unbindPaddingInputsKeydown, bindPaddingPlusMinusButtons,
        enablePaddingInputs, addPaddingHistory, setDefaultPaddingPanelConfig, bindAltTextSaveBtn,
        addRotateHistoryObject, undoRotate, cropImage, addCropHistoryObject,

        /* Private members */
        _editImageToolbarTemplateUnlocalized, _savingLayerTemplateUnlocalized,
        _editImageToolbarTemplate, _module, _redactorBox, _redactorToolbar, _resx, _defaultResx, _confirmOpts,
        _siteRoot, _sfImage, _saveImageURL, _saveExternalImageURL, _history, _activeImage, _activeImageStyle,
        _activeImageFloat, _disabled, _floatApplied, _removedImage, _activePaddingInput, _activeJcrop,
        _cropActions, _canvas, _imageIsResized, _imageEditingWillBeDestroyed, _savingImage, _notif,
        _downloadImageXHR, _savingLayer, _savingLayerTemplate, _moduleInitialWidth,

        // Edit image toolbar and it's buttons
        _toolbar, _toolbarRotateBtn, _toolbarUndoBtn, _toolbarDeleteBtn, _toolbarDeleteIcon,
        _activeToolbarBtn, _activeToolbarPanel,

          // Crop
        _toolbarCropBtn, _toolbarCropIcon, _cropButtons, _jcropSelection, _jcropChanging,

        // Resize
        _toolbarResizeBtn, _toolbarResizeIcon, bindResizeKeys,

          // Padding
        _toolbarPaddingBtn, _toolbarPaddingIcon, _toolbarPaddingPanel, _toolbarPaddingLock,
        _toolbarPaddingInputs, _toolbarPaddingButtons, _toolbarPaddingAreas, _toolbarPaddingImages,

          // Alt text
        _toolbarAltTextBtn, _toolbarAltTextIcon, _toolbarAltTextPanel, _toolbarAltTextInput,
        _toolbarAltTextSaveBtn,

          // Align
        _toolbarAlignLeftBtn, _toolbarAlignLeftIcon, _toolbarAlignRightBtn,
        _toolbarAlignRightIcon, _removeAlign;

        /* Class properties */
        ImageEditing.class = 'ImageEditing';
        ImageEditing.type  = 'Class';

        /* Constants and vars */
        CROP_ACTIONS_SIZE  = 30;
        ANGLE_90_DEGREES   = 0.5 * Math.PI;
        DEGREES            = 90;
        KEY_NUMBER_0       = 48;
        KEY_NUMBER_9       = 57;
        KEY_BACKSPACE      = 8;
        KEY_SHIFT          = 16;
        KEY_CTRL           = 17;
        KEY_LEFT_ARROW     = 37;
        KEY_RIGHT_ARROW    = 39;
        KEY_LEFT_WNDOW_KEY = 91;
        ENTER              = 13;
        ESC                = 27;
        NOTIF_DOWNLOADING_EXTERNAL_PROGRESS_TIME = 4000;
        NOTIF_DOWNLOADING_EXTERNAL_HEIGHT        = 150;
        FROM_EXTERNAL_URL_UPDATE_GUI_TIME        = 500;
        TIME_TO_SHOW_PROGRESS_AT_100             = 70;
        MAX_IMAGE_WIDTH  = 2560;
        MAX_IMAGE_HEIGHT = 1600;
        ALTTEXT_PANEL_WIDTH = 340;

        _resx = _defaultResx = {
          alignLeft: 'Align Left',
          alignRight: 'Align Right',
          cancel: 'Cancel',
          cantSaveImage: 'Error saving image',
          confirmDownloadImageCancel: 'Cancel',
          confirmDownloadImageNo: 'No',
          confirmDownloadImageText: 'URL images cannot be edited. Would you like to import this image?',
          confirmDownloadImageYes: 'Yes',
          crop: 'Crop',
          delete: 'Delete',
          importing: 'Importing',
          padding: 'Padding',
          resize: 'Resize',
          rotate: 'Rotate',
          save: 'Save',
          savingImageChanges: 'Saving image changes...',
          titleAndAltText: 'Title and alt text',
          undo: 'Undo'
        };

        // #image-edit-bar
        _editImageToolbarTemplateUnlocalized = '<div id="image-edit-bar">\
          <span class="rotate" title="{0}"><span class="image-edit-btns">{0}</span></span>\
          <span class="crop" title="{1}"><span class="image-edit-btns">{1}</span></span>\
          <span class="resize" title="{2}"><span class="image-edit-btns">{2}</span></span>\
          <span class="undo disabled" title="{3}"><span class="image-edit-btns">{3}</span></span>\
          <span class="padding">\
            <span class="popper padding-popover image-edit-btns" title="{4}">{4}</span>\
            <div class="padding-popcontent popper-content">\
              <h5>{4}</h5>\
              <img src="{i0}images/ImageEditing/padding-img.jpg" usemap="#Map" class="padding-area all" id="padding-area"/>\
              <img src="{i0}images/ImageEditing/area-top.jpg" usemap="#Map" class="padding-area top" id="padding-area" style="display: none;"/>\
              <img src="{i0}images/ImageEditing/area-left.jpg" usemap="#Map" class="padding-area left" id="padding-area" style="display: none;"/>\
              <img src="{i0}images/ImageEditing/area-right.jpg" usemap="#Map" class="padding-area right" id="padding-area" style="display: none;"/>\
              <img src="{i0}images/ImageEditing/area-bottom.jpg" usemap="#Map" class="padding-area bottom" id="padding-area" style="display: none;"/>\
              <map name="Map">\
                <area shape="poly" coords="90, 23, 116, 0, -5, -7, 26, 24" class="area-top" id="top">\
                <area shape="poly" coords="116, 2, 91, 24, 92, 84, 115, 106, 116, 105" class="area-right" id="right">\
                <area shape="poly" coords="27, 85, 3, 108, 113, 105, 90, 85" class="area-bottom" id="bottom">\
                <area shape="poly" coords="25, 24, 25, 86, 0, 108, 0, 2" class="area-left" id="left">\
              </map>\
              <span class="padding-lock-unlock lock"></span>\
              <div class="padding-value">\
                <span class="padding-top"><input type="text" value="0" name="paddingTop" id="paddingTop" data-padding="top" disabled/></span>\
                <span class="padding-right"><input type="text" value="0" name="paddingRight" id="paddingRight" data-padding="right" disabled/></span>\
                <span class="padding-bottom"><input type="text" value="0" name="paddingBottom" id="paddingBottom" data-padding="bottom" disabled/></span>\
                <span class="padding-left"><input type="text" value="0" name="paddingLeft" id="paddingLeft" data-padding="left" disabled/></span>\
              </div>\
              <div class="padding-buttons">\
                <span class="padding-down"><span>-</span></span>\
                <span class="padding-up"><span>+</span></span>\
              </div>\
            </div>\
          </span>\
          <span class="tag">\
            <span class="popper padding-tag image-edit-btns" title="{5}">Tag</span>\
            <div class="alttext-popcontent popper-content">\
              <h5>{5}</h5>\
              <input type="text" class="form-control alttext-field">\
              <button class="btn" type="button">{6}</button>\
            </div>\
          </span>\
          <span class="align-left image-align"><span class="image-edit-btns" title="{7}">{7}</span></span>\
          <span class="align-right image-align"><span class="image-edit-btns" title="{8}">{8}</span></span>\
          <span class="delete"><span class="image-edit-btns" title="{9}">{9}</span></span>\
        </div>';

        _cropActions = '<div class="actions">\
            <div class="cropBtn ok"></div>\
            <div class="cropBtn cancel"></div>\
          </div>';

        _savingLayerTemplateUnlocalized = '<div class="dnnImageEditingSavingLayer">\
          <div class="loopBar">\
            <div class="progressA" style="width: 0;"></div>\
          </div>\
          <div class="optacityLayer">\
            <h1 style="">{0}</h1>\
          </div>\
        </div>';

        _canvas = document.createElement('canvas');

        /* Constructor */
        function ImageEditing (moduleWithRedactor, siteRoot, sfImage, saveImageURL, saveExternalImageURL, resx) {
          //console.log('~ImageEditing');
          var images;

          if (!moduleWithRedactor) {throw 'Module not provided';}
          _module = moduleWithRedactor;           // Module is the same that '.redactor-editor'
          _module.addClass('imageInlineEdit');    // For CSS

          if (!siteRoot) {throw 'No site root provided';}
          _siteRoot = siteRoot;

          if (!sfImage) {throw 'No image service framwork provided';}
          _sfImage = sfImage;

          if (!saveImageURL) {throw 'No save image URL provided';}
          _saveImageURL = saveImageURL;

          if (!saveExternalImageURL) {throw 'No save external image URL provided';}
          _saveExternalImageURL = saveExternalImageURL;

          _moduleInitialWidth = _module.css('width');

          if (resx && typeof resx === 'object' && Object.keys(resx).length > 0) {
            _resx = resx;
          }

          // Add route for image of area in template. Needs apply before localize Templates.
          _editImageToolbarTemplateUnlocalized = _editImageToolbarTemplateUnlocalized.replace(/\{i0\}/g, _siteRoot);

          // Translate template
          localizeTemplates();

          _confirmOpts = {
            title:   'Confirm',
            text:    _resx.confirmDownloadImageText,
            yesText: _resx.confirmDownloadImageYes,
            noText:  _resx.confirmDownloadImageNo
          };

          _activeImage = null;

          // Get principal redactor objects
          _redactorBox = _module.closest('.redactor_box');
          _redactorToolbar = _redactorBox.find('.redactor_toolbar');

          initTemplate();

          // Init history array
          _history = [];

          initImages();

          // Disable active image (editing)
          _module.on('click.imageEditing', function moduleClick(evt) {
            if ($(evt.target).hasClass('dnnLayerWrapper')) {return;}

            if (_activeJcrop) {
              evt.stopPropagation();
              return;
            }

            if (isCropping(evt)) {return;}

            // Click out of an image (click on text)
            if (_activeImage !== null && evt.target.nodeName !== 'IMG') {
              setTimeout(function() {
                addWrappersToAllImages();
              }, 0);

              hideToolbar();
              enableContentEditable();
            }
          });

          images = _module.find('img');

          _module.on('scroll.imageEditing', function() {
            images.each(function(idx, image) {
              image = $(image);
              if (!image.parent().hasClass('dnnImageWrapper')) {return;}
              image.prev().offset(image.offset());
            });
          });
        }

        isCropping = function isCropping(evt) {
          // Clicked on ✓ or X, crop buttons
          if ($(evt.target).hasClass('cropBtn')) {return true;}

          // Actions inside jcrop
          if (_jcropChanging) {return true;}

          return false;
        };

        enableContentEditable = function enableContentEditable() {
          _module.find('.dnnLayerWrapper').show();
          _module.attr('contenteditable', true);
        };

        /* Private Methods */
        initTemplate = function initTemplate() {
          var map, padding;

          // Add image editing toolbar
          _redactorToolbar.after(_editImageToolbarTemplate);
          _toolbar = _redactorBox.find('#image-edit-bar');

          // Get all template objects to manage functionality
          _toolbarRotateBtn      = _toolbar.find('.rotate:first');
          _toolbarRotateBtn.data('paddingLeft', _toolbarRotateBtn.css('padding-left'));

          _toolbarCropBtn        = _toolbar.find('.crop:first');
          _toolbarCropIcon       = _toolbarCropBtn.find('.image-edit-btns:first');
          _toolbarResizeBtn      = _toolbar.find('.resize:first');
          _toolbarResizeIcon     = _toolbarResizeBtn.find('.image-edit-btns:first');
          _toolbarUndoBtn        = _toolbar.find('.undo:first');
          _toolbarPaddingBtn     = _toolbar.find('.padding-popover:first');
          _toolbarPaddingIcon    = _toolbarPaddingBtn;
          _toolbarPaddingPanel   = _toolbar.find('.padding-popcontent:first');
          _toolbarPaddingLock    = _toolbar.find('.padding-lock-unlock:first');
          _toolbarPaddingAreas   = _toolbar.find('map:first area');
          _toolbarPaddingInputs  = _toolbar.find('.padding-value:first input');
          _toolbarPaddingButtons = _toolbar.find('.padding-buttons:first > span');
          _toolbarPaddingImages  = _toolbar.find('img.padding-area');
          _toolbarAltTextBtn     = _toolbar.find('.tag:first');
          _toolbarAltTextIcon    = _toolbarAltTextBtn.find('.image-edit-btns:first');
          _toolbarAltTextPanel   = _toolbar.find('.alttext-popcontent:first');
          _toolbarAltTextInput   = _toolbarAltTextPanel.find('input:first');
          _toolbarAltTextSaveBtn = _toolbarAltTextPanel.find('button:first');
          _toolbarAlignLeftBtn   = _toolbar.find('.align-left:first');
          _toolbarAlignLeftIcon  = _toolbarAlignLeftBtn.find('.image-edit-btns:first');
          _toolbarAlignRightBtn  = _toolbar.find('.align-right:first');
          _toolbarAlignRightIcon = _toolbarAlignRightBtn.find('.image-edit-btns:first');
          _toolbarDeleteBtn      = _toolbar.find('.delete:first');
          _toolbarDeleteIcon     = _toolbarDeleteBtn.find('.image-edit-btns:first');

          bindToolbarButtonsActions();
        };

        showToolbar = function showToolbar() {
          var width, style, top, contentPadding, modulePadding, finalWidth, rows, height;

          width = $('.redactor_toolbar').width();

          style = 'z-index: 99999 !important; ';

          _toolbar.attr('style', style);

          finalWidth = _toolbar.width();

          switch (true) {
            case (finalWidth > 299): rows = 1; break;
            case (finalWidth > 163): rows = 2; break;
            case (finalWidth > 101): rows = 3; break;
            case (finalWidth > 95): rows = 4; break;
            case (finalWidth > 67): rows = 5; break;
            case (finalWidth > 61): rows = 8; break;
            case (finalWidth < 62): rows = 9; break;
          }

          height = 34 * rows;

          style += 'height: ' + height + 'px !important;';

          _toolbar.attr('style', style);

          contentPadding = height + CROP_ACTIONS_SIZE;

          if (_module.data('inFullScreen')) {
            // Fullscreen is now disabled and this code is obsolete
            top = _module.data('finalMargin');
            modulePadding = contentPadding + top;

            style += 'position: fixed !important;' + 'top: ' + top + 'px !important;';
            _toolbarRotateBtn.css('padding-left', 0);
          } else {
            top = _redactorToolbar.height();
            modulePadding = contentPadding;

            style += 'top: ' + top + 'px !important;';
            _toolbarRotateBtn.css('padding-left', _toolbarRotateBtn.data('paddingLeft'));
          }

          _toolbar.attr('style', style);

          _toolbar.show();
          _toolbar.width(_redactorToolbar.width()-2);
          _module.data('padding-top', parseInt(_module.css('padding-top'), 10));

          _module.css('padding-top', 0);
          style = _module.attr('style').replace(/padding\-top:\s[0-9]+(px)?\s?(\!important)?/, 'padding-top: ' + modulePadding + 'px !important;');
          _module.attr('style', style);
        };

        hideToolbar = function hideToolbar() {
          var dnnImageWrapper, style;

          if (!_module) {return;}

          enableContentEditable();

          disableEditingImage(_activeImage);
          _activeImage = null;

          if (_activeToolbarBtn) {
            _activeToolbarBtn.removeClass('active');
            _activeToolbarBtn = null;
          }

          if (_removedImage) {
            _history[getImageHistIdx(_removedImage)] = null;

            dnnImageWrapper = _removedImage.parent();

            if (dnnImageWrapper.hasClass('dnnImageWrapper')) {
              dnnImageWrapper.remove();
            } else {
              _removedImage.remove();
            }
          }

          // Remove inline style editor toolbar top
          _toolbar.attr('style', '');
          style = _module.attr('style').replace(/padding\-top:\s[0-9]+(px)?\s?(\!important)?/, 'padding-top: ' + _module.data('padding-top') + 'px !important;');
          _module.attr('style', style);

          _toolbar.hide();

          // Trigger hidded
          _module.trigger('hideToolbar.imageEditing');
        };

        initImages = function initImages() {
          addWrappersToAllImages();

          // Add event to bind toolbar with images
          _module.on('click.imageEditing', 'img', function activeImageClicked(evt) {
            var self, histIdx, src, name, imageLocation;
            self = $(this);

            _module.attr('contenteditable', false);

            setImageHistIdx(self);

            if (self.hasClass('ui-resizable')) {
              return;
            }

            // Unselect redactor toolbar icons
            _redactorToolbar.find('.redactor_act').removeClass('redactor_act');

            showToolbar();

            if (_activeImage && !self.hasClass('highlighted')) {
              disableEditingImage(_activeImage);
              addWrappersToAnImage(_activeImage);

              _activeImage = null;
              _activeImageStyle = null;
              disableFloatButtons();
            }

            // Undo can be active with no _activeImage
            disableActiveBtn();

            // Set active image control ang save actual style,
            // style is for clean when resizable end
            _activeImage = self;
            _activeImage.addClass('highlighted');

            _activeImageStyle = self.attr('style');
            _activeImageFloat = self.css('float');

            if(!_activeImageStyle) {_activeImageStyle = '';}

            // Save original src
            if (!self.data('original-src')) {
              src = self.attr('src');
              self.data('original-src', src);

              name = src.match(/[^\/\\]+$/);
              if (name && name[0]) {
                if (name) {
                  if (typeof name === 'string') {
                    self.data('name', name);
                  } else {
                    self.data('name', name[0]);
                  }
                }
              }
            }

            // Save actions to future server post
            if (!self.data('action-rotate')) {
              self.data('action-rotate', '0');
            }

            if (!self.data('action-resize-h')) {
              self.data('action-resize-h', '0');
              self.data('action-resize-w', '0');
            }

            if (!self.data('action-crop-h')) {
              self.data('action-crop-h', '0');
              self.data('action-crop-w', '0');
            }

            // Check if is local by host
            imageLocation = getLocation(self.attr('src'));
            if (imageLocation && imageLocation.host !== window.location.host) {
              self.data('is-local', 'NO');
            } else {
              self.data('is-local', 'YES');
            }

            disablePanel();
            enableIfNededFloatBtn(self);

            // Enable undo if image has history changes
            histIdx = getLastImageHistObj(self);
            if (histIdx) {
              enableUndo();
            }
          });
        };

        /* Start Image Wrappers */
        addWrappersToAllImages = function addWrappersToAllImages() {
          if (!_module || _activeImage || _activeJcrop) {return;}

          _module.find('img').each(function wrapImage(idx, image) {
            image = $(image);
            addWrappersToAnImage(image);
          });
        };

        addWrappersToAnImage = function addWrappersToAnImage(image) {
          var imageWrapper, layerWrapper, sizes;

          if (image.parent().hasClass('dnnImageWrapper')) {return;}

          imageWrapper = $('<div class="dnnImageWrapper" style="overflow: hidden; position: relative;"></div>');
          layerWrapper = $('<div class="dnnLayerWrapper" style="z-index:9999;"></div>');

          sizes = getImageSizesForWrappers(image);
          image.wrap(imageWrapper);

          imageWrapper = image.parent();
          imageWrapper.prepend(layerWrapper);
          layerWrapper = imageWrapper.children(':first');

          layerWrapper.attr('style', 'z-index:9999; background-color: transparent !important; opacity: 0.9;'); // Change color to debug

          updateImageWrappers(image);

          imageWrapper.attr('contenteditable', false);
          layerWrapper.attr('contenteditable', false);

          layerWrapper.offset(image.offset());

          imageWrapper.off('click.imageEditing').on('click.imageEditing', function activeImagePreventingIEResizeBuiltIn(evt) {
            if (isCropping(evt)) {return;}

            // Click on image (wrapper layer is hidden)
            if (evt.target.nodeName === 'IMG') {return;}

            // Trigger event after _module.on('click.imageEditing', ...
            setTimeout(function triggerImageClick () {
              //removeWrappersOfAllImages();
              removeWrappersOfOneImage(image);
              image.trigger('click');
            }, 0);
          });
        };

        removeWrappersOfAllImages = function removeWrappersOfAllImages() {
          if (!_module) {return;}

          _module.find('img').each(function (idx, image) {
            image = $(image);
            removeWrappersOfOneImage(image);
          });
        };

        removeWrappersOfOneImage = function removeWrappersOfOneImage(image) {
          var layer, parent;

          parent = image.parent();
          layer = image.prev();

          if (layer.hasClass('dnnLayerWrapper')) {layer.remove();}

          if (parent.hasClass('dnnImageWrapper')) {
            parent.before(image);
            parent.remove();
          }
        };
        /* End Image Wrappers */

        /* Start Image Actions */
        imageSizeExceded = function imageSizeExceded(image) {
          var width, height, ratio, maxDimensionsExceeded;

          width  = image[0].naturalWidth;
          height = image[0].naturalHeight;
          ratio  = width/height;

          maxDimensionsExceeded = ratio < 1 ? (width > MAX_IMAGE_HEIGHT || height > MAX_IMAGE_WIDTH) : (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT);

          if (maxDimensionsExceeded) {
            _notif = $.dnnNotif({
              text: _resx.fileSizeExceed,
              styleBlue: true,
              dialogClass: 'noCloseIcon',
              height: 70
            });
            return true;
          }

          return false;
        };

        getImageActionRotate = function getImageActionRotate(image) {
          var turns;

          turns = parseInt(image.data('action-rotate'), 10);

          return isNaN(turns) ? 0 : turns;
        };

        getImageActionResize = function getImageActionResize(image) {
          var width, height;

          width =  parseInt(image.data('action-resize-w'), 10);
          height = parseInt(image.data('action-resize-h'), 10);

          if (isNaN(width)) {width = 0;}
          if (isNaN(height)) {height = 0;}

          return {width: width, height: height};
        };

        getImageActionCrop = function getImageActionCrop(image) {
          var width, height;

          width =  parseInt(image.data('action-crop-w'), 10);
          height = parseInt(image.data('action-crop-h'), 10);

          if (isNaN(width)) {width = 0;}
          if (isNaN(height)) {height = 0;}

          return {width: width, height: height};
        };

        getImageActions = function getImageActions(image) {
          var actions;
          actions = {};

          actions.rotated = getImageActionRotate(image) * DEGREES;
          actions.resized = getImageActionResize(image);
          actions.cropped = getImageActionCrop(image);

          return actions;
        };

        setImageActionRotate = function setImageActionRotate(image, value) {
          if (value < 0) {value = 0;}
          image.data('action-rotate', value);
        };

        setImageActionResize = function setImageActionResize(image, width, height) {
          image.data('action-resize-w', width);
          image.data('action-resize-h', height);
        };

        setImageActionCrop = function setImageActionCrop(image, width, height) {
          image.data('action-crop-w', width);
          image.data('action-crop-h', height);
        };
        /* End Image actions */

        getLocation = function getLocation(url) {
          var match;
          match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);

          return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
          };
        };

        disableFloatButtons = function disableFloatButtons() {
          disableFloatLeftButton();
          disableFloatRightButton();
        };

        disableFloatLeftButton = function disableFloatLeftButton() {
          _toolbarAlignLeftIcon.removeClass('active');
        };

        enableFloatLeftButton = function disableFloatLeftButton() {
          _toolbarAlignLeftIcon.addClass('active');
        };

        disableFloatRightButton = function disableFloatRightButton() {
          _toolbarAlignRightIcon.removeClass('active');
        };

        enableFloatRightButton = function disableFloatRightButton() {
          _toolbarAlignRightIcon.addClass('active');
        };

        enableIfNededFloatBtn = function enableIfNededFloatBtn(image) {
          switch (image.css('float')) {
            case 'left':
              enableFloatLeftButton();
            break;

            case 'right':
              enableFloatRightButton();
            break;
          }
        };

        getImageHistIdx = function getImageHistIdx(image) {
          return image.data('dnn-hist-idx');
        };

        setImageHistIdx = function setImageHistIdx(image) {
          var tsIndex;
          tsIndex = getImageHistIdx(image);

          // Image has history changes
          if (tsIndex !== undefined && _history[tsIndex]) {return;}

          // Unique index to preserve history
          if (!tsIndex) {tsIndex = new Date().getTime();}

          image.data('dnn-hist-idx', tsIndex);

          _history[tsIndex] = {
            imgHist: []
          };
        };

        addActionToImageHistChanges = function addActionToImageHistChanges(histIdx, histObj) {
          var lastHistElement;
          lastHistElement = _history[histIdx].imgHist.slice(-1)[0];

          // Not add to historic changes if is the same
          _history[histIdx].imgHist.push(histObj);
        };

        // Return last image history change or null
        getLastImageHistObj = function getLastImageHistObj(image) {
          var histIdx, lastHistElement;

          histIdx = getImageHistIdx(image);

          if (histIdx === undefined) {return null;}

          lastHistElement = _history[histIdx].imgHist.slice(-1)[0];
          if (!lastHistElement) {return null;}

          return lastHistElement;
        };

        removeLastHistObj = function removeLastHistObj(image) {
          var histIdx;

          histIdx = getImageHistIdx(image);

          if (histIdx === undefined) {return null;}

          _history[histIdx].imgHist.pop();

          if (_history[histIdx].imgHist.length === 0) {
            disableUndo();
          }
        };

        showDownloadDialog = function showDownloadDialog(image, callback) {
          _confirmOpts.callbackTrue = function dnnConfirmTruePressed(data) {
            showNotifWidthUpload(image.attr('src').match(/[^\/\\]+$/)[0]);

            _downloadImageXHR = $.ajax({
              type: 'POST',
              url:  _saveExternalImageURL,
              beforeSend: _sfImage.setModuleHeaders,
              data: {
                image: image.attr('src')
              },
              success: function (data) {
                var imageObj;

                if (data.success) {
                  image.data('is-local', 'YES');
                  image.attr('src', data.filelink);
                  image.data('original-src', data.filelink);

                  imageObj = new Image();
                  imageObj.src = data.filelink;

                  name = data.filelink.match(/[^\/\\]+$/);

                  if (name) {
                    if (typeof name === 'string') {
                      image.data('name', name);
                    } else {
                      image.data('name', name[0]);
                    }
                  }

                  if (_notif && _notif.length > 0 ) {
                    _notif.find('.progressA').stop(true, true).animate({width: '99%'}, NOTIF_DOWNLOADING_EXTERNAL_PROGRESS_TIME);
                  }

                  if (typeof callback === 'function') {
                    imageObj.onload = function imageLoaded() {
                      closeNotif();
                      callback(image);
                    };

                  } else {
                    closeNotif();
                  }

                } else {
                  notifCantSaveImage();
                }
                _savingImage = false;
              },
              error: function (data) {
                if (data.statusText !== 'abort') {notifCantSaveImage();}
              }
            });
          };

          $.dnnConfirm(_confirmOpts);
        };

        showNotifWidthUpload = function showNotifWidthUpload(imageName) {
          var progress;
          closeNotif();

          _notif = $.dnnNotif({
            dialogClass: 'noTittle',
            text: '<div class="title" style="text-align: center;"><h2 style="color:white;">{0}</h2></div>'.replace('{0}', _resx.importing) +
                  '<div class="imageName" style="text-align: center;">' +
                    imageName +
                  '</div>' +
                  '<div class="loopBar"><div class="progressA"></div></div>' +
                  '<div class="notifCancelBtn">{0}</div>'.replace('{0}', _resx.cancel),
            styleBlue: true,
            noIcon: true,
            manualClose: true,
            height: NOTIF_DOWNLOADING_EXTERNAL_HEIGHT
          });

          progress =_notif.find('.progressA');
          progress.css('width', '0');
          progress.animate({width: '95%'}, NOTIF_DOWNLOADING_EXTERNAL_PROGRESS_TIME);

          _notif.find('.notifCancelBtn').on('click', function cancelDownloadingImage() {
            if (_downloadImageXHR && _downloadImageXHR.readyState != 4) {
              _downloadImageXHR.abort();
            }
            closeNotif();
          });
        };

        notifCantSaveImage = function notifCantSaveImage() {
          closeNotif();

          _notif = $.dnnNotif({
            dialogClass: 'noTittle',
            text: _resx.cantSaveImage,
            styleBlue: true,
            height: 50
          });
        };

        closeNotif = function closeNotif() {
          if (!_notif) {return;}

          _notif.find('.progressA').stop(true, true).css('width', '100%');
          _notif.find('.notifCancelBtn').off('click');
          _notif.dialog('close');
        };

        getImageSize = function getImageSize(image) {
          return {
            width:  image.width(),
            height: image.height()
          };
        };

        setImageSizes = function setImageSizes(image, size) {
          image.css({
            width:        size.width+'px',
            height:       size.height+'px',
            'max-width':  'none',
            'max-height': 'none',
            'min-width':  'none',
            'min-height': 'none'
          });
        };

        getFloatObject = function getFloatObjec(image, float) {
          var histObj;

          histObj = {
            type: 'float',
            prop: {
              float: float
            }
          };

          return histObj;
        };

        setImageFloat = function setImageFloat(image, float) {
          var imageOffset, dnnLayerWrapper, dnnImageWrapper;

          _activeImage.css('float', float);
          _activeImageFloat = float;
        };

        disableEditingImage = function disableEditingImage(image) {
          if (!image) {return;}

          // Image is deleted
          if (!image.is(':visible') && !_jcropSelection) { // not(':visible') not working
            image.remove();
            return;
          }

          removeActionsWithWrappers(image);
          image.removeClass('highlighted');

          if (image.attr('class') === '') {
            image.removeAttr('class');
          }

          disableFloat(image);
          disableFloatButtons();
          disableUndo();

          if (image.attr('src').search('data:image/png;base64,') === -1) {return;}

          // If image has rotate, resize, or crop changes
          if (image.data('need-save') === 'YES') {
            _savingImage = true;
            $.ajax({
              type: 'POST',
              url:  _saveImageURL,
              beforeSend: _sfImage.setModuleHeaders,
              data: {
                image: image.attr('src').replace('data:image/png;base64,', ''),
                name:  image.data('name'),
                actions: getImageActions(image)
              },
              success: function (data) {
                if (data.success) {
                  image.attr('src', data.filelink);
                  image.data('original-src', data.filelink);
                } else {
                  notifCantSaveImage();
                }
                _savingImage = false;
                $(window).trigger('saved.inlineEditing');
              },
              error: function () {
                _savingImage = false;
                $(window).trigger('saved.inlineEditing');
                notifCantSaveImage();
              }
            });

          }
        };

        disableResizable = function disableResizable(image, preventResize) {
          var size;

          if (!image.hasClass('ui-resizable')) {return;}

          image.resizable('destroy');

          if (!preventResize) {
            size = getImageSize(image);
            restoreOriginalInlineStyle(image);
          }

          if (_imageIsResized) {
            applyResizeWithCanvas(image, size);
            _imageIsResized = false;
          }

          $(window).off('keydown.inlineEditing');
        };

        disableCrop = function disableCrop(image) {
          if (!image) {image = _activeImage;}

          if (!image) {return;}

          disableActiveBtn();
          _jcropSelection = null;

          if (image.data('Jcrop')) {
            _activeJcrop = null;
            image.data('Jcrop').destroy();
          }

          if(_cropButtons && _cropButtons.length === 2){
            _cropButtons[0].off('.inlineEditing');
            _cropButtons[1].off('.inlineEditing');
          }

          $(window).off('keydown.inlineEditing');
        };

        // Remove Resize and Crop
        removeActionsWithWrappers = function removeActionsWithWrappers(image) {
          disableResizable(image);
          disableCrop(image);
        };

        restoreOriginalInlineStyle = function restoreOriginalInlineStyle(image) {
          image.attr('style', _activeImageStyle);
        };

        disableFloat = function disableFloat(image) {
          if (!_activeImageFloat) {return;}

          if (image.css('float') !== _activeImageFloat) {
            image.css('float', _activeImageFloat);
          }

          _activeImageFloat = null;
        };

        disableUndo = function disableUndo() {
          _toolbarUndoBtn.addClass('disabled');
        };

        enableUndo = function enableUndo() {
          _toolbarUndoBtn.removeClass('disabled');
        };
        /* Start toolbar buttons actions */

        bindToolbarButtonsActions = function bindToolbarButtonsActions() {
          _toolbar.on('click.imageEditing', function clickOnToolbar(evt) {
            if (_activeToolbarBtn) {
              evt.stopPropagation();
            }
          });

          bindRotateBtn();
          bindCropBtn();
          bindResizeBtn();
          bindUndoBtn();
          bindPaddingBtn();
          bindAltTextBtn();
          bindAltTextSaveBtn();
          bindAlignLeftBtn();
          bindAlignRightBtn();
          bindDeleteBtn();
          bindPaddingLockUnlockBtn();
          bindPaddingPlusMinusButtons();
        };

        /* toolbar: Start Rotate */
        bindRotateBtn = function bindRotateBtn() {
          _toolbarRotateBtn.on('click.inlineEditing', function rotateImageBtnPressed(evt) {
            evt.stopPropagation();

            if (_activeImage === null) {return;}
            disablePanel();
            rotateImage(_activeImage);
          });
        };

        rotateImage = function rotateImage(image) {
          var context, w, h, diff, w2, h2, diff2, turns, ow, oh;

          if (imageSizeExceded(image)) {return;}

          if (image.data('is-local') === 'NO') {
            showDownloadDialog(image, rotateImage);
            return;
          }

          removeActionsWithWrappers(image);

          ow    = image.width();
          oh    = image.height();
          w     = image[0].naturalWidth;
          h     = image[0].naturalHeight;
          w2    = w/2;
          h2    = h/2;
          diff  = w-h;
          diff2 = diff/2;

          _canvas.width  = h;
          _canvas.height = w;

          context = _canvas.getContext('2d');

          context.save();
          context.translate(w2, h2);
          context.rotate(ANGLE_90_DEGREES);
          context.translate(-w2 + diff2, -h2 + diff2);
          context.drawImage(image[0], 0, 0);
          context.restore();

          addRotateHistoryObject(image, {width: image.width(), height: image.height()});

          if (_canvas.toDataURL().search('data:image/png;base64,') !== -1) {
            image.attr('src', _canvas.toDataURL());
            image.css({
              width:  oh,
              height: ow
            });
            turns = getImageActionRotate(image) + 1;
            setImageActionRotate(image, turns);
            image.data('need-save', 'YES');

            updateImageWrappers(image);
          }
        };

        addRotateHistoryObject = function addRotateHistoryObject(image, size) {
          var histObj, histIdx;

          histIdx = getImageHistIdx(image);
          histObj = {
            type: 'rotate',
            prop: {
              src: image.attr('src'),
              width:  size.width,
              height: size.height
            }
          };

          addActionToImageHistChanges(histIdx, histObj);
          enableUndo();
        };
        /* toolbar: End Rotate */

        /* toolbar: Start Crop */
        bindCropBtn = function bindCropBtn() {
          _toolbarCropBtn.on('click.inlineEditing', function activeCropImage(evt) {
            var jcropHolderFirstDiv;

            evt.stopPropagation();

            if (_activeImage === null) {return;}

            disablePanel();

            if (imageSizeExceded(_activeImage)) {return;}

            if (_activeImage.data('is-local') === 'NO') {
              showDownloadDialog(_activeImage, function() {_toolbarCropBtn.trigger('click');});
              return;
            }

            if (_activeJcrop) {
              disableActiveBtn();
              disableCrop();
              return;
            }

            removeActionsWithWrappers(_activeImage);

            _jcropChanging = false;

            _activeJcrop = _activeImage.Jcrop({
              setSelect: [0, 0, 50, 50],
              allowSelect: false,
              onChange: function(selection) {
                _jcropSelection = selection;
                _jcropChanging = true;
              },
              onSelect: function () {
                setTimeout(function endCroppingAction() {
                  _jcropChanging = false;
                }, 0);
              }
            });

            setTimeout(function() {
              jcropHolderFirstDiv = _activeJcrop.parent().find('.jcrop-holder div:first');
              jcropHolderFirstDiv.prepend(_cropActions);

              _cropButtons = [jcropHolderFirstDiv.find('.ok'), jcropHolderFirstDiv.find('.cancel')];
              bindCropButtons(_cropButtons[0], _cropButtons[1]);
              bindCropKeys();
            }, 0);

            activeBtn(_toolbarCropIcon);
          });
        };

        bindCropButtons = function bindCropButtons(okBtn, cancelBtn) {
          okBtn.on('click.inlineEditing', function okCropClicked(evt) {
            evt.stopPropagation();
            cropImage(_activeImage);
          });

          cancelBtn.on('click.inlineEditing', function cancelCropClicked(evt) {
            evt.stopPropagation();
            disableActiveBtn();
            disableCrop();
          });
        };

        bindCropKeys = function bindCropKeys() {
          $(window).on('keydown.inlineEditing', function saveOrQuitCrop(evt) {
            if (!_activeJcrop) {
              _module.off('keydown.inlineEditing');
              return;
            }

            switch (evt.keyCode) {
              case ENTER:
                cropImage(_activeImage);
              break;

              case ESC:
                disableCrop();
              break;
            }
          });
        };

        cropImage = function cropImage(image) {
          var context, jcropData, bounds, wRatio, hRatio;

          if (!_activeJcrop || !image || !_jcropSelection) {return;}

          addCropHistoryObject(image);

          jcropData = image.data('Jcrop');
          bounds = jcropData.tellSelect();

          wRatio = image[0].naturalWidth/image.width();
          hRatio = image[0].naturalHeight/image.height();

          _canvas.width  = bounds.w * wRatio;
          _canvas.height = bounds.h * hRatio;

          context = _canvas.getContext('2d');
          context.drawImage(image[0],
            bounds.x * wRatio, bounds.y * hRatio,
            bounds.w * wRatio, bounds.h * hRatio,
            0, 0, _canvas.width, _canvas.height);

          if (_canvas.toDataURL().search('data:image/png;base64,') !== -1) {
            image.attr('src', _canvas.toDataURL());
            image.css({
              width:  bounds.w,
              height: bounds.h
            });
            setImageActionCrop(image, _canvas.width, _canvas.height);
            image.data('need-save', 'YES');

            updateImageWrappers(image);
          }

          disableActiveBtn();
          disableCrop();
        };

        addCropHistoryObject = function addCropHistoryObjec(image) {
          var histObj, histIdx;

          histIdx = getImageHistIdx(image);
          histObj = {
            type: 'crop',
            prop: {
              src: image.attr('src'),
              width:  image.width(),
              height: image.height()
            }
          };

          addActionToImageHistChanges(histIdx, histObj);
          enableUndo();
        };
        /* toolbar: End Crop */

        /* toolbar: Start Resize */
        bindResizeBtn = function bindResizeBtn() {
          _toolbarResizeBtn.on('click.imageEditing', function resizeBtnPressed(evt) {
            evt.stopPropagation();

            if (_activeImage === null) {return;}

            disablePanel();

            if (_activeToolbarBtn === _toolbarResizeIcon) {
              disableResizable(_activeImage);
              disableActiveBtn();
              return;
            }

            removeActionsWithWrappers(_activeImage);

            enableResizable(_activeImage);
          });
        };

        enableResizable = function enableResizable(image) {
          var histIdx;

          if (imageSizeExceded(image)) {return;}

          if (image.data('is-local') === 'NO') {
            showDownloadDialog(image, enableResizable);
            return;
          }

          activeBtn(_toolbarResizeIcon);

          histIdx = getImageHistIdx(image);

          _imageIsResized = false;

          setTimeout(function() {

            image.resizable({
              handles: 'n, e, s, w, se, sw, nw, ne',

              // Save history resize object and enable undo
              start: function resizeStart(evt, ui) {
                var histObj;
                histObj = getResizeHistObject(image, ui.size);
                addActionToImageHistChanges(histIdx, histObj);
                enableUndo();
              },
              resize: function resizing() {
                _imageIsResized = true;
              },
              stop: function resizeStop(evt, ui) {
                applyResizeWithCanvas(image, ui.size);
              }
            });

          }, 100);

          // Prevent image boing effect
          image.css('display', 'inline');

          bindResizeKeys();
        };

        bindResizeKeys = function bindResizeKeys() {
          $(window).on('keydown.inlineEditing', function saveOrQuitResize(evt) {
            switch (evt.keyCode) {
              case ENTER:
                disableResizable(_activeImage);
                disableActiveBtn();
              break;

              case ESC:
                if (_imageIsResized) {
                  _toolbarUndoBtn.trigger('click');
                }

                disableResizable(_activeImage, true);
                disableActiveBtn();
              break;
            }
          });
        };

        applyResizeWithCanvas = function applyResizeWithCanvas(image, size) {
          var context;

          _canvas.width  = size.width;
          _canvas.height = size.height;

          context = _canvas.getContext('2d');
          context.save();
          context.drawImage(image[0], 0, 0, size.width, size.height);
          context.restore();

          if (_canvas.toDataURL().search('data:image/png;base64,') !== -1) {
            image.attr('src', _canvas.toDataURL());
            setImageActionResize(_activeImage, size.width, size.height);
            image.data('need-save', 'YES');
            setImageSizes(image, size);

            updateImageWrappers(image);
          }
        };

        getResizeHistObject = function getResizeHistObject(image, size) {
          var histObj, width, height;

          width  = size.width;
          height = size.height;

          histObj = {
            type: 'resize',
            prop: {
              width:  width,
              height: height,
              src: image.attr('src')
            }
          };

          return histObj;
        };
        /* toolbar: End Resize */

        /* toolbar: Start Undo actions */
        bindUndoBtn = function bindUndoBtn() {
          _toolbarUndoBtn.on('click.inlineEditing', function undoLastAction(evt) {
            var histObj;

            evt.stopPropagation();

            if (_activeImage === null) {return;}

            disableActiveBtn();
            disablePanel();

            histObj = getLastImageHistObj(_activeImage);
            if(!histObj) {return;}

            removeActionsWithWrappers(_activeImage);

            switch (histObj.type) {
              case 'resize':
                undoResize(_activeImage, histObj.prop);
              break;

              case 'float':
                undoFloat(_activeImage, histObj.prop.float);
              break;

              case 'delete':
                undoDelete(_activeImage);
              break;

              case 'padding':
                undoPadding(_activeImage, histObj.prop);
              break;

              case 'altText':
                undoAltText(_activeImage, histObj.prop.text);
              break;

              case 'crop':
                undoCrop(_activeImage, histObj.prop);
              break;

              case 'rotate':
                undoRotate(_activeImage, histObj.prop);
              break;
            }

          });
        };

        undoResize = function undoResize(image, prop) {
          setImageSizes(image, prop);
          image.attr('src', prop.src);
          setImageActionResize(image, prop.width, prop.height);
          removeLastHistObj(image);

          updateImageWrappers(image);
        };

        undoFloat = function undoFloat(image, float) {
          disableFloatButtons();
          setImageFloat(image, float);
          removeLastHistObj(image);
          _activeImageFloat = float;

          // Float can be left, right or none
          switch (float) {
            case 'left':
              enableFloatLeftButton();
            break;

            case 'right':
              enableFloatRightButton();
            break;
          }

          updateImageWrappers(image);
        };

        undoDelete = function undoDelete(image) {
          image.parent().show();
          enableIfNededFloatBtn(image);
          _removedImage = null;
          removeLastHistObj(image);

          updateImageWrappers(image);
        };

        undoPadding = function undoPadding(image, prop) {
          image.css({
            'padding-top':    prop.top,
            'padding-left':   prop.left,
            'padding-right':  prop.right,
            'padding-bottom': prop.bottom
          });

          removeLastHistObj(image);

          updateImageWrappers(image);
        };

        undoAltText = function undoAltText(image, text) {
          image.attr({
            alt: text,
            title: text
          });

          removeLastHistObj(image);

          updateImageWrappers(image);
        };

        undoCrop = function undoCrop(image, prop) {
          image.attr('src', prop.src);
          image.css({
            width: prop.width,
            height: prop.height
          });
          setImageActionCrop(image, prop.width, prop.height);
          removeLastHistObj(image);

          updateImageWrappers(image);
        };

        undoRotate = function undoRotate(image, prop) {
          var turns;

          image.attr('src', prop.src);
          _activeImage.css({
            width:  prop.width,
            height: prop.height
          });

          turns = getImageActionRotate(image) - 1;
          setImageActionRotate(image, turns);
          removeLastHistObj(image);

          updateImageWrappers(image);
        };
        /* toolbar: End Undo actions */

        /* toolbar: Start Image Wrappers */
        updateImageWrappers = function updateImageWrappers(image) {
          var dnnLayerWrapper, dnnImageWrapper, imageFloat, sizes;

          dnnLayerWrapper = image.prev();

          if (!dnnLayerWrapper.hasClass('dnnLayerWrapper')) {return;}

          dnnImageWrapper = image.parent();

          imageFloat = image.css('float');

          dnnImageWrapper.css({
            display: 'inline',
            padding: 0,
            float:   imageFloat
          });

          dnnLayerWrapper.css({
            padding:  0,
            position: 'absolute',
            float:    imageFloat
          });

          updateImageWrappersSize(image);

          dnnLayerWrapper.offset(image.offset());
        };

        updateImageWrappersSize = function updateImageWrappersSize(image) {
          var dnnLayerWrapper, dnnImageWrapper, sizes;
          dnnLayerWrapper = image.prev();
          dnnImageWrapper = image.parent();

          sizes = getImageSizesForWrappers(image);
          dnnLayerWrapper.css('width', sizes.width);
          dnnImageWrapper.css('width', sizes.width);
          dnnLayerWrapper.css('height', sizes.height);
          dnnImageWrapper.css('height', sizes.height);
        };

        getImageSizesForWrappers = function getImageSizesForWrappers(image) {
          var width, height, imageWidth, imageHeight, marginTop, marginLeft, marginRight,
          marginBottom, paddingTop, paddingLeft, paddingRight, paddingBottom;

          imageWidth  = image.width() + 5;
          imageHeight = image.height() + 5;

          marginTop = parseInt(image.css('margin-top'), 10);
          marginTop = isNaN(marginTop) ? 0 : marginTop;

          marginLeft = parseInt(image.css('margin-left'), 10);
          marginLeft = isNaN(marginLeft) ? 0 : marginLeft;

          marginRight = parseInt(image.css('margin-right'), 10);
          marginRight = isNaN(marginRight) ? 0 : marginRight;

          marginBottom = parseInt(image.css('margin-bottom'), 10);
          marginBottom = isNaN(marginBottom) ? 0 : marginBottom;

          paddingTop = parseInt(image.css('padding-top'), 10);
          paddingTop = isNaN(paddingTop) ? 0 : paddingTop;

          paddingRight = parseInt(image.css('padding-right'), 10);
          paddingRight = isNaN(paddingRight) ? 0 : paddingRight;

          paddingLeft = parseInt(image.css('padding-left'), 10);
          paddingLeft = isNaN(paddingLeft) ? 0 : paddingLeft;

          paddingBottom = parseInt(image.css('padding-Bottom'), 10);
          paddingBottom = isNaN(paddingBottom) ? 0 : paddingBottom;

          width  = imageWidth + marginLeft + marginRight + paddingLeft + paddingRight + 'px';
          height = imageHeight + marginTop + marginBottom + paddingTop + paddingBottom + 'px';

          return {width: width, height: height};
        };
        /* toolbar: End Image Wrappers*/

        /* toolbar: Start Padding */
        bindPaddingBtn = function bindPaddingBtn() {
          _toolbarPaddingBtn.on('click.inlineEditing', function activePaddingPanel(evt) {
            if (_activeImage === null) {return;}

            evt.stopPropagation();

            // Quit
            if (_activeToolbarBtn === _toolbarPaddingIcon) {
              disablePanel();
              disableActiveBtn();
              return;
            }

            removeActionsWithWrappers(_activeImage);
            activeBtn(_toolbarPaddingIcon);

            if (!_toolbarPaddingLock.hasClass('lock')) {
              _toolbarPaddingLock.addClass('lock');
              setDefaultPaddingPanelConfig();
            }

            _activePaddingInput = 'all';
            enablePanel(_toolbarPaddingPanel);
            updatePaddingPanelValues(_activeImage);
          });
        };

        setDefaultPaddingPanelConfig = function setDefaultPaddingPanelConfig() {
          _toolbarPaddingInputs.attr('disabled', true);
          unbindAreasAndInputsSelection();
          unbindPaddingInputsKeydown();
          _activePaddingInput = 'all';
          _toolbarPaddingImages.hide();
          _toolbarPaddingImages.filter('.all').show();
        };

        bindPaddingLockUnlockBtn = function bindPaddingLockUnlockBtn() {
          _toolbarPaddingLock.on('click.inlineEditing', function lockUnlockPadding() {
            _toolbarPaddingLock.toggleClass('lock');

            if (_toolbarPaddingLock.hasClass('lock')) {
              setDefaultPaddingPanelConfig();
            } else {
              _toolbarPaddingInputs.attr('disabled', false);
              bindAreasAndInputsSelection();
              bindPaddingInputsKeydown();
              _toolbarPaddingImages.hide();
              _toolbarPaddingImages.filter('.all').show();
            }
          });
        };

        updatePaddingPanelValues = function updatePaddingPanelValues(image) {
          _toolbarPaddingInputs.each(function (idx, input) {
            var padding;

            padding = parseInt(image.css('padding-' + $(input).data('padding')), 10);

            if (isNaN(padding)) {
              padding = 0;
            }

            input.value = padding;
          });
        };

        bindAreasAndInputsSelection = function bindAreasAndInputsSelection() {
          _toolbarPaddingInputs.on('click.inlineEditing', function () {
            var self, position;

            self = $(this);
            position = self.data('padding');

            enablePaddingInputs(position);
          });

          _toolbarPaddingAreas.on('click.inlineEditing', function () {
            var self, position;

            self = $(this);
            position = self.attr('id');

            enablePaddingInputs(position);
          });
        };

        enablePaddingInputs = function enablePaddingInputs(position) {
          var inputButton;

          inputButton = _toolbarPaddingInputs.filter('#padding' + position[0].toUpperCase() + position.slice(1).toLowerCase());
          inputButton.attr('disabled', false);
          inputButton.select();

          _activePaddingInput = position;
          _toolbarPaddingImages.hide();
          _toolbarPaddingImages.filter('.'+position).show();
        };

        unbindAreasAndInputsSelection = function unbindAreasAndInputsSelection() {
          _toolbarPaddingAreas.off('click.inlineEditing');
          _toolbarPaddingInputs.off('click.inlineEditing');
        };

        bindPaddingInputsKeydown = function bindPaddingInputsKeydown() {
          _toolbarPaddingInputs.on('keydown.inlineEditing', function(evt) {
            var self, allowedKeys;
            allowedKeys = [KEY_BACKSPACE, KEY_SHIFT, KEY_CTRL, KEY_LEFT_ARROW, KEY_RIGHT_ARROW, KEY_LEFT_WNDOW_KEY];

            // Allowed key that not changes values
            if (allowedKeys.indexOf(evt.keyCode) !== -1) {return;}

            // Only 0-9 keys
            if (evt.keyCode < KEY_NUMBER_0 || evt.keyCode > KEY_NUMBER_9) {
              evt.preventDefault();
              return;
            }

            self = $(this);
            addPaddingHistory(_activeImage);

            // Apply padding
            setTimeout(function() {
              _activePaddingInput = self.data('padding');
              _activeImage.css('padding-'+_activePaddingInput, self.val()+'px');
            }, 0);
          });
        };

        unbindPaddingInputsKeydown = function unbindPaddingInputsKeydown() {
          _toolbarPaddingInputs.off('keydown.inlineEditing');
        };

        bindPaddingPlusMinusButtons = function bindPaddingPlusMinusButtons() {
          _toolbarPaddingButtons.on('click.imageEditing', function bindPlusMinusButtons() {
            var self, value, values, inputButton;
            self = $(this);

            value = self.hasClass('padding-up') ? +1 : -1;
            addPaddingHistory(_activeImage);
            values = {};

            switch (_activePaddingInput) {
              case 'all':
                values.top    = parseInt(_activeImage.css('padding-top'), 10) + value;
                values.left   = parseInt(_activeImage.css('padding-left'), 10) + value;
                values.right  = parseInt(_activeImage.css('padding-right'), 10) + value;
                values.bottom = parseInt(_activeImage.css('padding-bottom'), 10) + value;

                if(isNaN(values.top)    || values.top < 1) {values.top = value > 0 ? value : 0;}
                if(isNaN(values.left)   || values.left < 1) {values.left = value > 0 ? value : 0;}
                if(isNaN(values.right)  || values.right < 1) {values.right = value > 0 ? value : 0;}
                if(isNaN(values.bottom) || values.bottom < 1) {values.bottom = value > 0 ? value : 0;}

                _activeImage.css({
                  'padding-top':    values.top + 'px',
                  'padding-left':   values.left + 'px',
                  'padding-right':  values.right + 'px',
                  'padding-bottom': values.bottom + 'px'
                });

                _toolbarPaddingInputs.each(function(idx, input) {
                  var padding;

                  input = $(input);
                  padding = input.data('padding');
                  input.val(values[padding]);
                });
              break;

              case 'top':
                values.top = parseInt(_activeImage.css('padding-top'), 10) + value;
                if(isNaN(values.top) || values.top < 1) {values.top = value > 0 ? value : 0;}
                _activeImage.css('padding-top', values.top + 'px');
                inputButton = _toolbarPaddingInputs.filter('#paddingTop');
                inputButton.val(values.top);
              break;

              case 'left':
                values.left = parseInt(_activeImage.css('padding-left'), 10) + value;
                if(isNaN(values.left) || values.left < 1) {values.left = value > 0 ? value : 0;}
                _activeImage.css('padding-left', values.left + 'px');
                inputButton = _toolbarPaddingInputs.filter('#paddingLeft');
                inputButton.val(values.left);
              break;

              case 'right':
                values.right = parseInt(_activeImage.css('padding-right'), 10) + value;
                if(isNaN(values.right) || values.right < 1) {values.right = value > 0 ? value : 0;}
                _activeImage.css('padding-right', values.right + 'px');
                inputButton = _toolbarPaddingInputs.filter('#paddingRight');
                inputButton.val(values.right);
              break;

              case 'bottom':
                values.bottom = parseInt(_activeImage.css('padding-bottom'), 10) + value;
                if(isNaN(values.bottom) || values.bottom < 1) {values.bottom = value > 0 ? value : 0;}
                _activeImage.css('padding-bottom', values.bottom + 'px');
                inputButton = _toolbarPaddingInputs.filter('#paddingBottom');
                inputButton.val(values.bottom);
              break;
            }
          });
        };

        addPaddingHistory = function addPaddingHistory(image) {
          var histObj, histIdx;

          histIdx = getImageHistIdx(image);
          histObj = {
            type: 'padding',
            prop: {}
          };

          _toolbarPaddingInputs.each(function (idx, input) {
            var paddingPosition;

            input = $(input);
            paddingPosition = input.data('padding');

            histObj.prop[paddingPosition] = image.css('padding-'+paddingPosition);
          });

          addActionToImageHistChanges(histIdx, histObj);
          enableUndo();
        };
        /* toolbar: End Padding */

        /* toolbar: Start Alternative Text (and title) */
        bindAltTextBtn = function bindAltTextBtn() {
          _toolbarAltTextIcon.on('click.inlineEditing', function showAltTextPanel(evt) {
            evt.stopPropagation();
            if (_activeImage === null) {return;}

            // Quit
            if (_activeToolbarBtn === _toolbarAltTextIcon) {
              disablePanel();
              disableActiveBtn();
              return;
            }

            removeActionsWithWrappers(_activeImage);
            activeBtn(_toolbarAltTextIcon);
            enablePanel(_toolbarAltTextPanel);
            _toolbarAltTextInput.val(_activeImage.attr('alt'));
          });
        };

        bindAltTextSaveBtn = function bindAltTextSaveBtn() {
          _toolbarAltTextSaveBtn.on('click.inlineEditing', function saveAltText() {
            var histObj, histIdx;

            histIdx = getImageHistIdx(_activeImage);
            histObj = {
              type: 'altText',
              prop: {
                text: _activeImage.attr('alt')
              }
            };

            addActionToImageHistChanges(histIdx, histObj);
            enableUndo();

            _activeImage.attr({
              alt: _toolbarAltTextInput.val(),
              title: _toolbarAltTextInput.val()
            });

            disablePanel();
          });
        };
        /* toolbar: End Alternative Text */

        /* toolbar: Start Align */
        bindAlignLeftBtn = function bindAlignLeftBtn() {
          _toolbarAlignLeftBtn.on('click.inlineEditing', function alignImageLeft() {
            alignButtonAction('left');
          });
        };

        bindAlignRightBtn = function bindAlignRightBtn() {
          _toolbarAlignRightBtn.on('click.inlineEditing', function alignImageRight() {
            alignButtonAction('right');
          });
        };

        alignButtonAction = function alignButtonAction(align) {
          var histIdx, histObj, float;

          if (_activeImage === null) {return;}

          disablePanel();
          removeActionsWithWrappers(_activeImage);

          histIdx = getImageHistIdx(_activeImage);
          histObj = getFloatObject(_activeImage, _activeImage.css('float'));

          addActionToImageHistChanges(histIdx, histObj);
          disableFloatButtons();

          if (_activeImageFloat === align) {
            float = 'none';
          } else {
            float = align;

            if (float === 'left') {
              enableFloatLeftButton();
            } else {
              enableFloatRightButton();
            }
          }

          setImageFloat(_activeImage, float);
          enableUndo();
        };
        /* toolbar: End Align */

        /* toolbar: Start Delete */
        bindDeleteBtn = function bindDeleteBtn() {
          _toolbarDeleteBtn.on('click.inlineEditing', function deleteImage() {
            var histIdx, histObj;

            if (_activeImage === null) {return;}

            // Yet deleted
            if (_toolbarDeleteIcon === _activeToolbarBtn) {return;}

            disablePanel();

            // Controls used by hideToolbar to remove on end editing
            _removedImage = _activeImage;

            removeActionsWithWrappers(_activeImage);
            _activeImage.hide();

            disableFloatButtons();
            activeBtn(_toolbarDeleteIcon);

            histIdx = getImageHistIdx(_activeImage);
            histObj = {type: 'delete'};
            addActionToImageHistChanges(histIdx, histObj);

            enableUndo();
          });
        };
        /* toolbar: End delete */

        /* toolbar: Start Controls */
        activeBtn = function activeBtn(btnToActive) {
          if (_activeToolbarBtn) {
            _activeToolbarBtn.removeClass('active');
          }

          btnToActive.addClass('active');
          _activeToolbarBtn = btnToActive;
        };

        disableActiveBtn = function disableActiveBtn() {
          if (_activeToolbarBtn) {
            _activeToolbarBtn.removeClass('active');
            _activeToolbarBtn = null;
          }
        };

        disablePanel = function disablePanel() {
          if (_activeToolbarPanel) {
            _activeToolbarPanel.closest('span').removeClass('openPanel');
            _activeToolbarPanel.removeClass('active');
          }
        };

        enablePanel = function activePanel(panelToActive) {
          disablePanel();
          panelToActive.closest('span').addClass('openPanel');
          panelToActive.addClass('active');
          _activeToolbarPanel = panelToActive;

          // Hardcoded 3rd party skins panel position problems
          if (panelToActive === _toolbarAltTextPanel) {
            setTimeout(function() {
              panelToActive.width(ALTTEXT_PANEL_WIDTH);
            }, 0);
          }
        };
        /* toolbar: End Controls */

        localizeTemplates = function localizeTemplates(resx) {
          if (resx && typeof resx === 'object' && Object.keys(resx).length > 0) {
            _resx = resx;
          } else if(_resx == null) {
              _resx = _defaultResx;
          }

          _editImageToolbarTemplate = _editImageToolbarTemplateUnlocalized.replace(
            /(\{[0-9]+\})/g,
            function (str, match) {
              switch (match) {
                case '{0}': return _resx.rotate;
                case '{1}': return _resx.crop;
                case '{2}': return _resx.resize;
                case '{3}': return _resx.undo;
                case '{4}': return _resx.padding;
                case '{5}': return _resx.titleAndAltText;
                case '{6}': return _resx.save;
                case '{7}': return _resx.alignLeft;
                case '{8}': return _resx.alignRight;
                case '{9}': return _resx.delete;
                default: return match;
              }
            });

            _savingLayerTemplate = _savingLayerTemplateUnlocalized.replace('{0}', _resx.savingImageChanges);
        };

        /* End toolbar buttons actions */

        destroy = function destroy() {
          if (!_module) {return;}

          if (_activeImage) {
            removeActionsWithWrappers(_activeImage);
          }

          removeWrappersOfAllImages();
          hideToolbar();

          // Disable events
          _module.off('.imageEditing');
          _module.find('img').off('.imageEditing');

          $(window).off('.inlineEditing');
          _toolbarRotateBtn.off('.imageEditing');
          _toolbarCropBtn.off('.imageEditing');
          _toolbarResizeBtn.off('.imageEditing');
          _toolbarUndoBtn.off('.imageEditing');
          _toolbarPaddingBtn.off('.imageEditing');
          _toolbarPaddingLock.off('.imageEditing');
          _toolbarPaddingInputs.off('.imageEditing');
          _toolbarPaddingAreas.off('.imageEditing');
          _toolbarPaddingButtons.off('.imageEditing');
          _toolbarAltTextIcon.off('.imageEditing');
          _toolbarAltTextSaveBtn.off('.imageEditing');
          _toolbarAlignLeftBtn.off('.imageEditing');
          _toolbarAlignRightBtn.off('.imageEditing');
          _toolbarDeleteBtn.off('.imageEditing');
          _toolbar.off('click.imageEditing');

          if (_cropButtons && _cropButtons.length === 2) {
            _cropButtons[0].off('.imageEditing');
            _cropButtons[1].off('.imageEditing');
          }

          // Nullify members
          _module                      = null;
          _redactorBox                 = null;
          _redactorToolbar             = null;
          _resx                        = null;
          _confirmOpts                 = null;
          _siteRoot                    = null;
          _sfImage                     = null;
          _saveImageURL                = null;
          _saveExternalImageURL        = null;
          _history                     = null;
          _activeImage                 = null;
          _activeImageStyle            = null;
          _activeImageFloat            = null;
          _disabled                    = null;
          _floatApplied                = null;
          _removedImage                = null;
          _activePaddingInput          = null;
          _activeJcrop                 = null;
          _imageIsResized              = null;
          _imageEditingWillBeDestroyed = null;
          _savingImage                 = null;
          _notif                       = null;
          _downloadImageXHR            = null;
          _toolbar                     = null;
          _toolbarRotateBtn            = null;
          _toolbarUndoBtn              = null;
          _toolbarDeleteBtn            = null;
          _toolbarDeleteIcon           = null;
          _activeToolbarBtn            = null;
          _activeToolbarPanel          = null;
          _toolbarCropBtn              = null;
          _toolbarCropIcon             = null;
          _cropButtons                 = null;
          _jcropSelection              = null;
          _jcropChanging               = null;
          _toolbarResizeBtn            = null;
          _toolbarResizeIcon           = null;
          _toolbarPaddingBtn           = null;
          _toolbarPaddingIcon          = null;
          _toolbarPaddingPanel         = null;
          _toolbarPaddingLock          = null;
          _toolbarPaddingInputs        = null;
          _toolbarPaddingButtons       = null;
          _toolbarPaddingAreas         = null;
          _toolbarPaddingImages        = null;
          _toolbarAltTextBtn           = null;
          _toolbarAltTextIcon          = null;
          _toolbarAltTextPanel         = null;
          _toolbarAltTextInput         = null;
          _toolbarAltTextSaveBtn       = null;
          _toolbarAlignLeftBtn         = null;
          _toolbarAlignLeftIcon        = null;
          _toolbarAlignRightBtn        = null;
          _toolbarAlignRightIcon       = null;
          _removeAlign                 = null;
        };

        ensureClean = function ensureClean() {
          if (!_module) {return;}

          _module.find('img').each(function (idx, image) {
            image = $(image);

            if (image.data('original-src') && image.attr('src').search('data:image/png;base64,') !== -1) {
              image.attr('src', image.data('original-src'));
            }
          });
        };

        /* Public Methods */
        ImageEditing.prototype.executeAfterSaving = function publicExecuteAfterSaving(callback) {
            var win, needToBeSaved;
            needToBeSaved = _activeImage && _activeImage.data('need-save') === 'YES';
            if (!needToBeSaved) {
                if (typeof callback === 'function') {
                    callback();
                }
            } else {
                win = $(window);
                win.on("saved.inlineEditing", function (event, data) {
                    win.off('saved.inlineEditing');
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
        };

        ImageEditing.prototype.destroy = function publicDestroy(callback) {
          var win, redactorBox, progress, opacityLayer;

          if (_activeImage) {
            disableEditingImage(_activeImage);
          }

          if (_imageEditingWillBeDestroyed) {return;}
          _imageEditingWillBeDestroyed = true;

          win = $(window);

          win.on('saved.inlineEditing', function () {
            ensureClean();
            destroy();
            if (typeof callback === 'function') {
              callback();
            }
            win.off('saved.inlineEditing');
          });

          if (!_savingImage) {
            win.trigger('saved.inlineEditing');
          } else {
            _savingLayer = $(_savingLayerTemplate);

            $('body').append(_savingLayer);

            _savingLayer = $('.dnnImageEditingSavingLayer');
            progress     = _savingLayer.find('.progressA');
            redactorBox  = _module.closest('.DNNContainer_Title_h2');

            _savingLayer.css({
              width:  redactorBox.css('width'),
              height: redactorBox.css('height')
            });

            _savingLayer.offset(redactorBox.offset());

            progress.animate({width: '99%'}, NOTIF_DOWNLOADING_EXTERNAL_PROGRESS_TIME);
          }
        };

        ImageEditing.prototype.isEsditingInProcess = function isEditingInProcess() {
          return _activeImage !== null;
        };

        ImageEditing.prototype.getActiveImage = function getActiveImage() {
          return _activeImage;
        };

        ImageEditing.prototype.getHistory = function getHistory() {
          return _history;
        };

        ImageEditing.prototype.setHistory = function setHistory(history) {
          var tsIndex;

          for (tsIndex in _history) {
            if (typeof history[tsIndex] !== 'object') {continue;}

            _history[tsIndex].imgHist = history[tsIndex].imgHist;
          }
        };

        ImageEditing.prototype.stopEditingImage = function stopEditingImage() {
          hideToolbar();
        };

        ImageEditing.prototype.removeWrappers = function removeWrappers() {
          removeWrappersOfAllImages();
        };

        ImageEditing.prototype.addWrappers = function addWrappers() {
          addWrappersToAllImages();
        };

        ImageEditing.prototype.removeSavingLayer = function removeSavingLayer() {
          //return; // comment to test progress
          if (_savingLayer) {
            _savingLayer.find('.progressA').css('width: 100%');
            setTimeout(function removeSavingLayer() {
              _savingLayer.remove();
              _savingLayer = null;
            }, TIME_TO_SHOW_PROGRESS_AT_100);
          }
        };

        /* Class Methods */
        ImageEditing.localize = function classLocalize(resx) {
          localizeTemplates(resx);
        };

        // Disable/Enable canvas actions: crop, rotate, resize
        ImageEditing.setCanvasActions = function classSetCanvasActions(canCropRotateResizeImages) {
          if (!canCropRotateResizeImages) {
            _editImageToolbarTemplateUnlocalized = _editImageToolbarTemplateUnlocalized
              .replace('id="image-edit-bar"', 'id="image-edit-bar" class="disableCanvasActions"')
              .replace('class="rotate"', 'class="rotate hideAction"')
              .replace('class="crop"', 'class="crop hideAction"')
              .replace('class="resize"', 'class="resize hideAction"');
          } else {
            _editImageToolbarTemplateUnlocalized = _editImageToolbarTemplateUnlocalized
              .replace('id="image-edit-bar" class="disableCanvasActions"', 'id="image-edit-bar"')
              .replace('class="rotate hideAction"', 'class="rotate"')
              .replace('class="crop hideAction"', 'class="crop"')
              .replace('class="resize hideAction"', 'class="resize"');
          }
        };

        /* test-code */
        /* end-test-code */

        return ImageEditing;
    })();

    window.dnn.HTMLPro.ImageEditing = ImageEditingClass;

}).call(this);
