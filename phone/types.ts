import { TTask } from "../types";

export type TSettings = {
    pendingRoutes: TTask[][],
    recordedRoutes: TTask[][],
    isConnected:boolean
    isSafeRemove:boolean
}