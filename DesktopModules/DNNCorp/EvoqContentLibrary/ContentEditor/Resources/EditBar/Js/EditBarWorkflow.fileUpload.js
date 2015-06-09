(function IIFE($) {
    $.fn.EditBarWorkflowImageUpload = function (options) {
        var $dropZone, $imageInputFile, url, antiForgeryToken;

        function supportAjaxUpload() {
            var xhr = new XMLHttpRequest();
            return !!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
        }

        function browserSupportsDragDrop() {
            return ('draggable' in document.createElement('span'));
        }

        if (!browserSupportsDragDrop()) {
            $("span.dragMessage").hide();
        }

        function getResult(data) {
            var result;
            try {
                if (!supportAjaxUpload()) {
                    result = JSON.parse($("pre", data.result).html());
                } else {
                    result = JSON.parse(data.result);
                }
            } catch (e) {
                return null;
            }

            return result;
        }

        $dropZone = this;
        $imageInputFile = $(".uploadFileInput", $dropZone);
        $imageInputFile.dnnFileInput(
                {
                    buttonClass: 'dnnPrimaryAction',
                    showSelectedFileNameAsButtonText: false
                });

        url = options.url;
        if (!supportAjaxUpload()) {
            antiForgeryToken = $('input[name="__RequestVerificationToken"]').val();
            url += '?__RequestVerificationToken=' + antiForgeryToken;
        }

        $imageInputFile.fileupload({
            url: url,
            beforeSend: options.servicesFramework.setModuleHeaders,
            dropZone: $dropZone,
            paramName: options.paramName,
            sequentialUpload: true,
            progressInterval: 20,
            dragover: function () {
                if (options.addElementDragover) {
                    options.addElementDragover.addClass('dragover');
                }
                $dropZone.addClass("dragover");
            },
            drop: function () {
                if (options.addElementDragover) {
                    options.addElementDragover.removeClass('dragover');
                }
                $dropZone.removeClass("dragover");
            },
            submit: function (e, data) {
                if (options.paintInObj) {
                    options.paintInObj.addClass('uploading');
                } else {
                    $dropZone.addClass('uploading');
                }

                data.formData = {
                    type: options.param
                };
                data.formData = $.extend(data.formData, options.request);

                $(document).trigger(options.param + "BeginUpload", data.result);
                //$dropZone.find("div.uploadFileStatus").removeClass("error").addClass("uploading");

                return true;
            },
            done: function (e, data) {
                var result, value;
                result = getResult(data);

                if (data.textStatus == "success") {
                    value = !result.FilePath || result.FilePath === "" ? '' : 'url("' + result.FilePath + '")';

                    if (options.paintInObj) {
                        options.paintInObj.css('background-image', value);
                        options.paintInObj.removeClass('uploading');
                        options.paintInObj.addClass('withImage');
                    } else {
                        $dropZone.css('background-image', value);
                        $dropZone.removeClass('uploading');
                        $dropZone.addClass('withImage');
                    }

                    options.imageCallbackInfo.fileId = result.FileId;
                    options.imageCallbackInfo.filePath = result.FilePath;
                } else {
                    $.dnnAlert({
                        title: data.response().errorThrown,
                        text: $.parseJSON(data.response().jqXHR.responseText).Message
                    });
                }
            },
            fail: function (e, data) {
                if (options.paintInObj) {
                    options.paintInObj.removeClass('uploading');
                } else {
                    $dropZone.removeClass('uploading');
                }

                $.dnnAlert({
                    title: data.response().errorThrown,
                    text: $.parseJSON(data.response().jqXHR.responseText).Message
                });
            }
        });

        $dropZone.on('dragleave', function () {
            if (options.addElementDragover) {
                options.addElementDragover.removeClass('dragover');
            }
            $(this).removeClass("dragover");
        });

        $dropZone.on("logoUpload", function (e, logoUrl) {
            var value = !logoUrl || logoUrl === "" ? '' : 'url("' + logoUrl + '")';
            $("#uploadLogoFileDropZone").css('background-image', value);
        });

        return this;
    };
}(jQuery));
