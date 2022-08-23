import { ViewUserProfileDTO } from './view-models';

export interface AuthContextState {
  authenticated: boolean;
  user: {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    sub: string;
    [key: string]: unknown;
  } | null;
  profile: ViewUserProfileDTO | null;
}
