const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const { check_folder, log } = require('osu-md5-storage-archive');
const { find_beatmap_pps, GetGamemodeToInt } = require('../../DB/beatmaps');
const { irc_say } = require('../../twitchchat/tools/ircManager');
const { formatBeatmapInfoOsu } = require('../../twitchchat/tools/format_beatmap');
const { v2 } = require('osu-api-extended');
const { checkTokenExpires } = require('../../osu/requests');
const calculate_single_beatmap = require('../calculate_single_beatmap');
const { get_client_id, convert_ip_to_int } = require('./tools');
const { default: axios } = require('axios');
const { OSU_CLIENT_SECRET } = require('../../config');

const last_request_params_path = path.join(__dirname, '..', '..', 'data', 'osu_pps', 'last_request_params.json');
const web_users_path = path.join(__dirname, '..', '..', 'data', 'osu_pps', 'users');

const request_params_default = {
	acc: 99,
	pp_min: 300,
	pp_max: 350,
	gamemode: 0,
	bpm_min: 0,
	bpm_max: 1000,
	stream_min: 0,
	stream_max: 1000,
	mods_int: 0,
	osuname: 'BanchoBot',
};

let last_request_params = null;

//const host = '127.0.0.1';
const host = '0.0.0.0';

const start_webserver = (port, public_path = path.join(__dirname, 'public')) => {
	const app = express();

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	app.on('error', (e) => {
		if (e.code === 'EADDRINUSE') {
			console.error('Address in use, retrying...');
			rej('Address in use, retrying...');
		}
	});

	app.use(express.static( public_path ));

	app.listen(port, host,  () => {
		console.log(`http://${host}:${port}`);
	});

	return app;
}

const cache = {
	requests: []
}

module.exports = {
	init: async () => {

		check_folder(path.dirname(last_request_params_path));
		check_folder(web_users_path);

		if (!last_request_params) {
			if (existsSync(last_request_params_path)) {
				last_request_params = JSON.parse(readFileSync(last_request_params_path, { encoding: 'utf8'}));
			} else {
				last_request_params = request_params_default;
				writeFileSync(last_request_params_path, JSON.stringify(last_request_params));
			}
		}

		const web_app = start_webserver(80);

        //API POSTS

		web_app.get('/oauth', async (req, res) => {
            const request_data = req.query;
			if (!request_data.code){
				res.send({ error: 'Авторизация невозможна: Неполучен код' });
				return;
			}
			
			// const id = get_client_id(req);
			// console.log(convert_ip_to_int(id.ip));

			console.log('code', request_data.code)

			const url = 'https://osu.ppy.sh/oauth/token';
			const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            };
			const args = {
				client_id: 38746,
				client_secret: OSU_CLIENT_SECRET,
				code: request_data.code,
				grant_type: 'authorization_code',
				redirect_uri: 'https://svdgod.ru/oauth',
			}

			const auth_result = await axios.post(url, args, { headers });

			if (auth_result.status !== 200) {
				console.error('Авторизация невозможна:', auth_result.status, auth_result.data);
				res.redirect('https://svdgod.ru/?error=1');
                return;
			}

			const tokens = auth_result.data;

			console.log('web_app.get', tokens);

			const me_result = await axios.get('https://osu.ppy.sh/api/v2/me', { headers: {
				'Authorization': `Bearer ${tokens.access_token}`,
				'Accept': 'application/json',
                'Content-Type': 'application/json',
			}});

			if (me_result.status!== 200) {
                console.error('Ошибка получения информации о пользователе:', me_result.status, me_result.data);
				res.redirect('https://svdgod.ru/?error=2');
                return;
            }

			console.log({ id: me_result.data.id, name: me_result.data.username });

			const user_config_path = path.join(web_users_path, `${me_result.data.id}.json`);

			const client = get_client_id(req);
			console.log('user_config_path', user_config_path)
			if (!existsSync(user_config_path)) {
				const data = {
					id: me_result.data.id, 
					username: me_result.data.username,
					form_params: request_params_default,
					tokens,
					token_recieve: new Date().valueOf(),
					ip: convert_ip_to_int(client.ip),
				}

				console.log('save data', data);

				writeFileSync(user_config_path, JSON.stringify(data, null, 4), {encoding: 'utf8'});
			}

			res.redirect('https://svdgod.ru/');
		});

		web_app.post('/get_last_params',async (req, res) => {
			res.send(last_request_params);
		});

		web_app.post('/send_beatmap_to_osu',async (req, res) => {
			const request_data = req.body;

			const message_text = formatBeatmapInfoOsu({ username: 'localhost', beatmap: request_data.beatmap });

			irc_say(request_data.user, message_text);

			res.send({ result: 'beatmap sended' });
		});

		web_app.post('/recomend',async (req, res) => {
			const request_data = req.body;

			if (Object.keys(request_data).length === 0) {
				return res.status(400).send('Request data is empty');
			}

			if (JSON.stringify(request_data) !== JSON.stringify(last_request_params)) {
				last_request_params = request_data;
				writeFileSync(last_request_params_path, JSON.stringify(request_data));
			}

			const request_string = Object.entries(request_data).map( ([key, val]) => `${key}:${val}`).join(';');
			
			const idx = cache.requests.findIndex( v => v.params === request_string );

            if (idx > -1) {
				console.log('sended cached data for', request_string);
                res.send(cache.requests[idx].data);
				return;
            }

			const result = await find_beatmap_pps(request_data);
			cache.requests.push({ params: request_string, data: result });

			res.send( result );
		});

		web_app.post('/find_beatmap', async (req, res) => {
			let request_data = req.body;
			const url_parts = request_data.beatmap_url.match(/https:\/\/osu\.ppy\.sh\/beatmapsets\/([0-9]+)(\#([A-Za-z]+)\/([0-9]+)?)*/i );
	
			if (url_parts === null) {
				res.send({ error: `Ссылка не битмапсет` });
				return;
			}

			if (!url_parts[1] || !url_parts[3] || !url_parts[4]) {
				res.send({ error: `Cсылка неполная` });
				return;
			}

			request_data = {...request_data,	//mods_int, gamemode
				beatmapset_id: Number(url_parts[1]),
				gamemode: GetGamemodeToInt(url_parts[3]),
				beatmap_id: Number(url_parts[4])
			};
			
			const result = await find_beatmap_pps(request_data);

			if (result.length > 0) {
				res.send( result );
				return;
			}

			const calculated = await calculate_single_beatmap(request_data);

			if (calculated) {
				console.log('send calculated');
				const founded = await find_beatmap_pps(request_data);
				res.send(founded);
				return;
			} else {
				res.send({ error: 'Карта отсутствует, не удалось скалькулировать карту'});
				return;
			}
			
		});


		
	}
}
