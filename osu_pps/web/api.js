const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { find_beatmap_pps } = require('../../DB/beatmaps');

module.exports = {
	init: async () => {
		return await new Promise( (res, rej) => {

			const app = express();

			app.get('/', (req, res) => {
				res.sendFile(path.join(__dirname, 'public', 'index.html'));
			});

			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({ extended: false }));

			app.use(express.static( path.join(__dirname, 'public') ));
			
			app.post('/recomend',async (req, res) => {
				const request_data = req.body;
				
				console.log('request recieved', request_data);
				const result = await find_beatmap_pps(request_data);

				
				res.send( result );
			});

			app.on('error', (e) => {
				if (e.code === 'EADDRINUSE') {
					console.error('Address in use, retrying...');
					rej('Address in use, retrying...');
				}
			});

			app.listen(3003, () => {
				console.log(`http://localhost:3003`);
				res(app);
			});
		});
	}
}
