import pkg from '../package.json';
import fsp from 'fs/promises';

async function moveReadme() {
	const readmeContents = await fsp.readFile('../README.md', 'utf-8');
	fsp.writeFile('../dist/README.md', readmeContents);
}

async function movePackageJson() {
	// Stuff to remove
	const { scripts, devDependencies, ...targetPkgJson } = pkg;

	fsp.writeFile('../dist/package.json', JSON.stringify(targetPkgJson, null, 2));
}

movePackageJson();
moveReadme();
