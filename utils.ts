import {
  currentRoute,
  currentTaskIndex,
  incrementTaskIndex,
  loadRouteB,
} from "./route";
import { TTask } from "./types";
import { routeLogs } from "./log";

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
