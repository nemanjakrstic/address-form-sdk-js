import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { FunctionComponent, PropsWithChildren, useMemo, useState } from "react";
import { AddressFormData } from "../AddressForm";
import { AddressFormContext, AddressFormContextType, MapViewState } from "./AddressFormContext";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";

export interface AddressFormProps extends PropsWithChildren {
  apiKey: string;
  region: string;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
}

export const AddressFormProvider: FunctionComponent<AddressFormProps> = ({
  apiKey,
  region,
  children,
  language,
  politicalView,
  showCurrentCountryResultsOnly,
  allowedCountries,
  placeTypes,
}) => {
  const [data, setData] = useState<AddressFormData>({});
  const [isAutofill, setIsAutofill] = useState(false);
  const [mapViewState, setMapViewState] = useState<MapViewState>({ longitude: 0, latitude: 0, zoom: 1 });
  const [typeaheadApiName, setTypeaheadApiName] = useState<TypeaheadAPIName | null>(null);

  const context = useMemo<AddressFormContextType>(
    () => ({
      apiKey,
      region,
      data,
      setData: (data: AddressFormData) => setData((state) => ({ ...state, ...data })),
      resetData: () => setData({}),
      mapViewState,
      setMapViewState,
      language,
      politicalView,
      showCurrentCountryResultsOnly,
      allowedCountries,
      placeTypes,
      isAutofill,
      setIsAutofill,
      typeaheadApiName,
      setTypeaheadApiName,
    }),
    [
      apiKey,
      region,
      data,
      mapViewState,
      language,
      politicalView,
      showCurrentCountryResultsOnly,
      allowedCountries,
      placeTypes,
      isAutofill,
      typeaheadApiName,
    ],
  );

  return <AddressFormContext.Provider value={context}>{children}</AddressFormContext.Provider>;
};
