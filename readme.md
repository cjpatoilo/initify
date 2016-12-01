<p align="center">
  <a href="http://cjpatoilo.com/initify"><img width="100%" src="http://cjpatoilo.com/initify/images/thumbnail.jpg" alt="Initify | The easy way to start open source projects."></a>
</p>

> The easy way to start open source projects.

[![Build Status](https://travis-ci.org/cjpatoilo/initify.svg?branch=master)](https://travis-ci.org/cjpatoilo/initify)
[![Dependencies Status](https://david-dm.org/cjpatoilo/initify.svg)](https://travis-ci.org/cjpatoilo/initify)
[![npm version](https://badge.fury.io/js/initify.svg)](https://badge.fury.io/js/initify)


## Why it's awesome?

Initify is the easy way to start open source projects. Hope you enjoy!


## Install

```
$ npm install initify --global
```


## Usage

```
$ initify --help

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
    --no-license            Disallow readme.md
    --no-ignore             Disallow readme.md

  Examples:

    $ initify myApp
    $ initify sample --ignore android
    $ initify www --license apache-2.0

  Default when no arguments:

    $ initify <directory> --license mit --ignore node --ci travis

```


## Contributing

Want to contribute? Follow these [recommendations](https://github.com/cjpatoilo/initify/blob/master/.github/contributing.md).


## License

Designed with ♥ by [CJ Patoilo](https://cjpatoilo.com/). Licensed under the [MIT License](https://cjpatoilo.mit-license.org/).
