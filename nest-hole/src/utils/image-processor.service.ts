import { extname } from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';

const pngToJpeg = require('png-to-jpeg');


export async function processImage(
    file: Express.Multer.File
): Promise<Buffer> {
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