import { SerialPort } from "serialport";

import { currentRoute } from "./route";

const port = new SerialPort({
  path: "/dev/ttys003",
  baudRate: 57600,
});

port.on("data", (data) => {
  const parsed = JSON.parse(data);
  const res = {
    status: { name: "connected", text: "OK" },
    task: parsed.task,
  };
  console.log("res ", res);

  setTimeout(() => port.write(JSON.stringify(res)), 1000);
});

port.on("open", () => {
  console.log("COM2 LISTENING...");
});

const initData = {
  status: { name: "connected", text: "OK" },
  task: currentRoute[0],
};
port.write(JSON.stringify(initData));
