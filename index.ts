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
program.argument('<basePath>', 'The base path of the package being released')
	.requiredOption('-u, --username <type>', 'Username for authentication with the email server')
	.requiredOption('-p, --password <type>', 'Password for authentication with the email server')
	.requiredOption('-f, --from <type>', 'Sender\'s email address')
	.requiredOption('-t, --to <type>', 'Recipient\'s email address')
	.option('-n, --package-name <type>', 'The name of the package being released')
	.option('-v, --pkg-version <type>', 'The version of the package being released')
	.option('--ssl-verify <boolean>', 'Whether or not to verify the SSL certificate of the email server', false)
	.option('--changelog-file <type>', 'The path of the CHANGELOG.md file', 'CHANGELOG.md')
	.option('-s, --subject <type>', 'The subject line to use for the release email')
	.parse(Bun.argv);

const options = program.opts();

/**
 * Retrieves the changelog from a file and returns it as a Markdown string with emojis.
 * @param basePath - The base path of the file.
 * @param filePath - The path of the file relative to the base path.
 * @returns The changelog as a Markdown string with emojis.
 */
async function getChangelog(basePath: string, filePath: string) {
	const changelog = await Bun.file(join(basePath, filePath)).text();
	return marked(emojify(changelog));
}

/**
 * Sends an email with the changelog for a package release.
 * @returns A Promise that resolves when the email has been sent.
 */
async function sendEmail() {
	const packageJson = await Bun.file(join(options.basePath, 'package.json')).json();
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

	const changelog = await getChangelog(options.basePath, options.changelogFile);
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

await sendEmail();
