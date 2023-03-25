import { ConflictException, Injectable } from '@nestjs/common';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<Book[]> {
    return this.prismaService.book.findMany({
      include: { author: true },
    });
  }

  public getById(id: Book['id']): Promise<Book | null> {
    return this.prismaService.book.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  public deleteById(id: Book['id']): Promise<Book> {
    return this.prismaService.book.delete({
      where: { id },
    });
  }

  public async create(
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Book> {
    try {
      return await this.prismaService.book.create({
        data: bookData,
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new ConflictException('Title is already taken');
      throw error;
    }
  }

  public async updateById(
    id: Book['id'],
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Book> {
    try {
      return await this.prismaService.book.update({
        where: { id },
        data: bookData,
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new ConflictException('Title is already taken');
      throw error;
    }
  }

  public async likeBook(bookId: Book['id'], userId: string): Promise<Book> {
    return await this.prismaService.book.update({
      where: { id: bookId },
      data: {
        users: {
          create: {
            user: {
              connect: { id: userId },
            },
          },
        },
      },
    });
  }
}
