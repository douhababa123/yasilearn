import React from 'react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

export interface UserProfile {
  name: string;
  level: string;
  avatarUrl: string;
  targetBand: number;
  currentBand: number;
}