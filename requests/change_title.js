const { default: axios } = require("axios");
const { checkTokenExpires } = require("./auth");
const { TWITCH_CLIENT_ID } = require("../config");
const { get_token } = require("../twitchchat/tools/oauth_token");

module.exports = async (broadcaster_id, title) => {
	console.log('change_title');
    const token = get_token();
	
    const baseURL = 'https://api.twitch.tv';
    const url_path = `/helix/channels?broadcaster_id=${broadcaster_id}`;
	const headers = {
		'Accept': 'application/json',   
		'Client-ID': TWITCH_CLIENT_ID,
		'Authorization': `Bearer ${token}`
	}
	const data = { title };

	const res = await axios.patch(`${baseURL}${url_path}`, data, {headers});

	if (res && res.status === 200) {
		if (res.data) {
			return res.data;
		}
	} else {
		console.error(`error status ${res.status}`);
		return null;
	}
}