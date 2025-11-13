import { RefObject, useEffect, useRef } from "react";
import { AutofillValues, detectAutofill } from "../utils/detect-autofill";

export const useDetectAutofill = (
  formRef: RefObject<HTMLFormElement | null>,
  callback: (values: AutofillValues) => void,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!formRef.current) {
      return;
    }

    return detectAutofill(formRef.current, callbackRef.current);
  }, [formRef, callbackRef]);
};
