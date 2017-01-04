export function extend() {
  var obj = {};
  var srcList = Array.prototype.slice.call(arguments, 0);
  for (var i = 0, len = srcList.length; i < len; ++i) {
    var src = srcList[i];
    for (var q in src) {
      if (src.hasOwnProperty(q)) {
        obj[q] = src[q];
      }
    }
  }
  return obj;
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
