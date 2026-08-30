import { IUserLead } from './types';

/**
 * Escapes values for CSV output to prevent CSV formula injection.
 * Prepends a single quote if the value starts with =, +, -, @, or tab/CR.
 */
function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();

  // Prevent formula injection
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes inside string
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function generateLeadsCsv(leads: IUserLead[]): string {
  const headers = [
    'Lead ID',
    'Name',
    'Email',
    'Phone',
    'City',
    'Profession',
    'Monthly Bill (INR)',
    'Status',
    'Touchpoints Count',
    'Latest UTM Source',
    'Latest UTM Medium',
    'Latest UTM Campaign',
    'Latest Route',
    'Created Date (UTC)',
  ];

  const rows = leads.slice(0, 1000).map((lead) => [
    sanitizeCsvCell(lead.id),
    sanitizeCsvCell(lead.name),
    sanitizeCsvCell(lead.email),
    sanitizeCsvCell(lead.phone),
    sanitizeCsvCell(lead.city || 'N/A'),
    sanitizeCsvCell(lead.profession || 'N/A'),
    sanitizeCsvCell(lead.monthlyPowerBill || 'N/A'),
    sanitizeCsvCell(lead.status),
    sanitizeCsvCell(lead.touchpointCount),
    sanitizeCsvCell(lead.latestCampaign?.utm_source || 'Direct'),
    sanitizeCsvCell(lead.latestCampaign?.utm_medium || 'None'),
    sanitizeCsvCell(lead.latestCampaign?.utm_campaign || 'None'),
    sanitizeCsvCell(lead.latestCampaign?.route || '/'),
    sanitizeCsvCell(lead.createdAt),
  ]);

  const csvBody = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) for Excel / UTF-8 compatibility
  return '\uFEFF' + csvBody;
}
