import { Logger } from "./logger.js";
import connection from "./mysql.js";

export const baseUrl = "http://localhost:8903";

function jsonback(code, data, msg) {
  return {
    code,
    data: data || null,
    msg: msg || "",
  };
}

function isEmpty(params) {
  if (!Array.isArray(params)) return true;
  for (let i = 0, len = params.length; i < len; i++) {
    const item = params[i];
    if (Array.isArray(item) && item.length === 0) {
      return true;
    } else if (
      Object.prototype.toString.call(item).indexOf("Object") > 0 &&
      Object.keys(item).length === 0
    ) {
      return true;
    } else if (!item) {
      return true;
    }
  }
  return false;
}

function getCurrentTime() {
  const now = new Date();
  const date = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  return date;
}

/**
 * 将对象转换为类 querystring 形式
 * 如：
 * {
 *  a: 1,
 *  b: 2
 * }
 * 转为 => a=1,b=2
 *
 */
function toSentence(obj) {
  let st = "";

  for (const [key, val] of Object.entries(obj)) {
    st += `${key}="${val}",`;
  }

  st = st.slice(0, -1);
  return st;
}

function execQuery(connection, sentence) {
  return new Promise((resolve, reject) => {
    connection.query(sentence, function (error, results, fields) {
      if (error) {
        console.log("error --- ", sentence);
        Logger(error);
        return reject(error);
      }
      console.log(`The result of "${sentence}" is: `, results);
      resolve(results);
    });
  });
}

function execGetRes(sentence) {
  return execQuery(connection, sentence);
}

export default {
  jsonback,
  toSentence,
  execQuery,
  execGetRes,
  isEmpty,
  getCurrentTime,
};
