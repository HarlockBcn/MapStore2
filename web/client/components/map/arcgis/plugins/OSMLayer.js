/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/arcgis/Layers');
var OSMLayer = require('esri/layers/OpenStreetMapLayer');

Layers.registerType('osm', {
    create: (options) => {
        return new OSMLayer({
            id: "myOSMLayer",
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibilty,
            zoomOffset: options.zoomOffset || 0
        });
    }
});
