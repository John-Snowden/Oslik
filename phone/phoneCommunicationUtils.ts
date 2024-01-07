import { writeFileSync, readdirSync, readFileSync, statSync, existsSync} from 'fs';
import shell from 'shelljs'

import { TSettings } from './types'

let settingPathTimer: NodeJS.Timeout
let settingsTimer: NodeJS.Timeout

let isSafeRemove = false

const mountPoint = '/home/orangepi/Desktop/Oslik/media'
let clientSettingsPath = ''
let isStopSearchingPath = false
const cachedSettingsPath = './phone/cachedSettingsPath.json'
let clientSettings: TSettings | null = null

export const onAttachDevice = () => {
    console.log('Найден Android');
    shell.exec(`aft-mtp-mount /home/orangepi/Desktop/Oslik/media/`)
    settingPathTimer = setInterval(()=>{
        if(isStopSearchingPath) return
            getSettingsPath()
    },1000)

 
    settingsTimer = setInterval(async () => {        
        if(!clientSettingsPath) {
            console.log("Файл настроек не найден");
            return;
        }
        else { 
            let data: null | TSettings = null 
            try {
                const json = readFileSync(clientSettingsPath, 'utf-8')
                try {
                    const parsed = JSON.parse(json)
                    data = parsed
                }
                catch(e) {console.log('Не смог распарсить настройки',e)}
            } 
            catch (e) {console.log('Не смог прочитать настройки',e)}  
            
            clientSettings = data as TSettings
            if (!clientSettings || isSafeRemove) return
            console.log('Слушаю настройки ', clientSettings);


            if (clientSettings.isSafeRemove) {
                isSafeRemove = true
                return
            }

            if (clientSettings.pendingRoutes.length!==0) {
                writeFileSync('./phone/pendingRoutes.json', JSON.stringify(clientSettings.pendingRoutes))
                clientSettings.pendingRoutes = []
            }

            const recordedRoutes =  JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
            if (recordedRoutes.length!==0) {
                clientSettings.recordedRoutes = recordedRoutes
                writeFileSync('./phone/recordedRoutes.json', JSON.stringify([]))
            }

            clientSettings.isConnected=true
            console.log('Пишу настройки',clientSettings);
            
            writeFileSync(clientSettingsPath, JSON.stringify(clientSettings))
        
        }
    }, 1000);
}

const getSettingsPath = () => {
    try {
        const files = readdirSync(mountPoint)
        if (files.length !== 0) {
            console.log("Ищу путь к файлу настроек...");
            isStopSearchingPath = true
            const cached = JSON.parse(readFileSync(cachedSettingsPath, 'utf8'))
            
            if(cached.path){
                const isCachedValid = existsSync(cached.path)
                if(!isCachedValid) {
                    console.log('Кэшированный путь к файлу устарел');
                    writeFileSync(cachedSettingsPath, JSON.stringify({path:''}))
                    isStopSearchingPath = false
                }
                else {
                    clientSettingsPath = cached.path
                    console.log('Путь к настройкам найден в кэше. ', clientSettingsPath)
                }
            }
            else {
                console.log('Поиск пути к файлу настроек...');
                searchSettingsPath(mountPoint)
            }
        }
        else console.log('Oslik НЕ ВИДИТ файловую систему телефона');
    }
    catch(e){
        console.log('Ошибка поиска настроек',e)
    }    
}  

export const searchSettingsPath = (path: string) => {
    console.log('Ищу...')

    if(clientSettingsPath) {
        console.log("Путь к настройкам уже найден, выхожу из поиска.", clientSettingsPath);
        return
    }

    const files = readdirSync(path)
    if(files.includes('OslikHodovaya.json')) {
        clientSettingsPath = path + '/OslikHodovaya.json'
        writeFileSync(cachedSettingsPath, JSON.stringify({path:clientSettingsPath}))
    }
    else files.forEach(file=>{
        console.log('Файл настроек не найден.')
        if(statSync(path + '/' + file).isDirectory()){ 
            searchSettingsPath(path + '/' + file)
            }
        }
    )
}

 export const onDetachDevice = () => {
    console.log('Телефон отключен');
    isStopSearchingPath = false
    isSafeRemove = false
    clientSettingsPath = ''
    clientSettings = null
    shell.exec('fusermount -u /home/orangepi/Desktop/Oslik/media/')
    clearInterval(settingPathTimer)
    clearInterval(settingsTimer)
}


