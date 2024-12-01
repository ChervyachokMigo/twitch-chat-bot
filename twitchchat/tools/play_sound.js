const { exec } = require('child_process')


module.exports = {
	play_sound: (filepath) => {
	const com = 'ffplay -v 0 -nodisp -autoexit '+ filepath;
	//console.log(com)
	exec(com, (err) => {
		if (err) {
            console.error('ffplay error:', err);
        }
	});
}
}