import { TFull } from "./types";
import { fullAB } from "./routeA";
import { routeLogs } from "./log";

export const nextRoute = (data: TFull): string => {
  return JSON.stringify({
    index: data.index + 1,
    route: fullAB[data.index + 1],
  });
};

export const finishRoute = () => {
  console.log("ROUTE FINISHED");
  console.log("LOGS:" + routeLogs.length);
};
