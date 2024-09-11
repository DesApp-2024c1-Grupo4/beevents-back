import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }).end(file.buffer);
        });
    }

    async deleteImage(publicId: string): Promise<any> {
        return cloudinary.uploader.destroy(publicId);
    }

    async getAllImages(): Promise<any> {
        return cloudinary.api.resources({ resource_type: 'image' });
    }

    async getImage(publicId: string): Promise<any> {
        return cloudinary.api.resource(publicId);
    }
}
