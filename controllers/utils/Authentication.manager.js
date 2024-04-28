const { readFileSync } = require('node:fs');
const jwt = require("jsonwebtoken");
const env = require("../config");
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const path = require('path');

const privateKey = readFileSync(path.join(__dirname, "/../keys/", env.PEM_PATH));
const publicKey = readFileSync(path.join(__dirname, "/../keys/", env.PUB_PATH));
class AuthenticationManager {
	static dateInSeconds() {
		return Math.trunc(Date.now() / 1000);
	}
	static createToken(data, remember) {
		return jwt.sign({
			...data,
			iss: "https://monitormyrehab.com",
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: remember ? '86400s' : '4500s',
		});
	}
	static decodeToken(token) {
		if (this.isTokenValid(token))
			return jwt.verify(token, publicKey);
		return {};
	}

	static generatePasswordResetToken() {
		return crypto.randomBytes(30).toString('hex');
	}
	static isTokenValid(token) {
		try {
			const payload = jwt.verify(token, publicKey);
			if (payload.exp < this.dateInSeconds()) {
				return false;
			}
			if (payload.iat > this.dateInSeconds()) {
				return false
			}
			return true;
		} catch (err) {
			if (err.name === "TokenExpiredError") {
				return false;
			}
		}

	}

	static hashPassword(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
	}

	static comparePassword(password, hashedPassword) {
		return bcrypt.compareSync(password, hashedPassword);
	}

	static checkPasswordStrength(password = "") {
		if (password.length < 8) {
			return {
				status: false,
				message: "Password must have be at least 8 characters long"
			}
		}
		if (!password.match(/.*[A-Z]/)) {
			return {
				status: false,
				message: "Password must have at least one uppercase letter"
			}
		}
		if (!password.match(/.*[a-z]/)) {
			return {
				status: false,
				message: "Password must have at least one lowercase letter"
			}
		}
		if (!password.match(/.*[0-9]/)) {
			return {
				status: false,
				message: "Password must have at least one number"
			}
		}
		if (!password.match(/.*[^A-Za-z0-9]/)) {
			return {
				status: false,
				message: "Password must have at least one special character"
			}
		}

		return {
			status: true,
			message: "Password is strong"
		}
	}
}

module.exports = AuthenticationManager;