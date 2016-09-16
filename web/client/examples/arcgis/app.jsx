var React = require('react');
var ReactDOM = require('react-dom');

var Provider = require('react-redux').Provider;

// include application component
var ArcgisApp = require('./containers/arcgis-app');
var url = require('url');

var loadMapConfig = require('../../actions/config').loadMapConfig;
var ConfigUtils = require('../../utils/ConfigUtils');
const {loadMaps} = require('../../actions/maps');

const {pages, pluginsDef, initialState, storeOpts} = require('./appConfig');
// initializes Redux store
//var store = require('./stores/myappstore');
const appStore = require('../../stores/StandardStore').bind(null, initialState, {       
        maps: require('../../reducers/maps')
});

// reads parameter(s) from the url
const urlQuery = url.parse(window.location.href, true).query;

// get configuration file url (defaults to config.json on the app folder)
const { configUrl, legacy } = ConfigUtils.getConfigurationOptions(urlQuery, 'config', 'json');

const StandardApp = require('../../components/app/StandardApp');



const initialActions = [
        () => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, 'arcgis' || "*")
];


// dispatch an action to load the configuration from the config.json file
//appStore.dispatch(loadMapConfig(configUrl, legacy));

const appConfig = {
        storeOpts,
        appStore,
        pluginsDef,
        initialActions,        
        printingEnabled: true
    };

    ReactDOM.render(
        <StandardApp {...appConfig}/>,
        document.getElementById('container')
    );
    
// Renders the application, wrapped by the Redux Provider to connect the store to components
/*
ReactDOM.render(
    <Provider store={store}>
        <ArcgisApp />
    </Provider>,
    document.getElementById('container')
);
*/