var define, console;
define(['jquery', 'framework-core', 'framework-controls', '../models/tableCollection', 'template!../../content/connectorTemplate.html', './headerView', './searchToolbarView', './searchResultsView', 'logger', 'framework-application-context', 'framework-notifications'], function ($, Core, Controls, TableCollection, ConnectorTemplate, HeaderView, SearchToolbarView, SearchResultsView, Logger, ApplicationContext, Notifications) {
    'use strict';
    
    return Core.View.extend({        
        initialize: function (options) {
            this.state = options;
            this.state.isLoading = null;
            this.state.columnsAll = [];
            this.state.columns = [];
            this.state.searchColumns = [];
            this.state.searchSource = null;
            
            // Create columns from the data in the tableCollection
            var i, plan, column;
            plan = this.state.plan;
            for (i in plan) {
                if (plan.hasOwnProperty(i)) {
                    column = {
                        'name': plan[i].fieldLabel,
                        'propertyName': plan[i].fieldName,
                        'dataPath': plan[i].fieldPath,
                        'type': plan[i].fieldType,
                        'isVisible': plan[i].fieldIsVisible,
                        'isSearchable': plan[i].fieldIsSearchable,
                        'searchParameters': plan[i].fieldSearchParameters
                    };
                    if (column.type === '2') {
                        column.createCellContent = this.dateColumn;
                    }

                    if (column.type === '3') {
                        column.createCellContent = this.displayPhoto;
                    }
                    
                    this.state.columnsAll.push(column); // Load columnsAll array with every field

                    if (column.isVisible) {
                        this.state.columns.push(column); // Load columns array with only the fields that will be visible in the grid
                    }

                    if (column.isSearchable) {
                        this.state.searchColumns.push(column);
                    }
                }
            }
            
            // Construct connector Header, Search, and Results views
            this.headerView = new HeaderView(this.state);
            this.searchToolbar = new SearchToolbarView(this.state);
            this.searchResults = new SearchResultsView(this.state);
            
            // Listen for search action from searchToolbar
            this.listenTo(this.searchToolbar, 'connector:connectorSearch', this.connectorSearch);
            
            // If contextSearch is enabled for this connector, listen for context change events
            if (this.state.contextSearchEnabled) {
                this.listenTo(ApplicationContext.Manager, 'change:context', this.contextSearch);
            }
        },
        
        autoRun: function () {
            var search = this.state;
            search.searchString = '';
            this.showBusyStatus();
            this.connectorSearch(search);
        },
        
        displayPhoto: function (data) {
            var element = document.createElement('img');
            element.setAttribute('src', data);
            element.setAttribute('height', '40px');
            return element;
        },
        
        dateColumn: function (value, column, row) {
            var cellValue = row.sourceItem[column.sourceItem.propertyName];
            return Core.Dates.format(new Date(parseInt(cellValue)), {date: 'medium'});
        },
        
        // Search function where search values are passed to the connector's collection
        connectorSearch: function (data) {
            this.state.collection.reset();
            this.state.isLoading = true;
            this.state.error = false;
            this.state.newSearch = false;
            this.state.noResults = false;
            
            // If this is a context search, create a context Notification and set the state to 'loading'
            if (this.state.searchSource === 'context') {
                this.state.contextCardElement = $('<div></div>');
                this.state.notification = Notifications.notificationsSystem.addNotification(this.state.context, this.state.contextCardElement);
                this.state.notification.state = 'loading';
                this.searchToolbar.render(this.state);
            } else {
                if (!this.state.autoRun) {
                    this.state.searchString = data.searchString;    
                }
                this.showBusyStatus();
                this.searchResults.render(this);
            }
            
            var searchString;
            if (this.state.searchParameters) {
                searchString =  this.state.searchParameters + encodeURI(this.state.searchString);
            } else {
                searchString = encodeURI(this.state.searchString);
            }
            
            // Check for additional query parameters and add them to the searchString
            if (this.state.collection.queryParameters) {
                var obj = this.state.collection.queryParameters;
                var qParam = '?';
                obj.map(function (param) {
                    qParam += param.name + '=' + param.value + '&';
                });
                searchString = qParam + searchString; 
            }
            
            this.state.collection.parameters = searchString;
            
            var options = {
                success: function () {
                    this.state.error = false;
                    this.state.isLoading = false;
                    this.state.newSearch = false;
                }.bind(this),
                error: function () {
                    this.state.error = true;
                    this.state.isLoading = false;
                    this.searchResults.render();
                }.bind(this)
            };
            
            // Adding special code to run Inspire OFAC robot
            if (this.state.name === 'ofacRobot' && this.state.contextSearch.contextSource === 'psw-ap-invoiceapproval') {
                options.data = JSON.stringify({
                    parameters: [
                        {
                            variableName: 'ofac',
                            attribute: [
                                {
                                    type: 'text',
                                    name: 'vendorName',
                                    value: this.state.context.properties.vendorName
                                },
                                {
                                    type: 'text',
                                    name: 'vendorAddress',
                                    value: this.state.context.properties.vendor.address
                                },
                                {
                                    type: 'text',
                                    name: 'vendorCity',
                                    value: this.state.context.properties.vendor.city
                                },
                                {
                                    type: 'text',
                                    name: 'vendorState',
                                    value: this.state.context.properties.vendor.state
                                },
                                {
                                    type: 'text',
                                    name: 'vendorZip',
                                    value: this.state.context.properties.vendor.zip
                                }
                            ]
                        }
                    ]
                });
                options.type = 'POST';
                options.contentType = 'application/json';
                options.dataType = 'json';
                
                this.state.collection.fetch(options);
                return;
            }
            
            // Need to genericize this a bit, to pull the variableName from config
            if (this.state.collection.restType === 'POST') {
                options.data = JSON.stringify({
                    parameters: [{
                        variableName: 'amazon',
                        attribute: [{
                            type: 'text',
                            name: 'searchTerm',
                            value: searchString
                        }]
                    }]
                });
                options.type = 'POST';
                options.contentType = 'application/json';
                options.dataType = 'json';
            }
            
            this.state.collection.fetch(options);
        },
        
        render: function () {
            ConnectorTemplate.renderToView(this, this.state);
            
            this.headerView.render();
            this.searchToolbar.render();
            this.searchResults.render();
            
            this.$('.header-view').html(this.headerView.element);
            this.$('.search-toolbar-view').html(this.searchToolbar.element);
            this.$('.search-results-view').html(this.searchResults.element);
                        
            return this;
        },
        
        // Function used to display Progess Indicator over grid when app is busy searching for results
        showBusyStatus: function () {
            this.state.progressIndicator = Controls.ProgressIndicator.show({
                parent: this.$('.search-results-view')
            });
        },
        
        // Function used to perform context search. Reads the current context object and searches config.json for matching config settings (based on context source).
        contextSearch: function (data) {
            this.state.searchSource = 'context';
            this.state.context = data.context;
            this.state.contextSearch = {};
            
            
            var contextSource = data.context.source.type;
            
            if (!contextSource) {
                return;
            }
            
            if (!this.state.contextSettings) {
                //console.log('Error: No Context Settings');
                return;
            }

            var settings = this.state.contextSettings.filter(function (setting) {
                if (setting.contextSource === contextSource) {
                    this.state.contextSearch = setting;
                }
            }.bind(this));

            /*var obj = { foo: { bar: 5 }, 'foo.bar': 6};
            obj.foo.bar;
            obj['foo.bar'];
            obj['foo']['bar'];*/
            
            var contextData = data.context.properties,
                contextPath = this.state.contextSearch.contextProperty;
            
            function lookup(contextData, contextPath) {
                contextPath = contextPath.replace('[', '.').replace(']', '');
                contextPath = contextPath.split('.');
                for (var i = 0; i < contextPath.length; i++) {
                    contextData = contextData[contextPath[i]];
                }
                return contextData;
            }
            
//            this.state.contextSearch.searchString = data.context.properties[this.state.contextSearch.contextProperty];
            this.state.contextSearch.searchString = lookup(contextData, contextPath);
            
            this.state.plan.map(function (p) {
                if (p.fieldName === this.state.contextSearch.searchField) {
                    this.state.contextSearch.searchParameters = p.fieldSearchParameters;
                }
            }.bind(this));
            
            //console.log(this.state.contextSearch);
            
            this.state.searchString = this.state.contextSearch.searchString;
            this.state.searchParameters = this.state.contextSearch.searchParameters;
            
            this.connectorSearch(this.state);
        }
    });
});