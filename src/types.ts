/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Resident' | 'Tanod' | 'Admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  status?: 'Available' | 'On Duty' | 'Busy' | 'Offline';
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  createdAt: string;
}

export type IncidentStatus = 'Pending' | 'Responding' | 'Resolved';

export interface Incident {
  id: string;
  reporterId: string;
  reporterName: string;
  type: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: IncidentStatus;
  assignedTanods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
};
