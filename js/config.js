/**
 * config.js
 * All app-wide constants in one place.
 * To update sheet or API targets, change only this file.
 */

export const SHEET_ID         = '1X412u-aXPAzkKqwRn0PgvbjcWMaivWJx-FlyHb6LARc';
export const JOBS_GID         = '0';
export const PROFESSORS_GID   = '1254290790';

export const JOBS_SHEET_URL = 
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${JOBS_GID}`;

export const PROFESSORS_SHEET_URL = 
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${PROFESSORS_GID}`;

export const API_ENDPOINTS = {
  analyze  : '/api/analyze',
  skillGap : '/api/skillgap',
  subscribe: '/api/subscribe',
};
