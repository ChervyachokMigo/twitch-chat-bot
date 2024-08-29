const { default: axios } = require("axios");
const { checkTokenExpires } = require("./auth");
const { TWITCH_CLIENT_ID } = require("../config");

module.exports = async (username) => {
    const token = await checkTokenExpires();

    const baseURL = 'https://api.twitch.tv';
    const url_path = `/helix/users?login=${username}`;
	const headers = {
		'Accept': 'application/json',   
		'Client-ID': TWITCH_CLIENT_ID,
		'Authorization': `Bearer ${token.value}`
	}

	const res = await axios.get(`${baseURL}${url_path}`, {headers});

	if (res && res.status === 200) {
		if (res.data) {
			return res.data.data[0].id;
		}
	} else {
		console.error(`get_user_id error status ${res.status}`);
		return null;
	}
}