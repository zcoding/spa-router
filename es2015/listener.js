import { extend, addEvent } from './utils';

var historySupport = typeof window.history['pushState'] !== "undefined";

/// Listener
var Listener = {
  listeners: null,

  history: false,

  init: function(mode) {
    this.history = mode === 'history';
    if (this.history && historySupport) { // IE 10+
      utils.addEvent('popstate', onchange);
    } else {
      utils.addEvent('hashchange', onchange);
    }
    return this;
  },

  add: function (fn) {
    if (!this.listeners) {
      this.listeners = [];
    }
    this.listeners.push(fn);
    return this;
  },

  setHashHistory: function (path) {
    if (this.history) {
      history.pushState({}, document.title, path);
    } else {
      if (path[0] === '/') {
        location.hash = '!' + path;
      } else {
        var currentURL = location.hash.slice(2); // 去掉前面的#!
        var idf = currentURL.indexOf('?');
        if (idf !== -1) {
          currentURL = currentURL.slice(0, idf);
        }
        if (/.*\/$/.test(currentURL)) {
          location.hash = '!' + currentURL + path;
        } else {
          var hash = currentURL.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + path : path;
          });
          location.hash = '!' + hash;
        }
      }
    }
    return this;
  }
};

function onchange(onChangeEvent) {
  var listeners = Listener.listeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](onChangeEvent);
  }
}

export default Listener;
