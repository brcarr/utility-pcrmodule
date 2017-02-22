var define;
define(['framework-core', './rowModel'], function (Core, RowModel) {
    'use strict';
    
    return Core.Collection.extend({
        initialize: function (models, options) {
            this.rootUrl = options.rootUrl;
            this.path = options.path;
            this.parameters = options.parameters;
            this.parseValue = options.parseValue;
            this.connectorType = options.connectorType;
            this.restType = options.restType;
            this.queryParameters = options.queryParameters;
            
            /*if (options.queryParameters) {
                var qParams = options.queryParameters;
                qParams.map(function (param) {
                    console.log(param);
                })
            }*/
        },
        
        url: function () {
            var url;
            if (!this.parameters || (this.connectorType === 'kapow')) {
                url = this.rootUrl + this.path;
            } else {
                url = this.rootUrl + this.path + this.parameters;
            }
            return url;
        },
        
        parse: function (data) {
            if (!Array.isArray(data) && this.parseValue) {
                return data[this.parseValue];
            }
            return data;
        },
        
        model: RowModel
    });
});