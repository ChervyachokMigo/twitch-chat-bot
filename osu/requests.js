const { auth } = require ('osu-api-extended');

const log = require('../tools/log');
const { MYSQL_GET_ONE, MYSQL_SAVE } = require('mysql-tools');

let tokens = {
    osu: {}
}

async function initOsu(){     
    const mysql_token = await MYSQL_GET_ONE('token', {platform: 'osu'});

    if (mysql_token !== null){
        var nowdate = Math.trunc(new Date().valueOf()/1000);

        if (nowdate - mysql_token.getdate > mysql_token.expires){
            return await relogin_osu();
        } else {
            log('Установлен старый осу токен', 'Osu token')
            auth.set_v2(mysql_token.value);
            tokens.osu = {
                value: mysql_token.value,
                type: 'oauth',
                getdate: mysql_token.getdate,
                expires: mysql_token.expires
            };
            return true
        }
    } else {
        return await relogin_osu();
    }

    async function relogin_osu(){
        log('Получение Осу токена');        
        var token = await auth.login_lazer(OSU_LOGIN, OSU_PASSWORD);
        log('Установлен новый Осу токен'); 
        tokens.osu = {
            value: token.access_token,
            type: 'oauth',
            getdate: Math.trunc(new Date().valueOf()/1000),
            expires: token.expires_in
        };
        await MYSQL_SAVE('token', {
			platform: 'osu',
			...tokens.osu
		});
        return token && token.access_token && token.expires_in?true:false;
    }
}


async function checkTokenExpires(platform){
    var endtime = 0;
    switch(platform){
        case 'osu': 
            if (typeof tokens.osu.value === 'undefined'){
                if (await initOsu() == false){
                    log('osu token failed', 'osu token')
                    return false
                }
            }
            endtime = tokens.osu.getdate + tokens.osu.expires;
            if (endtime < (new Date().valueOf()-60)/1000){
                if (await initOsu() == false){
                    log('osu token failed', 'osu token')
                    return false
                }
                return true
            } else {
                return true
            }
        break;
        default:
            throw new Error('token: undefined platform')
    }
}

module.exports = {
    checkTokenExpires,

}