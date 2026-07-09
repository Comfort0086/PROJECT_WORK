// Normalizes + validates opportunity form input from the company UI.
// Used by both create (POST) and edit (PATCH).

export interface OpportunityInput {
  title: string;
  description: string;
  location?: string;
  duration?: string;
  slotsAvailable?: number;
  skillsRequired?: string[];
  status?: "open" | "closed";
  startDate?: Date | null;
  deadline?: Date | null;
}

export type ParseResult =
  | { ok: true; value: OpportunityInput }
  | { ok: false; error: string };

function toSkills(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseOpportunityInput(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {}
): ParseResult {
  const value: OpportunityInput = {} as OpportunityInput;

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;

  if (!partial || title !== undefined) {
    if (!title) return { ok: false, error: "Title is required." };
    value.title = title;
  }
  if (!partial || description !== undefined) {
    if (!description) return { ok: false, error: "Description is required." };
    value.description = description;
  }

  if (body.location !== undefined)
    value.location = String(body.location).trim();
  if (body.duration !== undefined)
    value.duration = String(body.duration).trim();

  if (body.slotsAvailable !== undefined) {
    const n = Number(body.slotsAvailable);
    if (!Number.isFinite(n) || n < 1)
      return { ok: false, error: "Slots must be a number of at least 1." };
    value.slotsAvailable = Math.floor(n);
  }

  if (body.skillsRequired !== undefined)
    value.skillsRequired = toSkills(body.skillsRequired);

  if (body.status !== undefined) {
    if (body.status !== "open" && body.status !== "closed")
      return { ok: false, error: "Invalid status." };
    value.status = body.status;
  }

  if (body.startDate !== undefined) {
    if (!body.startDate) {
      value.startDate = null;
    } else {
      const d = new Date(String(body.startDate));
      if (isNaN(d.getTime()))
        return { ok: false, error: "Invalid start date." };
      value.startDate = d;
    }
  }

  if (body.deadline !== undefined) {
    if (!body.deadline) {
      value.deadline = null;
    } else {
      const d = new Date(String(body.deadline));
      if (isNaN(d.getTime()))
        return { ok: false, error: "Invalid deadline date." };
      value.deadline = d;
    }
  }

  return { ok: true, value };
}
