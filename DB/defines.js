const { createConnection } = require('mysql2/promise');
const { Sequelize, DataTypes } = require('@sequelize/core');
const log  = require("../tools/log.js");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_NAME_BEATMAPS, DB_NAME_TWITCHCHAT } = require("../config.js");

const mysql = new Sequelize( DB_NAME, DB_USER, DB_PASSWORD, { 
    dialect: `mysql`,
	host: DB_HOST,
	port: DB_PORT, 
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
	logging: false,
});

const osu_beatmaps_mysql = new Sequelize( DB_NAME_BEATMAPS, DB_USER, DB_PASSWORD, { 
    dialect: `mysql`,
	host: DB_HOST,
	port: DB_PORT, 
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
	logging: false,
});

const beatmaps_md5 = osu_beatmaps_mysql.define ('beatmaps_md5', {
    hash: {type: DataTypes.STRING(32),  defaultvalue: '', allowNull: false, unique: true, index: true},
});

const osu_beatmap_pp = osu_beatmaps_mysql.define ('osu_beatmap_pp', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: 'action_key'},
    mods: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: 'action_key'},
    accuracy: {type: DataTypes.INTEGER,  defaultvalue: 100, allowNull: false, unique: 'action_key'},
    pp_total: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    pp_aim: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    pp_speed: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    pp_accuracy: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    stars: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    diff_aim: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    diff_speed: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    diff_sliders: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    speed_notes: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    AR: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    OD: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
});

const beatmap_id = osu_beatmaps_mysql.define ('beatmap_id', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: true, primaryKey: true},
    beatmap_id: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    beatmapset_id: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    gamemode: {type: DataTypes.TINYINT.UNSIGNED,  defaultvalue: '', allowNull: false},
    ranked: {type: DataTypes.TINYINT,  defaultvalue: 0, allowNull: false},
});

const beatmap_info = osu_beatmaps_mysql.define ('beatmap_info', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: true, primaryKey: true},
    artist: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    title: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    creator: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    difficulty: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
});

const beatmap_star = osu_beatmaps_mysql.define ('beatmap_star', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: true, primaryKey: true},
    local: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
    lazer: {type: DataTypes.FLOAT,  defaultvalue: 0, allowNull: false},
});

beatmaps_md5.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});
beatmap_id.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});
beatmap_info.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});

beatmaps_md5.hasOne(beatmap_id, {foreignKey: 'md5',  foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_info, {foreignKey: 'md5',  foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_star, {foreignKey: 'md5',  foreignKeyConstraints: false});


const Token = mysql.define ('token', {
    value: {type: DataTypes.TEXT,  defaultvalue: '', allowNull: false},
    platform: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    getdate: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    expires: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    type: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
});

const TwitchChatData = mysql.define ('twitchchat', {
    username: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    tracking: {type: DataTypes.BOOLEAN,  defaultvalue: true, allowNull: false},
});

const twitchchat_ignores = mysql.define ('twitchchat_ignores', {
    channelname: {type: DataTypes.STRING, allowNull: false}
});

const twitchchat_enabled = mysql.define ('twitchchat_enabled', {
    channelname: {type: DataTypes.STRING, allowNull: false}
});

const twitchchat_sended_notify = mysql.define ('twitchchat_sended_notify', {
    channelname: {type: DataTypes.STRING, allowNull: false}
});

const twitch_osu_binds = mysql.define ('twitch_osu_binds', {
    twitch_id: {type: DataTypes.STRING, allowNull: false},
    twitch_name: {type: DataTypes.STRING, allowNull: false},
    osu_id: {type: DataTypes.INTEGER, allowNull: false},
    osu_name: {type: DataTypes.STRING, allowNull: false}
});

const twitch_banned = mysql.define ('twitch_banned', {
    channelname: {type: DataTypes.STRING, allowNull: false}
});

const twitchchat = new Sequelize( DB_NAME_TWITCHCHAT, DB_USER, DB_PASSWORD, { 
    dialect: `mysql`,
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
});


const command_aliases = twitchchat.define ('command_aliases', {
    id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false}
});

const custom_commands = twitchchat.define ('custom_commands', {
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
    channelname: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.STRING, allowNull: false, defaultValue: ''},
    perm: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
});

custom_commands.hasMany(command_aliases, {foreignKey: 'command_id',  foreignKeyConstraints: false});

const mysql_actions = [
    { names: 'token', model: Token },
    { names: 'twitchchat', model: TwitchChatData },
    { names: 'twitchchat_ignores', model: twitchchat_ignores },
    { names: 'twitchchat_enabled', model: twitchchat_enabled },
    { names: 'twitchchat_sended_notify', model: twitchchat_sended_notify },
    { names: 'twitch_osu_binds', model: twitch_osu_binds },
    { names: 'twitch_banned', model: twitch_banned },
    { names: 'beatmaps_md5', model: beatmaps_md5 },
    { names: 'osu_beatmap_pp', model: osu_beatmap_pp },
    { names: 'beatmap_id', model: beatmap_id },
    { names: 'beatmap_info', model: beatmap_info },
    { names: 'beatmap_star', model: beatmap_star },
    { names: 'command_aliases', model: command_aliases },
    { names: 'custom_commands', model: custom_commands },
];



module.exports = {
	mysql_actions, 
    prepareDB: async () => {
        log('Подготовка баз данных', 'База данных');
        try {
            const connection = await createConnection(`mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_BEATMAPS}\`;`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_TWITCHCHAT}\`;`);
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error('Нет доступа к базе');
            } else {
                throw new Error(`ошибка базы: ${e}`);
            }
        }
        await osu_beatmaps_mysql.sync()
        await mysql.sync()
        await twitchchat.sync()

        log(`Подготовка завершена`, 'База данных')
    },

    select_mysql_model: (action) => {

        const MysqlModel = mysql_actions.find ( model => {
            if (typeof model.names === 'string'){
                return model.names === action;
            } else if (typeof model.names === 'object') {
                return model.names.findIndex( val => val === action) > -1;
            } else {
                return undefined;
            }
        });
    
        if (!MysqlModel){
            console.error(`DB: (selectMysqlModel) undefined action: ${action}`);
            throw new Error('unknown mysql model', action);
        }
    
        return MysqlModel.model;
    },

    osu_beatmaps_mysql
}