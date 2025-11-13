import * as styles from "./detect-autofill.css";

export type AutofillValues = Record<string, string>;

/**
 * Detects browser autofill events on a form and executes a callback with the filled values.
 *
 * Uses CSS animations to detect when browsers autofill form fields. When autofill is detected,
 * the callback is invoked with the form's current values after a debounced delay.
 *
 * @param form - The HTML form element to monitor for autofill events
 * @param callback - Function called when autofill is detected, receives form values as key-value pairs
 * @returns Cleanup function to remove event listeners and reset state
 *
 * @example
 * ```typescript
 * const form = document.querySelector('form');
 * const cleanup = detectAutofill(form, (values) => {
 *   console.log('Autofill detected:', values);
 *   // { addressLineOne: "123 Main St", city: "New York", ... }
 * });
 *
 * // Later, clean up
 * cleanup();
 * ```
 */
export const detectAutofill = (form: HTMLFormElement, callback: (values: AutofillValues) => void) => {
  let autofillFields: Element[] = [];
  let debounceTimeout: NodeJS.Timeout;
  let state: "none" | "active" | "selected" = "none";

  // Attaches input listeners to all autofilled fields
  const attachAutofillFields = () => {
    autofillFields = Array.from(form.querySelectorAll(":autofill, :-webkit-autofill"));

    autofillFields.forEach((field) => {
      field.addEventListener("input", handleAutofillFieldChange);
    });
  };

  // Removes input listeners from all autofilled fields
  const detachAutofillFields = () => {
    autofillFields.forEach((field) => {
      field.removeEventListener("input", handleAutofillFieldChange);
    });
  };

  // Debounces callback execution by 100ms
  const debounce = (callback: () => void) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(callback, 100);
  };

  // Extracts form values as key-value pairs
  const getFormValues = () => {
    const formData = new FormData(form);
    const values: AutofillValues = {};

    for (const [key, value] of formData.entries()) {
      const stringValue = String(value).trim();
      if (stringValue) {
        values[key] = stringValue;
      }
    }

    return values;
  };

  // Handles CSS animation start events to detect autofill
  const handleAnimationStart = (e: AnimationEvent) => {
    if (e.animationName === styles.animation && state !== "selected") {
      state = "active";
      detachAutofillFields();
      attachAutofillFields();
    }
  };

  // Handles input changes on autofilled fields
  const handleAutofillFieldChange = () => {
    if (state === "active") {
      state = "selected";

      debounce(() => {
        callback(getFormValues());
        detachAutofillFields();
        state = "none";
      });
    }
  };

  // Setup
  form.classList.add(styles.form);
  form.addEventListener("animationstart", handleAnimationStart);

  // Cleanup
  return () => {
    form.classList.remove(styles.form);
    form.removeEventListener("animationstart", handleAnimationStart);

    detachAutofillFields();
    state = "none";
  };
};
