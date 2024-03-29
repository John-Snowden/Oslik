import {writeFile, readdir, readFile, stat} from 'fs/promises'
import {readFileSync, openSync, closeSync} from 'fs'
import shell from 'shelljs'

import { TCached, TClient, TServer } from './types'

let pathTimer: NodeJS.Timeout

let clientFilePath = ''
let serverFilePath = ''
let clientFile: TClient | null = null
let serverFile: TServer | null = null
let cachedPaths: TCached | null = null
const pendingStorePath = './phone/pendingRoutes.json'
const recordedStorePath = './phone/recordedRoutes.json'

let isReading = false

export const mountPoint = '/Oslik/media/'
// export const mountPoint = '/run/user/1000/gvfs'
const cache = './phone/cache.json'

export const onAttachAndroid = () => {
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
            await searchSettingsPath(mountPoint)
        }
    }, 1000)

    watchClient()
}


const watchClient = async () => {
    if(clientFile && serverFile) {
        if(isReading) return
        isReading = true
        try {
            const serverJson = readFileSync(serverFilePath, {encoding:'utf8'})
            serverFile = JSON.parse(serverJson) as TServer

            const clientFd = openSync(clientFilePath, 'rs')
            console.log('clientFd', clientFd);
            
            const clientJson = readFileSync(clientFd, {encoding:'utf8', flag:'rs'})
            // const clientJson = readFileSync(clientFilePath, {encoding:'utf8', flag:'rs'})
            console.log('clientJson',clientJson);
            clientFile = JSON.parse(clientJson) as TClient
            console.log('clientFile',clientFile);
            
            const recordedJson = readFileSync(recordedStorePath, 'utf8')
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
            closeSync(clientFd)
            console.log('closed clientFd', clientFd);
            isReading = false
        } catch (e) {
            console.log('Ошибка clientTimer',e);
    }
    }
    setTimeout(() => {
        watchClient()
    }, 3000);
}
 
const searchSettingsPath = async (path: string) => {
    if(clientFilePath && serverFilePath) {
        try {
            const clientJson = await readFile(clientFilePath, 'utf8')
            const serverJson = await readFile(serverFilePath, 'utf8')
            clientFile = JSON.parse(clientJson)
            serverFile = JSON.parse(serverJson)
            return
        }
        catch(e){console.log('???', e);
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
}


