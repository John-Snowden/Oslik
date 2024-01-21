import {readFile, writeFile, readdir, stat} from 'fs/promises'
import shell from 'shelljs'

import { TCached, TClient, TServer } from './types'

let pathTimer: NodeJS.Timeout
let clientTimer: NodeJS.Timeout

let clientFilePath = ''
let serverFilePath = ''
let clientFile: TClient | null = null
let serverFile: TServer | null = null
let cachedPaths: TCached | null = null
const pendingStorePath = './phone/pendingRoutes.json'
const recordedStorePath = './phone/recordedRoutes.json'

export const mountPoint = '/Oslik/media/'
// export const mountPoint = '/run/user/1000/gvfs'
const cache = './phone/cache.json'

export const onAttachDevice = () => {
    console.log('Найдено устройство');
    shell.exec(`aft-mtp-mount ${mountPoint}`)
    pathTimer = setInterval(async ()=>{
        const files = await readdir(mountPoint)
        
        if(files.length === 0) {
            console.log('Разреши обмен данными на Android');
            return
        }
        
        clearInterval(pathTimer)
        const cachedJson = await readFile(cache, 'utf8')
        console.log('cachedJson',cachedJson);
        cachedPaths = JSON.parse(cachedJson) as TCached
        try {
            const clientJson = await readFile(cachedPaths.clientPath, 'utf8')
            const serverJson = await readFile(cachedPaths.serverPath, 'utf8')
            clientFilePath = cachedPaths.clientPath
            serverFilePath = cachedPaths.serverPath
            clientFile = JSON.parse(clientJson)
            serverFile = JSON.parse(serverJson)
            console.log('Путь к настройкам найден в кэше.', cachedPaths)
            console.log('client:', clientFile)
            console.log('server:', serverFile)
        } catch (e) {
            console.log('Кэшированный путь к файлам устарел');
            console.log('Ищу путь к файлу настроек...');
            searchSettingsPath(mountPoint)
        }
    }, 1000)

    watchClient()
}


const watchClient = async () => {
    console.log('watchClient');
    if(clientFile && serverFile) {
        try {
            const serverJson = await readFile(serverFilePath, {encoding:'utf8'})
            console.log('serverJson',serverJson);
            serverFile = JSON.parse(serverJson) as TServer

            const clientJson = await readFile(clientFilePath, {encoding:'utf8'})
            console.log('clientJson',clientJson);
            clientFile = JSON.parse(clientJson) as TClient

            const recordedJson = await readFile(recordedStorePath, 'utf8')
            const recordedRoutes = JSON.parse(recordedJson)

            if(clientFile.pending.modified > serverFile.pending.modified) {
             await writeFile(pendingStorePath, JSON.stringify(clientFile.pending.routes), 'utf8')
                serverFile.pending.modified = new Date().getTime()
             await writeFile(serverFilePath, JSON.stringify(serverFile), 'utf8')
                console.log('Загружены новые маршруты');
            }

            if (clientFile.recorded.modified >= serverFile.recorded.modified){
                if(recordedRoutes.length !== 0) { 
                    serverFile.recorded.routes = recordedRoutes
                    serverFile.recorded.modified = new Date().getTime()
                    await writeFile(serverFilePath, JSON.stringify(serverFile), 'utf8')
                    await writeFile(recordedStorePath, JSON.stringify([]), 'utf8')
                 }
                 else {
                     serverFile.recorded.routes = []
                    await writeFile(serverFilePath, JSON.stringify(serverFile), 'utf8')
                    console.log('Скачанные маршруты очищены');
                 }
            } 
        } catch (e) {
            console.log('Ошибка clientTimer',e);
        } finally {
            console.log('finaly block');
            clearTimeout(clientTimer)
            clientTimer = setTimeout(() => {
                watchClient()
            }, 6000);
        }
    } else {
        clearTimeout(clientTimer)
        clientTimer = setTimeout(() => {
        watchClient()
        }, 6000);
    }
}
 
const searchSettingsPath = async (path: string) => {
    if(clientFilePath && serverFilePath) {
        console.log('Путь найден в', clientFilePath, serverFilePath);
        try {
            const clientJson = await readFile(clientFilePath, 'utf8')            
            clientFile = JSON.parse(clientJson)
        }
        catch(e){console.log('clientJson ???', e);
        }
        try {
            const serverJson = await readFile(serverFilePath, 'utf8')
            serverFile = JSON.parse(serverJson)
            return
        }
        catch(e){console.log('serverJson ???', e);
        }
    }

    const files = await readdir(path)
    files.forEach(async file => {
        if(file === 'ClientFile.json') clientFilePath = path + '/' + file
        if(file === 'ServerFile.json') serverFilePath = path + '/' + file
        if (clientFilePath && serverFilePath) {
            await writeFile(cache, JSON.stringify({
                clientPath:clientFilePath, 
                serverPath:serverFilePath
            }), 'utf8')
        }
        else {
            console.log('Ищу в', path + '/' + file);
            const stats = await stat(path + '/' + file)
            if(stats.isDirectory()) searchSettingsPath(path + '/' + file)
        }
    })
}

 export const onDetachDevice = () => {
    console.log('Устройство отключено');
    clientFilePath = ''
    serverFilePath = ''
    clientFile = null
    serverFile = null
    shell.exec(`fusermount -u ${mountPoint}`)
    clearInterval(pathTimer)
    clearInterval(clientTimer)
}


