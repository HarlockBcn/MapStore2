/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/arcgis/Layers');
var WebTiledLayer = require('esri/layers/WebTiledLayer');

var mqTilesAttr = 'Tiles &copy; <a href="https://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" />';

const assign = require('object-assign');

var mapquestOptions = {
    osm: {
        url: 'http://otile${subDomain}.mqcdn.com/tiles/1.0.0/osm/${level}/${col}/${row}.png',
        options: {
            subDomains: ['1','2','3','4']            
        }
    },
    sat: {
        url: 'http://otile${subDomain}.mqcdn.com/tiles/1.0.0/sat/${level}/${col}/${row}.png',
        options: {
            subDomains: ['1','2','3','4']
        }
    }
};

Layers.registerType('mapquest', {
    create: (options) => {
        return new WebTiledLayer(mapquestOptions[options.name].url, assign({
            opacity: options.opacity || 1.0,
            visible: options.visibility
        }, mapquestOptions[options.name].options));
    }
    
});
    

