const { default: axios } = require("axios");
const { checkTokenExpires } = require("./auth");
const { TWITCH_CLIENT_ID } = require("../config");
const { get_token } = require("../twitchchat/tools/oauth_token");

module.exports = async ({ id, name, igdb_id }) => {

    const token = get_token();

	let param = '';
	if (id)
        param = `id=${encodeURIComponent(id)}`;
	if (name)
		param = `name=${encodeURIComponent(name)}`;
	if (igdb_id)
        param = `igdb_id=${encodeURIComponent(igdb_id)}`;

	console.log(
		`Searching game by ${param}...`
	);

    const baseURL = 'https://api.twitch.tv';
    const url_path = `/helix/games?${param}`;
	const headers = {
		'Accept': 'application/json',   
		'Client-ID': TWITCH_CLIENT_ID,
		'Authorization': `Bearer ${token}`
	};

	const res = await axios.get( `${baseURL}${url_path}`, {headers});

	if (res && res.status === 200) {
		if (res.data && res.data.data) {
			return res.data.data;
		} else {
			return [];
		}
	} else {
		console.error(`error status ${res.status}`);
		return null;
	}
}