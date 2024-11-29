const dashboard = require('dashboard_framework');

const users_watching = [];

module.exports = {
	
	join: async ( username ) => {
		let i = users_watching.findIndex( v => v.username === username);
		if (i === -1) {
            i = users_watching.push({ username, value: 0 }) - 1;
			await dashboard.add_sorted({ name: username, value: 0 });
        }
		const update = async () => {
			users_watching[i].value++;
			await dashboard.change_sorted({ name: username, value: users_watching[i].value });
		};
		users_watching[i].update_interval = setInterval(update, 1000);
	},

	leave: ( username ) => {
		let i = users_watching.findIndex( v => v.username === username);
        if (i !== -1) {
            clearInterval(users_watching[i].update_interval);
        } else {
			console.error(`leave: user ${username} is not exists`);
		}
	}
}