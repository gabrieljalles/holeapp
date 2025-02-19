import { extname } from 'path';
import pngToJpeg from 'png-to-jpeg';

export async function processImage(
    file: Express.Multer.File
): Promise<Buffer> {
    const imagemin = (await import('imagemin')).default;
    const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;


    const extension = extname(file.originalname).toLowerCase();
    const quality = 50;

    if(extension === '.png'){
        const convertedBuffer = await pngToJpeg({quality})(file.buffer);

        const compressedBuffer = await imagemin.buffer(convertedBuffer, {
            plugins: [
                imageminMozjpeg({quality}),
            ],
        });
        return compressedBuffer;
    }else{
        const compressedBuffer = await imagemin.buffer(file.buffer, {
            plugins: [
                imageminMozjpeg({ quality}),
            ]
        });
        return compressedBuffer;
    }
}