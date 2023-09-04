import { TFull } from "./types";

export const logRoute = (data: TFull) => {
  routeLogs.push(data);
  if (data.index) console.log("ROUTE " + data.index + " COMPLETE");
};

export const routeLogs: TFull[] = [];
