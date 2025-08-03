# Neodrag - Claude Assistant Documentation

## Project Overview

**Neodrag** is a comprehensive, multi-framework dragging library that provides a consistent API across different frontend frameworks. It's designed as a monorepo containing framework-specific packages that all share a common core.

### Key Features
- **Multi-framework support**: Svelte, React, Vue, Solid, Vanilla JS
- **Plugin-based architecture**: Modular, composable plugin system
- **Performance focused**: Small bundle size, efficient rendering
- **Type-safe**: Full TypeScript support
- **SSR-friendly**: Works with server-side rendering
- **Extensive testing**: Comprehensive test suite with browser testing

## Project Structure

```
neodrag/
├── packages/
│   ├── core/          # Core dragging engine and plugin system
│   ├── svelte/        # Svelte-specific wrapper with actions
│   ├── react/         # React hooks integration
│   ├── vue/           # Vue composables and directives
│   ├── solid/         # Solid.js integration
│   └── vanilla/       # Pure JavaScript API
├── playground/        # Development/testing environments for each framework
├── docs/             # Documentation website (Astro)
└── config/           # Shared configuration files
```

## Core Architecture

### Central Components

1. **DraggableFactory** (`packages/core/src/index.ts`): Main orchestrator class
   - Manages draggable instances
   - Handles event delegation and pointer events
   - Coordinates plugin execution lifecycle
   - Manages state and effects

2. **Plugin System** (`packages/core/src/plugins.ts`): Modular functionality
   - Plugin interface with lifecycle hooks: `setup`, `shouldStart`, `start`, `drag`, `end`, `cleanup`
   - Plugin priority system for execution order
   - Built-in plugins: `transform`, `bounds`, `controls`, `grid`, `threshold`, etc.

3. **Compartment System**: Dynamic plugin management
   - Allows runtime plugin swapping
   - Reactive updates with Svelte 5 integration
   - Live plugin updates during drag operations

### Framework Wrappers

Each framework package provides:
- Framework-specific API (actions, hooks, composables)
- Integration with framework reactivity systems
- Framework-specific TypeScript definitions
- Optimal bundle size for each framework

## Development Workflow

### Package Management
- **Package Manager**: pnpm with workspaces
- **Build System**: Turbo for coordinated builds
- **Bundler**: tsup for TypeScript compilation
- **Version Management**: Changesets for coordinated releases

### Key Scripts
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm compile

# Run core tests
pnpm test

# Build documentation
pnpm docs:build

# Release workflow
pnpm ci:version  # Update versions
pnpm ci:release  # Publish packages
```

### Build Configuration
- **TypeScript**: Shared catalog version (5.8.3)
- **Vite**: Shared catalog version (6.3.5)
- **Turbo**: Orchestrates build dependencies
- **tsup**: Builds both ESM and TypeScript declarations

## Testing Strategy

### Test Framework: Vitest + Playwright
- **Browser Testing**: Multi-browser support (Chromium, Firefox, WebKit)
- **Component Testing**: Svelte component rendering in browser
- **Visual Testing**: Screenshot comparisons for drag behaviors
- **Custom Commands**: Mouse simulation via Playwright integration

### Test Structure
```
packages/core/tests/
├── components/          # Test components (Svelte)
├── plugins.test.svelte.ts    # Plugin behavior tests
├── tests.test.ts        # Core functionality tests
├── mouse.ts             # Mouse simulation utilities
└── utils.ts             # Test helpers
```

### Key Testing Patterns
- **Drag Simulation**: Custom `dragAndDrop` utility
- **Position Verification**: CSS transform checking
- **Plugin Testing**: Isolated plugin behavior verification
- **Precision Testing**: Large coordinate precision edge cases
- **State Management**: Compartment and plugin lifecycle testing

## Plugin System Deep Dive

### Core Plugins (Default)
1. **ignoreMultitouch**: Prevents multi-touch conflicts
2. **stateMarker**: Adds drag state attributes
3. **applyUserSelectHack**: Prevents text selection during drag
4. **transform**: Applies position transforms
5. **threshold**: Drag threshold and delay configuration
6. **touchAction**: Touch event optimization

### Plugin Development Pattern
```typescript
export const myPlugin = unstable_definePlugin((options = {}) => ({
  name: 'my-plugin',
  priority: 100,
  setup(ctx) {
    // Initialize plugin state
    return { /* state */ };
  },
  shouldStart(ctx, state, event) {
    // Determine if drag should start
    return true;
  },
  start(ctx, state, event) {
    // Handle drag start
  },
  drag(ctx, state, event) {
    // Handle drag movement
  },
  end(ctx, state, event) {
    // Handle drag end
  },
  cleanup(ctx, state) {
    // Clean up resources
  }
}));
```

### Plugin Context API
- **Position Properties**: `delta`, `proposed`, `offset`, `initial`
- **State Properties**: `isDragging`, `isInteracting`
- **DOM Properties**: `rootNode`, `currentlyDraggedNode`, `cachedRootNodeRect`
- **Control Methods**: `propose()`, `cancel()`, `preventStart()`, `setForcedPosition()`
- **Effects**: `effect.immediate()`, `effect.paint()`

## Framework-Specific Details

### Svelte Integration
- **Actions**: `use:draggable` action with plugin array
- **Reactivity**: Svelte 5 runes integration with `$state` and `$effect`
- **Compartments**: `Compartment.of()` for reactive plugin management
- **Legacy Support**: Separate legacy export for Svelte < 5

### React Integration
- Hook-based API with `useDraggable`
- Ref-based element attachment
- React-specific state management

### Vue Integration
- Composable pattern with `useDraggable`
- Vue 3 reactivity integration
- Directive support

### Vanilla Integration
- Direct API access
- Manual lifecycle management
- Framework-agnostic usage

## Code Quality & Standards

### TypeScript Configuration
- Strict mode enabled
- Shared catalog versions across packages
- Full type coverage including complex generic types

### Code Style
- ESM modules throughout
- No comments policy (self-documenting code)
- Consistent naming conventions
- Tree-shakeable exports

### Performance Considerations
- Event delegation for efficiency
- Pointer events over mouse events
- requestAnimationFrame for visual updates
- Effect batching system
- Minimal bundle sizes per framework

## Important Implementation Details

### Precision Handling
- Known issues with large coordinate precision at JavaScript limits
- Test cases document expected failures at 2^24+ coordinates
- Delta calculation precision challenges

### Event System
- Pointer capture for reliable dragging
- Event delegation from document root
- Proper cleanup on component destruction
- Click prevention after drag operations

### SVG Support
- Special handling for SVG elements vs HTML elements
- Transform attribute vs CSS transform
- Coordinate scaling considerations
- Browser-specific transform syntax differences

### Error Handling
- Graceful plugin failure handling
- Error reporting system with context
- Failed plugin isolation
- Development vs production error strategies

## Development Commands Reference

```bash
# Core development
cd packages/core
pnpm test                    # Run tests
pnpm test:coverage          # Run with coverage
pnpm compile:watch          # Watch mode compilation

# Framework testing
cd playground/svelte
pnpm dev                    # Development server

# Documentation
cd docs
pnpm dev                    # Documentation development

# Release process
pnpm changeset              # Create changeset
pnpm ci:version            # Version bump
pnpm ci:release            # Publish to npm
```

## Current Version Information
- **Core**: 3.0.0-next.7
- **Svelte**: 3.0.0-next.7
- **React**: 3.0.0-next.7
- **Vue**: 3.0.0-next.8
- **Solid**: 3.0.0-next.7
- **Vanilla**: 3.0.0-next.7

## Branch Information
- **Current Branch**: `new-api`
- **Main Branch**: `main` (target for PRs)
- **Development**: Active work on v3 API rewrite

## Key Files to Understand

### Core Implementation
- `packages/core/src/index.ts` - Main DraggableFactory class
- `packages/core/src/plugins.ts` - Plugin system and built-in plugins
- `packages/core/src/utils.ts` - Utility functions

### Framework Wrappers
- `packages/svelte/src/index.svelte.ts` - Svelte 5 integration
- `packages/svelte/src/legacy.ts` - Svelte < 5 support
- `packages/react/src/index.ts` - React hooks
- `packages/vue/src/index.ts` - Vue composables

### Testing
- `packages/core/tests/plugins.test.svelte.ts` - Comprehensive plugin tests
- `packages/core/vitest.config.ts` - Test configuration
- `packages/core/tests/components/` - Test components

### Configuration
- `turbo.json` - Build orchestration
- `pnpm-workspace.yaml` - Workspace configuration
- `package.json` - Root package configuration

## Next Steps for Development

When working on this codebase:

1. **Start with tests**: Always run `pnpm test` in core package
2. **Understand plugins**: Review the plugin system before adding features
3. **Framework consistency**: Ensure changes work across all framework packages
4. **Performance impact**: Consider bundle size and runtime performance
5. **Browser compatibility**: Test across Chromium, Firefox, and WebKit
6. **Type safety**: Maintain full TypeScript coverage
7. **Documentation**: Update relevant docs for API changes

This codebase represents a sophisticated, well-tested dragging library with a clean plugin architecture. The core is framework-agnostic with efficient framework-specific wrappers.