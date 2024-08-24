const dashboard = require('dashboard_framework')

module.exports = async () => {
	console.log('Initializing dashboard...');

	const screen_name = 'twitch_chat';
	const port = 4488;

    await dashboard.run(port,4489);

	console.log('Dashboard is running on http://localhost:' + port );

    await dashboard.set_setting({ name: 'debug', value: false });
	await dashboard.set_setting({ name: 'fullscreen', value: false });
	await dashboard.set_setting({ name: 'mute', value: false });

    await dashboard.create_feed({feedname: 'last_message'});
    await dashboard.bind_screen_element({name: screen_name, element: 'last_message'});

    await dashboard.css_apply({selector: '.feed', prop: 'color', value: '#eee'});
	await dashboard.css_apply({selector: '.feed', prop: 'color', value: '#eee'});
}