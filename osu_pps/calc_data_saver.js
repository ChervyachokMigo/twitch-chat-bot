
const { MYSQL_SAVE } = require("mysql-tools");
const { ModsToInt } = require("./osu_mods");

let calculated_chunk_data = [];

module.exports = {
    calc_result_parse: ({last_command, data}) => {
		console.log(last_command, data)
		/* const gamemode = score.ruleset_id;
		const beatmap_id = score.beatmap_id;
		const acc = score.accuracy;
		const mods = ModsToInt(score.mods.map( x => x.acronym));*/
	},

    calc_result_add: ({md5_int, score, performance_attributes, difficulty_attributes, mods}) => {
		const data = {
			md5: md5_int,
			mods: ModsToInt(mods),
			accuracy: Math.round(score.accuracy),
			pp_total: Math.round(performance_attributes.pp),
			pp_aim: Math.round(performance_attributes.aim),
			pp_speed: Math.round(performance_attributes.speed),
			pp_accuracy: Math.round(performance_attributes.accuracy),
			stars: difficulty_attributes.star_rating,
			diff_aim: difficulty_attributes.aim_difficulty,
			diff_speed: difficulty_attributes.speed_difficulty,
			diff_sliders: difficulty_attributes.slider_factor,
			speed_notes: Math.round(difficulty_attributes.speed_note_count),
			AR: difficulty_attributes.approach_rate,
			OD: difficulty_attributes.overall_difficulty,
		};

		calculated_chunk_data.push(data);
	},
    save_calculated_data: async () => {
		console.log('calculated_chunk_data.length', calculated_chunk_data.length);
		const recorded_calculations = calculated_chunk_data.slice();
		console.log('recorded_calculations', recorded_calculations.length);
		calculated_chunk_data = [];

		if (recorded_calculations.length > 0){
			console.log('saving', recorded_calculations.length, 'records');
			await MYSQL_SAVE('osu_beatmap_pp', recorded_calculations );
		}
	},

    calculated_data_length: () => calculated_chunk_data.length,
}