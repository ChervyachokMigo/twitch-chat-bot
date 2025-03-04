
const { ModsToInt } = require("../../osu_pps/osu_mods");
const { find_beatmap_pps } = require("../../DB/beatmaps");

this.founded_buffer = [];

const shuffle = (i) => {
    //this.founded_buffer[i].maps.sort( () => (Math.random() > .5));
	if (this.founded_buffer[i].maps && this.founded_buffer[i].maps.length > 0){
		for (let k = 0; k < this.founded_buffer[i].maps.length; k++) {
			let j = Math.floor(Math.random() * (k + 1));
			[this.founded_buffer[i].maps[k], this.founded_buffer[i].maps[j]] = [this.founded_buffer[i].maps[j], this.founded_buffer[i].maps[k]];
		}
	}
}

const find = async (args) => {
	const args_keys = Object.keys(args);

    let i = this.founded_buffer.findIndex( x => {
		let res = true;
		for (let key of args_keys) {
			res = res && x[key] === args[key];
        }
		return res; 
		});
    
    if ( i === -1 ) {

        const maps = await find_beatmap_pps(args);

        //поиск по аиму y.diff.aim > y.diff.speed * aim

        if (!maps || maps.length === 0) {
            return null;
        }

        i = this.founded_buffer.push({...args, maps}) - 1;
    }

    shuffle(i);

    const founded_map = this.founded_buffer[i].maps.shift();

    if (!founded_map) {
        return null;
    }

    return founded_map;
}

module.exports = {
    find,
	buffer_size: ({ gamemode, username, acc = 100, pp_min, pp_max, aim, speed, mods_int, bpm_min, bpm_max, stream_min, stream_max }) => {
		let i = this.founded_buffer.findIndex( x => 
		x.gamemode === gamemode &&
        x.username === username && 
        x.acc === acc && 
        x.pp_min === pp_min && 
        x.pp_max === pp_max && 
        x.aim === aim &&
        x.speed === speed &&
        x.mods_int === mods_int &&
		x.bpm_min === bpm_min &&
		x.bpm_max === bpm_max &&
        x.stream_min === stream_min &&
        x.stream_max === stream_max
		);
	return this.founded_buffer[i].maps.length ?? 0;
	}
}
