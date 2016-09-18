var React = require('react');
var Scalebar = require('esri/dijit/Scalebar');

var ScaleBar = React.createClass({
    propTypes: {
        map: React.PropTypes.object,        
        minWidth: React.PropTypes.number,
        units: React.PropTypes.oneOf(['dual', 'english', 'metric'])
    },
    getDefaultProps() {
        return {
            map: null,            
            minWidth: 64,
            units: 'metric'
        };
    },
    componentDidMount() {
        if (this.props.map) {
            this.scalebar = new Scalebar({
            map: this.props.map,
            // "dual" displays both miles and kilometers
            // "english" is the default, which displays miles
            // use "metric" for kilometers
            scalebarUnit: "dual"
            });
        }        
    },
    render() {
        return null;
    }
});

module.exports = ScaleBar;
