define(['core'], function (Core) {
    'use strict';
    
    return {
        byString: function(o, s) {
            var x = s;
            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            s = s.replace(/^\./, '');           // strip a leading dot
            var a = s.split('.');
            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];
                if (k in o) {
                    o = o[k];
                } else {
                    return;
                }
            }
            //console.log(x + ": " + o)
            return o;
        }
    };
    
});