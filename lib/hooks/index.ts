// Hooks exports for convenient imports
// Usage: import { useUser, useOwnerProfile } from '@/lib/hooks'

export { useUser } from "./useUser";
export type {
  UserProfile,
  OwnerProfile,
  AgentProfile,
  AdminProfile,
  SystemOwnerProfile,
  RegularUserProfile,
  UserRole,
  UseUserReturn,
} from "./useUser";

// Specialized hooks
export {
  useOwnerProfile,
  useAgentProfile,
  useAdminProfile,
  useSystemOwnerProfile,
  useRegularUserProfile,
  useHasRole,
  useRoleGuard,
} from "./useUser";
