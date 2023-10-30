import {  writeFileSync, readdirSync, readFileSync, statSync, existsSync} from 'fs';

import { basePath } from './phoneConstants'
import { IPhoneAppSettings } from './types'

let settingPathTimer: NodeJS.Timeout
let settingsTimer: NodeJS.Timeout

let clientSettingsPath = ''
const cachedSettingsPath = './phone/cachedSettingsPath.json'
let clientSettings: IPhoneAppSettings | null = null
let serverSettings: IPhoneAppSettings | null = null

export const getSettingsPath = (path: string) => {
    if(clientSettingsPath) return
    console.log('Поиск пути к файлу настроек...');
    const files = readdirSync(path)
    
    if(files.includes('Oslik.json')) {
        clientSettingsPath = path + '/Oslik.json'
        writeFileSync(cachedSettingsPath, JSON.stringify(clientSettingsPath))
        console.log('Настройки найдены:', clientSettingsPath);
    }
    else files.forEach(file=>{
        if(statSync(path + '/' + file).isDirectory()){ 
            getSettingsPath(path + '/' + file)
            }
        }
    )
}

const updateClientSettings = () => {
   if(clientSettingsPath) writeFileSync(clientSettingsPath, JSON.stringify(serverSettings))
}

export const onAttachDevice = () => {
    console.log('Телефон подключен');

    if(!clientSettingsPath) {
        settingPathTimer = setInterval(()=>{
            if(clientSettingsPath)clearInterval(settingPathTimer) 
            if (isDataTransferEnabled()) {
                if (!getCachedSettingsPath()) getSettingsPath(basePath)
            }
        },1000)
    }
 
    settingsTimer = setInterval(() => {
        if(!clientSettingsPath) return
        else {
            console.log('Слушаю настройки...',clientSettings);
            clientSettings = JSON.parse(readFileSync(clientSettingsPath, 'utf-8'))
            if (!clientSettings) return

            serverSettings = {...clientSettings}
            if (clientSettings.isClientSendingPendingRoutes) writePendingRoutesToServer()
            if (clientSettings.isClientRequestingLastRecordedRoutes) writeRecordedRoutesToClient()
            if (!clientSettings.isServerFoundSettings) {
                serverSettings.isServerFoundSettings = true
                updateClientSettings()
            }
        }
    }, 1000);
}

const writePendingRoutesToServer = () =>{
    writeFileSync('./phone/pendingRoutes.json', JSON.stringify(clientSettings!.pendingRoutes))
    serverSettings!.isClientSendingPendingRoutes = false
    serverSettings!.pendingRoutes = []
    updateClientSettings()
}

const writeRecordedRoutesToClient = () => {
    const recordedRoutes = JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
    if (recordedRoutes.length !== 0) {
        serverSettings!.recordedRoutes = recordedRoutes
        writeFileSync('./phone/recordedRoutes.json', JSON.stringify([]))
    }
    serverSettings!.isClientRequestingLastRecordedRoutes = false
    updateClientSettings()
}

const isDataTransferEnabled = () => {
    const files = readdirSync(basePath)
    return files.length !== 0
 }  

const getCachedSettingsPath = () => {
    const cached = JSON.parse(readFileSync(cachedSettingsPath, 'utf8'))
    if(existsSync(cached)){ 
        clientSettingsPath = JSON.parse(readFileSync(cachedSettingsPath, 'utf8'))
        console.log('Настройки найдены в кэше:', clientSettingsPath);
        return true
    }

    return false
}

 export const onDetachDevice = () => {
    console.log('Телефон отключен');
    if (serverSettings) serverSettings.isServerFoundSettings = false
    clientSettingsPath = ''
    clientSettings = null
    clearInterval(settingPathTimer)
    clearInterval(settingsTimer)
}
