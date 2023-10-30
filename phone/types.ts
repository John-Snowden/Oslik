import { TTask } from "../types";

export type IPhoneAppSettings = {
    pendingRoutes: TTask[],
    isClientSendingPendingRoutes: boolean,
    recordedRoutes: TTask[],
    isClientRequestingLastRecordedRoutes: boolean,
    isServerFoundSettings:boolean
}