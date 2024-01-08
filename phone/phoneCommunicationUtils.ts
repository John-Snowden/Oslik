import {writeFile, readdir, readFile, stat, } from 'fs/promises'
import shell from 'shelljs'

import { TSettings } from './types'

let settingPathTimer: NodeJS.Timeout
let settingsTimer: NodeJS.Timeout

let clientSettingsPath = ''
let clientConnectionPath = ''
const mountPoint = '/home/orangepi/Desktop/Oslik/media'
const cachedPaths = './phone/cachedPaths.json'
let clientSettings: TSettings | null = null

export const onAttachDevice = () => {
    console.log('Найден Android');
    shell.exec(`aft-mtp-mount /home/orangepi/Desktop/Oslik/media/`)
    settingPathTimer = setInterval(async ()=>{
        const files = await readdir(mountPoint)
        if(files.length === 0) {
            console.log('Файловая система Android не найдена, разреши обмен данными');
            return
        }
        
        clearInterval(settingPathTimer)
        const cachedJson = await readFile(cachedPaths, 'utf8')
        const cached = JSON.parse(cachedJson)
        if(cached.settings && cached.connection){
            const settingsJson = await readFile(cached.settings, 'utf8')
            const settings = JSON.parse(settingsJson)
            const connectionJson = await readFile(cached.connection, 'utf8')
            const connection = JSON.parse(connectionJson)
            if(settings && connection) {
                console.log('Путь к настройкам найден в кэше. ', cached)
                clientSettingsPath = cached.settings
                clientConnectionPath = cached.connection
                clientSettings = settings
            }
        }
        else {
            console.log('Кэшированный путь к файлам устарел');
            writeFile(cachedPaths, JSON.stringify({settings:"", connection:""}))        
            console.log('Ищу путь к файлу настроек...');
            await searchSettingsPath(mountPoint)
        }
    }, 1000)

 
    settingsTimer = setInterval(async () => {        
        if(!clientSettingsPath || !clientConnectionPath) {
            console.log("Файлы настроек не найдены");
            return;
        }
        else { 
            let data: null | TSettings = null 
            try {
                const json = await readFile(clientSettingsPath, 'utf-8')
                try {
                    const parsed = JSON.parse(json)
                    data = parsed
                }
                catch(e) {console.log('Не смог распарсить настройки',e)}
            } 
            catch (e) {console.log('Не смог прочитать настройки',e)}  
            
            clientSettings = data as TSettings
            if (!clientSettings) return
            console.log('Слушаю настройки ', clientSettings);

            const recordedRoutesJson = await readFile('./phone/recordedRoutes.json', 'utf8')
            const recordedRoutes = JSON.parse(recordedRoutesJson)
            if(recordedRoutes.length!==0 || clientSettings.pendingRoutes.length!==0){
                await writeFile(clientConnectionPath, JSON.stringify({
                    lastRead: new Date().getTime(),
                    isSettingsAvailableToClient: false
                }))
              
                if (clientSettings.pendingRoutes.length!==0) {
                    await writeFile('./phone/pendingRoutes.json', JSON.stringify(clientSettings.pendingRoutes))
                    clientSettings.pendingRoutes = []
                }
                if (recordedRoutes.length!==0) {
                    clientSettings.recordedRoutes = recordedRoutes
                    await writeFile('./phone/recordedRoutes.json', JSON.stringify([]))
                }
                await writeFile(clientSettingsPath, JSON.stringify(clientSettings))
                await writeFile(clientConnectionPath, JSON.stringify({
                lastRead: new Date().getTime(),
                isSettingsAvailableToClient: true
                }))
                console.log('Настройки переданы клиенту');
            }
            else {
                await writeFile(clientConnectionPath, JSON.stringify({
                lastRead: new Date().getTime(),
                isSettingsAvailableToClient: true
            }))
        }
        }
    }, 1000);
}


const searchSettingsPath = async (path: string) => {
    if(clientSettingsPath) {
        console.log("Путь к настройкам найден, выхожу из поиска.", clientSettingsPath);
        return
    }

    const files = await readdir(path)
    files.forEach(async file => {
        if(file.includes('OslikHodovaya.json')) clientSettingsPath = path + file + '/OslikHodovaya.json'
        if(file.includes('OslikConnection.json')) clientConnectionPath = path + file + '/OslikConnection.json'
        if (clientSettingsPath && clientConnectionPath) {
            await writeFile(cachedPaths, JSON.stringify({
                settings:clientSettingsPath, 
                connection:clientConnectionPath
            }))
        }
        else files.forEach(async file => {
            const stats = await stat(path + '/' + file)
            if(stats.isDirectory()) searchSettingsPath(path + '/' + file)
            }
        )
    })
}

 export const onDetachDevice = () => {
    console.log('Телефон отключен');
    clientSettingsPath = ''
    clientConnectionPath = ''
    clientSettings = null
    shell.exec('fusermount -u /home/orangepi/Desktop/Oslik/media/')
    clearInterval(settingPathTimer)
    clearInterval(settingsTimer)
}


