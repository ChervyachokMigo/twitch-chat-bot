const { GetGamemodeToInt } = require("./DB/beatmaps");
const { prepareDB } = require("./DB/defines");
const { calc_action_single, get_beatmaps_by_gamemode_and_status } = require("./osu_pps/beatmaps_pp_calc");
const { ModsToInt, IntToMods } = require("./osu_pps/osu_mods");

const main = async () => {
	await prepareDB();

	const gamemode_int = GetGamemodeToInt('osu');
	const ranked = 4;

	const beatmaps_data = (await get_beatmaps_by_gamemode_and_status(gamemode_int, ranked))
		.sort ( (a, b) => a.md5.localeCompare(b.md5) );

	const founded_beatmap = beatmaps_data.find( v => v.beatmap_id === 2084862);

	if (!founded_beatmap) {
		console.log('beatmap not found');
        return;
	}

	const mods_args = 'HDDT';

	//convert string to array of mods
	const mods = IntToMods(ModsToInt(mods_args));

	let args = {...founded_beatmap, acc: 99, mods };

	await calc_action_single(args);
	console.log('complete');
	process.exit();

}

main();