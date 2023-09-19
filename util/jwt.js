const jwt = require("jsonwebtoken");
require("dotenv").config()

let createToken = (email, user_id, role) => {
	return jwt.sign(
		{ id: user_id, email: email, role: role },
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRATION + "h",
		}
	);
};

let verifyToken = (token, callback) => {
	jwt.verify(token, process.env.JWT_SECRET, callback);
}



module.exports = { createToken, verifyToken };
