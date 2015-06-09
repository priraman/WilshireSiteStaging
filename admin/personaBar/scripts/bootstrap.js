(function () {
	var regex = /\.mobi\.(([^.]+\.){0,2})[^.]+\.html/;
    var mobi = regex.test(location.href);
    var v = (function () {
        var d = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
        var q = location.search.substring(1);
        var k = q.split('&');
        for (var i in k) {
            var l = k[i].split('=');
            if (l.length > 1) {
                if (d(l[0]) === 'cdv') return d(l[1]);
            }
        }
        return '';
    })();

    var addCssToHead = function (css, vv) {
        var h = document.getElementsByTagName('head')[0];
        for (var i = 0; i < css.length; i++) {
            var m = document.createElement('link');
            m.setAttribute('rel', 'stylesheet');
            m.setAttribute('type', 'text/css');
            m.setAttribute('href', css[i] + vv);
            h.appendChild(m);
        }
    };

    var addJsToBody = function (js, vv) {
        var b = document.getElementsByTagName('body')[0];
        var m = document.createElement('script');
        m.setAttribute('src', 'scripts/contrib/require.js' + vv);
        m.setAttribute('data-main', js + vv);
        b.appendChild(m);
    };

    var debugMode = window.top['dnn'] && (window.top['dnn'].getVar('pb_debugMode') == "true");
    var version = (v ? '?cdv=' + v : '') + (debugMode ? '&t=' + Math.random(): '');
    var styles = [];
    var mainJs = mobi ? 'scripts/mobile.js' : 'scripts/main.js';

    styles.push(mobi ? 'css/mobi.css' : 'css/main.css');
    styles.push('css/graph.css');

    if (mobi) {
        styles.push('scripts/contrib/owl-carousel/owl.carousel.css');
        styles.push('scripts/contrib/owl-carousel/owl.theme.css');
    }
    addCssToHead(styles, version);
    addJsToBody(mainJs, version);
})();