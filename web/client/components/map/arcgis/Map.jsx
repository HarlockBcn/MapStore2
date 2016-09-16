/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Map = require('esri/map');    
var Point = require("esri/geometry/Point");
var React = require('react');
var assign = require('object-assign');

var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var ConfigUtils = require('../../../utils/ConfigUtils');
var mapUtils = require('../../../utils/MapUtils');

const {isEqual} = require('lodash');

var ArcgisMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        style: React.PropTypes.object,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        mapOptions: React.PropTypes.object,
        zoomControl: React.PropTypes.bool,
        mousePointer: React.PropTypes.string,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        resize: React.PropTypes.number,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func,
        registerHooks: React.PropTypes.bool,
        interactive: React.PropTypes.bool,
        onInvalidLayer: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          onInvalidLayer: () => {},
          onClick: null,
          onMouseMove: () => {},
          mapOptions: {},
          projection: 'EPSG:900913',          
          onLayerLoading: () => {},
          onLayerLoad: () => {},
          resize: 0,
          registerHooks: true,
          interactive: true
        };
    },
    componentDidMount() {
        var center = CoordinatesUtils.reproject([this.props.center.x, this.props.center.y], 'EPSG:900913', this.props.projection);

        let map = new Map(this.props.id, {
            //basemap: "streets",
            center: [this.props.center.x, this.props.center.y],
            spatialReference:{wkid:900913},
            zoom: this.props.zoom,                        
        });
        this.map = map;
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
        
    },
    componentWillReceiveProps(newProps) {
        // update the position if the map is not the source of the state change
        if (this.map && newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }
    },
    componentWillUnmount() {
        
    },
    getResolutions() {
        
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {
                map: map,
                mapId: this.props.id,
                onLayerLoading: this.props.onLayerLoading,
                onLayerLoad: this.props.onLayerLoad,
                projection: this.props.projection,
                onInvalid: this.props.onInvalidLayer
            }) : null;
        }) : null;

        return (
            <div id={this.props.id} style={this.props.style}>
                {children}
            </div>
        );
    },
    haveResolutionsChanged(newProps) {
        if (this.props.mapOptions && this.props.mapOptions.view && this.props.mapOptions.view.resolutions &&
            newProps.mapOptions && newProps.mapOptions.view && newProps.mapOptions.view.resolutions) {
            return !isEqual(newProps.mapOptions.view.resolutions, this.props.mapOptions.view.resolutions);
        }
        return false;
    },
    
    _updateMapPositionFromNewProps(newProps) {
        console.log('_updateMapPositionFromNewProps');
        var map = this.map;
        const currentCenter = this.props.center;
        const centerIsUpdated = newProps.center.y === currentCenter.y &&
                               newProps.center.x === currentCenter.x;

        if (!centerIsUpdated) {
            map.centerAt(new Point(newProps.center.x, newProps.center.y));                        
        }
        if (newProps.zoom !== this.props.zoom) {
            map.setZoom(newProps.zoom);
        }
    },
    normalizeCenter: function(center) {
        
    },
    setMousePointer(pointer) {
            },
    registerHooks() {
        
    }
});

module.exports = ArcgisMap;
