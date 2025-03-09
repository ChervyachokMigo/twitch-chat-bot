const { RankedStatus } = require("osu-tools");

const { GetGamemodeToInt } = require("../DB/beatmaps");
const { IntToMods, ModsToInt } = require("./osu_mods");
const { calc_action_single, get_beatmaps_by_gamemode_and_status, get_beatmap_pps_by_mods_and_acc } = require("./beatmaps_pp_calc");

module.exports = async ({ beatmap_id = null, beatmapset_id = null, mods_int = 0, acc = 99, gamemode = 0  }) => {

	if (!beatmap_id && !beatmapset_id) {
		//console.log('no beatmap_id');
        return null;
	}

	const find_db_args = { gamemode, mods: mods_int, accuracy: acc, beatmap_id, beatmapset_id };
	const calculated_osu_beatmaps = await get_beatmap_pps_by_mods_and_acc(find_db_args);
	
	if (calculated_osu_beatmaps.length > 0) {
		//console.log('yes')
		const res = calculated_osu_beatmaps.shift();
		//console.log(res);
        return res;
    }

	//console.log('no');

	const beatmap_ids = await get_beatmaps_by_gamemode_and_status({ 
		gamemode, 
		status: RankedStatus.ranked, 
		beatmap_id: beatmap_id,
		beatmapset_id: beatmapset_id
	});

	if (beatmap_ids.length === 0) {
        //console.log('no beatmap ids');
        return null;
    }

	await calc_action_single({
		...beatmap_ids.shift(), 
		acc, 
		mods: IntToMods(mods_int) 
	});

	//console.log('complete');
	const new_result = await get_beatmap_pps_by_mods_and_acc(find_db_args);

	if (new_result.length > 0) {
		//console.log('yes')
		const res = new_result.shift();
		//console.log(res);
        return res;
    } else {
        //console.log('no');
        return null;
	}

}
