export type ResidentProfile = {
  id: string;
  name: string;
  occupation: string;
  portrait: string;
  /** Manually approved private link only; same ID does not imply same person. */
  legacyId?: string;
  legacyApproved?: boolean;
};
