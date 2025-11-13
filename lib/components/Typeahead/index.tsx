import { Address } from "@aws-sdk/client-geo-places";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context.ts";
import { useDebounce } from "../../utils/debounce.ts";
import { getPlaceQuery } from "../../utils/queries.ts";
import { Input } from "../Input/index.tsx";
import { LocateButton } from "../LocateButton";
import { base, brandOption, brandOptionLink, currentLocation, info, input, option, options } from "./styles.css.ts";
import { TypeaheadAPIInput, TypeaheadAPIName, TypeaheadResultItem, useTypeaheadQuery } from "./use-typeahead-query.ts";
import { countries } from "../../data/countries.ts";

export interface TypeaheadOutput {
  addressLineOneField?: string;
  fullAddress?: Address;
  position?: [number, number];
}

export interface TypeaheadProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  apiName: TypeaheadAPIName | null;
  apiInput?: TypeaheadAPIInput;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: TypeaheadOutput) => void;
  showCurrentLocation?: boolean;
  debounce?: number;
  skipNextQuery?: boolean;
}

export const Typeahead = ({ apiName, ...props }: TypeaheadProps) => {
  return apiName ? <APITypeahead {...props} apiName={apiName} /> : <InputTypeahead {...props} apiName={null} />;
};

const APITypeahead = ({
  id,
  name,
  placeholder,
  className,
  value,
  onChange,
  apiName,
  apiInput,
  onSelect,
  showCurrentLocation = true,
  debounce = 300,
  skipNextQuery,
}: TypeaheadProps & { apiName: TypeaheadAPIName }) => {
  const debouncedValue = useDebounce(value, debounce);
  const { client } = useAmazonLocationContext();
  const queryClient = useQueryClient();
  const isValid = debouncedValue.length >= 2;
  const skipNextQueryRef = useRef(false);

  useEffect(() => {
    if (skipNextQuery !== undefined) {
      skipNextQueryRef.current = skipNextQuery;
    }
  }, [skipNextQueryRef, skipNextQuery]);

  const { data = [], isLoading } = useTypeaheadQuery({
    client,
    apiName,
    apiInput: { QueryText: debouncedValue, MaxResults: 5, ...apiInput },
    enabled: isValid && !skipNextQueryRef.current,
  });

  const handleAddressSelect = async (address: TypeaheadResultItem | null) => {
    if (!address) {
      return;
    }

    const result = await queryClient.ensureQueryData(
      getPlaceQuery(client, {
        PlaceId: address.placeId,
        Language: apiInput?.Language,
        PoliticalView: apiInput?.PoliticalView,
      }),
    );

    const [lng, lat] = result.Position ?? [];

    const matchedCountry = countries.find((country) => country.code === result.Address?.Country?.Code2);
    const addressLineOneFallback = result.Address?.Label || address.title;

    const addressLineOneField = matchedCountry?.supported
      ? [result.Address?.AddressNumber, result.Address?.Street].filter(Boolean).join(" ") || addressLineOneFallback
      : addressLineOneFallback;

    skipNextQueryRef.current = true;

    onChange(addressLineOneField);
    onSelect({
      addressLineOneField,
      fullAddress: result.Address,
      position: result.Position ? [lng, lat] : undefined,
    });

    // The user selected an address, we can clear the cache without refetching
    queryClient.removeQueries({ queryKey: ["typeahead"] });
    queryClient.removeQueries({ queryKey: ["getPlace"] });
  };

  useEffect(() => {
    if (value.length > 1) {
      onChange(value.trimStart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Removed: `onChange`
  }, [value]);

  const handleCurrentLocation = (address: TypeaheadOutput) => {
    skipNextQueryRef.current = true;
    onChange(address.addressLineOneField ?? "");
    onSelect(address);
  };

  return (
    <div className={clsx(className, base)}>
      <Combobox
        onChange={handleAddressSelect}
        onClose={() => {
          if (value) {
            onChange(` ${value}`);
          }
        }}
      >
        <ComboboxInput
          as={Input}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            skipNextQueryRef.current = false;
            onChange(event.target.value);
          }}
          className={input}
          autoComplete="off"
        />

        {isValid && (
          <ComboboxOptions
            transition
            anchor="bottom start"
            className={clsx(options, "aws-typeahead-results")}
            data-testid={`aws-typeahead-results-${apiName}`}
            modal={false}
          >
            {isLoading && (
              <ComboboxOption value={null} className={clsx(info, "aws-typeahead-results__loading")} disabled>
                Loading...
              </ComboboxOption>
            )}

            {data.length === 0 && !isLoading && (
              <ComboboxOption value={null} className={clsx(info, "aws-typeahead-results__no-results")} disabled>
                No results
              </ComboboxOption>
            )}

            {data.map((results) => (
              <ComboboxOption
                key={results.placeId}
                value={results}
                className={clsx(option, "aws-typeahead-results__option")}
              >
                {results.title}
              </ComboboxOption>
            ))}

            <ComboboxOption value={null} className={clsx(brandOption, "aws-typeahead-results__brand")} disabled>
              <a className={brandOptionLink} href="https://aws.amazon.com/location/" target="_blank" rel="noreferrer">
                Powered by Amazon Location
              </a>
            </ComboboxOption>
          </ComboboxOptions>
        )}
      </Combobox>

      {showCurrentLocation && <LocateButton onLocate={handleCurrentLocation} className={currentLocation} />}
    </div>
  );
};

const InputTypeahead = ({
  id,
  name,
  placeholder,
  className,
  value,
  onChange,
  onSelect,
  showCurrentLocation = true,
}: TypeaheadProps) => {
  const handleCurrentLocation = (address: TypeaheadOutput) => {
    onChange(address.addressLineOneField ?? "");
    onSelect(address);
  };

  return (
    <div className={clsx(className, base)}>
      <Input
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={input}
        autoComplete="off"
      />

      {showCurrentLocation && <LocateButton onLocate={handleCurrentLocation} className={currentLocation} />}
    </div>
  );
};
