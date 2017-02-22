var define, console;
define(['framework-core', 'template!../../content/headerViewTemplate.html'], function (Core, HeaderViewTemplate) {
    'use strict';
    
    return Core.View.extend({
        initialize: function (options) {
            this.state = options;
        },
        
        render: function () {
            //this.$element.html(HeaderViewTemplate.render(this.state));
            HeaderViewTemplate.renderToView(this, this.state);
            return this;
        }
    });
});