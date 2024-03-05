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
};
