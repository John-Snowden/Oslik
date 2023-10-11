import { SerialPort } from "serialport";

import { TFull } from "./types";
import { initTask } from "./route";

const port = new SerialPort({
  path: "/dev/ttys003",
  baudRate: 57600,
});

port.on("data", (data: string) => {
  const { task } = JSON.parse(data);
  const res: TFull = {
    status: { name: "connected", text: "OK" },
    task,
  };
  console.log("res ", res);

  setTimeout(() => port.write(JSON.stringify(res)), 1000);
});

port.on("open", () => {
  console.log("COM2 LISTENING...");
});

port.write(JSON.stringify(initTask));
