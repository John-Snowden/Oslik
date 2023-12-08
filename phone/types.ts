import { TTask } from "../types";

export type IPhoneAppSettings = {
    pendingRoutes: TTask[][],
    recordedRoutes: TTask[][],
    isConnected:boolean
    isSafeRemove:boolean
}