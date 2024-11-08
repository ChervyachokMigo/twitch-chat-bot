module.exports = (...args) => {
	const now = new Date();
    const moduleName = args.pop();
	const formattedDate = now.toISOString().replace(/Z/, '').replace(/T/, ' ');
    console.log(`[${formattedDate}] [${moduleName}]`, args.join(' ') );
}