import { SerialPort } from "serialport";

import { fullAB } from "./routeA";

const port = new SerialPort({
  path: "/dev/ttys003",
  baudRate: 57600,
});

port.on("data", (data) => {
  const parsed = JSON.parse(data);
  const res = {
    status: { name: "connected", text: "OK" },
    index: parsed.index,
    route: parsed.route,
  };
  console.log(res);

  setTimeout(() => port.write(JSON.stringify(res)), 1000);
});

port.on("open", () => {
  console.log("COM2 LISTENING...");
});

const initData = {
  status: { name: "connected", text: "OK" },
  index: 0,
  route: fullAB[0],
};
port.write(JSON.stringify(initData));
