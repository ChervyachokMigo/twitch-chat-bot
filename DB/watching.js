const dashboard = require('dashboard_framework');

const users_watching = [];

module.exports = {
	
	join: async ( username ) => {
		let i = users_watching.findIndex( v => v.username === username);
		if (i === -1) {
            i = users_watching.push({ username, value: 0 }) - 1;
			await dashboard.add_sorted({ name: username, value: 0 });
			await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'font-size', value: '24px'});
			await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'flex-direction', value: 'row'});
			await dashboard.css_apply({selector: `.sorted > #${username} > .item_name`, prop: 'padding-right', value: '8px'});
			
        }
		await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'display', value: 'flex'});
		await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'color', value: 'white'});
		const update = async () => {
			users_watching[i].value++;
			await dashboard.change_sorted({ name: username, value: users_watching[i].value });
		};
		users_watching[i].update_interval = setInterval(update, 1000);

	},

	leave: async ( username ) => {
		let i = users_watching.findIndex( v => v.username === username);
        if (i !== -1) {
            clearInterval(users_watching[i].update_interval);
			console.log(`.sorted > #${username}`)
			await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'color', value: '#999'});
			await dashboard.css_apply({selector: `.sorted > #${username}`, prop: 'display', value: 'none'});
        } else {
			console.error(`leave: user ${username} is not exists`);
		}
	}
}