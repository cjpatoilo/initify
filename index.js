#!/usr/bin/env node
const { existsSync } = require('fs')
const { get } = require('https')
const { exec } = require('child_process')
const { outputFile } = require('fs-extra')
const rasper = require('rasper')
const { version } = require('./package.json')

const options = process.argv[0].match(/node/i) ? rasper(process.argv.slice(2)) : rasper()
const directory = options._[0]
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
  $ initify sample --ignore macos,node,grunt,test
  $ initify www --license apache-2.0

Default settings when no arguments:

	$ initify <directory> --license=mit --ignore=node --ci=travis,appvey
`

/**
 * version
 */
if (options.version) {
	console.log(`v${version}`)
	process.exit(1)
}

/**
 * help
 */
if (options.help || options.h) {
	console.log(info)
	process.exit(1)
}

/**
 * has directory
 */
// if (existsSync(directory)) {
// 	console.error('[error] Directory exists!')
// 	process.exit(2)
// }

/**
 * No directory
 */
if (!directory) {
	console.error('[error] Directory is required!')
	process.exit(2)
}

/**
 * readme.md
 */
if (!options.noreadme) request('misc/readme', 'readme.md')

/**
 * license
 */
if (options.l || options.license) request(`license/${options.license}`, 'license')
else if (!options.nolicense) request('license/mit', 'license')

/**
 * .gitignore
 */
if (options.i || options.ignore) request(options.ignore, '.gitignore')
else if (!options.noignore) request('node', '.gitignore')

/**
 * continus integration
 */
if (options.c || options.ci) request(`ci/${options.ci}`, `.${options.ci}.yml`)
else if (!options.noci) {
	request('ci/appveyor', '.appveyor.yml')
	request('ci/travis', '.travis.yml')
}

/**
 * github template
 */
if (!options.notemplate) {
	request('github/contributing', '.github/contributing.md')
	request('github/issue_template', '.github/issue_template.md')
	request('github/pull_request_template', '.github/pull_request_template.md')
}

/**
 * .editorconfig
 */
if (!options.noeditor) request('misc/editorconfig', '.editorconfig')

/**
 * package.json
 */
exec(`cd ${directory} && npm init -y`)

/**
 * functions
 */
function request (url, file) {
	console.log(`[info] Request ${file}`)

	get(normalize(url, file), response => {
		response.on('data', data => write(`${directory}/${file}`, data))
	})
}

function normalize (url, file) {
	const hostname = (file === '.gitignore') ? 'www.gitignore.io' : 'raw.githubusercontent.com'
	const path = (file === '.gitignore') ? `/api/${url}` : `/cjpatoilo/initify/v${version}/src/${url}`

	return { hostname, path }
}

function write (file, data) {
	outputFile(file, data, error => {
		error ? console.error(`[error] Error ${file}!`) : console.log(`[info] Creating ${file}`)
	})
}
