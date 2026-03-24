/**
 * config.js
 * All app-wide constants in one place.
 * To update sheet or API targets, change only this file.
 */

export const SHEET_ID         = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
export const JOBS_GID         = '0';
export const PROFESSORS_GID   = '1254290790';
export const HR_GID           = '1900335835';

export const JOBS_SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${JOBS_GID}`;

export const PROFESSORS_SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${PROFESSORS_GID}`;

export const HR_SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${HR_GID}`;

// CSV export — reliable headers, used for HR sheet
export const HR_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${HR_GID}`;

export const API_ENDPOINTS = {
  analyze  : '/api/analyze',
  skillGap : '/api/skillgap',
  subscribe: '/api/subscribe',
};
