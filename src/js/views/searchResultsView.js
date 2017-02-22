define(['jquery', 'framework-core', 'framework-controls', './contextCardView', 'template!../../content/searchResultsViewTemplate.html'], function ($, Core, Controls, ContextCardView, SearchResultsViewTemplate) {
    'use strict';
        
    return Core.View.extend({
        className: 'search-results-view-content',
        
        initialize: function (options) {
            this.state = options;
            this.state.progressIndicator = null;
            this.state.newSearch = true;
            
            this.listenTo(this.state.collection, 'sync', this.render);
        },
        
        render: function () {
            // Parse Kapow results and insert back into collection.
            if (this.state.collection.connectorType === 'kapow') {
                if (this.state.collection.length) {
                    var kapowValues = this.state.collection.models[0].attributes.attribute[0].value;
                    if (kapowValues) {
                        var coll = JSON.parse(kapowValues);
                        this.state.collection.set(coll);
                    } else {
                        this.state.notification.remove();
                        return;
                    }
                }
            }
            
            // If performing a manual search, and a notification exists, remove the notificiation
            if (this.state.searchSource === 'manual' && this.state.notification) {
                this.state.notification.remove();
            }
            
            // If this is a brand new search, or if data is loading, render the Template
            if (this.state.newSearch || this.state.isLoading) {
                this.element.innerHTML = SearchResultsViewTemplate.render(this.state);
                return;
            }
            
            // If there are search results (or an error), remove the Progress Indicator. If there is an error, go ahead and render the Template
            if (this.state.collection.length || this.state.error) {
                if (this.state.progressIndicator) {
                    this.state.progressIndicator.close();
                }
                if(this.state.error) {
                    this.element.innerHTML = SearchResultsViewTemplate.render(this.state);
                    return;
                }
            }
            
            // If there is no error and no search results, it means that nothing was found. Close the progress indicator, remove the notification card (if necessary) and render the Template
            if (!this.state.error && !this.state.collection.length) {
                if (this.state.progressIndicator) {
                    this.state.progressIndicator.close();
                }
                if (this.state.searchSource === 'context') {
                    this.state.contextCardElement.html(this.state.contextCard.cardTemplate.render(this.state.contextCard));
                    this.state.notification.remove();
                }
                this.state.noResults = true;
                this.element.innerHTML = SearchResultsViewTemplate.render(this.state);
                return;
            }            
            
            // Prepare to render search results into the grid
            var columnsAll = this.state.columnsAll,
                columns = this.state.columns,
                rowsAll = [],
                rows = [],
                rowData,
                grid,
                rowOptions = {},
                columnOptions = {};
            rowData = this.state.collection.models.map(function (item) {
                var rowObj, rowObjAll, i, name, path, newPath, type;
                rowObj = {};
                rowObjAll = {};
                for (i in columnsAll) {
                    if (columnsAll.hasOwnProperty(i)) {
                        name = columnsAll[i].propertyName;
                        path = columnsAll[i].dataPath;
                        newPath = this.byPath(path, item.attributes, true);
                        type = columnsAll[i].type;
                        if (columnsAll[i].isVisible) {
                            rowObj[name] = newPath; // Gathers the row data that will be displayed in the grid
                        }
                        rowObjAll[name] = newPath; // Gathers all the row data, regardless of isVisible flag
                    }
                }
                rowsAll.push(rowObjAll);
                rows.push(rowObj);
            }.bind(this));
            
            columnOptions = {
                allowColumnReorder: true
            };
            
            //grid = new Controls.Grid(this.element, columns, rows);
            grid = new Controls.Grid(rows, rowOptions,columns, columnOptions);
            this.element.appendChild(grid.getElement());
            grid.fitAllColumns();
            
            /*grid.onLoaded(function () {
                var i;
                for (i = 0; i < columns.length; i += 1) {
                    grid.resizeColumnToFit(i);
                }
            });*/
            
            // If performing a context search, push search results into contextCard and render the contextCardView
            if (this.state.searchSource === 'context') {
                this.contextCardView = new ContextCardView(this.state);
                if (this.state.collection.length) {
                    this.state.contextCard.count = this.state.collection.length;
                    this.state.contextCard.data = rowsAll;
                    this.contextCardView.contextCardProperties(this.state.contextCard);
                }
            }
        },
        
        byPath: function (path, obj, safe) {
            return path.split('.').reduce(function (prev, curr) {
                return !safe ? prev[curr] : (prev ? prev[curr] : undefined);
            }, obj || self);
        }
    });
});