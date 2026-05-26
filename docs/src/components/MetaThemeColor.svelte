<script lang="ts">
	import { browser } from '$helpers/utils';

	let theme_color = $state<string | null>(null);

	function lch_to_hex(lchColor: string): string {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext('2d');

		if (!ctx) return lchColor;

		ctx.fillStyle = lchColor;
		ctx.fillRect(0, 0, 1, 1);

		const imageData = ctx.getImageData(0, 0, 1, 1);
		const [r, g, b] = imageData.data;

		const to_hex = (n: number) => {
			const hex = Math.max(0, Math.min(255, n)).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};

		canvas.remove();

		return `#${to_hex(r)}${to_hex(g)}${to_hex(b)}`;
	}

	if (browser) {
		$effect(() => {
			const node = document.createElement('div');
			node.style.display = 'none';
			node.style.setProperty('color', 'var(--app-color-scrolling-navbar)');
			document.body.appendChild(node);

			const apply = () => {
				const value = getComputedStyle(node).getPropertyValue('color');
				theme_color = lch_to_hex(value);

				const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
				if (meta && theme_color) {
					meta.content = theme_color;
				}
			};

			const observer = new MutationObserver(() => apply());
			observer.observe(document.body, { attributes: true });
			apply();

			return () => {
				observer.disconnect();
				node.remove();
			};
		});
	}
</script>
