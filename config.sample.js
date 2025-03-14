module.exports = {
    OSU_LOGIN: '',
    OSU_PASSWORD: '',

    OSU_API_KEY: '',

	OSU_CLIENT_SECRET: '',

    DB_HOST: `localhost`, 
    DB_PORT: `3306`, 
    DB_USER: ``, 
    DB_PASSWORD: ``, 
    DB_TWITCHCHAT: 'twitchchat',
	DB_DISCORD: 'zxcbot',
	DB_BEATMAPS: 'osu_beatmaps',

    TWITCHCHAT_ROUTER_PORT: 7896,

    twitch_chat_token: '',

	//https://dev.twitch.tv/console
	TWITCH_CLIENT_ID: '',
	TWITCH_CLIENT_SECRET: '',

    osu_irc_args: ['irc.ppy.sh', 6667, '', ''],

	//https://yandex.cloud/ru/docs/iam/operations/iam-token/create#api_1
	yandex_oauth_token: '',
		
	//https://console.yandex.cloud/folders/<идентификатор_каталога>
	yandex_folders_id: ''
}

// to get token
//https://id.twitch.tv/oauth2/authorize?client_id=<client_id>&redirect_uri=http://localhost:3000&response_type=token&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls
//https://id.twitch.tv/oauth2/token?client_id=<client_id>&redirect_uri=http://localhost:3000&client_secret=<client_secret>&code=<code>&grant_type=authorization_code