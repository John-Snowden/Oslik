type TStatus = {
  name: "connected" | "disconnected" | "error";
  text: string;
};

export type TTask = {
  distance: number;
  degree: number;
  speed: number;
  timeout: number;
};

export type TFull = {
  status: TStatus;
  task: TTask;
};
