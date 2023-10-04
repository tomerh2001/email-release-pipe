/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import process from 'node:process';
import Bun from 'bun';
import {marked} from 'marked';
import {emojify} from 'node-emoji';
import nodemailer from 'nodemailer';
import git from 'simple-git';
import {name, version} from './package.json';

function getConfig() {
	return {
		packageName: process.env.PACKAGE_NAME ?? name,
		version: process.env.VERSION ?? version,
		username: process.env.USERNAME,
		password: process.env.PASSWORD,
		from: process.env.FROM,
		to: process.env.TO,
		sslVerify: process.env.SSL_VERIFY ?? false,
	};
}

async function getChangelog() {
	const changelog = await Bun.file('CHANGELOG.md').text();
	return marked(emojify(changelog));
}

async function getChangeLogFromNote() {
	try {
		const commitHash: string = await simpleGit.revparse(['HEAD']);
		console.log('Latest commit hash:', commitHash.trim());

		const noteHash = await simpleGit.raw(['notes', 'show']);
		console.log('Note hash:', noteHash.trim());

		const changelog = await simpleGit.raw(['notes', 'show', noteHash.trim()]);
		console.log('Note:', changelog.trim());

		return marked(emojify(changelog));
	} catch (error) {
		console.error(error);
		return null;
	}
}

const config = getConfig();
const simpleGit = git({config: [`http.sslVerify=${config.sslVerify}`]});
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: config.username,
		pass: config.password,
	},
});

const changelog = await getChangeLogFromNote() ?? await getChangelog();
const mailOptions = {
	from: config.from,
	to: config.to,
	subject: `Release v${config.version} for ${config.packageName}`,
	html: changelog,
};

transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		throw new Error(error);
	}

	console.log('Email sent', info.messageId, info.response, info.envelope);
});
