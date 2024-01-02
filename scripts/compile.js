const fs = require('fs-extra');
const path = require('path');
const htmlMinify = require('html-minifier');
const jsMinify = require('uglify-js');

const OUTPUT_DIR = 'build';
const BASE_DIR = '.';

let startTime = Date.now();

let appData = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'src/js/appData.json')));

// get all sources
let sources = [
	...[
		...appData.thirdpartySources,
		'src/js/app.js',
		...resolveLocalDependences(appData.sources)
	].map((source) => path.join(BASE_DIR, source)),
	'scripts/finalize.js'
];

// log sources
console.log('Using sources:');
sources.forEach((source) => console.log(source));
console.log('');

// merge all sources
let source = sources.reduce((source, filename) => source + fs.readFileSync(filename, 'utf8'), '');

// get all templates
let templates = fs.readdirSync(
	path.join(BASE_DIR, 'src', 'tpls'), {
		recursive: true,
		withFileTypes: true
	}
).filter((fileInfo) => fileInfo.isFile()).map((fileInfo) => path.join(fileInfo.path, fileInfo.name));

// log templates
console.log('Using templates:');
templates.forEach((template) => console.log(template));
console.log('');

// merge all templates
let template = templates.reduce((template, filename) => template + fs.readFileSync(filename, 'utf8'), '');

// create, clean, and ensure the output dirs
fs.emptyDirSync(OUTPUT_DIR);
fs.ensureDirSync(path.join(OUTPUT_DIR, 'src/js'));
fs.ensureDirSync(path.join(OUTPUT_DIR, 'src/tpls'));

// copy content over
fs.copySync(path.join(BASE_DIR, 'index.html'), path.join(OUTPUT_DIR, 'index.html'));
fs.copySync(path.join(BASE_DIR, 'src', 'css'), path.join(OUTPUT_DIR, 'src/css'));
fs.copySync(path.join(BASE_DIR, 'assets'), path.join(OUTPUT_DIR, 'assets'));

// copy the new app data and index over
fs.writeFileSync(path.join(OUTPUT_DIR, 'src/js/appData.json'), JSON.stringify({
	build: {
		...appData.build,
		compiled: true
	},
	thirdpartySources: [],
	sources: []
}));

// run the minimizers
fs.writeFileSync(path.join(OUTPUT_DIR, 'src/js', appData.build.jsSource), jsMinify.minify(source).code);
fs.writeFileSync(path.join(OUTPUT_DIR, 'src/tpls', appData.build.tplSource), htmlMinify.minify(template));

console.log(`Finished compiling in ${Math.round((Date.now() - startTime) / 100) / 10}s`);

/* internal */

function resolveLocalDependences(sources) {

	let orderedSources = [];
	let cleanRun = false;

	for (let run = 0; run < Object.keys(sources).length && !cleanRun; ++run) {

		cleanRun = true;
		
		for (let source in sources) {

			let dependsOn = sources[source];
			let index = orderedSources.indexOf(source);

			if (dependsOn.length) {

				let maxDependencyIndex = -1;

				for (let i = 0; i < dependsOn.length; ++i) {

					let dependencyIndex = orderedSources.indexOf(dependsOn[i]);

					if (dependencyIndex > maxDependencyIndex) {
						maxDependencyIndex = dependencyIndex;
					}
				}

				if (index == -1 && maxDependencyIndex == -1) {
					orderedSources.push(source);
					cleanRun = false;
				} else {
					if (index == -1) {
						orderedSources.insert(maxDependencyIndex + 1, source);
						cleanRun = false;
					} else if (index < maxDependencyIndex) {
						orderedSources.delete_at(index);
						orderedSources.insert(maxDependencyIndex, source);
						cleanRun = false;
					}
				}
			} else if (index == -1) {
				orderedSources.push(source);
				cleanRun = false;
			}
		}
	}

	if (!cleanRun) {
		throw new Error('Circular dependencies');
	}

	return orderedSources;
}