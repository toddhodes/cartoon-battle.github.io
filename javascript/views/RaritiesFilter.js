/* global define */ define(['views/ButtonGroupFilter', 'cartoon-battle/config'], function (Filter, config) {

    return function (props) {
        return Filter(Object.assign({}, props, {
            "items": config.rarities,
            "imagePath": "icons/rarityicon_%s.png",
            "width": 64,
            "height": 48,
            "label": "Show results for cards of selected rarity:"
        }));
    };
});
