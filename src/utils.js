export function extend() {
  const obj = {};
  const srcList = Array.prototype.slice.call(arguments, 0);
  for (let i = 0, len = srcList.length; i < len; ++i) {
    const src = srcList[i];
    for (let q in src) {
      if (src.hasOwnProperty(q)) {
        obj[q] = src[q];
      }
    }
  }
  return obj;
}

// 判断是否 thenable 对象
export function isThenable (obj) {
  return typeof obj === 'object' && typeof obj['then'] === 'function';
}

export function removeHashBang (url) {
  return url.replace(/^#!?/, '');
}

export function addEvent(name, handler) {
  if (window.addEventListener) {
    window.addEventListener(name, handler, false);
  } else if (window.attachEvent) {
    window.attachEvent('on' + name, handler);
  } else {
    window['on' + name] = handler;
  }
}

export function warn (message) {
  if (window['console'] && console.warn) {
    console.warn(message);
  }
}

export const isArray = Array.isArray ? Array.isArray : function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

export function makeSureArray (obj) {
  return isArray(obj) ? obj : (obj ? [obj] : []);
}

export function ArrayCopy (arr) {
  return arr.slice(0);
}

export function formatHashBangURI (path) {
  let raw = path.replace(/^#!?/, '');
  // always
  if (raw.charAt(0) !== '/') {
    raw = '/' + raw;
  }
  return `/#!${raw}`;
}
