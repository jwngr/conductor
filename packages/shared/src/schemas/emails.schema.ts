import {z} from 'zod';

export const EmailAddressSchema = z.string().email();
