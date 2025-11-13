export type AutofillValues = Record<string, string>;

export const detectAutofill = (form: HTMLFormElement, callback: (values: AutofillValues) => void) => {
  let autofillFields: Element[] = [];
  let debounceTimeout: NodeJS.Timeout;
  let state: "none" | "active" | "selected" = "none";

  const attachAutofillFields = () => {
    autofillFields = Array.from(form.querySelectorAll(":autofill, :-webkit-autofill"));

    autofillFields.forEach((field) => {
      field.addEventListener("input", handleAutofillFieldChange);
    });
  };

  const detachAutofillFields = () => {
    autofillFields.forEach((field) => {
      field.removeEventListener("input", handleAutofillFieldChange);
    });
  };

  const debounce = (callback: () => void) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(callback, 100);
  };

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

  const handleAnimationStart = (e: AnimationEvent) => {
    if (e.animationName === "onAutofillStart" && state !== "selected") {
      state = "active";
      detachAutofillFields();
      attachAutofillFields();
    }
  };

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

  form.addEventListener("animationstart", handleAnimationStart);

  return () => {
    form.removeEventListener("animationstart", handleAnimationStart);
    detachAutofillFields();
    state = "none";
  };
};
