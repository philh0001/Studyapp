import type {ValidateFunction} from 'ajv';import type {ContentPack,Blueprint} from '../types';import type {BackupV1} from '../../backup/types';
export const checkPack:ValidateFunction<ContentPack>;export const checkBlueprint:ValidateFunction<Blueprint>;export const checkBackup:ValidateFunction<BackupV1>;
