const { DataTypes } = require('@sequelize/core');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_BEATMAPS, DB_NAME_TWITCHCHAT } = require("../config.js");
const { prepareDB, prepareEND, add_model_names } = require('mysql-tools');

module.exports = {

    prepareDB: async () => {
        const connections = await prepareDB({ DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASES: [DB_NAME_TWITCHCHAT, DB_NAME_BEATMAPS] });

		const twitchchat_connection = connections[0];
		const osu_beatmaps_connections = connections[1];
				
		const beatmaps_md5 = osu_beatmaps_connections.define ('beatmaps_md5', {
			id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, unique: true, index: true },
			hash: {type: DataTypes.STRING(32), allowNull: false, unique: true, index: true},
		});

		const osu_beatmap_pp = osu_beatmaps_connections.define ('osu_beatmap_pp', {
			md5: {type: DataTypes.INTEGER, allowNull: false, unique: 'action_key'},
			mods: {type: DataTypes.INTEGER, allowNull: false, unique: 'action_key'},
			accuracy: {type: DataTypes.INTEGER,  defaultvalue: 100, allowNull: false, unique: 'action_key'},
			pp_total: {type: DataTypes.INTEGER, allowNull: false},
			pp_aim: {type: DataTypes.INTEGER, allowNull: false},
			pp_speed: {type: DataTypes.INTEGER, allowNull: false},
			pp_accuracy: {type: DataTypes.INTEGER, allowNull: false},
			stars: {type: DataTypes.FLOAT, allowNull: false},
			diff_aim: {type: DataTypes.FLOAT, allowNull: false},
			diff_speed: {type: DataTypes.FLOAT, allowNull: false},
			diff_sliders: {type: DataTypes.FLOAT, allowNull: false},
			speed_notes: {type: DataTypes.INTEGER, allowNull: false},
			AR: {type: DataTypes.FLOAT, allowNull: false},
			OD: {type: DataTypes.FLOAT, allowNull: false},
		}, {noPrimaryKey: false});

		const beatmap_id = osu_beatmaps_connections.define ('beatmap_id', {
			md5: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
			beatmap_id: {type: DataTypes.INTEGER, allowNull: false},
			beatmapset_id: {type: DataTypes.INTEGER, allowNull: false},
			gamemode: {type: DataTypes.TINYINT.UNSIGNED, allowNull: false},
			ranked: {type: DataTypes.TINYINT, allowNull: false},
		}, {noPrimaryKey: false});

		const beatmap_info = osu_beatmaps_connections.define ('beatmap_info', {
			md5: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
			artist: {type: DataTypes.STRING, allowNull: false},
			title: {type: DataTypes.STRING, allowNull: false},
			creator: {type: DataTypes.STRING, allowNull: false},
			difficulty: {type: DataTypes.STRING, allowNull: false},
		}, {noPrimaryKey: false});

		const beatmap_star = osu_beatmaps_connections.define ('beatmap_star', {
			md5: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
			local: {type: DataTypes.FLOAT, allowNull: false},
			lazer: {type: DataTypes.FLOAT, allowNull: false},
		}, {noPrimaryKey: false});


		beatmaps_md5.hasOne(beatmap_id, {foreignKey: 'md5',  foreignKeyConstraints: false});
		beatmaps_md5.hasOne(beatmap_info, {foreignKey: 'md5',  foreignKeyConstraints: false});
		beatmaps_md5.hasOne(beatmap_star, {foreignKey: 'md5',  foreignKeyConstraints: false});

		beatmap_id.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});
		beatmap_id.hasOne(beatmap_star, { foreignKey: 'md5', foreignKeyConstraints: false});

		beatmap_info.hasOne(beatmap_star, { foreignKey: 'md5', foreignKeyConstraints: false});

		beatmaps_md5.hasMany(osu_beatmap_pp, { foreignKey: 'md5',  foreignKeyConstraints: false});
		beatmap_id.hasMany(osu_beatmap_pp, { foreignKey: 'md5',  foreignKeyConstraints: false});
		beatmap_info.hasMany(osu_beatmap_pp, { foreignKey: 'md5',  foreignKeyConstraints: false});


		const Token = twitchchat_connection.define ('token', {
			value: {type: DataTypes.TEXT, allowNull: false},
			platform: {type: DataTypes.STRING, allowNull: false},
			getdate: {type: DataTypes.INTEGER, allowNull: false},
			expires: {type: DataTypes.INTEGER, allowNull: false},
			type: {type: DataTypes.STRING, allowNull: false},
		});

		const TwitchChatData = twitchchat_connection.define ('twitchchat', {
			username: {type: DataTypes.STRING, allowNull: false},
			tracking: {type: DataTypes.BOOLEAN, allowNull: false},
		});

		const twitchchat_ignores = twitchchat_connection.define ('twitchchat_ignores', {
			channelname: {type: DataTypes.STRING, allowNull: false}
		});

		const twitchchat_enabled = twitchchat_connection.define ('twitchchat_enabled', {
			channelname: {type: DataTypes.STRING, allowNull: false}
		});

		const twitchchat_sended_notify = twitchchat_connection.define ('twitchchat_sended_notify', {
			channelname: {type: DataTypes.STRING, allowNull: false}
		});

		const twitch_osu_binds = twitchchat_connection.define ('twitch_osu_binds', {
			twitch_id: {type: DataTypes.STRING, allowNull: false},
			twitch_name: {type: DataTypes.STRING, allowNull: false},
			osu_id: {type: DataTypes.INTEGER, allowNull: false},
			osu_name: {type: DataTypes.STRING, allowNull: false}
		});

		const twitch_banned = twitchchat_connection.define ('twitch_banned', {
			channelname: {type: DataTypes.STRING, allowNull: false}
		});

		const command_aliases = twitchchat_connection.define ('command_aliases', {
			id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true},
			name: {type: DataTypes.STRING, allowNull: false}
		});

		const custom_commands = twitchchat_connection.define ('custom_commands', {
			name: {type: DataTypes.STRING, allowNull: false, unique: true},
			channelname: {type: DataTypes.STRING, allowNull: false},
			text: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
			perm: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
		});

		custom_commands.hasMany(command_aliases, {foreignKey: 'command_id',  foreignKeyConstraints: false});

		add_model_names({ names: 'token', model: Token });
		add_model_names({ names: 'twitchchat', model: TwitchChatData });
		add_model_names({ names: 'twitchchat_ignores', model: twitchchat_ignores });
		add_model_names({ names: 'twitchchat_enabled', model: twitchchat_enabled });
		add_model_names({ names: 'twitchchat_sended_notify', model: twitchchat_sended_notify });
		add_model_names({ names: 'twitch_osu_binds', model: twitch_osu_binds });
		add_model_names({ names: 'twitch_banned', model: twitch_banned });
		add_model_names({ names: 'beatmaps_md5', model: beatmaps_md5 });
		add_model_names({ names: 'osu_beatmap_pp', model: osu_beatmap_pp });
		add_model_names({ names: 'beatmap_id', model: beatmap_id });
		add_model_names({ names: 'beatmap_info', model: beatmap_info });
		add_model_names({ names: 'beatmap_star', model: beatmap_star });
		add_model_names({ names: 'command_aliases', model: command_aliases });
		add_model_names({ names: 'custom_commands', model: custom_commands });

        await prepareEND();
    },
}