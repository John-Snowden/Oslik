import {writeFile, readdir, readFile, stat, } from 'fs/promises'
import shell from 'shelljs'

import { TCached, TClient, TServer } from './types'

let pathTimer: NodeJS.Timeout
let clientTimer: NodeJS.Timeout

let clientFilePath = ''
let serverFilePath = ''
let clientFile: TClient | null = null
let serverFile: TServer | null = null
let cachedPaths: TCached | null = null
const mountPoint = '/home/orangepi/Desktop/Oslik/media'
const cache = './phone/cache.json'

export const onAttachDevice = () => {
    console.log('Найден Android');
    shell.exec(`aft-mtp-mount /home/orangepi/Desktop/Oslik/media/`)
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

 
    clientTimer = setInterval(async () => {        
        if(clientFile && serverFile) {
            const json = await readFile(clientFilePath, 'utf-8')
            clientFile = JSON.parse(json) as TClient
            console.log('clientFile:', clientFile);

            if(clientFile.recorded.modified > serverFile.recorded.modified){
                serverFile.recorded.routes = []
                await writeFile(serverFilePath, JSON.stringify(serverFile), 'utf8')
            }

            if(clientFile.pending.modified > serverFile.pending.modified) {
                await writeFile('./phone/pendingRoutes.json', JSON.stringify(clientFile.pending.routes))
                serverFile.pending.modified = new Date().getTime()
                await writeFile(serverFilePath, JSON.stringify(serverFile), 'utf8')
                console.log('Загружены новые маршруты');
                
            }
        }
    }, 1000);
}


const searchSettingsPath = async (path: string) => {
    if(clientFilePath && serverFilePath) {
        console.log("Путь к настройкам клиента найден", clientFilePath);
        console.log("Путь к настройкам сервера найден", serverFilePath);
        return
    }

    const files = await readdir(path)
    files.forEach(async file => {
        if(file === 'ClientFile.json') clientFilePath = path + '/' + file
        if(file === 'ServerFile.json') serverFilePath = path + '/' + file
        if (clientFilePath && serverFilePath) {
            await writeFile(cache, JSON.stringify({
                settings:clientFilePath, 
                connection:serverFilePath
            }), 'utf8')
        }
        else {
            const stats = await stat(path + '/' + file)
            if(stats.isDirectory()) searchSettingsPath(path + '/' + file)
        }
    })
}

 export const onDetachDevice = () => {
    console.log('Телефон отключен');
    clientFilePath = ''
    serverFilePath = ''
    clientFile = null
    serverFile = null
    shell.exec('fusermount -u /home/orangepi/Desktop/Oslik/media/')
    clearInterval(pathTimer)
    clearInterval(clientTimer)
}


