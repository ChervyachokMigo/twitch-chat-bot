
const { Op } = require("@sequelize/core");
const { select_mysql_model, get_connection } = require("mysql-tools");

const { DB_BEATMAPS } = require("../config");
const { Gamemode, RankedStatus, ModsTextToInt } = require("osu-tools");

const GetGamemodeToInt = (mode) => {
    switch (mode) {
        case 'osu':
        case 'std': 
            return 0;
        case 'taiko':
            return 1;
        case 'catch':
        case 'fruits':
        case 'ctb':
            return 2;
        case 'mania':
            return 3;
        default:
            return null;
    }
}

const Gamemodes = ['osu', 'taiko', 'fruits', 'mania'];

let beatmaps_md5_cache = null;

const init_md5_cache = async () => {
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');
    beatmaps_md5_cache = await beatmaps_md5.findAll({ raw: true });
}

const get_beatmap_id = async ({ md5 }) => {
	const osu_beatmap_id = select_mysql_model('beatmap_id');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await osu_beatmap_id.findOne({
        
        include: [{ model: beatmaps_md5, 
            where: { hash: md5 }
        }],

        
        fieldMap: {
            'beatmaps_md5.hash': 'md5',
            'beatmaps_md5.id': 'md5_int',
        },

        raw: true, 
    });
}

const get_beatmap_params_id = async ( id ) => {
	const beatmap_params = select_mysql_model('beatmap_params');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await beatmap_params.findOne({
        
        include: [{ model: beatmaps_md5, 
            where: { id: id }
        }],

        
        fieldMap: {
            'beatmaps_md5.hash': 'md5',
            'beatmaps_md5.id': 'md5_int',
        },

        raw: true, 
    });
}

const get_beatmap_pps_by_id = async ({ 
	beatmap_id, 
	beatmapset_id, 
	gamemode = Gamemode.osu, 
	mods = ModsTextToInt(['No Mods']), 
	ranked = RankedStatus.ranked  
}) => {
    if (typeof beatmap_id !== 'number' && typeof beatmapset_id !== 'number' && 
    beatmap_id > 0 && beatmapset_id > 0 ){
        return null;
    }

    const osu_beatmap_id = select_mysql_model('beatmap_id');
	const osu_beatmap_pp = select_mysql_model('osu_beatmap_pp');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');
	const osu_beatmap_info = select_mysql_model('beatmap_info');

    return await osu_beatmap_pp.findAll({
        where: { mods },

        include: [beatmaps_md5, 
            { model: osu_beatmap_id, where: { beatmap_id, beatmapset_id, gamemode, ranked } },
            osu_beatmap_info
        ],

        
        fieldMap: {
            'beatmaps_md5.hash': 'md5',

            'beatmaps_md5.id': 'md5_int',
            'beatmap_id.md5': 'md5_int',
            'beatmap_info.md5': 'md5_int',

            'beatmap_id.beatmap_id': 'beatmap_id',
            'beatmap_id.beatmapset_id': 'beatmapset_id',
            'beatmap_id.gamemode': 'gamemode',
            'beatmap_id.ranked': 'ranked',

            'beatmap_info.artist': 'artist',
            'beatmap_info.title': 'title',
            'beatmap_info.creator': 'creator',
            'beatmap_info.difficulty': 'difficulty',
        },

        raw: true, 
    });
}

const find_beatmap_pps = async (args) => {
	const osu_beatmap_id = select_mysql_model('beatmap_id');
	const osu_beatmap_pp = select_mysql_model('osu_beatmap_pp');
	const taiko_beatmap_pp = select_mysql_model('taiko_beatmap_pp');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');
	const osu_beatmap_info = select_mysql_model('beatmap_info');
	const beatmap_params = select_mysql_model('beatmap_params');

	const osu_beatmaps_connection = get_connection(DB_BEATMAPS);
	const { 
		acc = 99,
		gamemode = 0, 
		mods_int = 0, 
		ranked = 4, 
		pp_min = 0, 
		pp_max = 10000, 
		aim = null, 
		speed = null, 
		bpm_min = 0, 
		bpm_max = 1000,
		stream_min = 0,
		stream_max = 1000,
		beatmap_id = null,
		beatmapset_id = null,
	} = args;


	const mods = mods_int;
	const accuracy = acc;
	const stream_difficulty_min = stream_min;
	const stream_difficulty_max = stream_max;

	if (gamemode == Gamemode.osu) {

		let aim_condition = {};
		let speed_condition = {};

		if(aim){
			aim_condition = {
				pp_aim:{
					[Op.gte]: osu_beatmaps_connection.connection.literal(`pp_speed * ${aim}`)
				}
			}
		}

		if(speed){
			speed_condition = {
				pp_speed:{
					[Op.gte]: osu_beatmaps_connection.connection.literal(`pp_aim * ${speed}`)
				}
			}
		}

		let beatmap_condition = {
			gamemode, ranked
		};

		if (beatmap_id && beatmapset_id) {
			beatmap_condition = {
				...beatmap_condition,
				beatmap_id,
                beatmapset_id,
			}
		}

		const results = await osu_beatmap_pp.findAll({
			where: { 
				accuracy, 
				mods,
				pp_total: { 
					[Op.gte]: pp_min, 
					[Op.lte]: pp_max
				},
				...aim_condition,
				...speed_condition,

			},

			include: [beatmaps_md5, 
				{ model: osu_beatmap_id, where: beatmap_condition },
				osu_beatmap_info,
				{ model: beatmap_params, where: {
					bpm_avg: {
						[Op.gte]: bpm_min,
						[Op.lte]: bpm_max
					},
					stream_difficulty: {
						[Op.gte]: stream_difficulty_min,
						[Op.lte]: stream_difficulty_max
					}
					}}
			],

			
			fieldMap: {
				'beatmaps_md5.hash': 'md5',

				'beatmaps_md5.id': 'md5_int',
				'beatmap_id.md5': 'md5_int',
				'beatmap_info.md5': 'md5_int',

				'beatmap_id.beatmap_id': 'beatmap_id',
				'beatmap_id.beatmapset_id': 'beatmapset_id',
				'beatmap_id.gamemode': 'gamemode',
				'beatmap_id.ranked': 'ranked',

				'beatmap_info.artist': 'artist',
				'beatmap_info.title': 'title',
				'beatmap_info.creator': 'creator',
				'beatmap_info.difficulty': 'difficulty',

				'beatmap_params.md5': 'md5_int',
				'beatmap_params.bpm_min': 'bpm_min',
				'beatmap_params.bpm_max': 'bpm_max',
				'beatmap_params.bpm_avg': 'bpm_avg',
				'beatmap_params.total_time': 'total_time',
				'beatmap_params.drain_time': 'drain_time',
				'beatmap_params.break_time': 'break_time',
				'beatmap_params.hit_count': 'hit_count',
				'beatmap_params.slider_count': 'slider_count',
				'beatmap_params.spinner_count': 'spinner_count',
				'beatmap_params.stream_difficulty': 'stream_difficulty',
				'beatmap_params.circles_time': 'circles_time',
				'beatmap_params.sliders_time': 'sliders_time',
				'beatmap_params.objects_time': 'objects_time',

			},

			raw: true, 
		});

		return results;

	} else if (gamemode == Gamemode.taiko) {
		return await taiko_beatmap_pp.findAll({
			where: { 
				accuracy, 
				mods,
				pp_total: { 
					[Op.gte]: pp_min, 
					[Op.lte]: pp_max
				}
			},

			include: [beatmaps_md5, 
				{ model: osu_beatmap_id, where: { gamemode, ranked } },
				osu_beatmap_info
			],

			
			fieldMap: {
				'beatmaps_md5.hash': 'md5',

				'beatmaps_md5.id': 'md5_int',
				'beatmap_id.md5': 'md5_int',
				'beatmap_info.md5': 'md5_int',

				'beatmap_id.beatmap_id': 'beatmap_id',
				'beatmap_id.beatmapset_id': 'beatmapset_id',
				'beatmap_id.gamemode': 'gamemode',
				'beatmap_id.ranked': 'ranked',

				'beatmap_info.artist': 'artist',
				'beatmap_info.title': 'title',
				'beatmap_info.creator': 'creator',
				'beatmap_info.difficulty': 'difficulty',
			},

			raw: true, 
		});
	}
}

const get_md5_list = async () => {
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await beatmaps_md5.findAll({
        raw: true,
    });
}

const get_all_beatmap_params = async () => {
	const beatmap_params = select_mysql_model('beatmap_params');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await beatmap_params.findAll({
        
        include: [{ model: beatmaps_md5 }],

        
        fieldMap: {
            'beatmaps_md5.hash': 'md5',
            'beatmaps_md5.id': 'md5_int',
        },

        raw: true, 
    });
}

const get_md5_id = async (hash, returning = true) => {
    if (typeof hash !== 'string' && hash.length !== 32){
        return null;
    }

    const cache_result = beatmaps_md5_cache.find( x => x.md5 === hash);
    if (typeof cache_result !== 'undefined'){
        return cache_result;
    }


	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    const result = await beatmaps_md5.findOrCreate({ 
        where: { hash }
    });
    if (result[1] === true) {
        beatmaps_md5_cache.push(result[0].dataValues);
    }
    if (returning){
        return result[0].getDataValue('id');
    }

    return null;
}

const remove_beatmap = async (hash) => {
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');
    await beatmaps_md5.destroy({ where: {hash} });
}


const beatmap_pp_keys = ['md5', 'mods', 'accuracy', 'pp_total', 'pp_aim', 'pp_speed', 'pp_accuracy', 
    'stars', 'diff_aim', 'diff_speed', 'diff_sliders', 'speed_notes', 'AR', 'OD'];

const beatmap_pp_id_keys = ['md5', 'gamemode', 'ranked', 'beatmap_id', 'beatmapset_id'];

const get_beatmap_pp = async (condition = {} ) => {

    const beatmap_pp_conditions = Object.entries( condition ).filter( x => beatmap_pp_keys.indexOf(x[0]) > - 1)
    .reduce((a, v) => ({ ...a, [v[0]]: v[1]}), {}) ;

    const beatmap_id_conditions = Object.entries( condition ).filter( x => beatmap_pp_id_keys.indexOf(x[0]) > - 1)
    .reduce((a, v) => ({ ...a, [v[0]]: v[1]}), {}) ;

	const osu_beatmap_id = select_mysql_model('beatmap_id');
	const osu_beatmap_pp = select_mysql_model('osu_beatmap_pp');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');


    return await osu_beatmap_pp.findAll({
        where: beatmap_pp_conditions,
        
        include: [beatmaps_md5, {
            model: osu_beatmap_id,
            where: beatmap_id_conditions
        }], 

        fieldMap: {
            'beatmaps_md5.hash': 'md5',
            'beatmap_id.md5': 'md5_int',
            'beatmap_id.beatmap_id': 'beatmap_id',
            'beatmap_id.beatmapset_id': 'beatmapset_id',
            'beatmap_id.gamemode': 'gamemode',
            'beatmap_id.ranked': 'ranked',
        },

        raw: true, 
    });

}

module.exports = {
    Gamemodes,
    init_md5_cache,
    get_md5_id,
    remove_beatmap,
    get_beatmap_pps_by_id,
    find_beatmap_pps,
    get_beatmap_id,
    GetGamemodeToInt,
	get_beatmap_params_id,
	get_md5_list,
	get_all_beatmap_params
}