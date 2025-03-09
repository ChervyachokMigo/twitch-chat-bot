const { RankedStatus } = require("osu-tools");

const { GetGamemodeToInt } = require("../DB/beatmaps");
const { IntToMods, ModsToInt } = require("./osu_mods");
const { calc_action_single, get_beatmaps_by_gamemode_and_status, get_beatmap_pps_by_mods_and_acc } = require("./beatmaps_pp_calc");

module.exports = async ({ beatmap_id = null, mods_args = 'NM', acc = 99, gamemode = 'osu'  }) => {

	if (!beatmap_id) {
		console.log('no beatmap_id');
        return;
	}

	const mods_int = ModsToInt(mods_args);
	const gamemode_int = GetGamemodeToInt(gamemode);

	const find_db_args = { gamemode: gamemode_int, mods: mods_int, accuracy: acc, beatmap_id };
	const calculated_osu_beatmaps = await get_beatmap_pps_by_mods_and_acc(find_db_args);
	
	if (calculated_osu_beatmaps.length > 0) {
		console.log('yes')
		const res = calculated_osu_beatmaps.shift();
		console.log(res)
        return res;
    }

	console.log('no');

	const beatmap_ids = await get_beatmaps_by_gamemode_and_status({ 
		gamemode: gamemode_int, 
		status: RankedStatus.ranked, 
		beatmap_id: beatmap_id 
	});

	if (beatmap_ids.length === 0) {
        console.log('no beatmap ids');
        return;
    }

	await calc_action_single({
		...beatmap_ids.shift(), 
		acc, 
		mods: IntToMods(mods_int) 
	});

	console.log('complete');
	const new_result = await get_beatmap_pps_by_mods_and_acc(find_db_args);

	if (new_result.length > 0) {
		console.log('yes')
		const res = new_result.shift();
		console.log(res);
        return res;
    } else {
        console.log('no');
        return null;
	}

}
