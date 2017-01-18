import { addEvent, warn, historySupport } from './utils';

const MODE = {
  HASH: 1,
  HASHBANG: 1,
  HISTORY: 2
};

let RouteMode = MODE.HASHBANG;

let _init = false;

/// Listener
const Listener = {
  listeners: [],

  setUrlOnly: false,

  supportHistory () {
    return historySupport;
  },

  setMode (mode) {
    mode = String(mode).toUpperCase();
    RouteMode = MODE[mode] || MODE.HASHBANG;
  },

  init () {
    if (_init) {
      return this;
    }
    _init = true;
    if (RouteMode === MODE.HISTORY) { // IE 10+
      if (historySupport) {
        addEvent('popstate', onchange);
      } else {
        RouteMode = MODE.HASHBANG;
        // warning
        warn('你的浏览器不支持 History API ，只能使用 hashbang 模式');
        addEvent('hashchange', onchange);
      }
    } else {
      addEvent('hashchange', onchange);
    }
    return this;
  },

  add (fn) {
    this.listeners.push(fn);
    return this;
  },

  remove (id) {
    for (let i = 0; i < this.listeners.length; ++i) {
      if (this.listeners[i].id === id) {
        this.listeners.splice(i, 1);
        break;
      }
    }
    return this;
  },

  setHashHistory (targetURL) {
    if (RouteMode === MODE.HISTORY) {
      history.pushState({}, '', targetURL);
    } else {
      if (targetURL[0] === '/') {
        location.hash = `!${targetURL}`;
      } else {
        let currentURL = location.hash.replace(/^#!?/, ''); // 去掉前面的 #!
        const queryStringIndex = currentURL.indexOf('?');
        if (queryStringIndex !== -1) {
          currentURL = currentURL.slice(0, queryStringIndex);
        }
        if (/.*\/$/.test(currentURL)) {
          location.hash = `!${currentURL}${targetURL}`;
        } else {
          const hash = currentURL.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + targetURL : targetURL;
          });
          location.hash = `!${hash}`;
        }
      }
    }
    return this;
  },

  stop () {
    // remove event listener
  }
};

function onchange(onChangeEvent) {
  if (Listener.setUrlOnly) {
    Listener.setUrlOnly = false;
    return false;
  }
  let listeners = Listener.listeners;
  for (let i = 0, l = listeners.length; i < l; i++) {
    listeners[i].handler.call(null, onChangeEvent);
  }
}

export default Listener;
