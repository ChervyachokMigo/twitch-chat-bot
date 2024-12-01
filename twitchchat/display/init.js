const dashboard = require('dashboard_framework');

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
	await dashboard.css_apply({selector: '.feed', prop: 'text-shadow', value: '1px 1px 2px black'});

	await dashboard.css_apply({selector: '.sorted', prop: 'display', value: 'flex'});
	await dashboard.css_apply({selector: '.sorted', prop: 'align-items', value: 'flex-end'});
	await dashboard.css_apply({selector: '.sorted', prop: 'margin-right', value: '20px'});
	await dashboard.css_apply({selector: '.sorted', prop: 'flex-direction', value: 'column'});
	await dashboard.css_apply({selector: '.sorted', prop: 'margin-top', value: '300px'});
	await dashboard.css_apply({selector: '.sorted', prop: 'text-shadow', value: ' 2px 2px 2px black' });

}