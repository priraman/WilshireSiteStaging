/* This must be in dnn.jquery.js on platform*/
(function ($) {
    $.dnnNotif = function (options) {
        var opts, dnnDialogClass, closeStart;

        opts = $.extend({}, $.dnnNotif.defaultOptions, options);

        if (!opts.noIcon) {
            if (opts.styleBlue) {
                opts.text = '<div class="blueIcon"><p>' + opts.text + '</p></div>';
            } else {
                opts.text = '<div class="whiteIcon"><p>' + opts.text + '</p></div>';
            }
        }

        dnnDialogClass = options.styleBlue ? 'dnnDialogBlue' : 'dnnDialogWhite';
        $dnnDialog = $('<div class="' + dnnDialogClass + '"></div>').html(opts.text).dialog(opts);

        $dnnDialog.dialog();
        $dnnDialog.dialog('open');

        closeStart = opts.closeStart ? opts.closeStart : 2000;

        if (!opts.manualClose) {
            setTimeout(function() {
                $dnnDialog.dialog('close');
                if (typeof options.onCloseCallback === 'function') options.onCloseCallback();
            }, closeStart);
        }

        return $dnnDialog;
    };

    $.dnnNotif.defaultOptions = {
        autoOpen: false,
        resizable: false,
        height: 30,
        dialogClass: 'dnnFormPopup dnnClear dnnNotifDialog',
        hide: 'fade',
        show: 'fade',
        onCloseCallback: null,
        styleBlue: false,
        noIcon: false,
        manualClose: false
    };

})(jQuery);
