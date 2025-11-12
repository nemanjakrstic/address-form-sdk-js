type AutofillValues = Record<string, string>;

type AutofillState = "pending" | "started" | "updated" | "completed";

type AutofillCallback = (state: AutofillState, values: AutofillValues) => void;

export const detectAutofill = (form: HTMLFormElement, callback: AutofillCallback) => {
  let state: AutofillState = "pending";
  let autofillFields: NodeListOf<Element> | null = null;
  const updatedFields = new Set<Element>();

  const getAutofillFields = () => {
    return form.querySelectorAll(":autofill, :-webkit-autofill");
  };

  const getValues = () => {
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

  const checkCompletion = () => {
    if (autofillFields && updatedFields.size === autofillFields.length) {
      state = "completed";
      console.log("Autofill completed - all fields updated");
      callback(state, getValues());
    }
  };

  const handleAutofillAnimationStart = (e: AnimationEvent) => {
    if (e.animationName === "onAutofillStart") {
      state = "started";
      autofillFields = getAutofillFields();
      updatedFields.clear();
      console.log(
        `Autofill started - ${autofillFields.length} fields detected:`,
        Array.from(autofillFields).map((f) => (f as HTMLInputElement).name || f.tagName),
      );
      callback(state, getValues());

      // Listen for changes on autofilled fields
      autofillFields.forEach((field) => {
        field.addEventListener("input", handleAutofillFieldChange);
      });
    }
  };

  const handleAutofillFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    console.log(`Autofill field changed: ${target.name || target.tagName} = "${target.value}"`);

    // Check if element still has autofill pseudo-state
    if (!target.matches(":autofill, :-webkit-autofill")) {
      target.removeEventListener("input", handleAutofillFieldChange);
    }

    if (state === "started") {
      state = "updated";
      callback(state, getValues());
    }

    updatedFields.add(target);
    checkCompletion();
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const currentAutofillFields = getAutofillFields();
    console.log(
      `Input change detected on: ${target.name || target.tagName}, autofill fields remaining: ${currentAutofillFields.length}`,
    );

    // Chrome behavior - fields lose :autofill pseudo-state
    if (state !== "pending" && currentAutofillFields.length === 0) {
      state = "completed";
      console.log("Autofill completed - no more autofilled fields");
      callback(state, getValues());
    }
  };

  form.addEventListener("animationstart", handleAutofillAnimationStart);
  form.addEventListener("input", handleInputChange);

  return () => {
    form.removeEventListener("animationstart", handleAutofillAnimationStart);
    form.removeEventListener("input", handleInputChange);

    if (autofillFields) {
      autofillFields.forEach((field) => {
        field.removeEventListener("input", handleAutofillFieldChange);
      });
    }
  };
};
