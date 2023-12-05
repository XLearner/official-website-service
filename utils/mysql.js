import mysql from "mysql";
const remote = ["10.0.12.12", "yanli@1647"];
const localhost = ["localhost", "yanli"];

const connection = mysql.createConnection({
  host: localhost[0],
  user: "root",
  password: localhost[1],
  database: "zh_office_website",
});
connection.connect();

export default connection;
