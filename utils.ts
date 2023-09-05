import { routeLogs } from "./log";
import {
  currentRoute,
  currentTaskIndex,
  incrementTaskIndex,
  loadRouteB,
} from "./route";
import { TTask } from "./types";

export const getNextTask = (): string => {
  incrementTaskIndex();
  const nextTask: TTask = currentRoute[currentTaskIndex];
  return JSON.stringify({ task: nextTask });
};

export const finishRoute = () => {
  console.log("ROUTE FINISHED");
  console.log("LOGS:" + routeLogs.length);
  loadRouteB();
};
