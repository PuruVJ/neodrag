import { Result } from '$lib/result.js';
import { dedent } from '$lib/utils.js';

class BaseCompiler<MapType> {
	is_initialized: boolean = false;
	cache = new Map<string, string>();

	filter = /.js$/;

	async initialize() {
		throw new Error('initialize() must be implemented by subclass');
	}

	async transform(
		_code: string,
		_filename: string,
	): Promise<{
		code: string;
		map: MapType;
	}> {
		throw new Error('compile() must be implemented by subclass');
	}

	get template() {
		return dedent`
    // Default template - override in subclass
    `;
	}

	get dependencies() {
		return new Set();
	}
}

export class SvelteCompiler extends BaseCompiler<import('magic-string').SourceMap> {
	#compiler?: typeof import('svelte/compiler');

	filter = /\.(svelte|svelte\.(?=js|ts|mjs|mts))$/;

	get template(): string {
		return dedent`
      <script>
        import { onMount, onDestroy } from 'svelte';
        import { createDraggable } from 'neodrag';
        
        let box;
        let container;
        let destroyDraggable;
        
        onMount(() => {
          if (!box || !container) return;
          
          const { draggable } = createDraggable();
          
          const instance = draggable(box, [
            {
              name: 'bounds',
              options: {
                bounds: () => {
                  return {
                    left: 0,
                    top: 0,
                    right: container.offsetWidth - box.offsetWidth,
                    bottom: container.offsetHeight - box.offsetHeight
                  };
                }
              }
            }
          ]);
          
          destroyDraggable = instance.destroy;
        });
        
        onDestroy(() => {
          if (destroyDraggable) {
            destroyDraggable();
          }
        });
      </script>

      <div 
        bind:this={container}
        style="height: 300px; position: relative; border: 1px dashed #ccc; border-radius: 8px; padding: 16px;"
      >
        <div 
          bind:this={box}
          class="draggable"
        >
          Drag me!
        </div>
      </div>`;
	}

	async initialize(): Promise<void> {
		if (this.is_initialized) return;

		// TODO:For now we will embed these versions as is. However, later on we should allow for
		// versions
		this.#compiler = await import('svelte/compiler');
		console.log(`SVELTE VERSION: ${this.#compiler.VERSION}`);

		this.is_initialized = true;
	}

	async transform(code: string, filename: string) {
		if (!this.#compiler) throw new Error('Compiler not initialized');

		const result = Result.from(() =>
			this.#compiler!.compile(code, {
				filename,
				dev: true,
				css: 'injected',
			}),
		);

		if (!result.ok) {
			throw result.error;
		}

		return {
			code: result.value.js.code,
			map: result.value.js.map,
		};
	}
}

export class CompilerRegistry {
	#compilers = new Map<string, BaseCompiler<any>>();

	constructor() {
		this.#register_builtin_compilers();
	}

	#register_builtin_compilers() {
		this.#register('svelte', SvelteCompiler);
	}

	#register(framework: string, compiler: typeof BaseCompiler<any>) {
		this.#compilers.set(framework, new compiler());
	}

	async get_compiler(framework: string) {
		const compiler = this.#compilers.get(framework);

		if (!compiler) {
			throw new Error(`No compiler found for framework ${framework}`);
		}

		if (!compiler.is_initialized) {
			await compiler.initialize();
		}

		return compiler;
	}

	is_registered(framework: string) {
		return this.#compilers.has(framework);
	}
}

// import { Box } from '🟦'
