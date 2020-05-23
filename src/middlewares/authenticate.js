import jwt from "jsonwebtoken";
import User from "../models/User";

export default (req, res, next) => {
	const header = req.headers.authorization;

	let token;

	if (header) {
		token = header.split(" ")[1];
	}

	if (token) {
		jwt.verify(token, process.env.JWTSECRET, (err, decode) => {
			if (err) {
				res.status(401).json({ errors: { global: "Invalid Token" } });
			} else {
				User.findOne({ email: decode.email }).then((user) => {
					req.currentUser = user;
					next();
				});
			}
		});
	} else {
		res.status(401).json({ errors: { global: token } });
	}
};
