import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule
import { CloudinaryProvider } from 'src/common/cloudinary/cloudinary.provider'; // Asegúrate de que la ruta es correcta
import { ImagesController } from 'src/controllers/images.controller';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
    imports: [ConfigModule], // Asegúrate de incluir ConfigModule aquí
    controllers: [ImagesController],
    providers: [CloudinaryService, CloudinaryProvider],
})
export class ImagesModule { }
