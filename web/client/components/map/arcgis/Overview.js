/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * configuration param refer to https://github.com/Norkart/Leaflet-MiniMap
 */

var React = require('react');
var OverviewMap = require('esri/dijit/OverviewMap');
var Layers = require('../../../utils/arcgis/Layers');
var assign = require('object-assign');
let Overview = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        overviewOpt: React.PropTypes.object,
        layers: React.PropTypes.array
    },
    getDefaultProps() {
        return {
          id: 'overview',
          overviewOpt: {},
          layers: [{type: 'osm', options: {}}]
        };
    },
    componentDidMount() {
        let opt = assign({}, this.defaultOpt, this.props.overviewOpt);
        if (this.props.layers) {
            let lfLayers = [];
            this.props.layers.forEach((layerOpt) => {
                lfLayers.push(Layers.createLayer(layerOpt.type, layerOpt.options || {}), this.props.map.id);                
            });
            opt.layer = lfLayers[0];
            opt.map = this.props.map,
            opt.visible = true
            if (lfLayers.length === 1 ) {
                this.overview = new OverviewMap(opt);
            }else if (lfLayers.length > 1 ) {
                this.overview = this.overview = new OverviewMap(opt);
            }
        }
        if (this.props.map && this.overview) {
            this.overview.startup();
        }
    },
    render() {
        return null;
    },
    defaultOpt: { // For all configuration options refer to https://github.com/Norkart/Leaflet-MiniMap
            attachTo: "bottom-right",
            width: 300,
            height: 150,
            collapsedWidth: 25,
            collapsedHeight: 25,
            maximizeButton: true
    }
});

module.exports = Overview;
