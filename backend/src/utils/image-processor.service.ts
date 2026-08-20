import sharp from 'sharp';

const JPEG_QUALITY = 50;

export async function processImage(
    file: Express.Multer.File
): Promise<Buffer> {
    try {
        // sharp decodifica qualquer formato suportado (PNG, JPEG, WebP, etc.) e rejeita a
        // Promise de forma limpa se o arquivo estiver corrompido — não derruba o processo.
        return await sharp(file.buffer)
            .rotate() // aplica a orientação EXIF antes de descartá-la na conversão
            .jpeg({ quality: JPEG_QUALITY })
            .toBuffer();
    } catch (error) {
        console.error('Erro ao processar a imagem:', error);
        throw new Error('Falha ao processar a imagem! O arquivo pode estar corrompido.');
    }
}
