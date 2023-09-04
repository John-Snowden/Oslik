import { SerialPort } from "serialport";

import { TFull } from "./types";
import { logRoute } from "./log";
import { fullAB } from "./routeA";
import { finishRoute, nextRoute } from "./utils";

const port = new SerialPort({
  path: "/dev/ttys004",
  baudRate: 57600,
});

const sendRoute = (data: TFull) => {
  if (fullAB.length - 1 === data.index) finishRoute();
  else port.write(nextRoute(data));
};

port.on("data", (data: string): void => {
  const typed = JSON.parse(data) as TFull;
  logRoute(typed);

  if (typed.status.name !== "connected") return;
  else sendRoute(typed);
});

port.on("open", () => {
  console.log("COM1 LISTENING...");
});
