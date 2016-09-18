/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        MapPlugin: require('../../plugins/Map'),
        MousePositionPlugin: require('../../plugins/MousePosition'),
        MapLoadingPlugin: require('../../plugins/MapLoading'),
        ZoomAllPlugin: require('../../plugins/ZoomAll'),
        ZoomInPlugin: require('../../plugins/ZoomIn'),
        ZoomOutPlugin: require('../../plugins/ZoomOut'),
        SearchPlugin: require('../../plugins/Search'),
        ScaleBoxPlugin: require('../../plugins/ScaleBox'),
        ToolbarPlugin: require('../../plugins/Toolbar'),
        LocatePlugin: require('../../plugins/Locate'),
        TOCPlugin: require('../../plugins/TOC'),
        RasterStylerPlugin: require('../../plugins/RasterStyler'),
        MetadataExplorerPlugin: require('../../plugins/MetadataExplorer'),
        ExpanderPlugin: require('../../plugins/Expander'),
        BackgroundSwitcherPlugin: require('../../plugins/BackgroundSwitcher')
        /*
        DrawerMenuPlugin: require('../../plugins/DrawerMenu'),
        BurgerMenuPlugin: require('../../plugins/BurgerMenu'),
        OmniBarPlugin: require('../../plugins/OmniBar'),
        
        IdentifyPlugin: require('../../plugins/Identify'),
        
        
        
        MeasurePlugin: require('../../plugins/Measure'),
        PrintPlugin: require('../../plugins/Print'),
        SnapshotPlugin: require('../../plugins/Snapshot'),
        ShapeFilePlugin: require('../../plugins/ShapeFile'),
        
        SettingsPlugin: require('../../plugins/Settings'),
        
        HelpPlugin: require('../../plugins/Help'),
        HomePlugin: require('../../plugins/Home'),
        LoginPlugin: require('../../plugins/Login')*/
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../../components/data/identify/SwipeHeader')
    }
};
