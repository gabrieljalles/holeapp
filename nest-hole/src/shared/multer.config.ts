import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerOptions: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const newFilename = `${uniqueSuffix}${extname(file.originalname)}`;
      callback(null, newFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5MB)
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(
        new Error('Apenas arquivos de imagem são permitidos!'),
        false,
      );
    }
    callback(null, true);
  },
};
