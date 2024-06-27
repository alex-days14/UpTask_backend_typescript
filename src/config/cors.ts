import { CorsOptions } from 'cors'
import { WHITELIST } from '../server'

const corsOptions: CorsOptions = {
    origin: function(origin, callback){
        if(process.argv[2] == '--api'){
            WHITELIST.push(undefined)
        }
        if(WHITELIST.includes(origin)){
            callback(null, true)
        }else{
            console.log(`origin: ${origin} NOT ALLOWED`)
            callback(new Error('Error de CORS'))
        }
    }
}

export default corsOptions