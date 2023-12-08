import {  writeFileSync, readdirSync, readFileSync, statSync, existsSync} from 'fs';

import { basePath } from './phoneConstants'
import { IPhoneAppSettings } from './types'

let settingPathTimer: NodeJS.Timeout
let settingsTimer: NodeJS.Timeout

let isSafeRemove = false

let clientSettingsPath = ''
const cachedSettingsPath = './phone/cachedSettingsPath.json'
let clientSettings: IPhoneAppSettings | null = null

export const getSettingsPath = (path: string) => {
    if(clientSettingsPath) return
    console.log('Поиск пути к файлу настроек...');
    const files = readdirSync(path)
    
    if(files.includes('OslikHodovaya.json')) {
        clientSettingsPath = path + '/OslikHodovaya.json'
        writeFileSync(cachedSettingsPath, JSON.stringify(clientSettingsPath))
        console.log('Настройки найдены:', clientSettingsPath);
    }
    else files.forEach(file=>{
        if(statSync(path + '/' + file).isDirectory()){ 
            getSettingsPath(path + '/' + file)
            }
            else {
                console.log('Файл настроек на телефоне не найден.')
            }
        }
    )
}

export const onAttachDevice = () => {
    console.log('Телефон подключен');
    findSettingsPath()
 
    settingsTimer = setInterval(() => {        
        if(!clientSettingsPath) return
        else {            
            clientSettings = JSON.parse(readFileSync(clientSettingsPath, 'utf-8'))

            if (!clientSettings || isSafeRemove) return

            if (clientSettings.isSafeRemove) {
                isSafeRemove = true
                return
            }

            if (clientSettings.pendingRoutes.length!==0) {
                writeFileSync('./phone/pendingRoutes.json', JSON.stringify(clientSettings.pendingRoutes))
                clientSettings.pendingRoutes = []
            }

            const recordedRoutes = JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
            if (recordedRoutes.length!==0) {
                clientSettings.recordedRoutes.push(recordedRoutes)
                writeFileSync('./phone/recordedRoutes.json', JSON.stringify([]))
            }

            clientSettings.isConnected=true
            
            writeFileSync(clientSettingsPath, JSON.stringify(clientSettings))
        }
    }, 1000);
}

const findSettingsPath = () => {
    if(!clientSettingsPath) {
        settingPathTimer = setInterval(()=>{
            if(clientSettingsPath)clearInterval(settingPathTimer) 
            if (isDataTransferEnabled()) {
                if (!getCachedSettingsPath()) getSettingsPath(basePath)
            }
        },1000)
    }
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
    isSafeRemove = false
    clientSettingsPath = ''
    clientSettings = null
    clearInterval(settingPathTimer)
    clearInterval(settingsTimer)
}


