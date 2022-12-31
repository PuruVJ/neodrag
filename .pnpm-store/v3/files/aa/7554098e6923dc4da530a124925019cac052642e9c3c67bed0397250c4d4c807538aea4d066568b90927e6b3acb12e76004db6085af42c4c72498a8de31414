import type {
  ObserverEventDetails,
  Options,
  Position,
  ScrollDirection,
  Event,
  LifecycleEventDetails,
} from './types';

const defaultOptions: Options = {
  root: null,
  rootMargin: '0px',
  threshold: 0,
  unobserveOnEnter: false,
};

const createEvent = <T = ObserverEventDetails>(
  name: Event,
  detail: T
): CustomEvent<T> => new CustomEvent(name, { detail });

export function inview(node: HTMLElement, options: Options = {}) {
  const { root, rootMargin, threshold, unobserveOnEnter }: Options = {
    ...defaultOptions,
    ...options,
  };

  let prevPos: Position = {
    x: undefined,
    y: undefined,
  };

  let scrollDirection: ScrollDirection = {
    vertical: undefined,
    horizontal: undefined,
  };

  if (typeof IntersectionObserver !== 'undefined' && node) {
    const observer = new IntersectionObserver(
      (entries, _observer) => {
        entries.forEach((singleEntry) => {
          if (prevPos.y > singleEntry.boundingClientRect.y) {
            scrollDirection.vertical = 'up';
          } else {
            scrollDirection.vertical = 'down';
          }

          if (prevPos.x > singleEntry.boundingClientRect.x) {
            scrollDirection.horizontal = 'left';
          } else {
            scrollDirection.horizontal = 'right';
          }

          prevPos = {
            y: singleEntry.boundingClientRect.y,
            x: singleEntry.boundingClientRect.x,
          };

          const detail: ObserverEventDetails = {
            inView: singleEntry.isIntersecting,
            entry: singleEntry,
            scrollDirection,
            node,
            observer: _observer,
          };

          node.dispatchEvent(createEvent('change', detail));

          if (singleEntry.isIntersecting) {
            node.dispatchEvent(createEvent('enter', detail));

            unobserveOnEnter && _observer.unobserve(node);
          } else {
            node.dispatchEvent(createEvent('leave', detail));
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    // This dispatcher has to be wrapped in setTimeout, as it won't work otherwise.
    // Not sure why is it happening, maybe a callstack has to pass between the listeners?
    // Definitely something to investigate to understand better.
    setTimeout(() => {
      node.dispatchEvent(
        createEvent<LifecycleEventDetails>('init', { observer, node })
      );
    }, 0);

    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      },
    };
  }
}
