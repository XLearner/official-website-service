import mysql from "mysql";
const remote = ["10.0.12.12", "yanli@1647"];
const localhost = ["localhost", "yanli"];

const connection = mysql.createConnection({
  host: remote[0],
  user: "root",
  password: remote[1],
  database: "zh_office_website",
});
connection.connect();

export default connection;
