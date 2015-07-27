
var historySupport = typeof Win.history !== 'undefined';

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
        Win.location.hash = path;
      } else {
        var currentHash = Win.location.hash;
        var idf = currentHash.indexOf('?');
        if (idf !== -1) {
          currentHash = currentHash.slice(0, idf);
        }
        if (/.*\/$/.test(currentHash)) {
          Win.location.hash = currentHash + path;
        } else {
          var hash = currentHash.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + path : path;
          });
          Win.location.hash = hash;
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
