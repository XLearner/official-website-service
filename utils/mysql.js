import mysql from "mysql";
import { remote, localhost } from "./config.js";

const config = localhost;

const connection = mysql.createConnection({
  host: config[0],
  user: "root",
  password: config[1],
  database: "zh_office_website",
});
connection.connect();

export default connection;
