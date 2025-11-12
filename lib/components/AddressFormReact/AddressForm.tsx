import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import { ComponentProps, FormEvent, FormEventHandler, FunctionComponent, ReactNode, useEffect, useRef } from "react";
import { AddressFormData } from "../AddressForm";
import { AddressFormAddressField, AddressFormAddressFieldProps } from "./AddressFormAddressField";
import { useAddressFormContext } from "./AddressFormContext";
import { AddressFormCountryField, AddressFormCountryFieldProps } from "./AddressFormCountryField";
import { AddressFormFields } from "./AddressFormFields";
import { AddressFormMap, AddressFormMapProps } from "./AddressFormMap";
import { AddressFormProvider } from "./AddressFormProvider";
import { AddressFormTextField, AddressFormTextFieldProps } from "./AddressFormTextField";
import * as styles from "./styles.css";
import { useDetectAutofill } from "../../hooks/use-detect-autofill";

export interface AddressFormProps extends AddressFormContentProps {
  apiKey: string;
  region: string;
  preventDefaultOnSubmit?: boolean;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  onSubmit?: (event: FormEvent & { data: AddressFormData }) => void;
}

interface ChildComponents {
  AddressField: FunctionComponent<AddressFormAddressFieldProps>;
  CountryField: FunctionComponent<AddressFormCountryFieldProps>;
  Map: FunctionComponent<AddressFormMapProps>;
  TextField: FunctionComponent<AddressFormTextFieldProps>;
}

export const AddressForm: FunctionComponent<AddressFormProps> & ChildComponents = ({
  apiKey,
  region,
  children,
  language,
  politicalView,
  showCurrentCountryResultsOnly,
  allowedCountries,
  placeTypes,
  ...contentProps
}) => {
  return (
    <AddressFormProvider
      apiKey={apiKey}
      region={region}
      language={language}
      politicalView={politicalView}
      showCurrentCountryResultsOnly={showCurrentCountryResultsOnly}
      allowedCountries={allowedCountries}
      placeTypes={placeTypes}
    >
      <AddressFormContent {...contentProps}>{children}</AddressFormContent>
    </AddressFormProvider>
  );
};

interface AddressFormContentProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  preventDefaultOnSubmit?: boolean;
  onSubmit?: (event: FormEvent & { data: AddressFormData }) => void;
  className?: string;
  children: ReactNode;
}

const AddressFormContent: FunctionComponent<AddressFormContentProps> = ({
  children,
  className,
  onSubmit,
  preventDefaultOnSubmit = true,
  ...rest
}) => {
  const context = useAddressFormContext();
  const formRef = useRef<HTMLFormElement>(null);
  const [isAutofill, autofillValues] = useDetectAutofill(formRef);

  useEffect(() => {
    if (isAutofill) {
      console.log("<AUTOFILL>", Date.now());
      console.log(autofillValues);
      console.log("</AUTOFILL>");
    }
  }, [isAutofill, autofillValues]);

  const handleSubmit: FormEventHandler = (event) => {
    if (preventDefaultOnSubmit) {
      event.preventDefault();
    }

    onSubmit?.({ ...event, data: context.data });
  };

  const handleReset = () => {
    context.resetData?.();
  };

  return (
    <form
      ref={formRef}
      className={clsx(styles.root, className)}
      {...rest}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AddressFormFields>{children}</AddressFormFields>
    </form>
  );
};

AddressForm.AddressField = AddressFormAddressField;
AddressForm.CountryField = AddressFormCountryField;
AddressForm.Map = AddressFormMap;
AddressForm.TextField = AddressFormTextField;
