const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

module.exports = {
	init: async () => {
		return await new Promise( (res, rej) => {

			const app = express();

			app.get('/', (req, res) => {
				res.send(path.join(__dirname, 'public', 'index.html'));
			});

			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({ extended: false }));

			app.use(express.static( path.join(__dirname, 'public') ));
			
			app.post('/recomend',(req, res) => {
				const request_data = req.body;
				
				//do somethinf

				res.send( true );
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
