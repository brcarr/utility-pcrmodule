var define;
define(['framework-core', './views/mainView', 'psw-framework-application-context'], function (Core, MainView, ApplicationContext) {
    'use strict';
    
    return Core.Module.extend({
        initialize: function () {
            this.mainView = new MainView();
        },
        
        mianView: null,
        path: 'pcr',
        urlParts: null,
        
        icon: {
            className: 'icon-data_storage',
            text: Core.Strings.translate('pcrModule.title')
        },
        
        routes: {
            '': 'home'
        },
        
        home: function () {
            this.$element.html(this.mainView.render().$element);
        }
    });
});