/**
 * Overlap Detection Plugin for NeoDrag
 * 
 * Developed and maintained by Sheryians (Aayush Chouhan)
 * https://github.com/sheryianscodingschool
 */

import { unstable_definePlugin } from "./plugins";


export interface ShowOverlapConfig {
    enabled?: boolean;
    dragColor?: string;
    targetColor?: string;
    overlapColor?: string;
    zIndex?: number;
}

export interface OverlapOptions {
    targets?: string | string[] | HTMLElement[];
    threshold?: number;
    oncePerTarget?: boolean;
    checkFrequency?: number | 'frame';
    showOverlap?: ShowOverlapConfig;
    onOverlapStart?: (target: HTMLElement) => void;
    onOverlapEnd?: (target: HTMLElement) => void;
    onOverlapUpdate?: (targets: HTMLElement[]) => void;
}

/** Creates an overlap detection plugin for neodrag */
export const overlap = unstable_definePlugin((options: OverlapOptions = {}) => {
    const { targets, threshold = 0.01, oncePerTarget = true, checkFrequency = 'frame', showOverlap = {}, onOverlapStart, onOverlapEnd, onOverlapUpdate } = options;

    const cfg = {
        enabled: showOverlap.enabled ?? false,
        dragColor: showOverlap.dragColor ?? '#00ff88',
        targetColor: showOverlap.targetColor ?? '#0088ff',
        overlapColor: showOverlap.overlapColor ?? '#ff0000',
        zIndex: showOverlap.zIndex ?? 9999,
    } as Required<ShowOverlapConfig>;

    let lastOverlaps: Set<HTMLElement> = new Set();
    let intervalId: number | null = null;
    let animationFrameId: number | null = null;
    let cachedTargets: HTMLElement[] | null = null;
    let targetsNeedRefresh = true;
    let debugOverlays: Map<string, HTMLElement> = new Map();
    let debugStyleSheet: HTMLStyleElement | null = null;
    let overlayPool: HTMLElement[] = []; // Pool for reusing overlay elements

    // Observer-based optimization
    let intersectionObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let draggedElement: HTMLElement | null = null;
    let observedElements: Set<HTMLElement> = new Set();
    let elementRectCache: Map<HTMLElement, DOMRect> = new Map();
    let observerUpdateScheduled = false;
    let scrollEventListener: (() => void) | null = null;

    const initOverlapStyles = () => {
        if (!cfg.enabled || debugStyleSheet) return;

        debugStyleSheet = document.createElement('style');
        debugStyleSheet.id = 'neodrag-overlap-visual-styles';

        const z = cfg.zIndex;

        debugStyleSheet.textContent = `.neodrag-overlap-indicator{pointer-events:none;position:fixed;box-sizing:border-box;z-index:${z}}.neodrag-overlap-overlap{border:2px solid ${cfg.overlapColor}!important}.neodrag-overlap-drag{border:2px solid ${cfg.dragColor}!important}.neodrag-overlap-target{border:2px solid ${cfg.targetColor}!important}`;

        document.head.appendChild(debugStyleSheet);
    };

    const cleanupOverlapVisuals = () => {
        debugOverlays.forEach(o => {
            o.remove();
            overlayPool.push(o); // Return to pool for reuse
        });
        debugOverlays.clear();
        if (debugStyleSheet?.parentNode) {
            debugStyleSheet.remove();
            debugStyleSheet = null;
        }
    };

    const createOverlay = (rect: DOMRect, className: string) => {
        const o = overlayPool.pop() || document.createElement('div');
        o.className = className;
        o.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
        return o;
    };

    const updateOverlapVisuals = (draggedEl: HTMLElement | null, targetElements: HTMLElement[], overlappedData: Array<{ element: HTMLElement, percentage: number, draggedRect: DOMRect, targetRect: DOMRect }>) => {
        if (!cfg.enabled) return;

        debugOverlays.forEach(o => o.remove());
        debugOverlays.clear();

        // Show border on dragged element - use cached rect only
        if (draggedEl) {
            const dragRect = elementRectCache.get(draggedEl);
            if (dragRect && dragRect.width > 0 && dragRect.height > 0) {
                const o = createOverlay(dragRect, 'neodrag-overlap-indicator neodrag-overlap-drag');
                document.body.appendChild(o);
                debugOverlays.set('drag-indicator', o);
            }
        }

        // Show borders on target elements - use cached rects only  
        for (let i = 0; i < targetElements.length; i++) {
            const el = targetElements[i];
            if (el !== draggedEl) {
                const targetRect = elementRectCache.get(el);
                if (targetRect && targetRect.width > 0 && targetRect.height > 0) {
                    const o = createOverlay(targetRect, 'neodrag-overlap-indicator neodrag-overlap-target');
                    document.body.appendChild(o);
                    debugOverlays.set(`target-indicator-${i}`, o);
                }
            }
        }

        for (let i = 0; i < overlappedData.length; i++) {
            const { targetRect } = overlappedData[i];
            if (targetRect.width > 0 && targetRect.height > 0) {
                const o = createOverlay(targetRect, 'neodrag-overlap-indicator neodrag-overlap-overlap');
                document.body.appendChild(o);
                debugOverlays.set(`overlap-indicator-${i}`, o);
            }
        }
    };

    const updateElementRectCache = (element: HTMLElement) => {
        if (element.isConnected) {
            elementRectCache.set(element, element.getBoundingClientRect());
        } else {
            elementRectCache.delete(element);
            observedElements.delete(element);
        }
    };

    const cleanupObservers = () => {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (scrollEventListener) {
            window.removeEventListener('scroll', scrollEventListener);
            scrollEventListener = null;
        }
    };

    const scheduleObserverUpdate = () => {
        if (observerUpdateScheduled) return;
        observerUpdateScheduled = true;

        requestAnimationFrame(() => {
            if (!observerUpdateScheduled) return;
            observerUpdateScheduled = false;

            observedElements.forEach(element => {
                if (element?.isConnected) updateElementRectCache(element);
            });

            if (draggedElement?.isConnected) {
                updateElementRectCache(draggedElement);
                runDetection({ rootNode: draggedElement });
            }
        });
    };

    const initObservers = () => {
        cleanupObservers();

        // Intersection Observer to detect when elements enter/leave viewport
        intersectionObserver = new IntersectionObserver((entries) => {
            let shouldUpdate = false;
            entries.forEach(entry => {
                const element = entry.target as HTMLElement;
                if (entry.isIntersecting) {
                    updateElementRectCache(element);
                    observedElements.add(element);
                } else {
                    elementRectCache.delete(element);
                    observedElements.delete(element);
                }
                shouldUpdate = true;
            });
            if (shouldUpdate) scheduleObserverUpdate();
        }, {
            root: null,
            rootMargin: '50px', // Small margin to catch elements just outside viewport
            threshold: 0
        });

        // Resize Observer to detect when elements change size or position
        resizeObserver = new ResizeObserver((entries) => {
            let shouldUpdate = false;
            entries.forEach(entry => {
                const element = entry.target as HTMLElement;
                if (observedElements.has(element) || element === draggedElement) {
                    updateElementRectCache(element);
                    shouldUpdate = true;
                }
            });
            if (shouldUpdate) scheduleObserverUpdate();
        });

        // Listen for scroll events to update element positions
        scrollEventListener = scheduleObserverUpdate;
        window.addEventListener('scroll', scrollEventListener, { passive: true });
    };

    const observeElement = (element: HTMLElement) => {
        if (!observedElements.has(element) && element.isConnected) {
            intersectionObserver?.observe(element);
            resizeObserver?.observe(element);
            observedElements.add(element);
            updateElementRectCache(element);
        }
    };

    const unobserveElement = (element: HTMLElement) => {
        if (observedElements.has(element)) {
            intersectionObserver?.unobserve(element);
            resizeObserver?.unobserve(element);
            observedElements.delete(element);
            elementRectCache.delete(element);
        }
    };

    const refreshObservedElements = () => {
        const targetElements = getTargetElements();

        // Remove elements that are no longer targets
        for (const element of observedElements) {
            if (!targetElements.includes(element) && element !== draggedElement) {
                unobserveElement(element);
            }
        }

        // Add new target elements
        for (let i = 0; i < targetElements.length; i++) {
            const element = targetElements[i];
            if (element !== draggedElement) observeElement(element);
        }
    };

    const getTargetElements = (): HTMLElement[] => {
        if (cachedTargets && !targetsNeedRefresh) return cachedTargets;
        let elements: HTMLElement[];

        if (!targets) {
            elements = [];
        } else if (typeof targets === 'string') {
            // Single string selector
            try {
                elements = Array.from(document.querySelectorAll<HTMLElement>(targets));
            } catch (error) {
                elements = [];
            }
        } else if (Array.isArray(targets)) {
            // Array of selectors or HTMLElements
            elements = [];
            for (const target of targets) {
                if (typeof target === 'string') {
                    try {
                        const found = Array.from(document.querySelectorAll<HTMLElement>(target));
                        elements.push(...found);
                    } catch (error) {
                        // Skip invalid selectors
                    }
                } else if (target instanceof HTMLElement && target.isConnected) {
                    elements.push(target);
                }
            }
        } else {
            elements = [];
        }

        // Remove duplicates using Set and filter out disconnected elements
        const uniqueElements = Array.from(new Set(elements)).filter(el => el.isConnected);
        cachedTargets = uniqueElements;
        targetsNeedRefresh = false;
        return uniqueElements;
    };

    // Ultra-fast overlap calculation with minimal operations
    const getOverlapPercentage = (a: DOMRect, b: DOMRect) => {
        const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                           Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        return intersection / (a.width * a.height || 1);
    };

    const runDetection = (ctx: any) => {
        if (!ctx?.rootNode) return;

        const draggedEl = ctx.rootNode as HTMLElement;
        if (!draggedEl) return;

        // Always use cached rect for dragged element
        draggedElement = draggedEl;
        updateElementRectCache(draggedElement);
        const draggedRect = elementRectCache.get(draggedElement);
        
        if (!draggedRect || draggedRect.width === 0 || draggedRect.height === 0) return;

        // Create fresh buffers
        const overlappedBuffer: HTMLElement[] = [];
        const overlappedDataBuffer: Array<{ element: HTMLElement, percentage: number, draggedRect: DOMRect, targetRect: DOMRect }> = [];

        const targetElements = getTargetElements();
        const minThreshold = Math.max(threshold, 0.000001);

        // Optimized detection loop - cache-only
        for (let i = 0; i < targetElements.length; i++) {
            const el = targetElements[i];
            if (el === draggedEl) continue;

            let elRect = elementRectCache.get(el);
            if (!elRect) {
                // Cache miss - update cache
                updateElementRectCache(el);
                elRect = elementRectCache.get(el);
                if (!elRect) continue; // Element disconnected
            }
            
            if (elRect.width === 0 || elRect.height === 0) continue;

            // Fast intersection check
            if (draggedRect.right <= elRect.left || elRect.right <= draggedRect.left ||
                draggedRect.bottom <= elRect.top || elRect.bottom <= draggedRect.top) continue;

            const percent = getOverlapPercentage(draggedRect, elRect);
            if (percent >= minThreshold) {
                overlappedBuffer.push(el);
                overlappedDataBuffer.push({ element: el, percentage: percent, draggedRect, targetRect: elRect });
            }
        }

        // Update visuals if enabled
        if (cfg.enabled) {
            updateOverlapVisuals(draggedEl, targetElements, overlappedDataBuffer);
        }

        // Handle overlap events - optimized
        const currentSet = new Set(overlappedBuffer);
        
        if (oncePerTarget) {
            // Process new overlaps
            for (const el of currentSet) {
                if (!lastOverlaps.has(el)) onOverlapStart?.(el);
            }
            // Process ended overlaps  
            for (const el of lastOverlaps) {
                if (!currentSet.has(el)) onOverlapEnd?.(el);
            }
        } else {
            for (let i = 0; i < overlappedBuffer.length; i++) {
                onOverlapStart?.(overlappedBuffer[i]);
            }
        }

        onOverlapUpdate?.(overlappedBuffer);
        lastOverlaps = currentSet;
    };

    return {
        name: 'overlap-detection',
        liveUpdate: true,

        drag(ctx) {
            if (checkFrequency === 'frame') {
                if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(() => runDetection(ctx));
            }
        },
        start(ctx) {
            if (!ctx?.rootNode) return;

            if (cfg.enabled) initOverlapStyles();
            targetsNeedRefresh = true;

            if (!intersectionObserver || !resizeObserver) initObservers();

            const rootElement = ctx.rootNode as HTMLElement;
            if (rootElement) {
                draggedElement = rootElement;
                if (resizeObserver) {
                    resizeObserver.observe(draggedElement);
                    updateElementRectCache(draggedElement);
                }
            } else {
                return;
            }

            refreshObservedElements();

            // Show borders when dragging starts
            if (cfg.enabled) {
                updateOverlapVisuals(draggedElement, getTargetElements(), []);
            }

            if (checkFrequency !== 'frame' && typeof checkFrequency === 'number' && checkFrequency > 0) {
                intervalId = window.setInterval(() => runDetection(ctx), checkFrequency);
            }
        },
        end() {
            if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
            if (animationFrameId !== null) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }

            if (draggedElement && resizeObserver) {
                resizeObserver.unobserve(draggedElement);
                elementRectCache.delete(draggedElement);
            }

            for (const el of lastOverlaps) onOverlapEnd?.(el);
            lastOverlaps.clear();

            // Clean up visuals when dragging ends
            if (cfg.enabled) {
                cleanupOverlapVisuals();
            }

            draggedElement = null;
        },
        cleanup() {
            if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
            if (animationFrameId !== null) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }

            cleanupObservers();

            observedElements.clear();
            elementRectCache.clear();
            lastOverlaps.clear();
            cachedTargets = null;
            targetsNeedRefresh = true;
            draggedElement = null;
            observerUpdateScheduled = false;

            cleanupOverlapVisuals();
            overlayPool.length = 0; // Clear overlay pool
        },
    };
});
