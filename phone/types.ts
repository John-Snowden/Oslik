import { TTask } from "../types";

export type TClient = {
    pending: {
        routes: TTask[][]
        modified: number
    };
    recorded: {
        modified: number
    }
}

export type TServer = {
    pending: {
        modified: number
    };
    recorded: {
        routes: TTask[][]
        modified: number
    }
}

export type TCached = {
    clientPath: string;
    serverPath: string
}