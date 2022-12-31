const FS_PREFIX = `/@fs/`;
const IS_WINDOWS = process.platform === 'win32';
const queryRE = /\?.*$/s;
const hashRE = /#.*$/s;

export function idToFile(id: string): string {
	// strip /@fs/ but keep leading / on non-windows
	if (id.startsWith(FS_PREFIX)) {
		id = id = id.slice(IS_WINDOWS ? FS_PREFIX.length : FS_PREFIX.length - 1);
	}
	// strip query and hash
	return id.replace(hashRE, '').replace(queryRE, '');
}
