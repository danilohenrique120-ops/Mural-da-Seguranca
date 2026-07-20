/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContributionType = 'photo' | 'word' | 'message';

export interface Contribution {
  id: string;
  type: ContributionType;
  content: string; // Base64 image data URL for 'photo', single word for 'word', text message for 'message'
  author: string;  // Name or "Anônimo"
  sector?: string;  // Optional company sector (e.g., "Produção", "Logística")
  timestamp: any;   // Firestore serverTimestamp or Date number
  likes: number;    // Interactivity: appreciation clicks
  bgColor?: string; // Optional hex or tailwind class for sticky note background
}

export interface WordFrequency {
  text: string;
  value: number;
}
