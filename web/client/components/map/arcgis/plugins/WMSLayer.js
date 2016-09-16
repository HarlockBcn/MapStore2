/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require("../../../../utils/arcgis/Layers");
var WMSLayer = require("esri/layers/WMSLayer");
var WMSLayerInfo = require("esri/layers/WMSLayerInfo");
var Extent = require("esri/geometry/Extent"); 

var objectAssign = require('object-assign');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const {isArray} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');


function wmsToArcgisOptions(options) {
    // NOTE: can we use opacity to manage visibility?
    var res = objectAssign({}, options.baseParams, {
        visibleLayers: options.name,
        styles: options.style || "",
        format: options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        opacity: options.opacity !== undefined ? options.opacity : 1,        
        tiled: options.tiled !== undefined ? options.tiled : true,               
        version: options.version || "1.3.0"        
    }, options.params || {});
    return res;
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

// Works with geosolutions proxy
function proxyTileLoadFunction(imageTile, src) {
    var newSrc = src;
    if (ProxyUtils.needProxy(src)) {
        let proxyUrl = ProxyUtils.getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    imageTile.getImage().src = newSrc;
}

Layers.registerType('wms', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmsToArcgisOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        if (!options.tiled) {
            return new WMSLayer(urls[0], 
                objectAssign(queryParameters, {
                    resourceInfo: {
                        featureInfoFormat: "text/html",
                        getFeatureInfoURL: urls[0],
                        extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                        getMapURL: urls[0],
                        layerInfos: [
                            new WMSLayerInfo({
                                name: queryParameters.visibleLayers,
                                queryable: true,
                                showPopup: true
                            })
                        ],
                        spatialReferences: [900913],
                        version: queryParameters.version
                    }                                                
            }));            
        }        
    },
    update: (layer, newOptions, oldOptions) => {
        
    }
});
