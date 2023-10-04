/* eslint-disable import/no-extraneous-dependencies */
import process from 'node:process';
import Bun from 'bun';
import {marked} from 'marked';
import {emojify} from 'node-emoji';
import nodemailer from 'nodemailer';
import {name, version} from './package.json';

function getConfig() {
	return {
		packageName: process.env.PACKAGE_NAME ?? name,
		version: process.env.VERSION ?? version,
		username: process.env.USERNAME,
		password: process.env.PASSWORD,
		from: process.env.FROM,
		to: process.env.TO,
	};
}

async function getChangelog() {
	const changelog = await Bun.file('CHANGELOG.md').text();
	return marked(emojify(changelog));
}

const config = getConfig();
console.debug(config)

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: config.username,
		pass: config.password,
	},
});

const changelog = await getChangelog();
const mailOptions = {
	from: config.from,
	to: config.to,
	subject: `Release v${config.version} for ${config.packageName}`,
	html: changelog,
};

transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		throw error;
	}

	console.log('Email sent', info.messageId, info.response, info.envelope);
});
