var DefinePlugin = require("webpack/lib/DefinePlugin");
var NoErrorsPlugin = require("webpack/lib/NoErrorsPlugin");
var path = require("path");

const weCantMake = function weCantMake (request) {
  return /^dojo/.test(request) || /^dojox/.test(request) || /^dijit/.test(request) || /^esri/.test(request);  
};

module.exports = {

    entry: {
        'arcgis-app': path.join(__dirname, "app")
    },

    output: {
      path: path.join(__dirname, "dist"),
        publicPath: "/dist",
        filename: "[name].js",
        libraryTarget: 'amd'
    },

    externals: [function (context, request, callback) {        
        if (weCantMake(request)) {                               
            callback(null, 'amd ' + request);
        } else {            
            callback();
        }
    }],

    resolve: {
      extensions: ["", ".js", ".jsx"]
    },

    plugins: [
        new DefinePlugin({
            "__DEVTOOLS__": true
        }),
        new NoErrorsPlugin()
    ],

    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css'},
            { test: /\.less$/, loader: "style!css!less-loader" },
            { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?name=[path][name].[ext]&limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
            
            { test: /\.jsx?$/, loader: "babel-loader", exclude: /node_modules/ }
            /*
            { 
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['react-hot', 'babel-loader?presets[]=react,presets[]=es2015']
            }
            */
        ]
    },
    devtool: 'inline-source-map',
    debug: true
};
