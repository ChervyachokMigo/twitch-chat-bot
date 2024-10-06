const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());
const { TWITCH_CLIENT_ID } = require ('../../config.js');
const path = require('path');

const twitch_oautch_token_path = path.join('data', 'twitch_oauth_token.js');

const port = 3000;

let token = null;

const _save_token = (data) => {
	token = data.access_token;
	fs.writeFileSync(twitch_oautch_token_path, JSON.stringify(data));
};

module.exports = {
	init: async () => {
		if (fs.existsSync(twitch_oautch_token_path)) {
			console.log('Using cached token...');
			token = JSON.parse(fs.readFileSync(twitch_oautch_token_path)).access_token;
			return true;
		}

        console.log('Getting new OAuth token...');
		return new Promise((resolve, reject) => {
			
			app.listen(port, () => console.log('Token server started on port ' + port));

			app.on('error',(error) => {
				console.error(`Error: ${error.message}`)
				reject(error);
			});

			app.get('/', (req, res)  => {
				const parameters = {
					response_type: 'token',
					client_id: TWITCH_CLIENT_ID,
					redirect_uri: 'http://localhost:'+ port,
					scope: ['channel:manage:broadcast'].map( v => v.replace(/:/gui, '%3A')).join('+')
				}
				const url = `https://id.twitch.tv/oauth2/authorize?${Object.entries(parameters).map( v => v[0] + '=' + v[1]).join('&')}`;
				res.send(
					`<script>
						if (document.location.hash) {
							fetch('/token'+document.location.hash.replace('#','?'));
						}
					</script>
					<a href="${url}">Connect with Twitch</a>`);
			});

			app.get('/token', async (req, res) => {
				console.log(req.query)
				_save_token(req.query);
				res.send('Token saved');
			});

		});
	},

	get_token: () => {
		if (!token)
			throw new Error( 'No OAuth token available. Please run init() first.');
		return token;
	}
}