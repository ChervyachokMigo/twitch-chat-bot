const { default: axios } = require("axios");
const { writeFileSync, existsSync, readFileSync } = require("fs");
const path = require("path");

const { yandex_oauth_token } = require("../config");

const token_path = path.join('data', 'yandex_token.json');

let token = null;

const save_iam_token = ( token_data ) => {
	writeFileSync( token_path, JSON.stringify( token_data ), { encoding: 'utf8' });
}

const get_old_iam_token = () => {
	console.log('Trying to load old IAM token from', token_path, '...');
	return JSON.parse( readFileSync(token_path, { encoding: 'utf8'}));
}

const get_new_iam_token = async () => {
	console.log( 'Getting new IAM token...' );
	const url = "https://iam.api.cloud.yandex.net/iam/v1/tokens";
	const data = { "yandexPassportOauthToken": yandex_oauth_token };
	const res = await axios.post(url, data);
	if (res && res.status === 200) {
		if (res.data) {
			save_iam_token ( res.data );
			return res.data;
		}
	}
}

module.exports = {
	init: async () => {
		console.log( 'Initializing IAM token...' );
		const now = new Date();
		if ( existsSync( token_path )) {
			if ( !token ) {
				token = get_old_iam_token();
			}
			if ( new Date(token.expiresAt) < now ) {
				token = await get_new_iam_token();
			}
		} else {
			token = await get_new_iam_token();
		}
		console.log( 'IAM token initialized.' );
	},

	get_iam_token: async () => {
		const now = new Date();
		if ( new Date(token.expiresAt) < now ) {
			token = await get_new_iam_token();
		}
		return token.iamToken;
	}
}