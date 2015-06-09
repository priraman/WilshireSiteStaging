var WebPageThumbnailGenerator = function (options) {
    this.options = options;
    this.init();
};

WebPageThumbnailGenerator.prototype = {
    constructor: WebPageThumbnailGenerator,
    init: function() {
        var options = this.options = $.extend({}, WebPageThumbnailGenerator.defaultOptions, this.options);

        this.pageId = -1;
        if (options.pageId && options.pageId > 0) {
            this.pageId = options.pageId;
        }

        this.minHeight = 480;
        this.imageRatio = 1.333333333333333;

        this._onCanvasRenderHandler = $.proxy(this._onCanvasRender, this);
        this._onPageLoadedHandler = $.proxy(this._onPageLoaded, this);
        this._onCanvasToBlobHandler = $.proxy(this._onCanvasToBlob, this);
    },

    createThumbnails: function () {
        this.contentDocument = $(document.body);
        html2canvas([this.contentDocument[0]], {
            onrendered: this._onCanvasRenderHandler
        });
    },

    _onCanvasRender: function (canvas) {
        var handler = this;
        var postData = {
            postfile: canvas.toDataURL(),
            pageId: this.pageId,
            area: this._calculateArea()
        };
        
        var serviceUrl = this._getServiceUrl();
        $.ajax({
            url: serviceUrl,
            beforeSend: $.dnnSF().ServicesFramework().setModuleHeaders,
            data: postData,
            cache: false,
            type: 'POST',
            success: function (data) {
                (function (jq) {
                    jq(window.parent.document.body).trigger('thumbnailcreated', [{ pageId: handler.pageId, thumbnails: data.Thumbnails }]);
                })(window.parent.$);

            }
        });
    },

    _getServiceUrl: function () {
        var $dnnSF = $.dnnSF().ServicesFramework();
        return $dnnSF.getServiceRoot("EvoqContentLibrary") + "PageManagement/CreateThumbnails";
    },

    _calculateArea: function () {
        var paneElements = this.contentDocument.find('[data-ispane]');
        var logoElement = this.contentDocument.find('[id$="dnnLOGO_imgLogo"]');

        var left, right, top, bottom;
        if (paneElements.filter(':not(:empty)').length > 0) {
            left = Math.min.apply(null, paneElements.filter(':not(:empty)').map(function() { return $(this).offset().left; }).get());
            right = Math.max.apply(null, paneElements.filter(':not(:empty)').map(function() { return $(this).offset().left + $(this).outerWidth(); }).get());
        } else {
            left = Math.min.apply(null, paneElements.map(function() { return $(this).offset().left; }).get());
            right = Math.max.apply(null, paneElements.map(function() { return $(this).offset().left + $(this).outerWidth(); }).get());
        }

        top = Math.min.apply( null, paneElements.map(function(){ return $(this).offset().top; }).get() );
        bottom = Math.max.apply( null, paneElements.map(function(){ return $(this).offset().top + $(this).outerHeight(); }).get() );
        var width = right - left;
        var height = bottom - top;

        if (height < this.minHeight)
        {
            if (logoElement.length > 0)
            {
                left = logoElement.offset().left;
                top = logoElement.offset().top;
            }
            else
            {
                left = top = 0;
            }

            width = right - left;
            height = width / this.imageRatio;
        }
        else
        {
            if (width / height > this.imageRatio)
            {
                height = width / this.imageRatio;
            }
            else
            {
                height = width / this.imageRatio;
            }
        }

        return [left, top, width, height];
    }
};

WebPageThumbnailGenerator.defaultOptions = {};