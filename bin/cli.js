#!/usr/bin/env node

/**
 * Module dependencies
 */
const child = require('child_process')
const fs = require('fs')
const https = require('https')
const cli = require('commander')
const version = require('../package.json').version

/**
 * App
 */
cli
  .version(version)
  .usage('<directory> [<options>]')
  .option('-h, --help', 'Display help information')
  .option('-v, --version', 'Output Initify version')
  .option('-l, --license <opt>', 'Set license')
  .option('-i, --ignore <opt>', 'Set .gitignore')
  .option('-c, --ci <opt>', 'Set continue')
  .option('--no-template', 'Disallow .github templates')
  .option('--no-editor', 'Disallow .editorconfig')
  .option('--no-readme', 'Disallow readme.md')
  .option('--no-license', 'Disallow license')
  .option('--no-ignore', 'Disallow .gitignore')
  .parse(process.argv)

/**
 * Statements
 */
var repository
if (process.argv[0].match(/node/i)) repository = process.argv[2]
else repository = process.argv[1]
const source = 'raw.githubusercontent.com/cjpatoilo/initify/master/src'
const info = `
  Usage:

    $ initify <directory> [<options>]

  Options:

    -h, --help              Display help information
    -v, --version           Output Initify version
    -l, --license           Set license
    -i, --ignore            Set .gitignore
    -c, --ci                Set continue
    --no-template           Disallow .github templates
    --no-editor             Disallow .editorconfig
    --no-readme             Disallow readme.md
    --no-license            Disallow license
    --no-ignore             Disallow .gitignore

  Examples:

    $ initify myApp
    $ initify sample --ignore android
    $ initify www --license apache-2.0

  Default when no arguments:

    $ initify <directory> --license mit --ignore node --ci travis
`

/**
 * Help information
 */
if (!cli.help) {
  console.log(info)
  process.exit(1)
}

/**
 * Without any parameters
 */
if (!process.argv.slice(2).length) {
  console.log(info.red)
  process.exit(1)
}

/**
 * Without directory
 */
if (repository.indexOf('--') !== -1) {
  console.log(`\n[ERROR] Set the directory name:\n\n   $ initify <directory> [<options>]\n`.red)
  process.exit(1)
}

/**
 * Create directory
 */
if (repository) {
  child.exec(`mkdir ${repository}`)
}

/**
 * Create readme.md
 */
if (repository) {
  let url = `${source}/readme/readme`
  let file = `readme.md`
  Request(url, file)
}

/**
 * Create license
 */
if (typeof cli.license === 'string') {
  let url = `${source}/licenses/${cli.license}`
  let file = `license`
  Request(url, file)
} else {
  let url = `${source}/licenses/mit`
  let file = `license`
  Request(url, file)
}

/**
 * Create .gitignore
 */
if (typeof cli.ignore === 'string') {
  let url = `www.gitignore.io/api/${cli.ignore}`
  let file = `.gitignore`
  Request(url, file)
} else {
  let url = `www.gitignore.io/api/node`
  let file = `.gitignore`
  Request(url, file)
}

/**
 * Create .travis.yml
 */
if (cli.ci) {
  let url = `${source}/ci/${cli.ci}`
  let file = `.${cli.ci}.yml`
  Request(url, file)
} else {
  let url = `${source}/ci/travis`
  let file = `.travis.yml`
  Request(url, file)
}

/**
 * Create GitHub Template
 */
if (cli.template) {
  let url = `${repository}/.github`
  child.exec(`mkdir ${url}`)
  child.exec(`touch ${url}/contributing ${url}/issue_template ${url}/pull_request_template`)
}

/**
 * Create .editorconfig
 */
if (cli.editor) {
  let url = `${source}/misc/editorconfig`
  let file = `.editorconfig`
  Request(url, file)
}

/**
 * Helpers
 */
function Request (url, file) {
  // Normalize hostname and pathname
  let path = url.split('/')
  let hostname = path[0]
  path.shift()
  path = `/${path.join('/')}`

  // Request, response and create file
  https.get({ hostname: hostname, path: path }, (response) => {
    return response.on('data', (response) => {
      return fs.writeFile(`${repository}/${file}`, response)
    })
  })
}
