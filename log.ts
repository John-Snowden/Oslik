import { TFull } from "./types";
import { currentTaskIndex } from "./route";

export const logTask = (data: TFull) => {
  routeLogs.push(data);
  console.log("TASK " + currentTaskIndex + " COMPLETE");
};

export const routeLogs: TFull[] = [];
