import type { IssueCategory, ReportStatus, Urgency } from "@prisma/client";

export const categoryLabels: Record<IssueCategory, string> = {
  POTHOLE: "Pothole / road damage",
  STREETLIGHT: "Street lighting",
  TRASH: "Waste & sanitation",
  WATER_LEAK: "Water / drainage",
  PARK_MAINTENANCE: "Parks & green spaces",
  OTHER: "Other civic issue",
};

export const statusLabels: Record<ReportStatus, string> = {
  SUBMITTED: "Submitted",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  REJECTED: "Closed — not actionable",
};

export const urgencyLabels: Record<Urgency, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High / safety",
};
