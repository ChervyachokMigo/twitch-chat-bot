
const { MYSQL_SAVE } = require("mysql-tools");
const { ModsToInt } = require("./osu_mods");
const { Gamemode } = require("osu-tools");

let calculated_chunk_data = {
	[Gamemode.osu]: [],
    [Gamemode.taiko]: [],
};

const gamemodes = [Gamemode.osu, Gamemode.taiko];

module.exports = {
    calc_result_parse: ({last_command, data}) => {
		console.log(last_command, data)
		/* const gamemode = score.ruleset_id;
		const beatmap_id = score.beatmap_id;
		const acc = score.accuracy;
		const mods = ModsToInt(score.mods.map( x => x.acronym));*/
	},

    calc_result_add: ({ md5_int, score, performance_attributes, difficulty_attributes, mods }) => {
		const gamemode = score.ruleset_id;

		if (gamemode == Gamemode.osu) {
			calculated_chunk_data[gamemode].push({
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
			});
		} else if (gamemode == Gamemode.taiko) {
			calculated_chunk_data[gamemode].push({
				md5: md5_int,
				mods: ModsToInt(mods),
				accuracy: Math.round(score.accuracy),
				pp_total: Math.round(performance_attributes.pp),
				pp_difficulty: Math.round(performance_attributes.difficulty),
				pp_ur: Math.round(performance_attributes.estimated_unstable_rate),
				pp_accuracy: Math.round(performance_attributes.accuracy),
				stars: difficulty_attributes.star_rating,
				diff_mono_stamina: difficulty_attributes.mono_stamina_factor,
				diff_stamina: difficulty_attributes.stamina_difficulty,
				diff_rhythm: difficulty_attributes.rhythm_difficulty,
				diff_colour: difficulty_attributes.colour_difficulty,
				diff_peak: difficulty_attributes.peak_difficulty
			});
		} else {
			//skip other modes
			
		}

	},
    save_calculated_data: async () => {
		for (let g of gamemodes) {
			if (!calculated_chunk_data[g]) {
				continue;
			}
			const data = calculated_chunk_data[g].slice();
			calculated_chunk_data[g] = [];
			if (data && data.length > 0){
				if (g == Gamemode.osu) {
					await MYSQL_SAVE('osu_beatmap_pp', data );
				} else if (g == Gamemode.taiko) {
                    await MYSQL_SAVE('taiko_beatmap_pp', data );
                } else {
                    //skip other modes
                }
			}
		}
	},

    calculated_data_length: () => {
		let res = 0;
		for (let g of gamemodes) {
			if (!calculated_chunk_data[g]) {
				continue;
			}
			res += calculated_chunk_data[g].length;
		}
		return res;
	},
}