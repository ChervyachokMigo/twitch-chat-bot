module.exports = (...args) => {
    const moduleName = args.pop();
    console.log(`[${moduleName}]`, args.join(' ') );
}