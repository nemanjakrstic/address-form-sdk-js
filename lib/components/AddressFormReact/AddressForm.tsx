import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import {
  ComponentProps,
  FormEvent,
  FormEventHandler,
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AddressFormData } from "../AddressForm";
import { AddressFormAddressField, AddressFormAddressFieldProps } from "./AddressFormAddressField";
import { AddressFormAutofillHandler } from "./AddressFormAutofillHandler";
import { useAddressFormContext } from "./AddressFormContext";
import { AddressFormCountryField, AddressFormCountryFieldProps } from "./AddressFormCountryField";
import { AddressFormFields } from "./AddressFormFields";
import { AddressFormMap, AddressFormMapProps } from "./AddressFormMap";
import { AddressFormProvider } from "./AddressFormProvider";
import { AddressFormTextField, AddressFormTextFieldProps } from "./AddressFormTextField";
import * as styles from "./styles.css";

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
  const { data, resetData } = useAddressFormContext();
  const formRef = useRef<HTMLFormElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit: FormEventHandler = (event) => {
    if (preventDefaultOnSubmit) {
      event.preventDefault();
    }

    onSubmit?.({ ...event, data: data });
  };

  return (
    <form ref={formRef} className={clsx(styles.root, className)} {...rest} onSubmit={handleSubmit} onReset={resetData}>
      {isMounted && formRef.current && <AddressFormAutofillHandler form={formRef.current} />}
      <AddressFormFields>{children}</AddressFormFields>
    </form>
  );
};

AddressForm.AddressField = AddressFormAddressField;
AddressForm.CountryField = AddressFormCountryField;
AddressForm.Map = AddressFormMap;
AddressForm.TextField = AddressFormTextField;
