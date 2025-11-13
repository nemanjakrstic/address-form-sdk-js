import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { useEffect, useEffectEvent } from "react";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context";
import { autocomplete, getPlace, suggest } from "../../utils/api";
import { AutofillValues, detectAutofill } from "../../utils/detect-autofill";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";
import { useAddressFormContext } from "./AddressFormContext";
import type { Field } from "./AddressFormFields";

interface AddressFormAutofillHandlerProps {
  form: HTMLFormElement;
}

export const AddressFormAutofillHandler = ({ form }: AddressFormAutofillHandlerProps) => {
  const { client } = useAmazonLocationContext();
  const { mapViewState, setMapViewState, setData, setIsAutofill } = useAddressFormContext();

  const handleAutofill = useEffectEvent(async (values: AutofillValues) => {
    setIsAutofill(true);
    const query = buildQuery(values);

    const placeId = await getPlaceId(client, query, "suggest", [
      mapViewState?.longitude ?? 0,
      mapViewState?.latitude ?? 0,
    ]);

    if (!placeId) {
      setIsAutofill(false);
      return;
    }

    const placeResponse = await getPlace(client, { PlaceId: placeId });

    if (placeResponse.Position?.length === 2) {
      const [longitude, latitude] = placeResponse.Position;
      setMapViewState({ longitude, latitude, zoom: 15 });
    }

    setData({
      country: placeResponse.Address?.Country?.Code2, // This override is required since user might have the country name instead of the code in the saved autofill
      originalPosition: placeResponse.Position?.join(","),
      addressDetails: placeResponse.Address,
    });

    setIsAutofill(false);
  });

  useEffect(() => {
    return detectAutofill(form, handleAutofill);
  }, [form, handleAutofill]);

  return null;
};

const buildQuery = (values: AutofillValues): string => {
  return [
    getValue(values, "addressLineOne"),
    getValue(values, "city"),
    getValue(values, "province"),
    getValue(values, "postalCode"),
    getValue(values, "country"),
  ]
    .filter(Boolean)
    .join(", ");
};

const getValue = (values: AutofillValues, field: Field) => {
  if (field in values) {
    const value = values[field].trim();

    if (value) {
      return value;
    }
  }
};

const getPlaceId = async (
  client: GeoPlacesClient,
  query: string,
  apiName: TypeaheadAPIName,
  biasPosition: [number, number],
) => {
  if (apiName === "autocomplete") {
    const autocompleteResponse = await autocomplete(client, {
      QueryText: query,
      MaxResults: 1,
    });

    return autocompleteResponse.ResultItems?.[0].PlaceId;
  }

  if (apiName === "suggest") {
    const suggestResponse = await suggest(client, {
      QueryText: query,
      MaxResults: 1,
      BiasPosition: biasPosition,
    });

    return suggestResponse.ResultItems?.[0].Place?.PlaceId;
  }
};
