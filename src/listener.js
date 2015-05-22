
var dloc = document.location;

var historySupport = typeof window['history'] !== 'undefined';

/**
 * Utils: dlocHashEmpty 判断当前location.hash是否为空
 * @return {Boolean}
 */
var dlocHashEmpty = function() {
  return dloc.hash === '' || dloc.hash === '#';
};

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

  // destroy: function (fn) {
  //   var listeners = this.listeners;
  //   if (!Router || !listeners) {
  //     return;
  //   }
  //   for (var i = listeners - 1; i >= 0; --i) {
  //     if (listeners[i] === fn) {
  //       listeners.splice(i, 1);
  //     }
  //   }
  //   return this;
  // },

  setHashHistory: function (path) {
    if (this.history) {
      history.pushState({}, document.title, path);
    } else {
      if (path[0] === '/') {
        window.location.hash = path;
      } else { // TODO: consider '?a=b'
        if (/.*\/$/.test(window.location.hash)) {
          window.location.hash += path;
        } else {
          var hash = window.location.hash.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + path : path;
          });
          // if ()
          window.location.hash = hash;
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
