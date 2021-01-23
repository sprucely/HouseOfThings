import Resizer from 'react-image-file-resizer';


export function resize(imageFile: File, maxWidth: number, maxHeight: number, quality: number,
    outputType: 'base64' | 'blob', minWidth: number, minHeight: number) {
    return new Promise<string | Blob | ProgressEvent<FileReader>>(
        (res) => Resizer.imageFileResizer(imageFile, maxWidth, maxHeight,
             'JPEG', quality, 0, res, outputType, minWidth, minHeight));
}