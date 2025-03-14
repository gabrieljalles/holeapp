import { MulterModuleOptions } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const multerOptions: MulterModuleOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    console.log(file)
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(
        new Error('Apenas arquivos de imagem são permitidos!'),
        false,
      );
    }
    callback(null, true);
  },
};
