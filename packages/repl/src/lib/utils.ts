/**
 * Removes leading indentation from multi-line strings while preserving relative indentation.
 *
 * @param strings Template literal strings
 * @param values Values to be interpolated into the template
 * @returns Dedented string with preserved relative indentation
 */
export function dedent(strings: TemplateStringsArray | string, ...values: any[]): string {
	// Handle both template literals and regular strings
	let result: string;

	if (typeof strings === 'string') {
		result = strings;
	} else {
		result = strings.reduce((acc, str, i) => {
			return acc + str + (i < values.length ? values[i] : '');
		}, '');
	}

	// Split into lines and find the minimum indentation
	const lines = result.split('\n');
	const min_indent =
		lines
			.filter((line) => line.trim().length > 0)
			.reduce((min, line) => {
				const indent = line.match(/^[ \t]*/)?.[0].length || 0;
				return indent < min ? indent : min;
			}, Infinity) || 0;

	// Remove the common leading indentation from each line
	return lines
		.map((line) => line.slice(min_indent))
		.join('\n')
		.trim();
}
