/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Map = require('esri/map');    
var Point = require("esri/geometry/Point");
var SpatialReference = require("esri/SpatialReference");
var ScreenPoint = require("esri/geometry/ScreenPoint");
var Extent = require("esri/geometry/Extent");
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
          projection: 'EPSG:3857',          
          onLayerLoading: () => {},
          onLayerLoad: () => {},
          resize: 0,
          registerHooks: true,
          interactive: true
        };
    },

    _crsToWkid(crs) {
        return parseInt(crs.replace('EPSG:',''));
    },

    _onMoveEnd(extent) {
            let c = this.normalizeCenter(extent.getCenter());
            let min =  CoordinatesUtils.reproject([extent.xmin, extent.ymin], this.props.projection, 'EPSG:4326');
            let max =  CoordinatesUtils.reproject([extent.xmax, extent.ymax], this.props.projection, 'EPSG:4326');
            
            let size = {
                width: this.map.width,
                height: this.map.height
            };
            this.props.onMapViewChanges({x: c[0] || 0.0, y: c[1] || 0.0, crs: 'EPSG:4326'}, this.map.getZoom(), {
                bounds: {
                    minx: min.x,
                    miny: min.y,
                    maxx: max.x,
                    maxy: max.y
                },
                crs: 'EPSG:4326',
                rotation: 0
            }, size, this.props.id, this.props.projection);
    },

    componentDidMount() {
        var center = CoordinatesUtils.reproject([this.props.center.x, this.props.center.y], 'EPSG:4326', this.props.projection);
        var wkid = this._crsToWkid(this.props.projection);

        let map = new Map(this.props.id, {            
            extent: new Extent({xmin: center.x, ymin: center.y, xmax: center.x, ymax: center.y, spatialReference: {wkid: wkid}}),
            slider: this.props.zoomControl,                
            zoom: this.props.zoom                      
        });
        this.map = map;
        if (!this.props.interactive) {
            map.disableMapNavigatioon();            
        } else {
            map.enableMapNavigation();
        }

        map.on('pan-end', (params)  => {                        
            this._onMoveEnd(params.extent);
            // TODO: When zoom to scale, esri map pans and zooms, then pan-end and zoom-end are triggered
        });

        map.on('zoom-end', (params) => {
            this._onMoveEnd(params.extent);
            // TODO: When zoom to scale, esri map pans and zooms, then pan-end and zoom-end are triggered
        });
        map.on('click', (event) => {
            if (this.props.onClick) {
                let pos = event.mapPoint;
                let latlng = CoordinatesUtils.reproject([pos.x, pos.y], this.props.projection, 'EPSG:4326');
                this.props.onClick({
                    pixel: {
                        x: event.clientX,
                        y: event.clientY,
                    },
                    latlng: {
                        lat: latlng.y,
                        lng: latlng.x
                    }
                });
            }
        });
        this.mapMouseMove = map.on('mouse-move', (event) => {
            this._mouseMoveEvent(event);    
        });
        this.mapMouseDragStart = this.map.on('mouse-drag-start', () => { 
            this.mapMouseMove.remove(); 
            this.mapMouseMove = null; 
        });
        this.mapMouseDragEnd =this.map.on('mouse-drag-end', () => { 
            this.mapMouseMove = map.on('mouse-move', (event) => {
                this._mouseMoveEvent(event);            
            });
        });
        
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        if (this.props.registerHooks) {
            this.registerHooks();
        }
        
    },

    _mouseMoveEvent(event) {
        if (event.mapPoint) {
                let pos = event.mapPoint;
                let latlng = CoordinatesUtils.reproject([pos.x, pos.y], this.props.projection, 'EPSG:4326');
                this.props.onMouseMove({
                    y: latlng.y,
                    x: latlng.x,
                    crs: "EPSG:4326"
                });
        }
    },

    componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }

        if (newProps.zoomControl !== this.props.zoomControl) {
            if (newProps.zoomControl) {
                this.map.showZoomSlider();                
            } else {
                this.map.hideZoomSlider();
            }
        }
        // update the position if the map is not the source of the state change
        if (this.map && this.props.id !== newProps.mapStateSource) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.resize !== this.props.resize) {
            this.map.resize(false);
        }

        if (this.map && ((this.props.projection !== newProps.projection) || this.haveResolutionsChanged(newProps))) {
            const center = CoordinatesUtils.reproject([
                this.props.center.x,
                this.props.center.y
            ], 'EPSG:4326', newProps.projection);
            this.map.centerAt(new Point(newProps.center.x, newProps.center.y, new SpatialReference({wkid: 3857})));
            this.map.setZoom(newProps.zoom);

            //this.map.setView(this.createView(center, newProps.zoom, newProps.projection, newProps.mapOptions && newProps.mapOptions.view));
            // We have to force ol to drop tile and reload
            this.map.getLayers().forEach((l) => {
                let source = l.getSource();
                if (source.getTileLoadFunction) {
                    source.setTileLoadFunction(source.getTileLoadFunction());
                }
            });
            this.map.render();
        }
        return false;
    },
    componentWillUnmount() {
        if (this.mapMouseMove) {
            this.mapMouseMove.remove();            
        }
        if (this.mapMouseDragStart) {
            this.mapMouseDragStart.remove();
        }
        if (this.mapMouseDragEnd) {
            this.mapMouseDragEnd.remove();
        }
        this.map.destroy();
    },
    getResolutions() {
        return [];
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
        const centerNotUpdated = newProps.center.y === currentCenter.y &&
                               newProps.center.x === currentCenter.x;

        if (!centerNotUpdated) {            
            let center = CoordinatesUtils.reproject([newProps.center.x, newProps.center.y], 'EPSG:4326', newProps.projection );
            map.centerAt(new Point(center.x, center.y, new SpatialReference({wkid: 3857})));                        
        }
        if (newProps.zoom !== this.props.zoom) {
            map.setZoom(newProps.zoom);
        }
    },
    normalizeCenter: function(center) {
        return CoordinatesUtils.reproject(center, this.props.projection, 'EPSG:4326');
    },
    
    setMousePointer(pointer) {
    },

    registerHooks() {
        mapUtils.registerHook(mapUtils.RESOLUTIONS_HOOK, () => {
            return this.getResolutions();
        });
       
        mapUtils.registerHook(mapUtils.COMPUTE_BBOX_HOOK, (center, zoom) => {
            return this._calculateExtent(center);
        });
    },

    _calculateExtent(center) {
            let latLngCenter =  CoordinatesUtils.reproject([center.x, center.y], 'EPSG:4326', this.props.projection);
            let topLeftPx = this.map.position;
            let topLeft = this.map.toMap(new ScreenPoint(topLeftPx.x, topLeftPx.y));
            let bottomRightPx = new ScreenPoint(topLeftPx.x + this.map.width, topLeftPx.y + this.map.height);
            let bottomRight = this.map.toMap(bottomRightPx);
            let offX = (bottomRight.x - topLeft.x)/2.0;
            let offY = (topLeft.y - bottomRight.y)/2.0                        
            return {
                bounds: {
                    minx: latLngCenter.x - offX,
                    miny: latLngCenter.y - offY,
                    maxx: latLngCenter.x + offX,
                    maxy: latLngCenter.y + offY
                },
                crs: this.props.projection,
                rotation: 0
            };
    }

    
});

module.exports = ArcgisMap;
