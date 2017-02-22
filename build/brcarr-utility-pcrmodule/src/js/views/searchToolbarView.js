var define;
define(['framework-core', 'framework-controls', 'template!../../content/searchToolbarViewTemplate.html'], function (Core, Controls, SearchToolbarViewTemplate) {
    'use strict';
        
    return Core.View.extend({
        initialize: function (options) {
            this.state = options;
        },
        
        domEvents: {
            'click .primary'            : 'connectorSearch',
            'keypress .search-input'    : 'searchOnEnter'
        },
        
        render: function () {
            this.state.searchFields = {};
            this.state.searchFields.searchColumns = this.state.searchColumns;
            
            //this.$element.html(SearchToolbarViewTemplate.render(this.state));
            SearchToolbarViewTemplate.renderToView(this, this.state);

        },
        
        connectorSearch: function () {
            this.state.contextSearchString = null;
            this.state.searchString = this.$('.search-input').val();
            this.state.searchField = this.$('.search-field').val();
            this.state.searchParameters = this.getSearchParameters(this.state.searchField);
            this.state.searchSource = "manual";
            var alert;
            
            if (this.state.searchString || this.state.autoRun) {
                this.trigger('connector:connectorSearch', this.state);
            } else {
                alert = new Controls.Alert({
                    message: 'Please enter a search value',
                    type: 'info',
                    displayTimeout: 3000
                });
                alert.getElement().prependTo(this.$('.search-alert'));
                alert.show();
                return;
            }
        },
        
        searchOnEnter: function (e) {
            if (e.which === 13) {
                this.connectorSearch();
            }
        },
        
        getSearchParameters: function (data) {
            var params = this.state.searchFields.searchColumns.filter(function (d) {
                if (d.propertyName === data) {
                    return d.searchParameters;
                }
            });
            if (params.length !== 0) {
                return params[0].searchParameters;
            } else {
                return null;
            }
        }
    });
});