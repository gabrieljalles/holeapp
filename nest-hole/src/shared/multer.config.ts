import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerOptions: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {

      // Montar nome
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      // Colocar a extensão como jpg
      const newFilename = `${uniqueSuffix}${extname(file.originalname)}`;
      callback(null, newFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
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
