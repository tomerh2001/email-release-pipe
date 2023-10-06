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

/**
 * Returns an object containing configuration options for the email release pipe.
 * @returns An object containing the following properties:
 * - `packageName`: The name of the package being released.
 * - `version`: The version of the package being released.
 * - `username`: The username to use for authentication with the email server.
 * - `password`: The password to use for authentication with the email server.
 * - `from`: The email address to use as the sender.
 * - `to`: The email address to use as the recipient.
 * - `sslVerify`: Whether or not to verify the SSL certificate of the email server.
 * - `subject`: The subject line to use for the release email.
 */
export function getConfig() {
	return {
		packageName: process.env.PACKAGE_NAME ?? name,
		version: process.env.VERSION ?? version,
		username: process.env.USERNAME,
		password: process.env.PASSWORD,
		from: process.env.FROM,
		to: process.env.TO,
		sslVerify: process.env.SSL_VERIFY ?? false,
		changelogFile: process.env.CHANGELOG_FILE ?? 'CHANGELOG.md',
		subject: process.env?.SUBJECT ?? `Release v${process.env.VERSION ?? version} for ${process.env.PACKAGE_NAME ?? name}`,
	};
}

/**
 * Retrieves the contents of the CHANGELOG.md file, converts it to HTML using the
 * `marked` library, and applies emoji replacements using the `emojify` library.
 * @returns A Promise that resolves to the HTML content of the CHANGELOG.md file with
 * emoji replacements applied.
 */
export async function getChangelog() {
	const changelog = await Bun.file(config.changelogFile).text();
	return marked(emojify(changelog));
}

const config = getConfig();
console.debug('Configuration:', config);

const simpleGit = git({config: [`http.sslVerify=${config.sslVerify}`]});
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
	subject: config.subject,
	html: changelog,
};

transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		throw new Error(error);
	}

	console.log('Email sent', info.messageId, info.response, info.envelope);
});
