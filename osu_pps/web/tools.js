module.exports = {
	get_client_id: (req) => ({ 
		ip: req.headers['x-forwarded-for'], 
		user_agent: req.headers['user-agent'] }),
	convert_ip_to_int: (ip) => {
		const parts = ip.split('.');
        return parts.reduce((acc, part) => acc * 256 + parseInt(part), 0);
	}

}