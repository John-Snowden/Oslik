import {readFile, writeFile, readdir, stat, unlink} from 'fs/promises'
import shell from 'shelljs'

import { TCached, TRoutes } from './types'

let pathTimer: NodeJS.Timeout

let clientFilePath = ''
let serverFilePath = ''
const cachePath = './phone/cache.json'
const pendingStorePath = './phone/pendingRoutes.json'
const recordedStorePath = './phone/recordedRoutes.json'

// export const mountPoint = '/Oslik/media/'
export const mountPoint = '/run/user/1000/gvfs'

export const onAttachAndroid = () => {
    console.log('Найдено устройство');
    // shell.exec(`aft-mtp-mount ${mountPoint}`)
    pathTimer = setInterval(async ()=>{
        const files = await readdir(mountPoint)
        
        if(files.length === 0) {
            console.log('Разреши обмен данными на Android');
            return
        }
        
        clearInterval(pathTimer)
        const basePathJson = await readFile(cachePath, 'utf8') 
        const basePath = (JSON.parse(basePathJson) as TCached).basePath
        console.log('basePath',basePath);
        
        try {
            const clientJson = await readFile(basePath + '/ClientFile.json', 'utf8')
            const serverJson = await readFile(basePath + '/ServerFile.json', 'utf8')            
            JSON.parse(clientJson)
            JSON.parse(serverJson)
            clientFilePath = basePath + '/ClientFile.json'
            serverFilePath = basePath + '/ServerFile.json'
            console.log('Путь к настройкам найден в кэше.', basePath)
            updateClient()
            updateServer()
        } catch (e) {
            console.log('Кэшированный путь к файлам устарел');
            console.log('Ищу путь к файлу настроек...');
            searchSettingsPath(mountPoint)
        }
    }, 1000)
}

const updateClient = async () => {
    try{    
        const clientJson = await readFile(clientFilePath, 'utf8')
        const clientFile = JSON.parse(clientJson) as TRoutes
        const isPending = clientFile.routes.length !== 0
        if(!isPending) {
            console.log('Новых маршрутов нет');
            return
        }
        else {
            try {
                await writeFile(pendingStorePath, JSON.stringify(clientFile.routes), 'utf8')
                await writeFile(clientFilePath, JSON.stringify({routes:[]}), 'utf8')
                console.log('Загружены новые маршруты');
            } catch (e){
                console.log('Ошибка записи clientFilePath', e);
            }
        }
        }
    catch(e){
        console.log('Ошибка чтения clientFilePath');
            
    }
}

const updateServer = async () => {
    try {
        const recordedJson = await readFile(recordedStorePath, 'utf8')
        const recorded = JSON.parse(recordedJson)
        if(recorded.length !== 0) {
            try {
                await writeFile(serverFilePath, JSON.stringify({routes:recorded}), {encoding:'utf8', flag:'a'})
                await writeFile(recordedStorePath, JSON.stringify([]), 'utf8')
                console.log('Сохраненные маршруты переданы приложению');
            }
            catch (e){console.log('Ошибка записи', e);
            }
        } else {console.log('Сохраненных маршрутов нет')}
    }
    catch (e){
        console.log('Ошибка чтения recordedStorePath', e);
    }
}
 
const searchSettingsPath = async (path: string) => {
    if(clientFilePath && serverFilePath) return

    const files = await readdir(path)
    files.forEach(async file => {
        if(file === 'ClientFile.json' || file === 'ServerFile.json') {
            clientFilePath = path + '/ClientFile.json'
            serverFilePath = path + '/ServerFile.json'
            await writeFile(cachePath, JSON.stringify({basePath:path}), 'utf8')
            console.log('Файлы найдены');
            updateClient()
            updateServer()
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
    // shell.exec(`fusermount -u ${mountPoint}`)
    clearInterval(pathTimer)
}


