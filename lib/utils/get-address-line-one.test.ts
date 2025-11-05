import { describe, it, expect } from "vitest";
import { getAddressLineOne } from "./get-address-line-one";

describe("getAddressLineOne", () => {
  it("returns full label when 2 or fewer parts", () => {
    expect(getAddressLineOne("35, Kailash Hills")).toBe("35, Kailash Hills");
    expect(getAddressLineOne("35")).toBe("35");
  });

  it("removes parts from end by default (LTR)", () => {
    const result = getAddressLineOne(
      "35, Kailash Hills, East of Kailash, Delhi 110065, India",
      {
        country: "India",
        locality: "Delhi",
        city: "Delhi",
        postalCode: "110065"
      }
    );
    expect(result).toBe("35, Kailash Hills");
  });

  it("removes parts from beginning for RTL", () => {
    const result = getAddressLineOne(
      "35, Kailash Hills, East of Kailash, Delhi 110065, India",
      {
        country: "India",
        locality: "Delhi",
        city: "Delhi",
        postalCode: "110065"
      },
      true
    );
    expect(result).toBe("35, Kailash Hills");
  });

  it("stops removing when only 2 parts remain", () => {
    const result = getAddressLineOne(
      "35, Kailash Hills, East of Kailash",
      {
        country: "India",
        locality: "Delhi",
        city: "Delhi",
        postalCode: "110065",
        district: "East of Kailash"
      }
    );
    expect(result).toBe("35, Kailash Hills");
  });

  it("ignores undefined removal parameters", () => {
    const result = getAddressLineOne(
      "35, Kailash Hills, East of Kailash, Delhi",
      {
        city: "Delhi"
      }
    );
    expect(result).toBe("35, Kailash Hills");
  });
});
