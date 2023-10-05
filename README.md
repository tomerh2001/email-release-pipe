# Email Release Pipe
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)
[![Snyk Security](../../actions/workflows/snyk-security.yml/badge.svg)](../../actions/workflows/snyk-security.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/tomerh2001/email-release-pipe/badge)](https://securityscorecards.dev/viewer/?uri=github.com/tomerh2001/email-release-pipe)

A Bitbucket pipe to send an email with the release notes of the current release.

## YAML Definition

Add the following snippet to the script section of your `bitbucket-pipelines.yml` file:

```yaml
script:
  - pipe: docker://tomerh2001/email-release-pipe:latest
    variables:
      USERNAME: $USERNAME
      PASSWORD: $PASSWORD
      FROM: $FROM
      TO: $TO
```

## Variables

| Name          | Usage                                             | Type       | Default             |
|---------------|---------------------------------------------------|------------|---------------------|
| `USERNAME`    | Username for authentication with the email server| Mandatory  | None                |
| `PASSWORD`    | Password for authentication with the email server| Mandatory  | None                |
| `FROM`        | Sender's email address.                          | Mandatory  | None                |
| `TO`          | Recipient's email address.                       | Mandatory  | None                |
| `PACKAGE_NAME`| The name of the package being released.           | Optional   | name from package.json |
| `VERSION`     | The version of the package being released.       | Optional   | version from package.json |
| `SSL_VERIFY`  | Whether to verify the SSL certificate (true/false)| Optional  | False               |
| `SUBJECT`     | Subject line for the release email.              | Optional   | "Release v[version] for [package name]"|

## Details

The release notes are either extracted directly from the `CHANGELOG.md` file or derived from the latest git commit note, converted to HTML, and emailed to the specified recipients. It also interprets emojis found in the markdown content.

The default subject format if not specified is "Release v[version] for [package name]".

## Prerequisites

- Ensure you have set up the required environment variables in your Bitbucket Pipeline for email configuration (e.g., `USERNAME`, `PASSWORD`, etc.).
- If you use commit notes, ensure they are formatted properly for extraction.
- If you use a changelog, it must be named `CHANGELOG.md`.
