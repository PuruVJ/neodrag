export function bindTarget(binding: {
	attach(node: HTMLElement | SVGElement): void;
	detach(): void;
}) {
	return (node: HTMLElement | SVGElement) => {
		binding.attach(node);
		return () => binding.detach();
	};
}
