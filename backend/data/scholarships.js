// Demo scholarship database — New Zealand context.
// requirements are structured so the matching engine can check them
// programmatically against a student's confirmed profile fields.

export const scholarships = [
  {
    id: "SCH-01",
    name: "STEM Merit Scholarship — NZ",
    amountNZD: 4500,
    deadline: "2026-10-15",
    provider: "NZ STEM Education Trust",
    requirements: [
      { field: "gpa", op: ">=", value: 3.5, label: "GPA ≥ 3.5 (NCEA-equivalent)" },
      { field: "major", op: "in", value: ["Computer Science", "Engineering", "Mathematics", "Physics"], label: "STEM major" }
    ]
  },
  {
    id: "SCH-02",
    name: "First-in-Family Leaders Grant",
    amountNZD: 2800,
    deadline: "2026-11-01",
    provider: "Aotearoa Tertiary Access Fund",
    requirements: [
      { field: "first_in_family", op: "==", value: true, label: "First-generation university student" }
    ]
  },
  {
    id: "SCH-03",
    name: "Community Impact Award",
    amountNZD: 1200,
    deadline: "2026-09-30",
    provider: "Community Trust of NZ",
    requirements: [
      { field: "volunteer_hours", op: ">=", value: 50, label: "50+ logged volunteer hours" },
      { field: "partner_institution", op: "==", value: true, label: "Enrolled at a partner NZ institution" }
    ]
  },
  {
    id: "SCH-04",
    name: "Women in Tech Aotearoa Fund",
    amountNZD: 3000,
    deadline: "2026-10-20",
    provider: "Women in Tech Aotearoa",
    requirements: [
      { field: "gender", op: "==", value: "Female", label: "Female" },
      { field: "major", op: "in", value: ["Computer Science", "Engineering"], label: "CS / Engineering major" }
    ]
  }
];
