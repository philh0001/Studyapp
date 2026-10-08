import type {DatabaseSnapshot} from '../sessions/types';
import type {ValidationIssue} from '../content/types';
export const MAX_BACKUP_BYTES=10_485_760;
export const MAX_EXPANDED_BACKUP_BYTES=67_108_864;
export interface BackupV1 extends DatabaseSnapshot{schemaVersion:1;exportedAt:string}
export interface BackupValidation{valid:boolean;backup:BackupV1|null;issues:ValidationIssue[]}
export interface RestoreConfirmation{replaceConfirmed:boolean;recoveryBackup:Blob;compressedImport?:boolean;expectedRecoveryState?:string}
export const backupTables=['settings','packs','sourceChecks','contentTrust','sessions','attempts','reviews','bookmarks','notes','releasedHoldouts','workspace'] as const;
