import { usb } from "usb";

let device: usb.Device | null = null;

const getDevice = async () => {
  if (!device) {
    console.log("Deviced not found");
    return;
  }
  // console.log(device);

  device.open();
  device.interface(0).claim();
  // console.log("Device interfaces", device.interfaces);

  const [outPoint, inPoint] = device.interface(0).endpoints;
  console.log("outPoint", outPoint);
};

usb.on("attach", (data) => {
  console.log("device attached");
  device = data;
  getDevice();
});

usb.on("detach", () => console.log("device detached"));
