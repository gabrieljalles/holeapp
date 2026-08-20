import * as path from 'path';

export const baseUploadPath =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '..', '..', 'uploads')
    : '/app/uploads';
