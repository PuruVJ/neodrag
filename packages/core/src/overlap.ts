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

    const overlapConfig: Required<ShowOverlapConfig> = {
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
            intersectionHighlight: showOverlap.theme?.intersectionHighlight ?? '#ffffffa0',
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
    };

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

    const initOverlapStyles = () => {
        if (!overlapConfig.enabled || debugStyleSheet) return;
        debugStyleSheet = document.createElement('style');
        debugStyleSheet.id = 'neodrag-overlap-visual-styles';
        debugStyleSheet.textContent = `.neodrag-overlap-indicator{pointer-events:none;position:absolute;box-sizing:border-box;z-index:${overlapConfig.zIndex}}.neodrag-overlap-drag{border:${overlapConfig.borderWidth}px ${overlapConfig.borderStyle} ${overlapConfig.theme.dragIndicator}!important}.neodrag-overlap-target{border:${overlapConfig.borderWidth}px ${overlapConfig.borderStyle} ${overlapConfig.theme.targetIndicator}!important}.neodrag-overlap-overlap{border:${overlapConfig.borderWidth}px ${overlapConfig.borderStyle} ${overlapConfig.theme.overlapIndicator}!important}.neodrag-overlap-intersection{background-color:${overlapConfig.theme.intersectionHighlight}!important;pointer-events:none;position:absolute;mix-blend-mode:difference;z-index:${overlapConfig.zIndex + 1}}.neodrag-overlap-percentage{position:absolute;background:rgba(255,255,255,0.9);color:${overlapConfig.theme.percentageText};font-family:${overlapConfig.fontFamily};font-size:${overlapConfig.fontSize};font-weight:bold;padding:2px 6px;border-radius:3px;pointer-events:none;z-index:${overlapConfig.zIndex + 2};box-shadow:0 1px 3px rgba(0,0,0,0.3)}`;
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

    const createIndicatorOverlay = (rect: DOMRect, className: string) => {
        const o = document.createElement('div');
        o.className = `neodrag-overlap-indicator ${className}`;
        o.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
        return o;
    };

    const createIntersectionOverlay = (draggedRect: DOMRect, targetRect: DOMRect, percentage?: number) => {
        const l = Math.max(draggedRect.left, targetRect.left);
        const t = Math.max(draggedRect.top, targetRect.top);
        const r = Math.min(draggedRect.right, targetRect.right);
        const b = Math.min(draggedRect.bottom, targetRect.bottom);
        const o = document.createElement('div');
        o.className = 'neodrag-overlap-intersection';
        o.style.cssText = `left:${l}px;top:${t}px;width:${r - l}px;height:${b - t}px`;
        return o;
    };

    const createPercentageOverlay = (draggedRect: DOMRect, targetRect: DOMRect, percentage: number) => {
        const o = document.createElement('div');
        o.className = 'neodrag-overlap-percentage';
        o.textContent = `${(percentage * 100).toFixed(1)}%`;
        const l = Math.max(draggedRect.left, targetRect.left);
        const t = Math.max(draggedRect.top, targetRect.top);
        const r = Math.min(draggedRect.right, targetRect.right);
        const b = Math.min(draggedRect.bottom, targetRect.bottom);
        const x = (l + r) * 0.5;
        const y = (t + b) * 0.5;
        o.style.cssText = `left:${x}px;top:${y}px;transform:translate(-50%,-50%)`;
        return o;
    };

    const updateOverlapVisuals = (draggedEl: HTMLElement | null, targetElements: HTMLElement[], overlappedData: Array<{ element: HTMLElement, percentage: number, draggedRect: DOMRect, targetRect: DOMRect }>) => {
        if (!overlapConfig.enabled) return;
        debugOverlays.forEach(o => o.remove());
        debugOverlays.clear();

        if (overlapConfig.showDragIndicator && draggedEl) {
            const o = createIndicatorOverlay(draggedEl.getBoundingClientRect(), 'neodrag-overlap-drag');
            document.body.appendChild(o);
            debugOverlays.set('drag-indicator', o);
        }

        if (overlapConfig.showTargetIndicators) {
            targetElements.forEach((el, i) => {
                if (el !== draggedEl) {
                    const o = createIndicatorOverlay(el.getBoundingClientRect(), 'neodrag-overlap-target');
                    document.body.appendChild(o);
                    debugOverlays.set(`target-indicator-${i}`, o);
                }
            });
        }

        overlappedData.forEach(({ percentage, draggedRect, targetRect }, i) => {
            if (overlapConfig.showOverlapIndicators) {
                const o = createIndicatorOverlay(targetRect, 'neodrag-overlap-overlap');
                document.body.appendChild(o);
                debugOverlays.set(`overlap-indicator-${i}`, o);
            }
            if (overlapConfig.showIntersectionHighlight) {
                const o = createIntersectionOverlay(draggedRect, targetRect);
                document.body.appendChild(o);
                debugOverlays.set(`intersection-${i}`, o);
            }
            if (overlapConfig.showOverlapPercentage) {
                const o = createPercentageOverlay(draggedRect, targetRect, percentage);
                document.body.appendChild(o);
                debugOverlays.set(`percentage-${i}`, o);
            }
        });

        if (overlapConfig.logging.logTargetCount) console.log(`[Show Overlap] Target count: ${targetElements.length}`);
        if (overlapConfig.logging.logOverlapEvents && overlappedData.length) console.log(`[Show Overlap] Overlapping elements:`, overlappedData.map(d => ({ element: d.element, percentage: d.percentage })));
        if (overlapConfig.logging.logOverlapPercentages && overlappedData.length) console.log(`[Show Overlap] Percentages:`, overlappedData.map(d => `${(d.percentage * 100).toFixed(1)}%`));
    };

    const showAlwaysVisibleOverlap = () => {
        if (overlapConfig.enabled && overlapConfig.alwaysVisible) updateOverlapVisuals(null, getTargetElements(), []);
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
            observerUpdateScheduled = false;
            if (draggedElement) {
                updateElementRectCache(draggedElement);
                runDetectionOptimized();
            }
        });
    };

    const initObservers = () => {
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
            // If no targets specified, select all elements
            elements = Array.from(document.querySelectorAll<HTMLElement>('*'));
        } else if (typeof targets === 'string') {
            // Single string selector
            elements = Array.from(document.querySelectorAll<HTMLElement>(targets));
        } else if (Array.isArray(targets)) {
            // Array of selectors or HTMLElements
            elements = [];
            for (const target of targets) {
                if (typeof target === 'string') {
                    // String selector in array
                    const found = Array.from(document.querySelectorAll<HTMLElement>(target));
                    elements.push(...found);
                } else if (target instanceof HTMLElement) {
                    // Direct HTMLElement in array
                    elements.push(target);
                }
            }
        } else {
            // Direct array of HTMLElements (legacy support)
            elements = targets;
        }
        
        // Remove duplicates using Set
        const uniqueElements = Array.from(new Set(elements));
        cachedTargets = uniqueElements;
        targetsNeedRefresh = false;
        return uniqueElements;
    };

    // Performance optimization: inline rectanglesIntersect for hot path
    const rectanglesIntersect = (a: DOMRect, b: DOMRect) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);

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

    const runDetectionOptimized = () => {
        if (!draggedElement) return;
        
        const draggedRect = elementRectCache.get(draggedElement);
        if (!draggedRect || draggedRect.width === 0 || draggedRect.height === 0) return;

        // Clear buffers efficiently
        overlappedBuffer.length = 0;
        overlappedDataBuffer.length = 0;

        const targetElements = getTargetElements();
        const minThreshold = Math.max(threshold, 0.000001);

        // Optimized detection loop with early exits
        for (const el of targetElements) {
            if (el === draggedElement) continue;
            
            const elRect = elementRectCache.get(el);
            // Fast early exit for invalid rects
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

        // Only update visuals if enabled
        if (overlapConfig.enabled) {
            updateOverlapVisuals(draggedElement, targetElements, overlappedDataBuffer);
        }

        // Efficient set operations for overlap events
        const currentSet = new Set(overlappedBuffer);
        let hasChanges = false;
        const newEntries: HTMLElement[] = [];
        const removedEntries: HTMLElement[] = [];

        // Only compute differences if we have event handlers
        for (const el of currentSet) {
            if (!lastOverlaps.has(el)) {
                newEntries.push(el);
                hasChanges = true;
            }
        }
        for (const el of lastOverlaps) {
            if (!currentSet.has(el)) {
                removedEntries.push(el);
                hasChanges = true;
            }
        }

        if (oncePerTarget && hasChanges) {
            newEntries.forEach(el => onOverlapStart?.(el));
            removedEntries.forEach(el => onOverlapEnd?.(el));
        }

        // Always call onOverlapUpdate as it provides current state
        onOverlapUpdate?.(overlappedBuffer);
        lastOverlaps = currentSet;
    };

    const runDetection = (ctx: any) => {
        const draggedEl = ctx.rootNode as HTMLElement;
        if (!draggedEl?.getBoundingClientRect) return;
        
        // Fallback to direct getBoundingClientRect if observers are not available
        if (!intersectionObserver || !resizeObserver) {
            runDetectionLegacy(ctx);
            return;
        }
        
        // Update dragged element cache and run optimized detection
        draggedElement = draggedEl;
        updateElementRectCache(draggedElement);
        runDetectionOptimized();
    };

    const runDetectionLegacy = (ctx: any) => {
        const draggedEl = ctx.rootNode as HTMLElement;
        if (!draggedEl?.getBoundingClientRect) return;
        const draggedRect = draggedEl.getBoundingClientRect();
        if (draggedRect.width === 0 || draggedRect.height === 0) return;

        overlappedBuffer.length = 0;
        overlappedDataBuffer.length = 0;

        const targetElements = getTargetElements();
        const minThreshold = Math.max(threshold, 0.000001);

        for (const el of targetElements) {
            if (el === draggedEl) continue;
            const elRect = el.getBoundingClientRect();
            if (elRect.width === 0 || elRect.height === 0 || !rectanglesIntersect(draggedRect, elRect)) continue;
            const percent = getOverlapPercentage(draggedRect, elRect);
            if (percent >= minThreshold) {
                overlappedBuffer.push(el);
                overlappedDataBuffer.push({ element: el, percentage: percent, draggedRect, targetRect: elRect });
            }
        }

        updateOverlapVisuals(draggedEl, targetElements, overlappedDataBuffer);

        const currentSet = new Set(overlappedBuffer);
        const newEntries: HTMLElement[] = [];
        const removedEntries: HTMLElement[] = [];

        for (const el of currentSet) if (!lastOverlaps.has(el)) newEntries.push(el);
        for (const el of lastOverlaps) if (!currentSet.has(el)) removedEntries.push(el);

        if (oncePerTarget) {
            newEntries.forEach(el => onOverlapStart?.(el));
            removedEntries.forEach(el => onOverlapEnd?.(el));
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
            if (overlapConfig.enabled) initOverlapStyles();
            targetsNeedRefresh = true;
            
            // Initialize observers for better performance
            if (!intersectionObserver || !resizeObserver) {
                initObservers();
            }
            
            draggedElement = ctx.rootNode as HTMLElement;
            
            // Start observing the dragged element
            if (draggedElement) {
                resizeObserver?.observe(draggedElement);
                updateElementRectCache(draggedElement);
            }
            
            // Refresh and start observing target elements
            refreshObservedElements();
            
            if (checkFrequency !== 'frame') {
                intervalId = window.setInterval(() => runDetection(ctx), checkFrequency as number);
            }
        },
        end() {
            if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
            if (animationFrameId !== null) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
            
            // Stop observing the dragged element
            if (draggedElement && resizeObserver) {
                resizeObserver.unobserve(draggedElement);
                elementRectCache.delete(draggedElement);
            }
            
            for (const el of lastOverlaps) onOverlapEnd?.(el);
            lastOverlaps.clear();
            
            if (overlapConfig.enabled) {
                if (overlapConfig.alwaysVisible) showAlwaysVisibleOverlap();
                else cleanupOverlapVisuals();
            }
            
            draggedElement = null;
        },
        cleanup() {
            if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
            if (animationFrameId !== null) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
            
            // Cleanup all observers
            if (intersectionObserver) {
                intersectionObserver.disconnect();
                intersectionObserver = null;
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            
            // Clear all caches and state
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
            if (overlapConfig.enabled) {
                initOverlapStyles();
                if (overlapConfig.alwaysVisible) showAlwaysVisibleOverlap();
            }
            
            // Pre-initialize observers for better startup performance
            if (!intersectionObserver || !resizeObserver) {
                initObservers();
            }
        },
    };
});
