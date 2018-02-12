#!/usr/bin/env node
const { existsSync } = require('fs')
const { get } = require('https')
const { exec } = require('child_process')
const { outputFile, readJson, writeJson } = require('fs-extra')
const gitconfig = require('gitconfig')
const rasper = require('rasper')
const { version } = require('./package.json')
const { error, log } = console

if (require.main === module) initify()

async function initify () {
	const options = process.argv[0].match(/node/i) ? rasper(process.argv.slice(2)) : rasper()
	const config = await getConfig(options)

	// help
	if (config.help) {
		log(`
Usage:

  $ initify <directory> [<options>]

Options:

  -h, --help              Display help information
  -v, --version           Output Initify version
  -a, --author            Set author
  -e, --email             Set email
  -d, --description       Set description
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

  $ initify my-app
  $ initify my-app --ignore macos,node,grunt,test
  $ initify my-app --license apache-2.0

Default settings when no arguments:

  $ initify <directory> --license mit --ignore node --ci travis,appveyor
		`)
		process.exit(2)
	}

	// version
	if (config.version) {
		log(`v${version}`)
		process.exit(2)
	}

	// has directory
	if (existsSync(config.directory)) {
		error('[error] Directory exists')
		process.exit(2)
	}

	// No directory
	if (!config.directory) {
		error('[error] Directory is required')
		process.exit(2)
	}

	// package.json
	exec(`mkdir ${config.directory} && cd ${config.directory} && npm init -y`, err => {
		const file = `${config.directory}/package.json`
		err ? error(`[error] Error ${file}`) : readJson(file, create)
	})

	// index.js
	exec(`touch ${config.directory}/index.js`, err => {
		err ? error(`[error] Error ${config.directory}/index.js`) : log(`[info] Creating ${config.directory}/index.js`)
	})

	// readme.md
	if (!config.noreadme) request('misc/readme', 'readme.md')

	// license
	if (!config.nolicense) request('license/mit', 'license')
	else if (config.license) request(`license/${config.license}`, 'license')

	// .gitignore
	if (!config.noignore) request('node', '.gitignore')
	else if (config.ignore) request(config.ignore, '.gitignore')

	// continus integration
	if (!config.noci) {
		request('ci/appveyor', '.appveyor.yml')
		request('ci/travis', '.travis.yml')
	} else if (config.ci) request(`ci/${config.ci}`, `.${config.ci}.yml`)

	// github template
	if (!config.notemplate) {
		request('github/contributing', '.github/contributing.md')
		request('github/issue_template', '.github/issue_template.md')
		request('github/pull_request_template', '.github/pull_request_template.md')
	}

	// .editorconfig
	if (!config.noeditor) request('misc/editorconfig', '.editorconfig')

	function create (error, data) {
		const file = `${config.directory}/package.json`
		data.version = '0.0.0'
		data.license = config.license ? config.license.toUpperCase() : 'MIT'
		data.author = config.fullname + ' <' + config.email + '>'

		writeJson(file, data, { spaces: '\t' }, err => err ? error(`[error] Error ${file}`) : log(`[info] Creating ${file}`))
	}

	function request (url, file) {
		get(normalize(url, file), res => res.on('data', data => write(`${config.directory}/${file}`, data)))
	}

	function normalize (url, file) {
		const hostname = (file === '.gitignore') ? 'www.gitignore.io' : 'raw.githubusercontent.com'
		const path = (file === '.gitignore') ? `/api/${url}` : `/cjpatoilo/initify/v${version}/src/${url}`

		return { hostname, path }
	}

	function write (file, data) {
		outputFile(file, update(data))
			.then(() => log(`[info] Creating ${file}`))
			.catch(() => error(`[error] Error ${file}`))
	}

	function update (data) {
		return data
			.toString('utf8')
			.replaceAll('[year]', config.year || '[year]')
			.replaceAll('[fullname]', config.fullname || '[fullname]')
			.replaceAll('[email]', config.email || '[email]')
			.replaceAll('[directory]', config.directory || '[directory]')
			.replaceAll('[description]', config.description || '[description]')
	}

	function getConfig (options) {
		const version = options.v || options.version
		const help = options.h || options.help
		const license = options.l || options.license
		const ignore = options.i || options.ignore
		const ci = options.c || options.ci
		const description = options.description
		const directory = options._[0]
		const year = (new Date()).getFullYear()

		return new Promise(resolve => {
			gitconfig.get().then(({ user: { email = options.email, name = options.author } }) => {
				resolve({ ...options, version, help, license, ignore, ci, directory, year, description, email, fullname: name })
			})
		})
	}

	/* eslint-disable */
	String.prototype.replaceAll = function (find, replace) {
		const target = this
		return target.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace)
	}
}
