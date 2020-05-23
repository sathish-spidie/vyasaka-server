import nodemailer from "nodemailer";
const from = '"vyasaka" <info@vyasaka.com>';

function setup() {
	return nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		},
	});
}

export function sendConfirmationEmail(user) {
	const transport = setup();
	const email = {
		from,
		to: user.email,
		subject: "Welcome to vyasaka",
		text: `
		Welcome to vyasaka. Please confirm your email.
		${user.generateConfirmationUrl()}
		`,
	};
	transport.sendMail(email);
}

export function sendResetPasswordEmail(user) {
	const transport = setup();
	const email = {
		from,
		to: user.email,
		subject: "Reset Password",
		text: `
		Click the link to reset your password
		${user.generateResetPasswordUrl()}
		`,
	};
	transport.sendMail(email);
}
