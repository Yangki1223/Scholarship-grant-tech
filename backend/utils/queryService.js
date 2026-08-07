import { scholarships } from "../data/scholarships.js";
import { getStudent } from "../data/students.js";
import { evaluateAll } from "./matcher.js";

function formatRequirementReason(result) {
  if (result.met) {
    return `${result.label} satisfied`;
  }

  if (result.reason === "unconfirmed") {
    return `${result.label} needs confirmation`;
  }

  return `${result.label} did not match`;
}

export function getQueryServicePayload(studentId = "amara-okafor", questions = "eligibility,student") {
  const student = getStudent(studentId);
  const profile = student?.profile;
  const results = profile ? evaluateAll(scholarships, profile) : [];
  const normalizedQuestions = String(questions || "").split(",").map((q) => q.trim().toLowerCase()).filter(Boolean);

  const rows = results
    .map((result) => ({
      scholarship: result.name,
      fitScore:
        result.status === "match"
          ? "High"
          : result.status === "close"
            ? "Medium"
            : "Low",
      status: result.status,
      reason: result.requirementResults.map(formatRequirementReason).join(" | ")
    }))
    .sort((a, b) => {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.fitScore] - order[a.fitScore];
    });

  const studentFields = student
    ? [
        { field: "Name", value: student.name },
        { field: "Year", value: student.year },
        { field: "Location", value: student.location },
        { field: "GPA", value: student.profile?.gpa?.value ?? "Unknown" },
        { field: "Major", value: student.profile?.major?.value ?? "Unknown" },
        { field: "Volunteer hours", value: student.profile?.volunteer_hours?.value ?? "Unknown" },
        { field: "Financial need", value: student.profile?.financial_need?.value ?? "Unknown" }
      ]
    : [];

  const requirementRows = scholarships.map((scholarship) => ({
    scholarship: scholarship.name,
    requirements: scholarship.requirements.map((req) => req.label).join(" • ")
  }));

  const extraTables = [];
  if (normalizedQuestions.includes("student") || normalizedQuestions.includes("all")) {
    extraTables.push({
      title: "Student profile details",
      columns: ["field", "value"],
      rows: studentFields
    });
  }

  if (normalizedQuestions.includes("requirements") || normalizedQuestions.includes("all")) {
    extraTables.push({
      title: "Scholarship requirement summary",
      columns: ["scholarship", "requirements"],
      rows: requirementRows
    });
  }

  if (normalizedQuestions.includes("eligibility") || normalizedQuestions.includes("all")) {
    extraTables.push({
      title: "Eligibility results",
      columns: ["scholarship", "fitScore", "status", "reason"],
      rows
    });
  }

  if (normalizedQuestions.includes("analysis")) {
    extraTables.push({
      title: "Match analysis",
      columns: ["scholarship", "status", "insight"],
      rows: results.map((result) => ({
        scholarship: result.name,
        status: result.status,
        insight:
          result.status === "match"
            ? "Ready for application based on confirmed fields"
            : result.status === "close"
              ? "Close match; one or more fields need confirmation"
              : "Not eligible with current confirmed profile"
      }))
    });
  }

  return {
    mode: "local-demo",
    service: "Query Service",
    title: "Scholarship Query Studio",
    description:
      "A Snowflake-style Query Service panel that surfaces the GrantMatch NZ demo scholarship dataset through SQL-shaped results using the project's seeded student record.",
    summary: {
      studentName: student?.name || "Unknown student",
      scholarshipCount: scholarships.length,
      highConfidenceMatches: rows.filter((row) => row.fitScore === "High").length,
      topMatch: rows[0]?.scholarship || "No scholarship data"
    },
    sampleQuery:
      `SELECT scholarship_name, fit_score, status FROM demo_scholarships WHERE student_id = '${studentId || "amara-okafor"}' ORDER BY fit_score DESC;`,
    sampleQuestions: normalizedQuestions.join(", ") || "eligibility",
    sampleRows: rows,
    extraTables,
    notes: [
      "This view uses the repo's existing demo data only, so it is ready for panel demos without a live Snowflake account.",
      "The UI mirrors a Snowflake Query Service experience by presenting a SQL-style query and returning structured analytics rows.",
      "Use the questions field to request additional tables like student profile details, requirements, or match analysis."
    ]
  };
}
