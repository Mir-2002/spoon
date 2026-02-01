export type TimeRange = "short_term" | "medium_term" | "long_term";

export function timeRangeLabel(range: TimeRange): string {
  switch (range) {
    case "short_term":
      return "Last 4 weeks";
    case "medium_term":
      return "Last 6 months";
    case "long_term":
      return "All time";
  }
}
