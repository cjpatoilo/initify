#!/usr/bin/env node
const { existsSync, readFile } = require('fs')
const { get } = require('https')
const { exec } = require('child_process')
const { outputFile, readJson, writeJson } = require('fs-extra')
const gitconfig = require('gitconfig')
const rasper = require('rasper')
const { version } = require('./package.json')
const { error, log } = console

if (require.main === module) initify()

async function initify () {
	const user = await getUser()
	const year = (new Date()).getFullYear()
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

	  $ initify my-app
	  $ initify my-app --ignore macos,node,grunt,test
	  $ initify my-app --license apache-2.0

	Default settings when no arguments:

	  $ initify <directory> --license mit --ignore node --ci travis,appveyor
	`

	// version
	if (options.v || options.version) {
		log(`v${version}`)
		process.exit(1)
	}

	// help
	if (options.h || options.help) {
		log(info)
		process.exit(1)
	}

	// has directory
	if (existsSync(directory)) {
		error('[error] Directory exists')
		process.exit(2)
	}

	// No directory
	if (!directory) {
		error('[error] Directory is required')
		process.exit(2)
	}

	// package.json
	exec(`mkdir ${directory} && cd ${directory} && npm init -y`, err => {
		const file = `${directory}/package.json`
		err ? error(`[error] Error ${file}`) : readJson(file, create)
	})

	// index.js
	exec(`touch ${directory}/index.js`, err => {
		err ? error(`[error] Error ${directory}/index.js`) : log(`[info] Creating ${directory}/index.js`)
	})

	// readme.md
	if (!options.noreadme) request('misc/readme', 'readme.md')

	// license
	if (options.l || options.license) request(`license/${options.license}`, 'license')
	else if (!options.nolicense) request('license/mit', 'license')

	// .gitignore
	if (options.i || options.ignore) request(options.ignore, '.gitignore')
	else if (!options.noignore) request('node', '.gitignore')

	// continus integration
	if (options.c || options.ci) request(`ci/${options.ci}`, `.${options.ci}.yml`)
	else if (!options.noci) {
		request('ci/appveyor', '.appveyor.yml')
		request('ci/travis', '.travis.yml')
	}

	// github template
	if (!options.notemplate) {
		request('github/contributing', '.github/contributing.md')
		request('github/issue_template', '.github/issue_template.md')
		request('github/pull_request_template', '.github/pull_request_template.md')
	}

	// .editorconfig
	if (!options.noeditor) request('misc/editorconfig', '.editorconfig')

	function create (error, data) {
		data.version = '0.0.0'
		data.license = (options.license || options.l) ? options.license.toUpperCase() : 'MIT'
		data.author = user.name + ' (' + user.email + ')'

		writeJson(file, data, { spaces: '\t' }, err => err
			? error(`[error] Error ${directory}/package.json`)
			: log(`[info] Creating ${directory}/package.json`))
	}

	function request (url, file) {
		get(normalize(url, file), res => res.on('data', data => write(`${directory}/${file}`, data)))
	}

	function normalize (url, file) {
		const hostname = (file === '.gitignore') ? 'www.gitignore.io' : 'raw.githubusercontent.com'
		const path = (file === '.gitignore') ? `/api/${url}` : `/cjpatoilo/initify/v${version}/src/${url}`

		return { hostname, path }
	}

	function write (file, data) {
		outputFile(file, update(data))
			.then(() => log(`[info] Creating ${file}`))
			.catch(err => error(`[error] Error ${file}`))
	}

	function update (data) {
		return data
			.toString('utf8')
			.replace('[year]', year)
			.replace('[fullname]', user.name)
			.replace('[email]', user.email)
	}

	function getUser () {
		return new Promise(resolve => {
			gitconfig.get().then(({ user }) => {
				resolve(user ? user : { name: 'Author', email: 'email@author.com' })
			})
		})
	}
}
