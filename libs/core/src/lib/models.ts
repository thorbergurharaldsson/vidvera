/**
 * The base presence information for a user
 */
export enum UserAvailability {
  Available = 'available',
  AvailableIdle = 'available-idle',
  Away = 'away',
  BeRightBack = 'be-right-back',
  Busy = 'busy',
  BusyIdle = 'busy-idle',
  DoNotDisturb = 'do-not-disturb',
  Offline = 'offline',
  PresenceUnknown = 'presence-unknown'
}

/**
 * The supplemental information to a user's availability
 */
export enum UserActivity {
  Available = 'available',
  Away = 'away',
  BeRightBack = 'be-right-back',
  Busy = 'busy',
  DoNotDisturb = 'do-not-disturb',
  InACall = 'in-a-call',
  InAConferenceCall = 'in-a-conference-call',
  Inactive = 'inactive',
  InAMeeting = 'in-a-meeting',
  Offline = 'offline',
  OffWork = 'off-work',
  OutOfOffice = 'out-of-office',
  PresenceUnknown = 'presence-unknown',
  Presenting = 'presenting',
  UrgentInterruptionsOnly = 'urgent-interruptions-only'
}
