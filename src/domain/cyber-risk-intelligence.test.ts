import { describe, expect, it } from "vitest";
import { buildCyberRiskIntelligenceModel } from "./cyber-risk-intelligence";

describe("cyber risk intelligence model", () => {
  it("covers advanced subject-matter production features", () => {
    const model = buildCyberRiskIntelligenceModel();
    const ids = model.capabilities.map((capability) => capability.id);
    expect(ids).toContain("exploit_intel_fusion");
    expect(ids).toContain("business_service_graph");
    expect(ids).toContain("control_effectiveness");
    expect(ids).toContain("exception_governance");
    expect(model.economics.map((metric) => metric.id)).toContain("risk_reduced_per_hour");
    expect(model.scenarioPacks.map((scenario) => scenario.id)).toContain("ransomware_path");
    expect(model.governanceMatrix.map((row) => row.id)).toContain("toxic_combinations");
    expect(model.governanceMatrix.map((row) => row.id)).toContain("regulatory_mapping");
    expect(model.governanceMatrix.map((row) => row.id)).toContain("identity_cloud_data_risk");
    expect(model.summary.capabilities).toBeGreaterThanOrEqual(14);
    expect(model.summary.certificationTracks).toBeGreaterThanOrEqual(6);
    expect(model.summary.mitreMappedHops).toBeGreaterThanOrEqual(6);
    expect(model.summary.controlValidationMethods).toBeGreaterThanOrEqual(7);
    expect(model.subjectMatterMaturityPack.scannerCertification.map((item) => item.id)).toContain("tenable");
    expect(model.subjectMatterMaturityPack.exploitabilityConfidenceModel.map((item) => item.label)).toContain("proven");
    expect(model.subjectMatterMaturityPack.pilotAcceptancePack.length).toBeGreaterThanOrEqual(5);
  });
});
