import { z } from 'zod';
import mongoose from 'mongoose';
import { isValidCalendarDate } from '@/lib/date';

export { isValidCalendarDate };

const trimAndCleanString = (val: unknown): string | undefined => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return undefined;
};

const StrictPositiveInteger = z.preprocess((val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && /^\d+$/.test(val.trim())) {
    return parseInt(val.trim(), 10);
  }
  return val;
}, z.number().int().min(1, 'Must be at least 1'));

const StrictLimitInteger = z.preprocess((val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && /^\d+$/.test(val.trim())) {
    return parseInt(val.trim(), 10);
  }
  return val;
}, z.number().int().min(1).max(100, 'Limit cannot exceed 100'));

const IsoDateString = z.preprocess(
  trimAndCleanString,
  z
    .string()
    .refine((val) => isValidCalendarDate(val), {
      message: 'Must be a valid calendar date format (YYYY-MM-DD)',
    })
    .optional()
);

const BaseLeadFields = z
  .object({
    search: z.preprocess(trimAndCleanString, z.string().max(100, 'Search query too long').optional()),
    status: z.preprocess(trimAndCleanString, z.enum(['ACTIVE', 'DELETED', 'ONHOLD']).optional()),
    city: z.preprocess(trimAndCleanString, z.string().max(100).optional()),
    utm_source: z.preprocess(trimAndCleanString, z.string().max(100).optional()),
    utm_medium: z.preprocess(trimAndCleanString, z.string().max(100).optional()),
    utm_campaign: z.preprocess(trimAndCleanString, z.string().max(100).optional()),
    range: z.enum(['today', '7days', 'custom']).default('today'),
    startDate: IsoDateString,
    endDate: IsoDateString,
    sort: z.enum(['newest', 'oldest']).default('newest'),
    page: StrictPositiveInteger.default(1),
    limit: StrictLimitInteger.default(10),
  })
  .strict();

export const LeadQuerySchema = BaseLeadFields
  .refine(
    (data) => {
      if (data.range === 'custom') {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: "Both startDate and endDate are required when range is 'custom'",
      path: ['range'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
      }
      return true;
    },
    {
      message: 'startDate cannot be later than endDate',
      path: ['startDate'],
    }
  );

export type ParsedLeadQuery = z.infer<typeof LeadQuerySchema>;

export const ExportQuerySchema = BaseLeadFields.omit({ page: true, limit: true })
  .strict()
  .refine(
    (data) => {
      if (data.range === 'custom') {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: "Both startDate and endDate are required when range is 'custom'",
      path: ['range'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
      }
      return true;
    },
    {
      message: 'startDate cannot be later than endDate',
      path: ['startDate'],
    }
  );

export type ParsedExportQuery = z.infer<typeof ExportQuerySchema>;

export const StatsQuerySchema = z
  .object({
    range: z.enum(['today', '7days', 'custom']).default('today'),
    startDate: IsoDateString,
    endDate: IsoDateString,
  })
  .strict()
  .refine(
    (data) => {
      if (data.range === 'custom') {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: "Both startDate and endDate are required when range is 'custom'",
      path: ['range'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
      }
      return true;
    },
    {
      message: 'startDate cannot be later than endDate',
      path: ['startDate'],
    }
  );

export type ParsedStatsQuery = z.infer<typeof StatsQuerySchema>;

export const ObjectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid Lead ID format',
});

/**
 * Escapes special regex characters in search inputs
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips non-digit characters to normalize phone search queries
 */
export function normalizePhone(text: string): string {
  return text.replace(/\D/g, '');
}
