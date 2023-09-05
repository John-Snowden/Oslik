import { SerialPort } from "serialport";

import { TFull } from "./types";
import { logTask } from "./log";
import { currentRoute, currentTaskIndex } from "./route";
import { finishRoute, getNextTask } from "./utils";

const port = new SerialPort({
  path: "/dev/ttys004",
  baudRate: 57600,
});

const sendTask = () => {
  if (currentRoute.length - 1 === currentTaskIndex) finishRoute();
  else port.write(getNextTask());
};

port.on("data", (data: string): void => {
  const typed = JSON.parse(data) as TFull;
  logTask(typed);

  if (typed.status.name !== "connected") return;
  else sendTask();
});

port.on("open", () => {
  console.log("COM1 LISTENING...");
});
