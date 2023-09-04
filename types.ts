type TStatus = {
  name: "connected" | "disconnected" | "error";
  text: string;
};

export type TRoute = {
  distance: number;
  degree: number;
  speed: number;
  timeout: number;
};

export type TData = {
  index: number;
  route: TRoute;
};

export type TFull = TData & {
  status: TStatus;
};
