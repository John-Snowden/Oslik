// дистанция в см
// направление в минутах
// скорость в м/с
// таймаут в мс

import { TTask } from "./types";

export const initTask: TTask = {
  distance: 0,
  degree: 0,
  speed: 0,
  timeout: 0,
};

// mocks
const routeA: TTask[] = [
  {
    distance: 1000,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 700,
    degree: 460,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1200,
    degree: 600,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 850,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 5000,
    degree: 950,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 700,
    degree: 460,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1200,
    degree: 600,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 850,
    speed: 0.5,
    timeout: 500,
  },
];
const routeB: TTask[] | null = [
  {
    distance: 550,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 200,
    degree: 460,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 500,
    degree: 600,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 850,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 350,
    degree: 950,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1000,
    degree: 900,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 280,
    degree: 460,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 1200,
    degree: 600,
    speed: 0.5,
    timeout: 500,
  },
  {
    distance: 100,
    degree: 850,
    speed: 0.5,
    timeout: 500,
  },
];

export let currentTaskIndex = 0;
export let currentRoute: TTask[] = [initTask, ...routeA];

export const incrementTaskIndex = () => currentTaskIndex++;

export const loadRouteB = () => {
  currentRoute = routeB ? [initTask, ...routeB] : [initTask, ...routeA];
};
