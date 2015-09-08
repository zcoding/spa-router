
var historySupport = typeof Win.history['pushState'] !== TYPE_UNDEFINED;

/// Listener
var Listener = {

  listeners: null,

  history: false,

  init: function(mode) {
    this.history = mode === 'history';
    if (this.history && historySupport) { // IE 10+
      addEvent('popstate', onchange);
    } else {
      addEvent('hashchange', onchange);
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
        Loc.hash = '!' + path;
      } else {
        var currentURL = Loc.hash.slice(2); // 去掉前面的#!
        var idf = currentURL.indexOf('?');
        if (idf !== -1) {
          currentURL = currentURL.slice(0, idf);
        }
        if (/.*\/$/.test(currentURL)) {
          Loc.hash = '!' + currentURL + path;
        } else {
          var hash = currentURL.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + path : path;
          });
          Loc.hash = '!' + hash;
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
