import * as migration_20260810_102431_initial from './20260810_102431_initial';

export const migrations = [
  {
    up: migration_20260810_102431_initial.up,
    down: migration_20260810_102431_initial.down,
    name: '20260810_102431_initial'
  },
];
