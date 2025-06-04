import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {DeliverySchedule, DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

import {
  DeliveryScheduleSchema,
  DeliveryScheduleTypeSchema,
} from '@shared/schemas/deliverySchedules.schema';
import {fromStorageDeliverySchedule} from '@shared/storage/deliverySchedules.storage';

/**
 * Attempts to parse an unknown value into an {@link DeliverySchedule}.
 */
export function parseDeliverySchedule(maybeDeliverySchedule: unknown): Result<DeliverySchedule> {
  const parsedResult = parseZodResult(DeliveryScheduleSchema, maybeDeliverySchedule);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid delivery schedule');
  }

  const deliveryScheduleFromStorage = parsedResult.value;
  return fromStorageDeliverySchedule(deliveryScheduleFromStorage);
}

/**
 * Attempts to parse an unknown value into an {@link DeliverySchedule}.
 */
export function parseDeliveryScheduleType(
  maybeDeliveryScheduleType: unknown
): Result<DeliveryScheduleType> {
  return parseZodResult(DeliveryScheduleTypeSchema, maybeDeliveryScheduleType);
}
