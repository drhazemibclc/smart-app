import { customAlphabet } from 'nanoid';

const prefixes = {
  user: 'USR',
  patient: 'PAT',
  record: 'REC',
  doctor: 'DOC',
  appointment: 'APT'
} as const;

type Prefix = keyof typeof prefixes;

type GenerateIdOptions = {
  length?: number;
  separator?: string;
};

export function generateId(prefix?: Prefix, options: GenerateIdOptions = {}) {
  const { length = 12, separator = '_' } = options;

  const id = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)();

  // ✅ Type-safe getter using switch
  let prefixValue: string | undefined;
  switch (prefix) {
    case 'user':
      prefixValue = prefixes.user;
      break;
    case 'patient':
      prefixValue = prefixes.patient;
      break;
    case 'record':
      prefixValue = prefixes.record;
      break;
    case 'appointment':
      prefixValue = prefixes.appointment;
      break;
    default:
      prefixValue = undefined;
  }

  return prefixValue ? `${prefixValue}${separator}${id}` : id;
}
