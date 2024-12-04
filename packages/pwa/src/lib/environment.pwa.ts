export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const IS_MAC =
  typeof navigator !== 'undefined' &&
  (/Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
