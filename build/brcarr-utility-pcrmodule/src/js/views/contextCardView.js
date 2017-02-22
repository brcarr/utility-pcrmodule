var define, console;
define([
    'framework-core',
    'template!../../content/cards/basicCard.html',
    'template!../../content/cards/countCard.html',
    'template!../../content/cards/previewLeftCard.html',
    'template!../../content/cards/twitterContextCard.html',
    'template!../../content/cards/previewLeftIconCard.html'
], function (Core, BasicCardTemplate, CountCardTemplate, PreviewLeftCardTemplate, TwitterContextCardTemplate, PreviweLeftIconCardTemplate) {
    'use strict';
    
    return Core.View.extend({
        initialize: function (options) {
            this.state = options;
        },
        
        contextCardProperties: function (data) {
            var cardType = data.cardType;
            
            switch (cardType) {
            case "basicCard":
                this.state.contextCard = {
                    cardTemplate: BasicCardTemplate,
                    cardHeader: data.basicCard.cardHeader,
                    contextMenu: data.basicCard.contextMenu,
                    headerIcon: data.basicCard.headerIcon,
                    cardBody: data.basicCard.cardBody,
                    actions: data.basicCard.actions
                };
                break;
            case "countCard":
                this.state.contextCard = {
                    cardTemplate: CountCardTemplate,
                    color: data.countCard.color,
                    icon: data.countCard.icon,
                    count: data.count,
                    label: data.countCard.label
                };
                break;
            case "previewLeftCard":                    
                this.state.contextCard.cardTemplate = PreviewLeftCardTemplate;
                
                var imageProperty = data.previewLeftCard.image;
                var titleProperty = data.previewLeftCard.title;
                var valuesProperty = data.previewLeftCard.values;
                var cards = [];
                
                var newCards = data.data;
                
                newCards.map(function (card) {
                    var c = {
                        image: card[imageProperty],
                        title: card[titleProperty],
                        values: []
                    },
                        plan = this.state.plan;
                    
                    valuesProperty.map(function (val) {
                        // Read this.state.plan and determine appropriate label and value for each item in valuesProperty array
                        var test = card;
                        for (var p in plan) {
                            var planFieldName = plan[p].fieldName;
                            if (planFieldName === val) {
                                var v = {};
                                v.label = plan[p].fieldLabel;
                                if (plan[p].fieldType === "2") {
                                    v.value = Core.Dates.format(new Date(parseInt(card[val])), {date: 'medium'});
                                } else {
                                    v.value = card[val];
                                }
                            }
                        }
                        c.values.push(v);
                    })                    
                    cards.push(c);
                }.bind(this));
                this.state.contextCard.cards = cards;

                break;
            case "twitterContextCard":
                this.state.contextCard.cardTemplate = TwitterContextCardTemplate;
                this.state.contextCard.title = data.twitterContextCard.title;
                this.state.contextCard.searchString = this.state.searchString;
                this.state.contextCard.description = data.twitterContextCard.description;
                
                var screenNameProperty = this.state.contextCard.twitterContextCard.items.screenName,
                    avatarProperty = this.state.contextCard.twitterContextCard.items.avatar,
                    nameProperty = this.state.contextCard.twitterContextCard.items.name,
                    textProperty = this.state.contextCard.twitterContextCard.items.text,
                    items = [];

                var newItems = data.data;
                newItems.map(function (item) {
                    var i = {
                        screenName: item[screenNameProperty],
                        avatar: item[avatarProperty],
                        name: item[nameProperty],
                        text: item[textProperty],
                    };
                    items.push(i);
                });
                this.state.contextCard.items = items;
                break;
            case "previewLeftIconCard":
                this.state.contextCard.cardTemplate = PreviweLeftIconCardTemplate;
                    //this.state.contextCard.title = data.previewLeftIconCard.title;
                    //this.state.contextCard.content = data.previewLeftIconCard.content;
                    //this.state.contextCard.className = data.previewLeftIconCard.className;
                    //this.state.contextCard.icon = data.previewLeftIconCard.icon;
                    //this.state.contextCard.actions = data.previewLeftIconCard.actions;
                    
                var title = data.previewLeftIconCard.title;
                var content = data.previewLeftIconCard.content;
                var className = data.previewLeftIconCard.className;
                var icon = data.previewLeftIconCard.icon;
                var actions = data.previewLeftIconCard.actions;
                var valuesProperty = data.previewLeftIconCard.values;
                var cards = [];
                
                var newCards = data.data;
                
                newCards.map(function (card) {
                    var c = {
                        title: title,
                        content: content,
                        className: className,
                        icon: icon,
                        actions: actions,
                        values: []
                    },
                        plan = this.state.plan;

                    valuesProperty.map(function (val) {
                        // Read this.state.plan and determine appropriate label and value for each item in valuesProperty array
                        var test = card;
                        for (var p in plan) {
                            var planFieldName = plan[p].fieldName;
                            if (planFieldName === val) {
                                var v = {};
                                v.label = plan[p].fieldLabel;
                                if (plan[p].fieldType === "2") {
                                    v.value = Core.Dates.format(new Date(parseInt(card[val])), {date: 'medium'});
                                } else {
                                    v.value = card[val];
                                }
                            }
                        }
                        c.values.push(v);
                    })                    
                    cards.push(c);
                }.bind(this));
                this.state.contextCard.cards = cards;
                break;
                    
            }
            this.render();
        },
        
        render: function () {
            var template = this.state.contextCard.cardTemplate;
            this.state.contextCardElement.html(template.render(this.state.contextCard));
            this.state.notification.state = 'has-content';
        }
    });
});