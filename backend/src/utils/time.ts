export function formatToSAST(timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): string {
  // 1. Convert to Milliseconds (seconds * 1000 + nanoseconds / 1 million)
  const milliseconds =
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;

  // 2. Create a JS Date object
  const date = new Date(milliseconds);

  // 3. Format specifically for SAST (South Africa Standard Time)
  const sastTime = date.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return sastTime;
}
