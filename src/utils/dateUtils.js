/**
 * B.G. TUTORIAL HOME - IST Timezone & Date Utilities
 * Ensures Indian Standard Time (UTC+5:30) date consistency
 * across all client devices regardless of OS local timezone.
 */

export function getLocalIndianDate() {
  const d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  return d.toISOString().slice(0, 10);
}

export function getLocalIndianMonth() {
  return getLocalIndianDate().slice(0, 7);
}

export function getLocalIndianTime() {
  const d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  return d.toTimeString().slice(0, 5);
}

export function getLocalIndianTimestamp() {
  return new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000).toISOString();
}

export function formatIndianDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}
