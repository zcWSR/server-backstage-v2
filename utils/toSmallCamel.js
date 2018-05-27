/**
 * 将对象属性转为小驼峰形式
 * @param {} obj 待转换对象
 * @param {*} splitWord 分割用字符
 */
export default function toSmallCamel(obj, splitWord) {
  function firstUpperCase(str) {
    return str.charAt(0).toUpperCase()+str.slice(1);
  }

  const result = {};
  Object.keys(obj).forEach(key => {
    const keys = key.split(splitWord);
    const newKey = keys.map((k, i) => {
      if (i) {
        return firstUpperCase(k);
      }
      return k;
    }).join('');
    result[newKey] = obj[key];
  });
  return result;
}