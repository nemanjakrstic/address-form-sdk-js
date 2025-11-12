import { RefObject, useEffect, useState } from "react";
import * as styles from "./use-detect-autofill.css";
import { useDebounce } from "../utils/debounce";

type AutofillValues = Record<string, string>;

export const useDetectAutofill = (formRef: RefObject<HTMLFormElement | null>) => {
  const [values, setValues] = useState<[boolean, AutofillValues]>([false, {}]);
  const debouncedValues = useDebounce(values, 100);

  useEffect(() => {
    if (!formRef.current) {
      return;
    }

    const form = formRef.current;

    // Handle autofill detection via CSS animation
    const handleAutofillAnimationStart = (e: AnimationEvent) => {
      if (e.animationName === styles.animation && e.target === form) {
        setValues([true, getFormValues(form)]);
      }
    };

    form.classList.add(styles.form);
    form.addEventListener("animationstart", handleAutofillAnimationStart);

    return () => {
      form.classList.remove(styles.form);
      form.removeEventListener("animationstart", handleAutofillAnimationStart);
    };
  }, [formRef]);

  return debouncedValues;
};

const getFormValues = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  const values: AutofillValues = {};

  for (const [key, value] of formData.entries()) {
    values[key] = String(value);
  }

  return values;
};
