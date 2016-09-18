var React = require('react');
var ReactDOM = require('react-dom');
var Provider = require('react-redux').Provider;
const {changeBrowserProperties} = require('../../actions/browser');
const LocaleUtils = require('../../utils/LocaleUtils');
const {loadMapConfig} = require('../../actions/config');
const {loadLocale} = require('../../actions/locale');
const {loadPrintCapabilities} = require('../../actions/print');

    // include application component
    const ArcgisApp = require('./containers/arcgis-app');
    var url = require('url');
    const {connect} = require('react-redux');    
    var ConfigUtils = require('../../utils/ConfigUtils');
    const {loadMaps} = require('../../actions/maps');

    const Localized = connect((state) => ({
        messages: state.locale && state.locale.messages,
        locale: state.locale && state.locale.current,
        loadingError: state.locale && state.locale.localeError
    }))(require('../../components/I18N/Localized'));

    const {pages, pluginsDef, initialState, storeOpts} = require('./appConfig');
    const {plugins} = pluginsDef;
    // initializes Redux store
    const store = require('./myappstore')(pluginsDef.plugins);

    // reads parameter(s) from the url
    const urlQuery = url.parse(window.location.href, true).query;
       

    const appConfig = {
        plugins        
    };

    const renderPage = () => {
        ReactDOM.render(
            (                
                <Provider store={store}>
                    <Localized>
                        <ArcgisApp {...appConfig}></ArcgisApp>
                    </Localized>
                </Provider>
            ),        
            document.getElementById('container')
        );
    }   
    
    //renderPage();
    // get configuration file url (defaults to config.json on the app folder)
    //const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
    // dispatch an action to load the configuration from the config.json file
    //store.dispatch(loadMapConfig(configUrl, legacy));

    
    
    ConfigUtils.loadConfiguration().then(() => {
        store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));

        const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
        store.dispatch(loadMapConfig(configUrl, legacy));

        let locale = LocaleUtils.getUserLocale();
        store.dispatch(loadLocale('../../translations', locale));

        //store.dispatch(loadPrintCapabilities(ConfigUtils.getConfigProp('printUrl')));

        renderPage();
    });



    
// Renders the application, wrapped by the Redux Provider to connect the store to components
/*
ReactDOM.render(
    <Provider store={store}>
        <ArcgisApp />
    </Provider>,
    document.getElementById('container')
);
*/


