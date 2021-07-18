<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  /**
   * `allowAnyClick` allows dragging using any mouse button.
   * By default, we only accept the left button.
   *
   * Defaults to `false`.
   */
  export let allowAnyClick: boolean = false;

  /**
   * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
   * with the exception of `onMouseDown`, will not fire.
   */
  export let disabled = false;

  /**
   * By default, we add 'user-select:none' attributes to the document body
   * to prevent ugly text selection during drag. If this is causing problems
   * for your app, set this to `false`.
   */
  export let enableUserSelectHack = true;

  /**
   * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
   * instead of using the parent node.
   */
  export let offsetParent: HTMLElement = null;

  /**
   * `grid` specifies the x and y that dragging should snap to.
   */
  export let grid: [number, number];

  /**
   * `handle` specifies a selector to be used as the handle that initiates drag.
   *
   * Example:
   *
   * ```svelte
   * <Draggable handle=".handle">
   *   <div>
   *     <div className="handle">Click me to drag</div>
   *     <div>This is some other content</div>
   *   </div>
   * </Draggable>
   * ```
   */
  export let handle: string;

  /**
   * `cancel` specifies a selector to be used to prevent drag initialization.
   *
   * Example:
   *
   * ```svelte
   * <Draggable cancel=".cancel">
   *   <div>
   *     <div className="cancel">You can't drag from here</div>
   *     <div>Dragging here works fine</div>
   *   </div>
   * </Draggable>
   * ```
   */
  export let cancel: string;

  const dispatch =
    createEventDispatcher<{
      start: Window;
      drag: any;
      stop: any;
      mousedown: any;
    }>();

  dispatch('start', {} as Window);
  dispatch('drag');
  dispatch('stop');
  dispatch('mousedown');
</script>

{allowAnyClick}
