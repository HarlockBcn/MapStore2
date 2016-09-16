/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

var React = require('react');
var LocateBtn = require('esri/dijit/LocateButton');
var InfoTemplate = require('esri/InfoTemplate');
var assign = require('object-assign');

let Locate = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        status: React.PropTypes.string,
        messages: React.PropTypes.object,
        changeLocateState: React.PropTypes.func,
        onLocateError: React.PropTypes.func
    },
    
    componentDidMount() {
        if (this.props.map ) {
            this.locate = new LocateBtn(assign( {map: this.props.map}, this.defaultOpt));
            this.locate.on('locate', (ev) => {
                if (ev.error) this.onLocationError(ev.error);

            })            
            this.locate.options.onLocationError = this.onLocationError;
            this.locate.startup();            
        }
                
    },
    componentWillReceiveProps(newProps) {
        this.fol = false;
        if (newProps.status !== this.props.status) {
            if ( newProps.status === "ENABLED" && this.props.status === "DISABLED") {
                //this.locate.tracking = true;
                this.locate.locate();
            } else if (newProps.status === "FOLLOWING" && this.props.status === "ENABLED") {
                this.fol = true;
                this.locate.tracking = true;
                this.locate.useTracking = true;
                this.locate.locate();
            }else if ( newProps.status === "DISABLED") {
                this.locate.useTracking = false;
                this.locate.tracking = false;
            }
        }
        if (newProps.messages !== this.props.messages) {
            this.locate.InfoTemplate = new InfoTemplate({content: newProps.messages});            
        }
    },
    onLocationError(err) {
        this.props.onLocateError(err.message);
        this.props.changeLocateState("DISABLED");
    },
    render() {
        return null;
    },
    defaultOpt: { 
        status: "DISABLED" 
    },
    locateControlState(state) {
        if (state.state === 'requesting' && this.props.status !== "LOCATING" ) {
            this.props.changeLocateState("LOCATING");
        }else if (state.state === 'following' && !this.fol ) {
            this.props.changeLocateState("FOLLOWING");
        }else if (state.state === 'active' && this.props.status !== "ENABLED" ) {
            this.props.changeLocateState("ENABLED");
        }
    }
});

module.exports = Locate;
