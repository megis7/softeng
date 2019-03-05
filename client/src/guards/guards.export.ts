import { CrouwdsourcerOnlyGuard } from './crouwdsourcer-only.guard';
import { AdminOnlyGuard } from './admin-only.guard';

export const GUARD_PROVIDERS: any[] = [
    CrouwdsourcerOnlyGuard,
    AdminOnlyGuard
];
