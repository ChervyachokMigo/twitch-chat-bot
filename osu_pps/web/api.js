const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { find_beatmap_pps } = require('../../DB/beatmaps');
const { check_folder } = require('osu-md5-storage-archive');
const { writeFileSync, readFileSync, existsSync } = require('fs');

const last_request_params_path = path.join(__dirname, '..', '..', 'data', 'osu_pps', 'last_request_params.json');

let last_request_params = null;
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
};

module.exports = {
	init: async () => {

		check_folder(path.dirname(last_request_params_path));

		if (!last_request_params) {
			if (existsSync(last_request_params_path)) {
				last_request_params = JSON.parse(readFileSync(last_request_params_path, { encoding: 'utf8'}));
			} else {
				last_request_params = request_params_default;
				writeFileSync(last_request_params_path, JSON.stringify(last_request_params));
			}
		}

		return await new Promise( (res, rej) => {

			const app = express();

			app.get('/', (req, res) => {
				res.sendFile(path.join(__dirname, 'public', 'index.html'));
			});

			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({ extended: false }));

			app.use(express.static( path.join(__dirname, 'public') ));
			
			app.post('/get_last_params',async (req, res) => {
				res.send(last_request_params);
			});

			app.post('/send_beatmap_to_osu',async (req, res) => {
				const request_data = req.body;
				
				console.log('requested', request_data);

				res.send({ result: 'beatmap sended' });
			});

			app.post('/recomend',async (req, res) => {
				const request_data = req.body;

				//console.log('requested', request_data);

				//is not empty object check
				if (Object.keys(request_data).length === 0) {
                    return res.status(400).send('Request data is empty');
                }

				if (JSON.stringify(request_data) !== JSON.stringify(last_request_params)) {
                    last_request_params = request_data;
					writeFileSync(last_request_params_path, JSON.stringify(request_data));
                }

				const result = await find_beatmap_pps(request_data);

				res.send( result );
			});

			app.on('error', (e) => {
				if (e.code === 'EADDRINUSE') {
					console.error('Address in use, retrying...');
					rej('Address in use, retrying...');
				}
			});

			app.listen(3003, '0.0.0.0',  () => {
				console.log(`http://localhost:3003`);
				res(app);
			});
		});
	}
}
