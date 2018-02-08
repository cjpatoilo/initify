#!/usr/bin/env node
const child = require('child_process')
const fs = require('fs')
const https = require('https')
const rasper = require('rasper')
const { version } = require('./package.json')

const options = process.argv[0].match(/node/i) ? rasper(process.argv.slice(2)) : rasper()
const directory = options._[0]
const hostname = 'raw.githubusercontent.com'
const path = '/cjpatoilo/initify/master/src'
const port = 443
const method = 'GET'
const info = `
Usage:

  $ initify <directory> [<options>]

Options:

  -h, --help              Display help information
  -v, --version           Output Initify version
  -l, --license           Get license
  -i, --ignore            Get .gitignore
  -c, --ci                Get continuous integration
  --no-license            Disallow license
  --no-ignore             Disallow .gitignore
  --no-ci                 Disallow continuous integration
  --no-template           Disallow Github templates
  --no-editor             Disallow .editorconfig
  --no-readme             Disallow readme.md

Examples:

  $ initify my-project
  $ initify sample --ignore android
  $ initify www --license apache-2.0

Default settings when no arguments:

	$ initify <directory> --license=mit --ignore=node --ci=travis,appvey
`

/**
 * Without directory or help
 */
if (options.help || options.h || !directory) {
	console.log(info)
	process.exit(1)
}

/**
 * Version
 */
if (options.version) {
	console.log(`v${version}`)
	process.exit(1)
}

/**
 * Create directory
 */
child.exec(`mkdir ${directory}`)

/**
 * Create readme.md
 */
if (!options.noreadme) Request(`/readme/readme`, `readme.md`)

/**
 * Create license
 */
if (options.license) Request(`/licenses/${options.license}`, `license`)
else if (!options.nolicense) Request(`/licenses/mit`, `license`)

/**
 * Create .gitignore
 */
if (options.ignore) Request(`www.gitignore.io/api/${options.ignore}`, `.gitignore`)
else if (!options.noignore) Request(`www.gitignore.io/api/node`, `.gitignore`)

/**
 * Create .travis.yml
 */
if (options.ci) Request(`/ci/${options.ci}`, `.${options.ci}.yml`)

if (!options.noci) {
	Promise.all([
		Request(`/ci/appveyor`, `.appveyor.yml`),
		Request(`/ci/travis`, `.travis.yml`)
	])
}

/**
 * Create GitHub Template
 */
if (!options.notemplate) {
	const url = `${directory}/.github`
	Promise.all([
		child.exec(`mkdir ${url}`),
		Request(`${directory}/.github`, `contributing.md`),
		Request(`${directory}/.github`, `issue_template.md`),
		Request(`${directory}/.github`, `pull_request_temaplte.md`)
	])
}

/**
 * Create .editorconfig
 */
if (!options.editor) Request(`/misc/editorconfig`, `.editorconfig`)

process.exit(1)

function Request (url, file) {
	https
		.get({ hostname, path, port, method }, response => response.on('data', response => fs.writeFile(`${directory}/${file}`, response)))
		.on('error', error => console.error(error))
}
