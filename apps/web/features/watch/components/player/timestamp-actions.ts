export type TimestampAction = {
  /** Label shown on the button, e.g. "skip opening" */
  label: string;
  /** Time (seconds) when the button appears */
  startTime: number;
  /** Time (seconds) when the button disappears */
  endTime: number;
  /** Time (seconds) to seek to when clicked */
  skipTo: number;
};

export type EpisodeTimestampType = "recap" | "opening" | "ending";

export type EpisodeTimestamp = {
  type: EpisodeTimestampType;
  startSeconds: number;
  endSeconds: number;
};

const TIMESTAMP_LABELS: Record<EpisodeTimestampType, string> = {
  recap: "skip recap",
  opening: "skip opening",
  ending: "skip ending",
};

export function toTimestampActions(
  timestamps: EpisodeTimestamp[],
): TimestampAction[] {
  return timestamps.map((t) => ({
    label: TIMESTAMP_LABELS[t.type],
    startTime: t.startSeconds,
    endTime: t.endSeconds,
    skipTo: t.endSeconds,
  }));
}
