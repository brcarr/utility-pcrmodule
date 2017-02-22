var define;
define(['framework-core', 'framework-home', './views/mainView'], function (Core, Home, MainView) {
    'use strict';
    
    return Core.Module.extend({
        initialize: function () {
            this.mainView = new MainView();
            Home.apps.add(this);
        },
        
        mianView: null,
        path: 'pcr',
        urlParts: null,
        icon: 'icon-data_storage',
        title: 'PCR Module',
        
        routes: {
            '': 'home'
        },
        
        home: function () {
            this.$element.html(this.mainView.render().$element);
        }
    });
});