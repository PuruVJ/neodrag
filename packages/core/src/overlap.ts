/**
 * Overlap Detection Plugin for NeoDrag
 * 
 * Developed and maintained by Sheryians (Aayush Chouhan)
 * https://github.com/sheryianscodingschool
 */

import { unstable_definePlugin } from "./plugins";


export interface ShowOverlapConfig {
    enabled?: boolean;
    alwaysVisible?: boolean;
    showDragIndicator?: boolean;
    showTargetIndicators?: boolean;
    showOverlapIndicators?: boolean;
    showIntersectionHighlight?: boolean;
    showOverlapPercentage?: boolean;
    theme?: {
        dragIndicator?: string;
        targetIndicator?: string;
        overlapIndicator?: string;
        intersectionHighlight?: string;
        percentageText?: string;
    };
    borderWidth?: number;
    borderStyle?: string;
    fontSize?: string;
    fontFamily?: string;
    zIndex?: number;
    logging?: {
        logOverlapEvents?: boolean;
        logOverlapPercentages?: boolean;
        logTargetCount?: boolean;
    };
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
        alwaysVisible: showOverlap.alwaysVisible ?? false,
        showDragIndicator: showOverlap.showDragIndicator ?? true,
        showTargetIndicators: showOverlap.showTargetIndicators ?? true,
        showOverlapIndicators: showOverlap.showOverlapIndicators ?? true,
        showIntersectionHighlight: showOverlap.showIntersectionHighlight ?? true,
        showOverlapPercentage: showOverlap.showOverlapPercentage ?? true,
        theme: {
            dragIndicator: showOverlap.theme?.dragIndicator ?? '#15ff00',
            targetIndicator: showOverlap.theme?.targetIndicator ?? '#0088ff',
            overlapIndicator: showOverlap.theme?.overlapIndicator ?? '#ff0000',
            intersectionHighlight: showOverlap.theme?.intersectionHighlight ?? '#f23ea644',
            percentageText: showOverlap.theme?.percentageText ?? '#212121',
        },
        borderWidth: showOverlap.borderWidth ?? 2,
        borderStyle: showOverlap.borderStyle ?? 'solid',
        fontSize: showOverlap.fontSize ?? '12px',
        fontFamily: showOverlap.fontFamily ?? 'monospace',
        zIndex: showOverlap.zIndex ?? 9999,
        logging: {
            logOverlapEvents: showOverlap.logging?.logOverlapEvents ?? false,
            logOverlapPercentages: showOverlap.logging?.logOverlapPercentages ?? false,
            logTargetCount: showOverlap.logging?.logTargetCount ?? false,
        }
    } as Required<ShowOverlapConfig>;

    let lastOverlaps: Set<HTMLElement> = new Set();
    let intervalId: number | null = null;
    let animationFrameId: number | null = null;
    let cachedTargets: HTMLElement[] | null = null;
    let targetsNeedRefresh = true;
    let debugOverlays: Map<string, HTMLElement> = new Map();
    let debugStyleSheet: HTMLStyleElement | null = null;

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
        const bw = cfg.borderWidth;
        const bs = cfg.borderStyle;
        const theme = cfg.theme;
        const fontSize = cfg.fontSize;
        const fontFamily = cfg.fontFamily;

        debugStyleSheet.textContent = `.neodrag-overlap-indicator{pointer-events:none;position:fixed;box-sizing:border-box;z-index:${z}}.neodrag-overlap-drag{border:${bw}px ${bs} ${theme.dragIndicator}!important}.neodrag-overlap-target{border:${bw}px ${bs} ${theme.targetIndicator}!important}.neodrag-overlap-overlap{border:${bw}px ${bs} ${theme.overlapIndicator}!important}.neodrag-overlap-intersection{background-color:${theme.intersectionHighlight}!important;pointer-events:none;position:fixed;z-index:${z+1}}.neodrag-overlap-percentage{position:fixed;background:rgba(255,255,255,0.9);color:${theme.percentageText};font-family:${fontFamily};font-size:${fontSize};font-weight:bold;padding:2px 6px;border-radius:3px;pointer-events:none;z-index:${z+2};box-shadow:0 1px 3px rgba(0,0,0,0.3);}`;

        document.head.appendChild(debugStyleSheet);
    };

    const cleanupOverlapVisuals = () => {
        debugOverlays.forEach(o => o.remove());
        debugOverlays.clear();
        if (debugStyleSheet?.parentNode) {
            debugStyleSheet.remove();
            debugStyleSheet = null;
        }
    };

    const createOverlay = (rect: DOMRect, className: string, content?: string) => {
        const o = document.createElement('div');
        o.className = className;
        o.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
        if (content) o.textContent = content;
        return o;
    };

    const createIntersectionOverlay = (draggedRect: DOMRect, targetRect: DOMRect) => {
        const l = Math.max(draggedRect.left, targetRect.left);
        const t = Math.max(draggedRect.top, targetRect.top);
        const r = Math.min(draggedRect.right, targetRect.right);
        const b = Math.min(draggedRect.bottom, targetRect.bottom);
        return createOverlay({ left: l, top: t, width: r - l, height: b - t } as DOMRect, 'neodrag-overlap-intersection');
    };

    const createPercentageOverlay = (draggedRect: DOMRect, targetRect: DOMRect, percentage: number) => {
        const l = Math.max(draggedRect.left, targetRect.left);
        const t = Math.max(draggedRect.top, targetRect.top);
        const r = Math.min(draggedRect.right, targetRect.right);
        const b = Math.min(draggedRect.bottom, targetRect.bottom);
        const x = (l + r) * 0.5;
        const y = (t + b) * 0.5;
        const o = createOverlay({ left: x, top: y, width: 0, height: 0 } as DOMRect, 'neodrag-overlap-percentage', `${(percentage * 100).toFixed(1)}%`);
        o.style.transform = 'translate(-50%,-50%)';
        return o;
    };

    const updateOverlapVisuals = (draggedEl: HTMLElement | null, targetElements: HTMLElement[], overlappedData: Array<{ element: HTMLElement, percentage: number, draggedRect: DOMRect, targetRect: DOMRect }>) => {
        if (!cfg.enabled) return;
        
        try {
            debugOverlays.forEach(o => {
                if (o && o.parentNode) {
                    o.remove();
                }
            });
            debugOverlays.clear();

            if (cfg.showDragIndicator && draggedEl && draggedEl.getBoundingClientRect) {
                const dragRect = draggedEl.getBoundingClientRect();
                if (dragRect.width > 0 && dragRect.height > 0) {
                    const o = createOverlay(dragRect, 'neodrag-overlap-indicator neodrag-overlap-drag');
                    document.body.appendChild(o);
                    debugOverlays.set('drag-indicator', o);
                }
            }

            if (cfg.showTargetIndicators) {
                targetElements.forEach((el, i) => {
                    if (el !== draggedEl && el && el.getBoundingClientRect) {
                        const targetRect = el.getBoundingClientRect();
                        if (targetRect.width > 0 && targetRect.height > 0) {
                            const o = createOverlay(targetRect, 'neodrag-overlap-indicator neodrag-overlap-target');
                            document.body.appendChild(o);
                            debugOverlays.set(`target-indicator-${i}`, o);
                        }
                    }
                });
            }

            overlappedData.forEach(({ percentage, draggedRect, targetRect }, i) => {
                if (cfg.showOverlapIndicators && targetRect.width > 0 && targetRect.height > 0) {
                    const o = createOverlay(targetRect, 'neodrag-overlap-indicator neodrag-overlap-overlap');
                    document.body.appendChild(o);
                    debugOverlays.set(`overlap-indicator-${i}`, o);
                }
                if (cfg.showIntersectionHighlight) {
                    const o = createIntersectionOverlay(draggedRect, targetRect);
                    document.body.appendChild(o);
                    debugOverlays.set(`intersection-${i}`, o);
                }
                if (cfg.showOverlapPercentage) {
                    const o = createPercentageOverlay(draggedRect, targetRect, percentage);
                    document.body.appendChild(o);
                    debugOverlays.set(`percentage-${i}`, o);
                }
            });

            if (cfg.logging.logTargetCount) console.log(`[Show Overlap] Target count: ${targetElements.length}`);
            if (cfg.logging.logOverlapEvents && overlappedData.length) console.log(`[Show Overlap] Overlapping elements:`, overlappedData.map(d => ({ element: d.element, percentage: d.percentage })));
            if (cfg.logging.logOverlapPercentages && overlappedData.length) console.log(`[Show Overlap] Percentages:`, overlappedData.map(d => `${(d.percentage * 100).toFixed(1)}%`));
        } catch (error) {
            console.error('[NeoDrag Overlap] Error updating visual overlays:', error);
        }
    };

    const showAlwaysVisibleOverlap = () => {
        if (cfg.enabled && cfg.alwaysVisible) updateOverlapVisuals(null, getTargetElements(), []);
    };

    const updateElementRectCache = (element: HTMLElement) => {
        if (element.isConnected) {
            elementRectCache.set(element, element.getBoundingClientRect());
        } else {
            elementRectCache.delete(element);
            observedElements.delete(element);
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
        // Clean up existing observers and listeners first
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
        targetElements.forEach(element => {
            if (element !== draggedElement) {
                observeElement(element);
            }
        });
    };

    const getTargetElements = (): HTMLElement[] => {
        if (cachedTargets && !targetsNeedRefresh) return cachedTargets;
        let elements: HTMLElement[];

        if (!targets) {
            // If no targets specified, return empty array to avoid performance issues
            // Users should explicitly specify targets for overlap detection
            console.warn('[NeoDrag Overlap] No targets specified. Please provide target selectors or elements for better performance.');
            elements = [];
        } else if (typeof targets === 'string') {
            // Single string selector
            try {
                elements = Array.from(document.querySelectorAll<HTMLElement>(targets));
            } catch (error) {
                console.error('[NeoDrag Overlap] Invalid selector:', targets, error);
                elements = [];
            }
        } else if (Array.isArray(targets)) {
            // Array of selectors or HTMLElements
            elements = [];
            for (const target of targets) {
                if (typeof target === 'string') {
                    // String selector in array
                    try {
                        const found = Array.from(document.querySelectorAll<HTMLElement>(target));
                        elements.push(...found);
                    } catch (error) {
                        console.error('[NeoDrag Overlap] Invalid selector in array:', target, error);
                    }
                } else if (target instanceof HTMLElement) {
                    // Direct HTMLElement in array
                    if (target.isConnected) {
                        elements.push(target);
                    }
                }
            }
        } else {
            // Direct array of HTMLElements (legacy support)
            elements = (targets as HTMLElement[]).filter((el: HTMLElement) => el instanceof HTMLElement && el.isConnected);
        }

        // Remove duplicates using Set and filter out disconnected elements
        const uniqueElements = Array.from(new Set(elements)).filter(el => el.isConnected);
        cachedTargets = uniqueElements;
        targetsNeedRefresh = false;
        return uniqueElements;
    };

    // Performance optimization: Fast overlap calculation with early returns
    const getOverlapPercentage = (a: DOMRect, b: DOMRect) => {
        // Early return for non-intersecting rectangles
        if (a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top) return 0;

        const l = Math.max(a.left, b.left);
        const t = Math.max(a.top, b.top);
        const r = Math.min(a.right, b.right);
        const b2 = Math.min(a.bottom, b.bottom);
        const intersection = (r - l) * (b2 - t);
        const areaA = a.width * a.height;
        return areaA === 0 ? 0 : intersection / areaA;
    };

    // Pre-allocated buffers for better performance
    let overlappedBuffer: HTMLElement[] = [];
    let overlappedDataBuffer: Array<{ element: HTMLElement, percentage: number, draggedRect: DOMRect, targetRect: DOMRect }> = [];

    const runDetection = (ctx: any, legacy = false) => {
        if (!ctx?.rootNode) {
            console.warn('[NeoDrag Overlap] Invalid context provided');
            return;
        }
        
        const draggedEl = ctx.rootNode as HTMLElement;
        if (!draggedEl?.getBoundingClientRect) {
            console.warn('[NeoDrag Overlap] Invalid dragged element');
            return;
        }

        // Use cached rect if available and not legacy mode
        const draggedRect = !legacy && intersectionObserver && resizeObserver 
            ? (() => {
                draggedElement = draggedEl;
                updateElementRectCache(draggedElement);
                return elementRectCache.get(draggedElement);
            })()
            : draggedEl.getBoundingClientRect();

        if (!draggedRect || draggedRect.width === 0 || draggedRect.height === 0) return;

        // Clear buffers efficiently
        overlappedBuffer.length = 0;
        overlappedDataBuffer.length = 0;

        const targetElements = getTargetElements();
        const minThreshold = Math.max(threshold, 0.000001);

        // Optimized detection loop
        for (const el of targetElements) {
            if (el === draggedEl || !el?.isConnected) continue;

            const elRect = !legacy && elementRectCache.has(el) 
                ? elementRectCache.get(el)! 
                : el.getBoundingClientRect?.();
            
            if (!elRect || elRect.width === 0 || elRect.height === 0) continue;

            // Inline intersection check for performance
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

        // Handle overlap events
        const currentSet = new Set(overlappedBuffer);
        const newEntries: HTMLElement[] = [];
        const removedEntries: HTMLElement[] = [];

        for (const el of currentSet) if (!lastOverlaps.has(el)) newEntries.push(el);
        for (const el of lastOverlaps) if (!currentSet.has(el)) removedEntries.push(el);

        if (oncePerTarget) {
            newEntries.forEach(el => onOverlapStart?.(el));
            removedEntries.forEach(el => onOverlapEnd?.(el));
        } else {
            overlappedBuffer.forEach(el => onOverlapStart?.(el));
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
            if (!ctx?.rootNode) {
                console.warn('[NeoDrag Overlap] Invalid context provided');
                return;
            }
            
            if (cfg.enabled) initOverlapStyles();
            targetsNeedRefresh = true;

            if (!intersectionObserver || !resizeObserver) initObservers();

            const rootElement = ctx.rootNode as HTMLElement;
            if (rootElement && typeof rootElement.getBoundingClientRect === 'function') {
                draggedElement = rootElement;
                if (resizeObserver) {
                    resizeObserver.observe(draggedElement);
                    updateElementRectCache(draggedElement);
                }
            } else {
                console.warn('[NeoDrag Overlap] Invalid root element provided');
                return;
            }

            refreshObservedElements();

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

            if (cfg.enabled) {
                if (cfg.alwaysVisible) showAlwaysVisibleOverlap();
                else cleanupOverlapVisuals();
            }

            draggedElement = null;
        },
        cleanup() {
            if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
            if (animationFrameId !== null) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }

            if (scrollEventListener) {
                window.removeEventListener('scroll', scrollEventListener);
                scrollEventListener = null;
            }

            if (intersectionObserver) {
                intersectionObserver.disconnect();
                intersectionObserver = null;
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }

            observedElements.clear();
            elementRectCache.clear();
            lastOverlaps.clear();
            cachedTargets = null;
            targetsNeedRefresh = true;
            overlappedBuffer.length = 0;
            overlappedDataBuffer.length = 0;
            draggedElement = null;
            observerUpdateScheduled = false;

            cleanupOverlapVisuals();
        },
        init() {
            if (cfg.enabled) {
                initOverlapStyles();
                if (cfg.alwaysVisible) showAlwaysVisibleOverlap();
            }

            if (!intersectionObserver || !resizeObserver) initObservers();
        },
    };
});
