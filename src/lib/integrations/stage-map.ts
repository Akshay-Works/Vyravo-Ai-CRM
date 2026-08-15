// Maps internal CRM pipeline stages to HubSpot deal stage labels.
// HubSpot stages are resolved by label at runtime — if a label doesn't exist
// in the account's pipeline, the sync skips the stage change gracefully.

export const STAGE_TO_HUBSPOT_LABEL: Record<string, string> = {
  new: "Prospecting",
  qualified: "Qualification",
  discovery_scheduled: "Qualification",
  discovery_completed: "Qualification",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Closed Won",
  lost: "Closed Lost",
};

export function hubspotLabelForStage(stage: string): string | null {
  return STAGE_TO_HUBSPOT_LABEL[stage] || null;
}
