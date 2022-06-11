/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process')
const chokidar = require('chokidar')
const _ = require('lodash')

const pathToWatch = process.argv[2]

console.log(pathToWatch, process.cwd())

if (!pathToWatch) throw 'you must provide a path to a crate to watch'

const watcher = chokidar.watch(pathToWatch + '/**/*.rs')

function onWatch(path: string) {
	console.log('on rust change', path)
	exec(
		`npx wasm-pack build --target web ${pathToWatch}`,
		(err: any, stdout: any, stderr: any) => {
			if (err) {
				console.error('something bad happend!')
				return
			}

			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`)
			console.log(`stderr: ${stderr}`)
		},
	)
}

const watchListener = _.debounce(onWatch, 300)

watcher.on('change', watchListener)
watcher.on('add', watchListener)
watcher.on('unlink', watchListener)
