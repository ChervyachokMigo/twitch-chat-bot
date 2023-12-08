const acc_pattern = [98, 99, 100];
const mods_pattern = [
    ['', 'HD'],         //reading
    ['', 'DT', 'HT'],   //timing
    ['', 'HR', 'EZ']    //speed
];

module.exports = () => {
    let all_mods = [];

    for (let mod_1 of mods_pattern[0]){
        for (let mod_2 of mods_pattern[1]){
            for (let mod_3 of mods_pattern[2]){
                all_mods.push( [mod_1, mod_2, mod_3].filter(Boolean) );
            }
        }
    }

    all_mods.sort( (a,b) => a.length - b.length );

    let results = [];

    for (let mods of all_mods){
        for (let acc of acc_pattern){
            results.push({acc, mods});
        }
    }

    return results;
}