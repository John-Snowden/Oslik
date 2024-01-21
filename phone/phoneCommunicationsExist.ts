import {readFile, writeFile, readdir, stat, unlink} from 'fs/promises'
import shell from 'shelljs'

import { TCached, TRoutes } from './types'
import { TTask } from '../types'

let pathTimer: NodeJS.Timeout
let clientTimer: NodeJS.Timeout
let serverTimer: NodeJS.Timeout

let clientFilePath = ''
let serverFilePath = ''
let clientUpdatedPath = ''
let serverUpdatedPath = ''
const cache = './phone/cache.json'
const pendingStorePath = './phone/pendingRoutes.json'
const recordedStorePath = './phone/recordedRoutes.json'

export const mountPoint = '/Oslik/media/'
// export const mountPoint = '/run/user/1000/gvfs'

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
        const cachedBasePathJson = await readFile(cache, 'utf8') 
        const cachedBasePath = (JSON.parse(cachedBasePathJson) as TCached).basePath
        console.log('cachedBasePath',cachedBasePath);
        
        try {
            const clientJson = await readFile(cachedBasePath + '/ClientFile.json', 'utf8')
            const serverJson = await readFile(cachedBasePath + '/ServerFile.json', 'utf8')            
            JSON.parse(clientJson)
            JSON.parse(serverJson)
            clientFilePath = cachedBasePath + '/ClientFile.json'
            serverFilePath = cachedBasePath + '/ServerFile.json'
            clientUpdatedPath = cachedBasePath + '/ClientUpdated.txt'
            serverUpdatedPath = cachedBasePath + '/ServerUpdated.txt'
            console.log('Путь к настройкам найден в кэше.', cachedBasePath)
        } catch (e) {
            console.log('Кэшированный путь к файлам устарел');
            console.log('Ищу путь к файлу настроек...');
            searchSettingsPath(mountPoint)
        }
    }, 1000)

    watchClientUpdate()
    watchStoredRecorded()
}



const watchClientUpdate = async () => {
    clearTimeout(clientTimer)
    try{
        if(!clientFilePath) return

        const isClientUpdated = await stat(clientUpdatedPath)
        if(isClientUpdated) {
            // console.log('Обнаружено обновление маршрутов');
            try {
                const clientJson = await readFile(clientFilePath, 'utf8')
                const clientFile = JSON.parse(clientJson) as TRoutes
                await writeFile(pendingStorePath, JSON.stringify(clientFile.routes), 'utf8')
                // console.log('Загружены новые маршруты');
                await unlink(clientUpdatedPath)
            } catch (e){
                console.log('Ошибка чтения clientFilePath', e);
            }
        }
    } catch (e) {
        // console.log('Новых маршрутов нет')
    }
    finally {
        clientTimer = setTimeout(() => {
            watchClientUpdate()
    }, 3000);}
}

const watchStoredRecorded = async () => {
    clearTimeout(serverTimer)
    try {
        if(!serverFilePath) return

        const recordedJson = await readFile(recordedStorePath, 'utf8')
        const recorded = JSON.parse(recordedJson)
        
        if(recorded.length !== 0) {
            try {
                const serverJson = await readFile(serverFilePath, 'utf8')
                const serverFile = JSON.parse(serverJson) as TRoutes

                const stringified = serverFile.routes.toString()
                const filtered = recorded.filter((route:TTask[][]) => {
                    return !stringified.includes(route.toString())
                });
                serverFile.routes.push(...filtered)
                await writeFile(serverFilePath, JSON.stringify(serverFile), {encoding:'utf8'})
            }
            catch (e){console.log('Ошибка записи serverFilePath', e);
            }
            try {
                await writeFile(serverUpdatedPath, '')
            }
            catch (e){console.log('Ошибка записи serverUpdatedPath', e);
            }
            try {
                await writeFile(recordedStorePath, JSON.stringify([]), 'utf8')
                // console.log('Сохраненные маршруты переданы приложению');
            }
            catch (e){console.log('Ошибка записи recordedStorePath', e);
            }
        } else {
            // console.log('Сохраненных маршрутов нет');
        }
    }
    catch (e){
        // console.log('Ошибка чтения recordedStorePath', e);
    }
    finally {
        serverTimer = setTimeout(() => {
            watchStoredRecorded()
        }, 3000);
    }
}
 
const searchSettingsPath = async (path: string) => {
    if(clientFilePath && serverFilePath) return

    const files = await readdir(path)
    files.forEach(async file => {
        if(file === 'ClientFile.json' || file === 'ServerFile.json') {
            clientFilePath = path + '/ClientFile.json'
            serverFilePath = path + '/ServerFile.json'
            clientUpdatedPath = path + '/ClientUpdated.txt'
            serverUpdatedPath = path + '/ServerUpdated.txt'
            await writeFile(cache, JSON.stringify({basePath:path}), 'utf8')
            console.log('Файлы найдены');
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
    clientUpdatedPath = ''
    serverUpdatedPath = ''
    shell.exec(`fusermount -u ${mountPoint}`)
    clearInterval(pathTimer)
    clearInterval(clientTimer)
    clearInterval(serverTimer)
}


