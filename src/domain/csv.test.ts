import { describe, expect, it } from "vitest";
import { parseCsv } from "@/domain/csv";

describe("csv parser", () => {
  it("handles quoted fields and normalized headers", () => {
    const rows = parseCsv('Asset Name,Severity,Description\n"api, prod",HIGH,"quoted, value"');
    expect(rows).toEqual([
      {
        asset_name: "api, prod",
        severity: "HIGH",
        description: "quoted, value"
      }
    ]);
  });
});
