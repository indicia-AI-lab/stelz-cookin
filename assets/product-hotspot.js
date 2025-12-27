import { Component } from '@theme/component';
import { isClickedOutside, isMobileBreakpoint, mediaQueryLarge } from '@theme/utilities';

/**
 * A custom element that manages a product hotspot with hover dialog on desktop.
 * On all devices, clicking navigates directly to product page via native anchor link.
 *
 * @typedef {object} Refs
 * @property {HTMLDialogElement} dialog - The dialog element.
 * @property {HTMLElement} trigger - The trigger element (anchor or button).
 * @property {HTMLAnchorElement} productLink - The product link element.
 *
 * @extends Component<Refs>
 */

export class ProductHotspotComponent extends Component {
  requiredRefs = ['trigger'];
  /** @type {(() => void) | null} */
  #pointerenterHandler = null;
  timer = /** @type {number | null} */ (null);

  connectedCallback() {
    super.connectedCallback();

    // Set up desktop hover listeners only (clicking uses native anchor navigation)
    if (!isMobileBreakpoint()) {
      this.#setupDesktopListeners();
    }

    // Listen for breakpoint changes
    mediaQueryLarge.addEventListener('change', this.#handleBreakpointChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up listeners
    this.#removeDesktopListeners();
    mediaQueryLarge.removeEventListener('change', this.#handleBreakpointChange);
  }

  /**
   * Set up desktop event listeners (hover to show dialog)
   * @returns {void}
   */
  #setupDesktopListeners() {
    const { trigger } = this.refs;
    const dialog = this.querySelector('dialog');

    if (!trigger || !dialog) return;

    /** @type {() => void} */
    const pointerenterHandler = () => {
      if (dialog.open) return;

      this.timer = setTimeout(() => {
        this.showDialog();
      }, 120);
      trigger.addEventListener('pointerleave', this.#handlePointerLeave);
    };

    this.#pointerenterHandler = pointerenterHandler;
    trigger.addEventListener('pointerenter', pointerenterHandler);
  }

  /**
   * Remove desktop event listeners from trigger
   * @returns {void}
   */
  #removeDesktopListeners() {
    const { trigger } = this.refs;

    if (trigger && this.#pointerenterHandler) {
      trigger.removeEventListener('pointerenter', this.#pointerenterHandler);
      trigger.removeEventListener('pointerleave', this.#handlePointerLeave);
      this.#pointerenterHandler = null;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Handle breakpoint changes
   * @returns {void}
   */
  #handleBreakpointChange = () => {
    this.#removeDesktopListeners();

    if (!isMobileBreakpoint()) {
      this.#setupDesktopListeners();
    }
  };

  /**
   * Calculate the placement of the dialog.
   * @returns {Promise<void> | undefined}
   */
  #calculateDialogPlacement() {
    const { trigger } = this.refs;
    const dialog = this.querySelector('dialog');

    const hotspotsContainer = this.parentElement;

    if (!hotspotsContainer) {
      return;
    }

    // Spacing constants
    const BUTTON_GAP = 10; // Gap between button and dialog
    const CONTAINER_GAP = 10; // Gap from container edges
    const TOTAL_GAP = BUTTON_GAP + CONTAINER_GAP;

    // Get container bounds
    const containerRect = hotspotsContainer?.getBoundingClientRect();

    // Get button dimensions
    const triggerRect = trigger.getBoundingClientRect();

    // To get dialog dimensions, we need to temporarily show it invisibly
    // Show dialog invisibly to measure it
    dialog.style.visibility = 'hidden';
    dialog.style.display = 'block';
    dialog.style.transform = 'none';
    dialog.removeAttribute('data-placement');

    const { width: dialogWidth, height: dialogHeight } = dialog.getBoundingClientRect();

    // Reset dialog state
    dialog.style.removeProperty('display');
    dialog.style.removeProperty('visibility');
    dialog.style.removeProperty('transform');
    // Calculate button position relative to container
    const buttonLeft = triggerRect.left - containerRect.left;
    const buttonRight = triggerRect.right - containerRect.left;
    const buttonTop = triggerRect.top - containerRect.top;
    const buttonBottom = triggerRect.bottom - containerRect.top;

    // Calculate available space
    const spaceRight = containerRect.width - buttonRight - CONTAINER_GAP;
    const spaceLeft = buttonLeft - CONTAINER_GAP;

    // Determine horizontal placement
    let x = 'right';

    if (spaceRight >= dialogWidth + BUTTON_GAP) {
      x = 'right';
    } else if (spaceLeft >= dialogWidth + BUTTON_GAP) {
      x = 'left';
    } else {
      x = 'center';
    }

    // Determine vertical placement
    let y = 'bottom';
    let verticalOffset = 0;

    if (x !== 'center') {
      let dialogStartY = buttonTop; // Default to top-aligned
      let dialogEndY = buttonTop + dialogHeight;

      if (dialogEndY > containerRect.height - CONTAINER_GAP) {
        // If top-aligned overflows bottom
        dialogStartY = buttonBottom - dialogHeight;
        dialogEndY = buttonBottom;
        y = 'top';

        if (dialogStartY < CONTAINER_GAP) {
          // If bottom-aligned overflows top
          verticalOffset = CONTAINER_GAP - dialogStartY;
        } else if (dialogEndY > containerRect.height - CONTAINER_GAP) {
          // If bottom-aligned overflows bottom
          verticalOffset = -(dialogEndY - (containerRect.height - CONTAINER_GAP));
        }
      } else {
        if (dialogStartY < CONTAINER_GAP) {
          // If top-aligned overflows top
          if (dialogStartY < CONTAINER_GAP) {
            verticalOffset = CONTAINER_GAP - dialogStartY;
          }
          y = 'bottom';
        }
      }
    } else {
      // For center horizontal: position below or above button
      if (containerRect.height - buttonBottom >= dialogHeight + TOTAL_GAP) {
        y = 'bottom';
      } else if (buttonTop >= dialogHeight + TOTAL_GAP) {
        y = 'top';
      } else {
        // If neither fits well, choose based on button position
        y = buttonTop < containerRect.height / 2 ? 'bottom' : 'top';
      }
    }

    // Set placement data attribute
    dialog.dataset.placement = `${x},${y}`;

    // Apply vertical offset if needed to keep dialog in bounds
    if (verticalOffset !== 0) {
      dialog.style.setProperty('--dialog-vertical-offset', `${verticalOffset}px`);
    } else {
      dialog.style.removeProperty('--dialog-vertical-offset');
    }

    // Return a promise that resolves after a few ticks to ensure styles are applied
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Handle pointer leave.
   * @param {PointerEvent} e - The event.
   * @returns {void}
   */
  #handlePointerLeave = (e) => {
    const { trigger } = this.refs;
    const dialog = this.querySelector('dialog');

    // Clear open timer if leaving trigger before dialog opens
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (!dialog || !dialog.open) return;

    const isLeavingTrigger = e.target === trigger;
    const isLeavingDialog = e.target === dialog;
    const isGoingToDialog =
      e.relatedTarget === dialog ||
      (e.relatedTarget instanceof Element && e.relatedTarget.closest('dialog') === dialog);
    const isGoingToTrigger = e.relatedTarget === trigger;

    if ((isLeavingTrigger && !isGoingToDialog) || (isLeavingDialog && !isGoingToTrigger)) {
      this.closeDialog();
    }
  };

  showDialog = async () => {
    const dialog = this.querySelector('dialog');
    if (!dialog) return;
    
    await this.#calculateDialogPlacement();
    dialog.dataset.showing = 'true';
    dialog.show();
    document.body.addEventListener('click', this.lightDismissMouse);
    document.body.addEventListener('keydown', this.lightDismissKeyboard);
    document.body.addEventListener('keyup', this.lightDismissKeyboard);
    dialog.addEventListener('pointerleave', this.#handlePointerLeave);
  };

  /**
   * Close the dialog.
   * @returns {Promise<void>}
   */
  closeDialog = async () => {
    const { trigger } = this.refs;
    const dialog = this.querySelector('dialog');
    
    if (!dialog) return;
    
    dialog.dataset.closing = 'true';
    dialog.close();
    document.body.removeEventListener('click', this.lightDismissMouse);
    document.body.removeEventListener('keydown', this.lightDismissKeyboard);
    document.body.removeEventListener('keyup', this.lightDismissKeyboard);
    dialog.removeEventListener('pointerleave', this.#handlePointerLeave);
    if (trigger) {
      trigger.removeEventListener('pointerleave', this.#handlePointerLeave);
    }
    const animations = dialog.getAnimations({ subtree: true });
    await Promise.allSettled(animations.map((a) => a.finished));
    if (!dialog.open) {
      delete dialog.dataset.showing;
      delete dialog.dataset.closing;
      delete dialog.dataset.placement;
    }
  };

  /**
   * Light dismiss the dialog.
   * @param {MouseEvent} event - The event.
   * @returns {void}
   */
  lightDismissMouse = (event) => {
    const dialog = this.querySelector('dialog');
    if (dialog && isClickedOutside(event, dialog)) {
      this.closeDialog();
    }
  };

  /**
   * Light dismiss the dialog.
   * @param {KeyboardEvent} event - The event.
   * @returns {void}
   */
  lightDismissKeyboard = (event) => {
    const dialog = this.querySelector('dialog');
    if (!dialog) return;
    
    if (
      (event.type === 'keydown' && event.key === 'Escape') ||
      (event.type === 'keyup' && !dialog.matches(':is(:focus, :focus-visible, :focus-within)'))
    ) {
      this.closeDialog();
    }
  };
}

// Register custom element
customElements.define('product-hotspot-component', ProductHotspotComponent);
