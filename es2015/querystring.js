export default {
  /**
   * querystring.stringify
   * @param { Object } obj
   * @param { Boolean } traditional [default:false]
   * @return { String }
   *
   * traditional is true:  {x: [1, 2]} => 'x=1&x=2'
   * traditional is false: {x: [1, 2]} => 'x[]=1&x[]=2'
   */
  stringify: function(obj, traditional) {
    if (!obj) {
      return '';
    }
    var appendString = traditional ? '' : '[]';
    var names = Object.keys(obj).sort();

    var parts = [];
    for (var i = 0; i < names.length; ++i) {
      var name = names[i];
      var value = obj[name];

      if (Array.isArray(value)) {
        value.sort();
        var _parts = [];
        for (var j = 0; j < value.length; ++j) {
          _parts.push(`${encodeURIComponent(name).replace(/%20/g, '+')}${appendString}=${encodeURIComponent(value[j]).replace(/%20/g, '+')}`);
        }
        parts.push(_parts.join('&'));
        continue;
      }
      parts.push(`${encodeURIComponent(name).replace(/%20/g, '+')}=${encodeURIComponent(value).replace(/%20/g, '+')}`);
    }
    return parts.join('&');
  },

  /**
   * querystring.parse
   * @param { String } queryString
   * @return { Object }
   */
  parse: function(queryString) {
    if (typeof queryString !== 'string') {
      return {};
    }

    queryString = queryString.trim().replace(/^(\?|#)/, '');

    if (queryString === '') {
      return {};
    }

    var queryParts = queryString.split('&');

    var query = {};

    for (var i = 0; i < queryParts.length; ++i) {
      var parts = queryParts[i].replace(/\+/g, '%20').split('='); // 特殊字符`+`转换为空格
      var name = parts[0];
      var value = parts[1];

      name = decodeURIComponent(name);

      value = value === undefined ? null : decodeURIComponent(value);

      if (query.hasOwnProperty(name)) {
        query[name] = value;
      } else if (Array.isArray(query[name])) {
        query[name].push(value);
      } else {
        query[name] = [query[name], value];
      }
    }
    return query;
  }
};
