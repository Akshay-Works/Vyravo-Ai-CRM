import { db } from "@/db";
import { leads, activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncLeadToHubSpot, isHubSpotConfigured } from "@/lib/integrations/hubspot";
import { hubspotLabelForStage } from "@/lib/integrations/stage-map";

export const dynamic = "force-dynamic";

// Whitelist of fields clients are allowed to update (input sanitization).
const UPDATABLE_FIELDS = [
  "fullName", "email", "phone", "businessName", "businessWebsite", "industry",
  "companySize", "country", "currentSoftware", "biggestChallenge", "automationGoals",
  "monthlyLeads", "desiredOutcome", "budgetRange", "timeline", "additionalInfo",
  "leadScore", "leadCategory", "leadType", "recommendedServices", "qualificationSummary",
  "stage", "status", "priority", "source", "tags",
  "meetingStatus", "meetingDate", "meetingTimezone", "meetingLink",
] as const;

// GET - Get single lead
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Get activities for this lead
    const leadActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.leadId, leadId))
      .orderBy(activities.createdAt);

    return Response.json({
      success: true,
      lead,
      activities: leadActivities,
    });
  } catch (error) {
    console.error("Get lead error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// PATCH - Update lead
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const rawBody = await request.json();

    // Only allow known fields through (prevents mass-assignment).
    const body: Record<string, unknown> = {};
    for (const key of UPDATABLE_FIELDS) {
      if (key in rawBody) body[key] = rawBody[key];
    }

    if (Object.keys(body).length === 0) {
      return Response.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const [updatedLead] = await db
      .update(leads)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updatedLead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Log activity
    await db.insert(activities).values({
      type: "lead",
      action: "updated",
      description: `Lead updated: ${updatedLead.fullName}`,
      leadId: leadId,
      metadata: { changes: Object.keys(body) },
    });

    // Keep the HubSpot contact in sync (best-effort, deduped by email).
    let hubspot: { configured: boolean; ok: boolean; detail?: string } = {
      configured: isHubSpotConfigured(),
      ok: false,
    };
    if (hubspot.configured && updatedLead.email) {
      const result = await syncLeadToHubSpot(
        {
          fullName: updatedLead.fullName,
          email: updatedLead.email,
          phone: updatedLead.phone,
          businessName: updatedLead.businessName,
          businessWebsite: updatedLead.businessWebsite,
          industry: updatedLead.industry,
          companySize: updatedLead.companySize,
          country: updatedLead.country,
          biggestChallenge: updatedLead.biggestChallenge,
          automationGoals: updatedLead.automationGoals,
          budgetRange: updatedLead.budgetRange,
          timeline: updatedLead.timeline,
          leadScore: updatedLead.leadScore,
          leadCategory: updatedLead.leadCategory,
          source: updatedLead.source,
        },
        { dealStageLabel: hubspotLabelForStage(updatedLead.stage || "") || undefined }
      );
      hubspot = { configured: true, ok: result.ok, detail: result.error };
    }

    return Response.json({
      success: true,
      lead: updatedLead,
      hubspot,
    });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const [deletedLead] = await db
      .delete(leads)
      .where(eq(leads.id, leadId))
      .returning();

    if (!deletedLead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    return Response.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
