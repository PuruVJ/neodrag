import type { VFile } from 'vfile';
/**
 * `src/content/` does not support relative image paths.
 * This plugin throws an error if any are found
 */
export default function toRemarkContentRelImageError({ contentDir }: {
    contentDir: URL;
}): () => (tree: any, vfile: VFile) => void;
