

const path = require("path");

const fs = require("fs");
const input = require("input");


const { MYSQL_SAVE } = require("../../DB/base.js");

const { prepareDB, mysql_actions } = require("../../DB/defines.js");
const splitArray = require("../tools/splitArray.js");


const load_csv = (filepath) => {
    if ( !fs.existsSync(filepath)){
        throw new Error('no csv file at '+filepath);
    }

    const data = fs.readFileSync( filepath, {encoding: 'utf8'}).split('\n')
        .map( x => x.replace(/["\r﻿]/gi,'').split(';') );
    const header = data.shift();
    const content = data.map ( x => x.map ( y => isNaN(y)? y: Number(y)) );
    return content.map( x => Object.fromEntries( x.map( (y, i) => [header[i], y] ) ));
}

const import_table_csv = async (filepath, tablename, chunk_size = 500) => {
    await prepareDB();

    const content_objects = load_csv(filepath);

    for (let chunk of splitArray( content_objects, chunk_size) ){
        await MYSQL_SAVE(tablename, 0, chunk)
    }
}

module.exports = {
    load_csv,
    import_table_csv
}



const main = async (args) => {
    await prepareDB();

	console.log('importing table');

		const csv_folder_path = path.join( 'data', 'mysql_backups');
		const files = fs.readdirSync( csv_folder_path );
		const tables = mysql_actions.map( x => x.names );

		await import_table_csv( 
			args?.filepath || path.join( csv_folder_path, await input.select('Select csv file', files )), 
			args?.tablename || await input.select('Select table name', tables),
		);
		
	console.log('import complete');


    /*const data = fs.readFileSync('./.trash/beatmaps_pps_bad_without_id.csv', {encoding: 'utf8'}).split('\n')
    .map( x => x.replace(/["\r﻿]/gi,'').split(',') )

    const header = data.shift();

    const content = data.map ( x => x.map ( (y, i) => i > 0? Number(y): y) );

    const content_objects = content.map( x => Object.fromEntries( x.map( (y, i) => [header[i], y] ) ));

    'osu_beatmap_pp'*/
    

}

main();
