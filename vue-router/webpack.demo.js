var path = require('path');

module.exports = {

  entry: path.resolve(__dirname, './app/main.js'),

  output: {
    path: path.resolve(__dirname, './assets/app/'),
    publicPath: "/assets/app/",
    filename: "app.js"
  },

  module: {
    loaders: [
      { test: /\.vue$/, loader: 'vue' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },

  vue: {
    loaders: {
      html: 'vue-html?removeRedundantAttributes=false'
    }
  },

  resolve: {
    alias: {
      "views": path.resolve(__dirname, './app/views'),
      "components": path.resolve(__dirname, './app/components'),
      "spa-router-better": path.resolve(__dirname, '..')
    }
  },

  devtool: "#inline-source-map"

};
