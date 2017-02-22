var define;
define(['framework-core', 'framework-controls', './connectorView', '../models/tableCollection'], function (Core, Controls, ConnectorView, TableCollection) {
    'use strict';
    
    return Core.View.extend({
        //className: 'connector-tabs-view',
        
        initialize: function (data) {
            this.connectors = data;
            
            // For each connector that is defined (in config.json), create a new TableCollection and ConnectorView
            this.connectors.map(function (item) {
                if (item.enabled) {
                    item.collection = new TableCollection([], item);
                    item.view = new ConnectorView(item);
                }
            });
        },
        
        render: function (data) {
            var tabItems = [],
                tabControl;
            this.connectors.map(function (item) {
                if (item.enabled) {
                    var connector = {
                        name: item.label,
                        content: item.view.render(item).$element
                    };
                    tabItems.push(connector);
                }
            });
            
            tabControl = new Controls.TabControl(this.element, tabItems);
        }
    });
});