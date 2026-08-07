// Demo student store. In a real build this would be a database;
// here it's an in-memory object seeded with the sample student
// from the spec so the prototype is testable end-to-end.

export const students = {
  "amara-okafor": {
    id: "amara-okafor",
    name: "Amara Okafor",
    year: "Year 13",
    location: "Wellington, NZ",
    rawUploadText: `NCEA Transcript & Profile — Amara Okafor
School: Wellington Girls' College
NCEA Level 3, GPA equivalent: 3.7 / 4.0
Intended tertiary major: Computer Science
Extracurriculars: Robotics Club (Lead, 2025-2026), Volunteer Tutoring (Maths & Science, 62 hours logged)
StudyLink financial need indicator: High`,
    // Confirmed = fields the student has explicitly verified.
    // Unconfirmed fields exist in the schema but are left null —
    // the matcher must never guess these.
    profile: {
      gpa: { value: 3.7, confirmed: true },
      major: { value: "Computer Science", confirmed: true },
      extracurriculars: { value: "Robotics Club (Lead), Volunteer Tutoring", confirmed: true },
      volunteer_hours: { value: 62, confirmed: true },
      financial_need: { value: "High", confirmed: true },
      first_in_family: { value: null, confirmed: false },
      gender: { value: null, confirmed: false },
      partner_institution: { value: null, confirmed: false }
    },
    applications: {
      "SCH-01": { status: "drafting" },
      "SCH-04": { status: "not_started" },
      "SCH-03": { status: "not_started" }
    }
  }
};

export function getStudent(id) {
  return students[id];
}

export function confirmProfileField(id, field, value) {
  const student = students[id];
  if (!student) return null;
  if (!(field in student.profile)) return null;
  student.profile[field] = { value, confirmed: true };
  return student.profile;
}

export function setApplicationStatus(id, scholarshipId, status) {
  const student = students[id];
  if (!student) return null;
  student.applications[scholarshipId] = { status };
  return student.applications;
}
