// images.controller.ts

import { Controller, Post, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('images')
export class ImagesController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file provided');
        }

        const result = await this.cloudinaryService.uploadImage(file);
        return { url: result.secure_url, publicId: result.public_id };
    }

    @Get()
    async getAllImages() {
        const result = await this.cloudinaryService.getAllImages();
        return result.resources.map((resource) => ({
            url: resource.secure_url,
            publicId: resource.public_id,
        }));
    }
}
