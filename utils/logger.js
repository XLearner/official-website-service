import fs from "fs";

const logFilePath = "./log/logfile.log";

export function Logger(msg) {
  fs.access(logFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir("./log", { recursive: true }, (err2) => {
        if (err2) {
          console.log("create folder error");
        }
      });
    }
  });
  const str = `[Service infomation]: ${new Date().toString()}, ${msg} \n\n`;
  fs.appendFile(logFilePath, str, (err) => {
    if (err) {
      fs.writeFile(logFilePath, str, (err2) => {
        if (err2) {
          console.log("Failed to create log: ", err2);
        } else {
          console.log("Log written to file:", logFilePath);
        }
      });
    } else {
      console.log("Log written to file:", logFilePath);
    }
  });
}
