var define, console;
define(['framework-core', './connectorTabsView', 'template!../../content/mainViewTemplate.html'], function (Core, ConnectorTabsView, MainViewTemplate) {
    'use strict';
    
    return Core.View.extend({
        //className: 'main-view',
        
        initialize: function () {
            // Read config.json to get pcrModule settings
            var pcrModuleSettings = Core.App.config.pcrModuleSettings || {};
            this.connectors = pcrModuleSettings.connectors;

            //this.connectorTabsView = new ConnectorTabsView(this);
            this.connectorTabsView = new ConnectorTabsView(this.connectors);
        },
        
        render: function () {
            if (!this.$element.html()) { //if it hasn't already been rendered
                this.$element.html(MainViewTemplate.renderToView(this));
                this.$('.connectors-view').html(this.connectorTabsView.element);
                this.connectorTabsView.render(this);
            }
            
            return this;
        }
    });
});