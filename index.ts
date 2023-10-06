#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-extraneous-dependencies */

import {join} from 'node:path';
import {Command} from 'commander';
import nodemailer from 'nodemailer';
import {marked} from 'marked';
import {emojify} from 'node-emoji';
import Bun from 'bun';

const program = new Command();
program.argument('<path>', 'The base path of the package being released')
	.option('-u, --username <type>', 'Username for authentication with the email server', Bun.env.EMAIL_USERNAME)
	.option('-p, --password <type>', 'Password for authentication with the email server', Bun.env.EMAIL_PASSWORD)
	.option('-f, --from <type>', 'Sender\'s email address', Bun.env.EMAIL_FROM)
	.option('-t, --to <type>', 'Recipient\'s email address', Bun.env.EMAIL_TO)
	.option('-n, --package-name <type>', 'The name of the package being released', Bun.env.PACKAGE_NAME)
	.option('-v, --pkg-version <type>', 'The version of the package being released', Bun.env.PACKAGE_VERSION)
	.option('--ssl-verify <boolean>', 'Whether or not to verify the SSL certificate of the email server', Bun.env.SSL_VERIFY === 'true')
	.option('--changelog-file <type>', 'The path of the CHANGELOG.md file', Bun.env.CHANGELOG_FILE ?? 'CHANGELOG.md')
	.option('-s, --subject <type>', 'The subject line to use for the release email', Bun.env.EMAIL_SUBJECT)
	.action(sendEmail)
	.parse(Bun.argv);

const options = program.opts();

/**
 * Retrieves the changelog from a file and returns it as a Markdown string with emojis.
 * @param path - The base path of the file.
 * @param changelogPath - The path of the file relative to the base path.
 * @returns The changelog as a Markdown string with emojis.
 */
async function getChangelog(path: string, changelogPath: string) {
	const changelog = await Bun.file(join(path, changelogPath)).text();
	return marked(emojify(changelog));
}

/**
 * Sends an email with the changelog for a package release.
 * @returns A Promise that resolves when the email has been sent.
 */
async function sendEmail(path: string) {
	const packageJson = await Bun.file(join(path, 'package.json')).json();
	const {name, version} = packageJson;

	const subject = options.subject ?? `Release v${options.pkgVersion || version} for ${options.packageName || name}`;
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: options.username,
			pass: options.password,
		},
		tls: {
			rejectUnauthorized: options.sslVerify,
		},
	});

	const changelog = await getChangelog(path, options.changelogFile);
	const mailOptions = {
		from: options.from,
		to: options.to,
		subject,
		html: changelog,
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			return;
		}

		console.log('Email sent', info.messageId, info.response, info.envelope);
	});
}
