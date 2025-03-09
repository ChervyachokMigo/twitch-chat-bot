const { prepareDB } = require("../DB/defines");
const calculate_single_beatmap = require("../osu_pps/calculate_single_beatmap");

const main = async () => {
	await prepareDB();

	const beatmap_id = 2084862;
	const mods_args = 'DTHD';
	const acc = 100;

	await calculate_single_beatmap({ beatmap_id, acc, mods_args })
	process.exit()
}

main();