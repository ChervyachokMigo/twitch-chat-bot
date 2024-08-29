const { select_mysql_model } = require("mysql-tools");
const { MYSQL_GET_ALL, MYSQL_GET_ONE, MYSQL_DELETE, MYSQL_SAVE } = require("mysql-tools");
const get_user_id = require("../requests/get_user_id");

let users_cache = []; 

const get_user_stats = (user, condition = 'userid') => {
	const founded = users_cache.find( v => v[condition] === user[condition]);
	if (!founded) {
		const new_user = { ...user, messagescount: 0, charscount: 0, joinscount: 0 };
		users_cache.push(new_user);
		return new_user;
	}
	return founded;
}

const update_cache_values = (values) => {
	const idx = users_cache.findIndex( v => v.userid === values.userid );
	users_cache[idx] = { ...users_cache[idx], ...values };
}

const mysql_action = 'user_stats';

module.exports = {
	init_user_stats : async () => {
		console.log('Init user stats');
		users_cache = await MYSQL_GET_ALL({action: mysql_action});
	},

	calc_message: async (user, {text}) => {
		const user_from_cache = get_user_stats(user);
		const charscount = user_from_cache.charscount + text.length;
		const messagescount = user_from_cache.messagescount + 1;
		const values = {...user_from_cache, messagescount, charscount};
		update_cache_values(values);
		await MYSQL_SAVE(mysql_action, {...user_from_cache, messagescount, charscount}, false);
	},

	inc_joins: async (username) => {
		const user_from_cache = get_user_stats({ userid: '0', username, usercolor: '#FFFFFF' }, 'username');
		if (user_from_cache.userid === '0') {
			console.log('User not found in cache:', username);
			user_from_cache.userid = await get_user_id(username);
		}
		const joinscount = user_from_cache.joinscount + 1;
		const values = {...user_from_cache, joinscount};
		update_cache_values(values);
		await MYSQL_SAVE(mysql_action, {...user_from_cache, joinscount}, false);
	}
}