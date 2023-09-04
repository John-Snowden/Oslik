// дистанция в см
// направление в минутах
// скорость в м/с
// таймаут в мс

import { TRoute } from "./types";

const initRoute: TRoute = {
  distance: 0,
  degree: 0,
  speed: 0,
  timeout: 0,
};

const initAB: TRoute[] = [
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

export const fullAB: TRoute[] = [initRoute, ...initAB];
