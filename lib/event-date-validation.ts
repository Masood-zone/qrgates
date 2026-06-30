export function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function isDateOnOrAfterToday(date: Date) {
  return startOfDay(date).getTime() >= startOfDay(new Date()).getTime();
}

type EventDateValidationResult =
  | { ok: true; startDate: Date; endDate: Date }
  | { ok: false; message: string };

export function validateEventDateRange(
  startDateInput: string | Date,
  endDateInput: string | Date
): EventDateValidationResult {
  const startDate = new Date(startDateInput);
  const endDate = new Date(endDateInput);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, message: "Invalid event date" };
  }

  if (!isDateOnOrAfterToday(startDate) || !isDateOnOrAfterToday(endDate)) {
    return {
      ok: false,
      message: "Event start and end dates cannot be in the past",
    };
  }

  if (endDate.getTime() < startDate.getTime()) {
    return { ok: false, message: "Event end date must be after start date" };
  }

  return { ok: true, startDate, endDate };
}
