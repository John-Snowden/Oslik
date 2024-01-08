import { TTask } from "../types";

export type TSettings = {
    pendingRoutes: TTask[][],
    recordedRoutes: TTask[][],
    // isSafeRemove:boolean
}

export type TConnection = {
    lastRead: Date,
    isSettingsAvailableToClient: boolean
}