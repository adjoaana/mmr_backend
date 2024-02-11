class SecurityManager{
	static check_allowed_requests(req, res, next){
		const allowedMethods = [
			"OPTIONS",
			"CONNECT",
			"GET",
			"POST",
			"PUT",
			"DELETE",
		];
		if (!allowedMethods.includes(req.method)) {
			res.status(405).json({ msg: `${req.method} not allowed.` });
			next("method not allowed");
		}

		next();
	}
}

module.exports = SecurityManager;