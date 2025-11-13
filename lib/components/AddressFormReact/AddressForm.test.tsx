import { fireEvent } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import { AddressForm } from "./AddressForm";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: {},
  setData: vi.fn(),
  setMapViewState: vi.fn(),
  isAutofill: false,
  setIsAutofill: vi.fn(),
  typeaheadApiName: "autocomplete",
  setTypeaheadApiName: vi.fn(),
};

const renderWithContext = (ui: React.ReactElement) => {
  return renderWithProvider(<AddressFormContext.Provider value={mockContextValue}>{ui}</AddressFormContext.Provider>);
};

describe("AddressForm", () => {
  it("renders form element", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1">
        <div />
      </AddressForm>,
    );
    expect(document.querySelector("form")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1" className="custom">
        <div />
      </AddressForm>,
    );
    expect(document.querySelector("form")).toHaveClass("custom");
  });

  it("renders child components", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1">
        <input data-type="address-form" name="city" />
        <button data-type="address-form" type="submit" />
      </AddressForm>,
    );
    expect(document.querySelector("input")).toBeInTheDocument();
    expect(document.querySelector("button")).toBeInTheDocument();
  });

  it("provides context value", () => {
    const TestComponent = () => {
      const context = useContext(AddressFormContext);
      return <div data-testid="context">{context?.apiKey}</div>;
    };

    renderWithContext(
      <AddressForm apiKey="test-key" region="us-west-2">
        <TestComponent />
      </AddressForm>,
    );
    expect(document.querySelector('[data-testid="context"]')).toHaveTextContent("test-key");
  });

  it("resets form data when Reset button is clicked", () => {
    const { getByLabelText, getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="us-east-1">
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <button data-type="address-form" type="reset">
          Reset
        </button>
      </AddressForm>,
    );

    const addressLineTwo = getByLabelText("Address Line 2");
    const city = getByLabelText("City");
    const province = getByLabelText("Province/State");
    const postalCode = getByLabelText("Postal/Zip code");
    const resetButton = getByRole("button", { name: "Reset" });

    // Populate all form fields with data
    fireEvent.change(addressLineTwo, { target: { value: "Apartment 456" } });
    fireEvent.change(city, { target: { value: "Vancouver" } });
    fireEvent.change(province, { target: { value: "BC" } });
    fireEvent.change(postalCode, { target: { value: "V6B 1Z6" } });

    // Verify all fields have data
    expect(addressLineTwo).toHaveValue("Apartment 456");
    expect(city).toHaveValue("Vancouver");
    expect(province).toHaveValue("BC");
    expect(postalCode).toHaveValue("V6B 1Z6");

    // Click reset button
    fireEvent.click(resetButton);

    // Verify all fields are cleared
    expect(addressLineTwo).toHaveValue("");
    expect(city).toHaveValue("");
    expect(province).toHaveValue("");
    expect(postalCode).toHaveValue("");
  });
});
