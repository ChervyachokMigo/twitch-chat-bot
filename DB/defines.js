const { prepareDB, prepareEND, twitchchat_prepare, beatmaps_prepare } = require('mysql-tools');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_TWITCHCHAT, DB_DISCORD, DB_BEATMAPS } = require("../config.js");


module.exports = {

    prepareDB: async () => {
		
		try {

			const connections = await prepareDB({ DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASES: { DB_TWITCHCHAT, DB_DISCORD, DB_BEATMAPS } });

			const twitchchat_connection = 	connections.find( x=> x.name === DB_TWITCHCHAT )?.connection;
			const discord_connection = 		connections.find( x=> x.name === DB_DISCORD )?.connection;
			const beatmaps_connection = 	connections.find( x=> x.name === DB_BEATMAPS )?.connection;

			if (!twitchchat_connection) {
				throw new Error('twitchchat_connection connection undefined');
			}

			if (!discord_connection) {
				throw new Error('discord_connection connection undefined');
			}
			
			if (!beatmaps_connection) {
				throw new Error('beatmaps_connection connection undefined');
			}

			beatmaps_prepare(beatmaps_connection);
			twitchchat_prepare(twitchchat_connection, discord_connection);

			await prepareEND();

		} catch (e) {
			console.error(e);
			throw new Error(e);
		}

		return true;

	}
}