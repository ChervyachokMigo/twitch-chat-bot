const dashboard = require('dashboard_framework');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const list_path = path.join('data', 'watching_users.json');

let old_list = null;

const users_watching = [];


module.exports = {
	init: () => {
		old_list = existsSync(list_path)? JSON.parse(readFileSync(list_path, { encoding: 'utf8' })) : [];
	},
	
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
	},

	get_list: () => users_watching,

	save_list: () => {
		
		let is_changed = false;
		for (let item of users_watching) {
			const idx = old_list.findIndex( v => v.username === item.username );
            if (idx > -1) {
				const diff = parseInt(item.value)- parseInt(old_list[idx].value);
				if (diff > 0) {
					old_list[idx].value = parseInt(old_list[idx].value) + diff;
					is_changed = true;
				}
            } else {
				old_list.push({ username: item.username, value: parseInt(item.value) });
				is_changed = true;
			}
		}

		if (is_changed) {
			writeFileSync(list_path, JSON.stringify(old_list));
			//console.log('Saved watching users list');
		}

	}

}