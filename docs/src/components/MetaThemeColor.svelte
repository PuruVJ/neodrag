<script lang="ts">
	let theme_color = $state<string | null>(null);

	function lch_to_hex(lchColor: string): string {
		// Create a canvas element to force color conversion
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext('2d');

		if (!ctx) return lchColor; // Fallback if no canvas support

		// Set the fill style to the LCH color
		ctx.fillStyle = lchColor;

		// Fill a pixel
		ctx.fillRect(0, 0, 1, 1);

		// Get the pixel data (this forces conversion to RGB)
		const imageData = ctx.getImageData(0, 0, 1, 1);
		const [r, g, b] = imageData.data;

		// Convert to hex
		const toHex = (n: number) => {
			const hex = Math.max(0, Math.min(255, n)).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};

		canvas.remove();

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	function get_theme_color(node: HTMLElement) {
		node.style.setProperty('color', 'var(--app-color-scrolling-navbar)');

		function update() {
			const value = getComputedStyle(node).getPropertyValue('color');
			// This gets LCH. Convert it to RGB
			theme_color = lch_to_hex(value);
		}

		const observer = new MutationObserver((mutations, observer) => {
			update();
		});

		observer.observe(document.body, {
			attributes: true,
		});

		update();

		return () => observer.disconnect();
	}
</script>

<div style="display: hidden;" {@attach get_theme_color}></div>

<svelte:head>
	{#if theme_color}
		<meta name="theme-color" content={theme_color} />
	{/if}
</svelte:head>
