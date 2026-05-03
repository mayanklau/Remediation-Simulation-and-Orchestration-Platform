export type FoundationStatus = "implemented_contract" | "external_runtime_required";

export type FoundationStore = {
  id: string;
  role: string;
  tool: string;
  canonical: boolean;
  rebuildSource: string;
  tenantIsolation: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  input: string;
  output: string;
  gates: string[];
};

export type PlannerCapability = {
  agentId: string;
  description: string;
  requiredScopes: string[];
  dataClassifications: string[];
  sideEffects: boolean;
  requiresApproval: boolean;
  kbDependencies: string[];
};

export function buildKbPlannerFoundation() {
  const stores = foundationStores();
  const ingestionPipeline = ingestionStages();
  const plannerPipeline = plannerStages();
  const manifest = toolManifest();
  const nonNegotiables = kbNonNegotiables().concat(plannerNonNegotiables());

  return {
    summary: {
      canonicalStore: "mongodb",
      derivedStores: stores.filter((store) => !store.canonical).length,
      ingestionStages: ingestionPipeline.length,
      retrievalModes: retrievalFacade().modes.length,
      plannerStages: plannerPipeline.length,
      registeredCapabilities: manifest.length,
      nonNegotiables: nonNegotiables.length,
      status: "implemented_contract" as FoundationStatus,
      verdict: "aligned_to_kb_planner_foundation"
    },
    guidingPrinciples: [
      "MongoDB is the system of record; Qdrant, PageIndex, Neo4j, and S3 are rebuildable derived indexes.",
      "The planner is a deterministic shell with model calls inside controlled steps.",
      "Security retrieval is hybrid: exact, semantic, graph, and temporal.",
      "OCSF-style records are typed, versioned, tenant-scoped, and signed before indexing.",
      "LLM calls are skipped whenever deterministic routing, cache, or manifest rules can answer safely."
    ],
    dataContract: {
      requiredFields: ["record_id", "ocsf", "tenant_id", "entity_ids", "source_scanner", "collected_at", "valid_from", "valid_to", "confidence", "classification", "content_hash", "signing_hash", "embedding_model_version"],
      foreignKeyRule: "record_id is the foreign key in vector payloads, PageIndex metadata, graph nodes, and object metadata.",
      rebuildRule: "If a derived store disappears, rebuild it from MongoDB without losing canonical facts.",
      idempotencyKey: ["source_id", "content_hash"]
    },
    stores,
    ingestionPipeline,
    retrievalFacade: retrievalFacade(),
    plannerPipeline,
    toolManifest: manifest,
    nonNegotiables,
    buildOrder: [
      "Define OCSF/Pydantic record wrapper and entity model.",
      "Stand up MongoDB, Qdrant, PageIndex, Neo4j, and S3-compatible storage behind interfaces.",
      "Build ingestors through normalizer, entity resolver, PII scrubber, and canonical Mongo write.",
      "Add hybrid retrieval and reranking behind the KB facade.",
      "Create eval harness and golden query set before tuning retrieval.",
      "Register tools and module agents through a typed manifest.",
      "Add deterministic router and DAG planner before adding model reasoning.",
      "Attach LLM only for uncertain or high-context queries with structured outputs.",
      "Write provenance, verification, budgets, and human approval gates.",
      "Register the first module agent and validate end-to-end."
    ],
    openDecisions: [
      { item: "Embedding model", default: "bge-m3", revisitWhen: "Customer mandates NVIDIA stack" },
      { item: "Reranker", default: "bge-reranker-base", revisitWhen: "Latency budget is exhausted" },
      { item: "Object storage", default: "S3-compatible abstraction", revisitWhen: "Customer has mandated storage platform" },
      { item: "Reasoning model", default: "Qwen/Llama/local SLM via provider abstraction", revisitWhen: "GPU footprint or data residency changes" },
      { item: "Keyword path", default: "Mongo text/Atlas Search", revisitWhen: "Log-style recall requires OpenSearch" }
    ]
  };
}

function foundationStores(): FoundationStore[] {
  return [
    { id: "mongodb", role: "Canonical store and audit history", tool: "MongoDB", canonical: true, rebuildSource: "self", tenantIsolation: "tenant_id shard key and collection-level indexes" },
    { id: "qdrant", role: "Semantic vectors", tool: "Qdrant", canonical: false, rebuildSource: "MongoDB KBRecord", tenantIsolation: "per-tenant collections" },
    { id: "pageindex", role: "Large document structure", tool: "PageIndex", canonical: false, rebuildSource: "MongoDB record plus object blob", tenantIsolation: "tenant metadata and scoped indexes" },
    { id: "neo4j", role: "Relationships, attack paths, identity graph, W3C PROV", tool: "Neo4j", canonical: false, rebuildSource: "MongoDB entities and events", tenantIsolation: "per-tenant database or tenant labels" },
    { id: "s3", role: "Raw blobs and immutable artifacts", tool: "S3-compatible storage", canonical: false, rebuildSource: "MongoDB metadata", tenantIsolation: "tenant bucket/prefix policy" }
  ];
}

function ingestionStages(): PipelineStage[] {
  return [
    { id: "source", name: "Source connector", input: "scanner, document, API, or export", output: "raw payload", gates: ["source_id", "tenant_id", "collection_time"] },
    { id: "normalize", name: "OCSF normalizer", input: "raw payload", output: "typed security record", gates: ["schema_version", "source_scanner", "required_fields"] },
    { id: "entity_resolution", name: "Entity resolution", input: "typed record", output: "entity_ids", gates: ["asset_key", "identity_key", "confidence"] },
    { id: "pii_scrub", name: "PII scrubber", input: "record content", output: "scrubbed content", gates: ["classification", "scrub_rules", "pre_embed_check"] },
    { id: "canonical_write", name: "Canonical Mongo write", input: "scrubbed record", output: "KBRecord", gates: ["content_hash", "signing_hash", "idempotency_key"] },
    { id: "derived_indexes", name: "Derived index fanout", input: "record.created", output: "vector, graph, page, object indexes", gates: ["record_id", "embedding_model_version", "cache_invalidation"] }
  ];
}

function retrievalFacade() {
  return {
    rule: "Planner and module agents call one KB facade, never individual stores directly.",
    modes: ["semantic", "keyword", "graph", "temporal"],
    mergeKey: "record_id",
    flow: ["fan_out", "merge_by_record_id", "rerank", "hydrate_from_mongo", "return_with_provenance"],
    safeguards: ["tenant_scope_required", "classification_gate", "freshness_window", "max_context_chunks_10"]
  };
}

function plannerStages(): PipelineStage[] {
  return [
    { id: "intent", name: "Intent and entity extraction", input: "user query", output: "typed intent", gates: ["deterministic_classifier_first"] },
    { id: "policy", name: "Policy/RBAC/classification gate", input: "intent", output: "allow or deny", gates: ["required_scope", "classification_allowed"] },
    { id: "retrieval_plan", name: "Retrieval plan", input: "intent", output: "hybrid KB search plan", gates: ["modes", "filters", "budget"] },
    { id: "tool_dag", name: "Tool DAG", input: "retrieved facts", output: "manifest-constrained plan", gates: ["registered_tool", "json_schema_output"] },
    { id: "execution", name: "Parallel execution", input: "DAG", output: "step results", gates: ["max_steps", "max_wall_time", "max_cost"] },
    { id: "grounding", name: "Aggregation and grounding", input: "step results", output: "grounded answer", gates: ["record_id_citations", "no_uncited_claims"] },
    { id: "verification", name: "Verification and provenance", input: "grounded answer", output: "response or HITL request", gates: ["w3c_prov_write", "side_effect_approval"] }
  ];
}

function toolManifest(): PlannerCapability[] {
  return [
    { agentId: "crvm.attack_path", description: "Builds vulnerability chains and before/after remediation risk.", requiredScopes: ["finding:read", "report:read"], dataClassifications: ["internal"], sideEffects: false, requiresApproval: false, kbDependencies: ["mongodb", "neo4j", "qdrant"] },
    { agentId: "crvm.remediation_planner", description: "Creates simulation-first remediation plans with rollback and evidence.", requiredScopes: ["simulation:run"], dataClassifications: ["internal"], sideEffects: false, requiresApproval: false, kbDependencies: ["mongodb", "neo4j"] },
    { agentId: "crvm.connector_sync", description: "Ingests scanner exports and produces OCSF-like KB records.", requiredScopes: ["connector:run"], dataClassifications: ["internal", "pii"], sideEffects: true, requiresApproval: true, kbDependencies: ["mongodb"] },
    { agentId: "crvm.evidence_pack", description: "Builds audit evidence from canonical records and execution history.", requiredScopes: ["evidence:write"], dataClassifications: ["internal"], sideEffects: true, requiresApproval: true, kbDependencies: ["mongodb", "s3"] }
  ];
}

function kbNonNegotiables() {
  return [
    "OCSF-style schema exists before any ingestor.",
    "Entity resolution runs before storage.",
    "PII scrubbing runs before vectorization.",
    "Retrieval is hybrid, never vector-only.",
    "Tenant isolation is physical/logical per store, not only a filter.",
    "embedding_model_version is stamped on every vector.",
    "Golden retrieval eval set runs on every retrieval change.",
    "Idempotency uses source_id plus content_hash.",
    "Cache invalidation fires when source records change.",
    "Every fact is time-aware with valid_from and valid_to."
  ];
}

function plannerNonNegotiables() {
  return [
    "LLM output is constrained to registered manifest schemas.",
    "Deterministic routing handles the common path before model calls.",
    "Budgets are enforced in middleware, not prompts.",
    "Every answer cites KB record_ids.",
    "Every plan step writes W3C PROV.",
    "Side-effecting tools require human approval.",
    "Empty-KB and agent-down cases return explicit states.",
    "Planner state and agent state remain separated."
  ];
}
