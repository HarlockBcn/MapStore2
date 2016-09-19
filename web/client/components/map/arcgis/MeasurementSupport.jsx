const React = require('react');
var Draw = require("esri/toolbars/draw");
var Graphic = require("esri/graphic");
var SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
var SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
var SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
var GeomEngine = require("esri/geometry/geometryEngine");
var Polygon = require("esri/geometry/Polygon");
var Polyline = require("esri/geometry/Polyline");
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');


const MeasurementSupport = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        projection: React.PropTypes.string,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func
    },
    componentWillReceiveProps(newProps) {

        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ) {
            this.addDrawInteraction(newProps);
        }

        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
    },
    render() {
        return null;
    },
    addDrawInteraction: function(newProps) {
        var source;
        var vector;
        var draw;
        var geometryType;

        // cleanup old interaction
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        draw = new Draw(this.props.map);

        if (newProps.measurement.geomType === 'Bearing') {
            geometryType = 'LineString';
        } else {
            geometryType = newProps.measurement.geomType;
        }

        switch (geometryType) {
          case 'LineString':
            draw.activate('polyline');
            break;
          case 'Point':
            draw.activate('point');
            break;
          case 'Polygon':
            draw.activate('polygon');
            break;
          default:
            draw.activate('polygon');
            break;
        }
        
        // update measurement results for every new vertex drawn
        this.mapOnClick = this.props.map.on('click', this.updateMeasurementResults, this);
        this.sketchCoords = [];
        this.drawInteraction = draw;
        
    },
    removeDrawInteraction: function() {
        if (this.drawInteraction !== null) {
            this.drawInteraction.deactivate();
            this.drawInteraction = null;
            if (this.mapOnClick) {            
               this.mapOnClick.remove();
               this.mapOnClick = null;
            }
        }
        this.sketchCoords = null;
    },

    updateMeasurementResults(event) {
        //let latlng = CoordinatesUtils.reproject([event.mapPoint.x, event.mapPoint.y], this.props.projection, 'EPSG:4326');
        this.sketchCoords.push(event.mapPoint);
              
        var bearing = 0;
        var newMeasureState;

        if (this.props.measurement.geomType === 'Bearing' &&
                this.sketchCoords.length > 2) {
            this.drawInteraction.finishDrawing();
            // calculate the azimuth as base for bearing information
            bearing = CoordinatesUtils.calculateAzimuth(
                sketchCoords[0], sketchCoords[1], this.props.projection);
        }

        newMeasureState = {
            lineMeasureEnabled: this.props.measurement.lineMeasureEnabled,
            areaMeasureEnabled: this.props.measurement.areaMeasureEnabled,
            bearingMeasureEnabled: this.props.measurement.bearingMeasureEnabled,
            geomType: this.props.measurement.geomType,
            len: this.props.measurement.geomType === 'LineString' ?
                this.calculateGeodesicDistance(this.sketchCoords) : 0,
            area: this.props.measurement.geomType === 'Polygon' ?
                this.calculateGeodesicArea(this.sketchCoords) : 0,
            bearing: this.props.measurement.geomType === 'Bearing' ? bearing : 0
        };

        this.props.changeMeasurementState(newMeasureState);
        
    },
    reprojectedCoordinates: function(coordinates) {
        return coordinates.map((coordinate) => {
            let reprojectedCoordinate = CoordinatesUtils.reproject(coordinate, this.props.projection, 'EPSG:4326');
            return [reprojectedCoordinate.x, reprojectedCoordinate.y];
        });
    },
    calculateGeodesicDistance: function(coordinates) {
        let reprojectedCoordinates = this.reprojectedCoordinates(coordinates);        
        return GeomEngine.geodesicLength(new Polyline(reprojectedCoordinates));        
    },
    calculateGeodesicArea: function(coordinates) {
        let reprojectedCoordinates = this.reprojectedCoordinates(coordinates);
        return GeomEngine.geodesicArea(new Polygon(reprojectedCoordinates));
    }
});

module.exports = MeasurementSupport;