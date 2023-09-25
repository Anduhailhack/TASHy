const nodemailer = require("nodemailer");

const sendEmail = (email, verification_code, callback) => {
	console.log(verification_code);
	//return callback(true)
	
	let transporter = nodemailer.createTransport({
		service: "gmail", //this used to work
		auth: {
			user: "endeshawtadese496@gmail.com",
			pass: "crjpidclpmiberci",
		},
	});

	let contact = {
		from: "SAC wellness program <SAC@SAC.com>",
		subject: "SAC wellness system, verification code at " + (new Date()).getTime(),
		to: email,
		//text: verification_code,
		html: "<p><code>" + verification_code + "</code></p>"
	};
	transporter
		.sendMail(contact)
		.then((result) => callback(true))
		.catch((error) => callback(false));

	
};

module.exports = { sendEmail };
