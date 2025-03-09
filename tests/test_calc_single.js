const { prepareDB } = require("../DB/defines");
const calculate_single_beatmap = require("../osu_pps/calculate_single_beatmap");

const main = async () => {
	await prepareDB();

	const beatmap_id = 2084862;
	const mods_args = 'DTHD';
	const acc = 69;
	const gamemode = 'osu';


	const mods_int = ModsToInt(mods_args);

	const res = await calculate_single_beatmap({ beatmap_id, acc, mods_int, gmaemode: GetGamemodeToInt(gamemode) });

	console.log(res);

	process.exit()
}

main();