const { default: axios } = require('axios');
const { existsSync, writeFileSync, readFileSync } = require('fs');
const path = require('path');

const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = require ('../config.js');
const twitch_token_path = path.join('data', 'twitch_token.json');

let twitch_token = {}

const getTwitchToken = async () => {
    const token_url = `https://id.twitch.tv/oauth2/token`;

    return await new Promise( async (res, rej) => {
        axios.post(
            token_url, {
                client_id: TWITCH_CLIENT_ID,
                client_secret: TWITCH_CLIENT_SECRET,
                grant_type:'client_credentials'
            }, { headers: { 'Accept': 'application/json' }})
        .then(function (response) {
			console.log(response.data)
            console.log('Логин на твич совершен');
            res(response.data);
        }).catch(function (error) {
            rej(error.code);
        });
    });
}

const initTwitch = async () => {
    console.log('Получение нового твич токена');
    try{
        const token = await getTwitchToken();

		twitch_token = {
			value: token.access_token,
			type: token.token_type,
			getdate: Math.trunc(new Date().valueOf()/1000),
			expires: token.expires_in
		}

		writeFileSync(twitch_token_path, JSON.stringify(twitch_token), {encoding: 'utf8'});

		return true;

    } catch (e){
        console.error('initTwitch', e)
        return false
    }
}

module.exports = {
	checkTokenExpires : async () => {
		let endtime = 0;
		const now = (new Date().valueOf()-60)/1000;

		if (typeof twitch_token.value === 'undefined'){
			if ( existsSync(twitch_token_path) ){
				console.log('Использование старого твич токена');
				twitch_token = JSON.parse( readFileSync(twitch_token_path, { encoding: 'utf8' }));
			} else {
				if ((await initTwitch()) === false ) {
					console.log('init twitch failed');
					return false;
				}
			}
		}

		endtime = twitch_token.getdate + twitch_token.expires;
		
		if ( endtime < now ){
			if((await initTwitch()) === false){
				console.log('init twitch failed');
				return false;
			}
		}
		
		return twitch_token;
	}

} 
