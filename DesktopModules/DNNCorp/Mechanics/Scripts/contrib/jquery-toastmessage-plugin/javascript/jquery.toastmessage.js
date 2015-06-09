(function ($) {
    var settings = {
        inEffect: { opacity: 'show' },
        inEffectDuration: 600,
        stayTime: 3000,
        text: '',
        sticky: false,
        type: 'notice',
        position: 'top-right',
        closeText: '',
        close: null
    };
    
    var wordSubstring = function (s, n) {
        var trimed = s.substr(0, n);
        return trimed.substr(0, Math.min(trimed.length, trimed.lastIndexOf(" ")));
    };

    var htmlSubstring = function (s, n) {
        var m, r = /<([^>\s]*)[^>]*>/g,
			stack = [],
			lasti = 0,
			result = '';

        while ((m = r.exec(s)) && n) {
            var ss = s.substring(lasti, m.index);
            var trimss = ss.substr(0, n);
            if(ss.length != trimss.length){
                trimss = trimss.substr(0, Math.min(trimss.length, trimss.lastIndexOf(" ")));
                n = 0;
            }
            var temp = trimss;
            result += temp;
            if(n) n -= temp.length;
            lasti = r.lastIndex;

            if (n) {
                result += m[0];
                if (m[1].indexOf('/') === 0) {
                    stack.pop();
                } else if (m[1].lastIndexOf('/') !== m[1].length - 1) {
                    stack.push(m[1]);
                }
            }
        }
        if (n) {
            var trimed = s.substr(lasti, n);
            trimed = trimed.substr(0, Math.min(trimed.length, trimed.lastIndexOf(" ")));
            result += trimed;
        }
        while (stack.length) {
            result += '</' + stack.pop() + '>';
        }
        return result;
    };

    var methods = {
        init: function (options) {
            if (options) {
                $.extend(settings, options);
            }
        },

        showAllToasts: function (msgOptions) {
            var messages = msgOptions.messages;
            var seeMoreText = msgOptions.seeMoreText;
            var seeMoreLink = msgOptions.seeMoreLink;

            if (!messages || !messages.length) return null;

            if ($('.toast-container').length) {
                $('.toast-container').remove();
            }

            var localSettings = {};
            $.extend(localSettings, settings);
            
            var toastWrapAll, toastItemOuter, toastItemInner, toastItemClose;
            var allToasts = $('<ul></ul>');
            var length = messages.length;
            for (var i = 0; i < length; i++) {
                var singleMsg = messages[i];
                var singleToast = $('<li></li>').addClass('toast-message');
                var subject = singleMsg.subject ? singleMsg.subject : '';
                var body = singleMsg.body ? singleMsg.body : '';
                var regex = /(<([^>]+)>)/ig;
                var stripedBody = body.replace(regex, "");
                
                subject = subject.length > 83 ? wordSubstring(subject, 83) + '...' : subject;
                body = stripedBody.length > 200 ? htmlSubstring(body, 200) + '...' : body;
                singleToast.append('<a href="' + seeMoreLink + '" >' + subject + '</a>');
                singleToast.append('<p>' + body + '</p>');
                allToasts.append(singleToast);
            }

            var seeMoreContent = $('<li></li>').addClass('toast-lastChild');
            seeMoreContent.append('<a href="' + seeMoreLink + '" class="seeMoreLink" >' + seeMoreText + '</a>');
            allToasts.append(seeMoreContent);

            toastWrapAll = $('<div></div>').addClass('toast-container').addClass('toast-position-' + localSettings.position).appendTo('body');
            var originalPos = null, top = 20, right = 80;
            var cookieId = 'nebula-toast-position';
            var cookieValue = window.dnn.dom.getCookie(cookieId);
            if (cookieValue) {
                var splitCookieValue = cookieValue.split('|');
                top = parseInt(splitCookieValue[0], 10);
                right = parseInt(splitCookieValue[1], 10);
                toastWrapAll.css({
                    top: top,
                    right: right
                });
            }
            var mouseMove = function (e) {
                if (originalPos !== null) {
                    var x = e.pageX;
                    var y = e.pageY;

                    var offsetX = originalPos.x - x;
                    var offsetY = originalPos.y - y;
                    originalPos.x = x;
                    originalPos.y = y;

                    top -= offsetY;
                    right += offsetX;

                    toastWrapAll.css({
                        top: top,
                        right: right
                    });
                }
            };

            toastWrapAll.bind('mousedown', function (e) {
                var x = e.pageX;
                var y = e.pageY;
                originalPos = {
                    x: x,
                    y: y
                };
                $(document).bind('mousemove', mouseMove);

            }).bind('mouseup', function (e) {
                originalPos = null;
                $(document).unbind('mousemove', mouseMove);

                var cValue = top + '|' + right;
                window.dnn.dom.setCookie(cookieId, cValue, 20 * 365); // never expire - set 20 years...
            });

            toastItemOuter = $('<div></div>').addClass('toast-item-wrapper');
            toastItemInner = $('<div></div>').hide().addClass('toast-item toast-type-' + localSettings.type).appendTo(toastWrapAll).append(allToasts).animate(localSettings.inEffect, localSettings.inEffectDuration).wrap(toastItemOuter);
            toastItemClose = $('<div></div>').addClass('toast-item-close').prependTo(toastItemInner).html(localSettings.closeText).click(function () { $().dnnToastMessage('removeToast', toastItemInner, localSettings); });

            if (navigator.userAgent.match(/MSIE 6/i)) {
                toastWrapAll.css({ top: document.documentElement.scrollTop });
            }

            return toastItemInner;
        },

        removeToast: function (obj, options) {
            obj.animate({ opacity: '0' }, 600, function () {
                obj.parent().animate({ height: '0px' }, 300, function () {
                    obj.parent().remove();
                });
            });
            if (options && options.close !== null) {
                options.close();
            }
        }
    };

    $.fn.dnnToastMessage = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
        }
    };

})(jQuery);