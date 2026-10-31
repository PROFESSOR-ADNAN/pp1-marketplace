export const sanitizeObject = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean: any = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue; // Strip MongoDB injection operators
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
};
