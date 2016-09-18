var React = require('react');
var connect = require('react-redux').connect;
const PluginsUtils = require('../../../utils/PluginsUtils');

const Debug = require('../../../components/development/Debug');

const PluginsContainer = connect((state) => ({
    pluginsState: state && state.controls || {}
}))(require('../../../components/plugins/PluginsContainer'));

const mapType = 'arcgis';

var LMap = require('../../../components/map/arcgis/Map');
var LLayer = require('../../../components/map/arcgis/Layer');

let pluginsCfg = {
    standard: ['Map', 'Toolbar']
};

const getPluginsConfiguration = (plugins) => {
    return {
        standard: Object.keys(plugins).map((plugin) => ({
            name: plugin.replace('Plugin',''),
            hide: false,
            cfg: {}
        }))
    };
};

var ArcgisApp = React.createClass({

    propTypes: {
        // redux store slice with map configuration (bound through connect to store at the end of the file)
        mapConfig: React.PropTypes.object,
        plugins: React.PropTypes.object,
        // redux store dispatch func
        dispatch: React.PropTypes.func
    },

    

    renderLayers(layers) {        
        if (layers) {
            return layers.map(function(layer) {
                return <LLayer type={layer.type} key={layer.name} options={layer} />;
            });
        }        
        return null;
    },
    
    render() {
        return (
                
                     <div style={{width: "100%", height: "100%"}}>
                        
                        <div style={{position: "absolute", right: 0, left: "0px", height: "100%"}}>
                            <PluginsContainer params={{mapType}} plugins={PluginsUtils.getPlugins(this.props.plugins)} pluginsConfig={getPluginsConfiguration(this.props.plugins)} mode="standard"/>
                        </div>  
                        <Debug/>                      
                    </div>     
                
        );
    },

    render_() {
        // wait for loaded configuration before rendering
        if (this.props.mapConfig && this.props.mapConfig.map) {
            return (
                <LMap id="map" center={this.props.mapConfig.map.center} zoom={this.props.mapConfig.map.zoom}>
                     {this.renderLayers(this.props.mapConfig.layers)}
                </LMap>
            );
        }
        return null;
    }
});

// include support for OSM and WMS layers
require('../../../components/map/arcgis/plugins/OSMLayer');
require('../../../components/map/arcgis/plugins/WMSLayer');
require('../../../components/map/arcgis/plugins/MapQuest');

// connect Redux store slice with map configuration
module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig
    };
})(ArcgisApp);
