import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${folder}/${uuidv4()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      return `${publicUrl}/${uniqueFileName}`;
    } catch (error) {
      console.error('Cloudflare R2 업로드 중 예외 발생:', error);
      throw new InternalServerErrorException('이미지 업로드 중 오류가 발생했습니다.');
    }
  }
}