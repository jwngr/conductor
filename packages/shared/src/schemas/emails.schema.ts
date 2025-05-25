import {z} from 'zod';

/** Zod schema for an {@link EmailAddress}. */
export const EmailAddressSchema = z.string().email();
