// Core eligibility engine. Never recommends a scholarship the
// student's confirmed profile doesn't actually satisfy.
// An unconfirmed field is treated as "cannot verify" — not eligible,
// not guessed — per the non-negotiable requirements in the spec.

function checkRequirement(req, profile) {
  const fieldEntry = profile[req.field];

  if (!fieldEntry || !fieldEntry.confirmed || fieldEntry.value === null || fieldEntry.value === undefined) {
    return { met: false, reason: "unconfirmed", actual: null };
  }

  const actual = fieldEntry.value;
  let met = false;
  switch (req.op) {
    case ">=":
      met = actual >= req.value;
      break;
    case "<=":
      met = actual <= req.value;
      break;
    case "==":
      met = actual === req.value;
      break;
    case "in":
      met = req.value.includes(actual);
      break;
    default:
      met = false;
  }

  return { met, reason: met ? "satisfied" : "not_satisfied", actual };
}

// Returns one of: "match" (all requirements met),
// "close" (at least one met, at least one unmet/unconfirmed),
// "not_eligible" (no requirements met, or a hard-fail with unconfirmed field)
export function evaluateScholarship(scholarship, profile) {
  const results = scholarship.requirements.map((req) => ({
    ...req,
    ...checkRequirement(req, profile)
  }));

  const allMet = results.every((r) => r.met);
  const anyMet = results.some((r) => r.met);

  let status;
  if (allMet) status = "match";
  else if (anyMet) status = "close";
  else status = "not_eligible";

  return {
    scholarshipId: scholarship.id,
    name: scholarship.name,
    amountNZD: scholarship.amountNZD,
    deadline: scholarship.deadline,
    provider: scholarship.provider,
    status,
    requirementResults: results
  };
}

export function evaluateAll(scholarships, profile) {
  return scholarships.map((s) => evaluateScholarship(s, profile));
}
