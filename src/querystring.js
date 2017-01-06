import { isArray } from './utils';

const encode = encodeURIComponent, decode = decodeURIComponent;

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
  stringify(obj, traditional) {
    if (!obj) {
      return '';
    }
    const appendString = traditional ? '' : '[]';
    const keysArray = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        keysArray.push(p);
      }
    }
    const names = keysArray.sort();

    const parts = [];
    for (let i = 0; i < names.length; ++i) {
      const name = names[i];
      const value = obj[name];

      if (isArray(value)) {
        value.sort();
        const _parts = [];
        for (let j = 0; j < value.length; ++j) {
          _parts.push(`${encode(name).replace(/%20/g, '+')}${appendString}=${encode(value[j]).replace(/%20/g, '+')}`);
        }
        parts.push(_parts.join('&'));
        continue;
      }
      parts.push(`${encode(name).replace(/%20/g, '+')}=${encode(value).replace(/%20/g, '+')}`);
    }
    return parts.join('&');
  },

  /**
   * querystring.parse
   * @param { String } queryString
   * @return { Object }
   * 
   * 'x=1&y=2' => {x: 1, y: 2}
   * 'x=1&x=2' => {x: [1, 2]}
   */
  parse(queryString) {
    if (typeof queryString !== 'string') {
      return {};
    }

    queryString = queryString.trim().replace(/^(\?|#)/, '');

    if (queryString === '') {
      return {};
    }

    const queryParts = queryString.split('&');

    const query = {};

    for (let i = 0; i < queryParts.length; ++i) {
      const parts = queryParts[i].replace(/\+/g, '%20').split('='); // 特殊字符`+`转换为空格
      const name = decode(parts[0]), value = parts[1] === undefined ? null : decode(parts[1]);

      if (!query.hasOwnProperty(name)) {
        query[name] = value;
      } else if (isArray(query[name])) {
        query[name].push(value);
      } else {
        query[name] = [query[name], value];
      }
    }
    return query;
  }
};
