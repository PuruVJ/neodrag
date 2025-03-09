import { join, relative } from 'node:path';
import { readdirSync, statSync, readFileSync } from 'node:fs';

// Configuration
const IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build'];
const IGNORED_EXTENSIONS = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.mp4',
	'.mp3',
	'.wav',
	'.zip',
	'.bin',
	'.exe',
];
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

/**
 * Recursively collects files from a directory
 * @param {string} dir - Directory to scan
 * @param {string} rootDir - The original root directory for relative path calculation
 * @returns {Array<{path: string, content: string}>} Array of file objects
 */
function collectFiles(dir: string, rootDir: string): Array<{ path: string; content: string }> {
	const result = [];
	const items = readdirSync(dir);

	for (const item of items) {
		// Skip ignored directories
		if (IGNORED_DIRS.includes(item)) continue;

		const fullPath = join(dir, item);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			// Recursively collect files from subdirectories
			const subFiles = collectFiles(fullPath, rootDir);
			result.push(...subFiles);
		} else if (stats.isFile()) {
			// Check file size
			if (stats.size > MAX_FILE_SIZE) {
				console.warn(`Skipping large file: ${fullPath} (${(stats.size / 1024).toFixed(2)} KB)`);
				continue;
			}

			// Check file extension
			const ext = item.substring(item.lastIndexOf('.')).toLowerCase();
			if (IGNORED_EXTENSIONS.includes(ext)) {
				continue;
			}

			try {
				// Read file content and add to results
				const content = readFileSync(fullPath, 'utf-8');
				const relativePath = relative(rootDir, fullPath);

				result.push({
					path: relativePath,
					content,
				});
			} catch (error) {
				console.error(`Error reading file ${fullPath}: ${(error as Error).message}`);
			}
		}
	}

	return result;
}

/**
 * Format the collected files for LLM consumption
 * @param {Array<{path: string, content: string}>} files - Collected file objects
 * @returns {string} Formatted output
 */
function formatForLLM(files: Array<{ path: string; content: string }>): string {
	let output = `# Project Files (${files.length} files)\n\n`;

	for (const file of files) {
		output += `## File: ${file.path}\n`;
		output += '```\n';
		output += file.content;
		output += '\n```\n\n';
	}

	return output;
}

// Main function
function main() {
	const args = process.argv.slice(2);
	const targetDir = args[0] || '.';
	const outputFile = args[1] || 'files_dump.md';

	console.log(`Scanning directory: ${targetDir}`);

	const files = collectFiles(targetDir, targetDir);
	console.log(`Collected ${files.length} files`);

	const formattedOutput = formatForLLM(files);

	// Write to file
	Bun.write(outputFile, formattedOutput);
	console.log(`Output written to ${outputFile}`);

	// Also output file count and total characters
	const totalChars = formattedOutput.length;
	console.log(`Total characters: ${totalChars.toLocaleString()}`);
	console.log(`Approximate tokens (chars/4): ${Math.ceil(totalChars / 4).toLocaleString()}`);
}

// Run the program
main();
