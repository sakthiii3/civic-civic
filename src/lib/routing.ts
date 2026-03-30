import type { IssueCategory } from "@/generated/prisma/enums";

/** Department codes seeded in DB — automated routing from report category */
export function departmentCodeForCategory(category: IssueCategory): string {
  switch (category) {
    case "POTHOLE":
    case "OTHER":
      return "PW";
    case "STREETLIGHT":
      return "PWR";
    case "TRASH":
    case "WATER_LEAK":
      return "SAN";
    case "PARK_MAINTENANCE":
      return "PARK";
    default:
      return "PW";
  }
}
