import Bun from 'bun';
import {marked} from 'marked';
import {emojify} from 'node-emoji';
import nodemailer from 'nodemailer';

async function getChangelog() {
	const changelog = await Bun.file('CHANGELOG.md').text();
	return marked(emojify(changelog));
}

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: '',
		pass: '',
	},
});
if (!await transporter.verify()) {
	throw new Error('Invalid email transport configuration');
}

const changelog = await getChangelog();
const mailOptions = {
	from: '',
	to: '',
	subject: 'Changelog',
	html: changelog,
};

transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		console.error(error);
	} else {
		console.log(`Email sent: ${info.response}`);
	}
});
