import {z} from 'zod/v4';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import type {Result} from '@shared/types/results.types';

import {DeliveryScheduleSchema} from '@shared/schemas/deliverySchedules.schema';
import {fromStorageDeliverySchedule} from '@shared/storage/deliverySchedules.storage';

/**
 * Attempts to parse an unknown value into an {@link DeliverySchedule}.
 */
export function parseDeliverySchedule(
  maybeDeliverySchedule: unknown
): Result<DeliverySchedule, Error> {
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
): Result<DeliveryScheduleType, Error> {
  return parseZodResult(z.enum(DeliveryScheduleType), maybeDeliveryScheduleType);
}
