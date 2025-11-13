import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { FormEvent, FunctionComponent, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AddressFormData } from "../AddressForm";
import { AmazonLocationProvider } from "../AmazonLocationProvider";
import { ComponentInjector } from "../ComponentInjector";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormAutofillHandler } from "./AddressFormAutofillHandler";
import { AddressFormCountryField } from "./AddressFormCountryField";
import { Field } from "./AddressFormFields";
import { AddressFormProvider } from "./AddressFormProvider";
import { AddressFormTextField } from "./AddressFormTextField";
import { useAddressFormContext } from "./AddressFormContext";
import { getBoolean, getString } from "./utils";
import { Button } from "../Button";
import { AddressFormMap } from "./AddressFormMap";
import { MapStyle, MapStyleType, ColorScheme } from "../Map";

export interface RenderParams {
  root: string;
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

export const render = ({ root: selector, ...formProps }: RenderParams) => {
  const form = document.querySelector(selector) as HTMLFormElement;

  if (!form) {
    throw new Error(
      `Address form could not be initialized. No form element found matching selector "${selector}". Please ensure the form exists in the DOM before calling render().`,
    );
  }

  const container = document.createElement("div");
  const root = createRoot(container);

  // Mount the container to the form so React components render in the DOM
  form.appendChild(container);

  root.render(
    <AmazonLocationProvider apiKey={formProps.apiKey} region={formProps.region}>
      <AddressFormProvider
        apiKey={formProps.apiKey}
        region={formProps.region}
        language={formProps.language}
        politicalView={formProps.politicalView}
        showCurrentCountryResultsOnly={formProps.showCurrentCountryResultsOnly}
        allowedCountries={formProps.allowedCountries}
        placeTypes={formProps.placeTypes}
      >
        <FormEventHandler
          selector={selector}
          onSubmit={formProps.onSubmit}
          preventDefaultOnSubmit={formProps.preventDefaultOnSubmit}
        />

        <AddressFormAutofillHandler form={form} />

        <ComponentInjector
          selector={selector}
          replacements={[
            {
              selector: `input[data-type="address-form"][name="${Field.ADDRESS_LINE_ONE}"]`,
              component: (element) => (
                <AddressFormAddressField
                  name={Field.ADDRESS_LINE_ONE}
                  label={element.ariaLabel ?? "Address"}
                  placeholder={element.getAttribute("placeholder") ?? "Enter address"}
                  className={element.className || undefined}
                  apiName={getString(element.dataset, "apiName") ?? "autocomplete"}
                  showCurrentLocation={getBoolean(element.dataset, "showCurrentLocation") ?? true}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.ADDRESS_LINE_TWO}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.ADDRESS_LINE_TWO}
                  label={element.ariaLabel ?? "Address Line 2"}
                  placeholder={element.getAttribute("placeholder") ?? "Apartment, suite, etc."}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.CITY}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.CITY}
                  label={element.ariaLabel ?? "City"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.PROVINCE}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.PROVINCE}
                  label={element.ariaLabel ?? "Province/State"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.POSTAL_CODE}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.POSTAL_CODE}
                  label={element.ariaLabel ?? "Postal/Zip code"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.COUNTRY}"]`,
              component: (element) => (
                <AddressFormCountryField
                  name={Field.COUNTRY}
                  label={element.ariaLabel ?? "Country"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: 'div[data-type="address-form"][data-map-style]',
              component: (element) => (
                <AddressFormMap
                  mapStyle={validateMapStyle(getString(element.dataset, "mapStyle"))}
                  adjustablePosition={getBoolean(element.dataset, "adjustablePosition")}
                />
              ),
            },
            {
              selector: 'button[data-type="address-form"][type="submit"]',
              component: (element) => (
                <Button type="submit" className={element.className || undefined}>
                  {element.textContent}
                </Button>
              ),
            },
            {
              selector: 'button[data-type="address-form"][type="reset"]',
              component: (element) => (
                <Button type="reset" variant="secondary" className={element.className || undefined}>
                  {element.textContent}
                </Button>
              ),
            },
          ]}
        />
      </AddressFormProvider>
    </AmazonLocationProvider>,
  );
};

// Linter thinks it's not a component since we're returning `null`
// eslint-disable-next-line react-refresh/only-export-components
const FormEventHandler: FunctionComponent<{
  selector: string;
  onSubmit?: (event: FormEvent & { data: AddressFormData }) => void;
  preventDefaultOnSubmit?: boolean;
}> = ({ selector, onSubmit, preventDefaultOnSubmit = true }) => {
  const { data, setData, resetData } = useAddressFormContext();

  useEffect(() => {
    const form = document.querySelector(selector) as HTMLFormElement;
    if (!form) return;

    const handleSubmit = (event: Event) => {
      if (preventDefaultOnSubmit) {
        event.preventDefault();
      }

      if (onSubmit) {
        onSubmit(Object.assign(event as unknown as FormEvent, { data }));
      }
    };

    const handleReset = () => {
      resetData?.();
    };

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);

    return () => {
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("reset", handleReset);
    };
  }, [selector, data, setData, resetData, onSubmit, preventDefaultOnSubmit]);

  return null;
};

const validateMapStyle = (mapStyleString?: string): MapStyle => {
  if (!mapStyleString) return ["Standard", "Light"];

  const [style, scheme] = mapStyleString.split(",");
  const validStyles = ["Standard", "Monochrome", "Hybrid", "Satellite"] as const;
  const validSchemes = ["Light", "Dark"] as const;

  const isValidStyle = (s: string): s is MapStyleType => validStyles.includes(s as MapStyleType);
  const isValidScheme = (s: string): s is ColorScheme => validSchemes.includes(s as ColorScheme);

  const mapStyle = isValidStyle(style) ? style : "Standard";
  const colorScheme = isValidScheme(scheme) ? scheme : "Light";

  // Return valid combinations based on MapStyle type constraints
  if (colorScheme === "Dark") {
    if (mapStyle === "Standard" || mapStyle === "Monochrome") {
      return [mapStyle, "Dark"];
    }
    return ["Standard", "Dark"];
  }

  // For Light scheme, all styles are valid
  return [mapStyle, "Light"];
};
