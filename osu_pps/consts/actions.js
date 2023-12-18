const settings = require("../../settings");

const skip_mods = require("./skip_mods");

const pattern = require("./action_pattern");

module.exports = (is_skip_check = settings.is_skip_check) => {
    let all_mods = [];

    for (let mod_1 of pattern.mods[0]){
        for (let mod_2 of pattern.mods[1]){
            for (let mod_3 of pattern.mods[2]){
                let mods = [mod_1, mod_2, mod_3].filter(Boolean);
                if (is_skip_check){
                    if(skip_mods.indexOf(mods.join('')) === -1){
                        all_mods.push( mods );
                    } else {
                        console.log('skipped mods:', mods.join(''));
                    }
                } else {
                    all_mods.push( mods );
                }
            }
        }
    }

    all_mods.sort( (a,b) => a.length - b.length );

    let results = [];

    for (let mods of all_mods){
        for (let acc of pattern.acc){
            results.push({acc, mods});
        }
    }

    return results;
}