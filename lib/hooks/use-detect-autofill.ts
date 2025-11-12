import { RefObject, useEffect, useState } from "react";
import { detectAutofill } from "../utils/detect-autofill";

type AutofillValues = Record<string, string>;
type AutofillState = "pending" | "started" | "updated" | "completed";

export const useDetectAutofill = (formRef: RefObject<HTMLFormElement | null>) => {
  const [state, setState] = useState<AutofillState>("pending");
  const [values, setValues] = useState<AutofillValues>({});

  useEffect(() => {
    if (!formRef.current) {
      return;
    }

    return detectAutofill(formRef.current, (newState, newValues) => {
      setState(newState);
      setValues(newValues);
    });
  }, [formRef]);

  return [state, values] as const;
};
