-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'security_analyst',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "environment" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "provider" TEXT,
    "region" TEXT,
    "criticality" INTEGER NOT NULL DEFAULT 3,
    "dataSensitivity" INTEGER NOT NULL DEFAULT 3,
    "internetExposure" BOOLEAN NOT NULL DEFAULT false,
    "complianceScope" TEXT,
    "tagsJson" TEXT NOT NULL DEFAULT '{}',
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "teamId" TEXT,
    "technicalOwnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Asset_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_technicalOwnerId_fkey" FOREIGN KEY ("technicalOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "fromAssetId" TEXT NOT NULL,
    "toAssetId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetRelationship_fromAssetId_fkey" FOREIGN KEY ("fromAssetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetRelationship_toAssetId_fkey" FOREIGN KEY ("toAssetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "cve" TEXT,
    "controlId" TEXT,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "scannerSeverity" TEXT,
    "exploitAvailable" BOOLEAN NOT NULL DEFAULT false,
    "activeExploitation" BOOLEAN NOT NULL DEFAULT false,
    "patchAvailable" BOOLEAN NOT NULL DEFAULT false,
    "compensatingControls" TEXT,
    "riskScore" REAL NOT NULL DEFAULT 0,
    "businessRiskScore" REAL NOT NULL DEFAULT 0,
    "riskExplanation" TEXT NOT NULL DEFAULT '',
    "fingerprint" TEXT NOT NULL,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Finding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Finding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "findingId" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "rawPayloadJson" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.7,
    "ingestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourceFinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SourceFinding_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemediationAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "proposedChangeJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "ownerHint" TEXT,
    "complexity" INTEGER NOT NULL DEFAULT 3,
    "expectedRiskReduction" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RemediationAction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RemediationAction_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "remediationActionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "inputJson" TEXT NOT NULL,
    "resultJson" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0,
    "riskReductionEstimate" REAL NOT NULL DEFAULT 0,
    "operationalRisk" REAL NOT NULL DEFAULT 0,
    "explanation" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Simulation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Simulation_remediationActionId_fkey" FOREIGN KEY ("remediationActionId") REFERENCES "RemediationAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemediationPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "remediationActionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RemediationPlan_remediationActionId_fkey" FOREIGN KEY ("remediationActionId") REFERENCES "RemediationAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "remediationActionId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "dueAt" DATETIME,
    "commentsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkflowItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkflowItem_remediationActionId_fkey" FOREIGN KEY ("remediationActionId") REFERENCES "RemediationAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkflowItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "workflowItemId" TEXT NOT NULL,
    "approverEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decisionReason" TEXT,
    "decidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Approval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Approval_workflowItemId_fkey" FOREIGN KEY ("workflowItemId") REFERENCES "WorkflowItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "workflowItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceArtifact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceArtifact_workflowItemId_fkey" FOREIGN KEY ("workflowItemId") REFERENCES "WorkflowItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "healthJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SsoConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadataUrl" TEXT,
    "entityId" TEXT,
    "callbackUrl" TEXT,
    "certificateFingerprint" TEXT,
    "settingsJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SsoConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleBinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'tenant',
    "constraintsJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleBinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectorRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "requestJson" TEXT NOT NULL DEFAULT '{}',
    "resultJson" TEXT NOT NULL DEFAULT '{}',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConnectorRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecutionHook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hookType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExecutionHook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "remediationActionId" TEXT,
    "policyId" TEXT,
    "hookId" TEXT,
    "runType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "approvalMode" TEXT NOT NULL DEFAULT 'manual',
    "inputJson" TEXT NOT NULL DEFAULT '{}',
    "outputJson" TEXT NOT NULL DEFAULT '{}',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutomationRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AutomationRun_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policyType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rulesJson" TEXT NOT NULL DEFAULT '{}',
    "enforcementMode" TEXT NOT NULL DEFAULT 'advisory',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Policy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemediationCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "owner" TEXT,
    "criteriaJson" TEXT NOT NULL DEFAULT '{}',
    "planJson" TEXT NOT NULL DEFAULT '{}',
    "metricsJson" TEXT NOT NULL DEFAULT '{}',
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RemediationCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detailsJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tenantId_slug_key" ON "Team"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Asset_tenantId_type_idx" ON "Asset"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Asset_tenantId_environment_idx" ON "Asset"("tenantId", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tenantId_externalId_key" ON "Asset"("tenantId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetRelationship_fromAssetId_toAssetId_relation_key" ON "AssetRelationship"("fromAssetId", "toAssetId", "relation");

-- CreateIndex
CREATE INDEX "Finding_tenantId_severity_idx" ON "Finding"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "Finding_tenantId_status_idx" ON "Finding"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Finding_tenantId_riskScore_idx" ON "Finding"("tenantId", "riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "Finding_tenantId_fingerprint_key" ON "Finding"("tenantId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "SourceFinding_tenantId_source_sourceId_key" ON "SourceFinding"("tenantId", "source", "sourceId");

-- CreateIndex
CREATE INDEX "RemediationAction_tenantId_status_idx" ON "RemediationAction"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SsoConfiguration_tenantId_provider_key" ON "SsoConfiguration"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "RoleBinding_tenantId_subject_idx" ON "RoleBinding"("tenantId", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "RoleBinding_tenantId_subjectType_subject_role_scope_key" ON "RoleBinding"("tenantId", "subjectType", "subject", "role", "scope");

-- CreateIndex
CREATE INDEX "ReportSnapshot_tenantId_type_idx" ON "ReportSnapshot"("tenantId", "type");

-- CreateIndex
CREATE INDEX "ReportSnapshot_tenantId_createdAt_idx" ON "ReportSnapshot"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ConnectorRun_tenantId_provider_idx" ON "ConnectorRun"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "ConnectorRun_tenantId_status_idx" ON "ConnectorRun"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ExecutionHook_tenantId_hookType_idx" ON "ExecutionHook"("tenantId", "hookType");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionHook_tenantId_name_key" ON "ExecutionHook"("tenantId", "name");

-- CreateIndex
CREATE INDEX "AutomationRun_tenantId_runType_idx" ON "AutomationRun"("tenantId", "runType");

-- CreateIndex
CREATE INDEX "AutomationRun_tenantId_status_idx" ON "AutomationRun"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Policy_tenantId_policyType_idx" ON "Policy"("tenantId", "policyType");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_tenantId_name_key" ON "Policy"("tenantId", "name");

-- CreateIndex
CREATE INDEX "RemediationCampaign_tenantId_status_idx" ON "RemediationCampaign"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RemediationCampaign_tenantId_name_key" ON "RemediationCampaign"("tenantId", "name");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entityType_entityId_idx" ON "AuditLog"("tenantId", "entityType", "entityId");

