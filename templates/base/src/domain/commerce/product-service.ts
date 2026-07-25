import type { DbClient } from '@/lib/db';
import { PrismaClient } from '@/generated/prisma';

export interface ProductDto {
  id: string;
  type: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  currency: string;
  compareAtPrice: number | null;
  sku: string | null;
  category: string | null;
  tags: string[];
  imageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  stockCount: number | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  type?: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  currency?: string;
  compareAtPrice?: number;
  sku?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
  stockCount?: number;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  metadata?: Record<string, unknown>;
}

export interface ProductFilter {
  category?: string;
  type?: string;
  tags?: string[];
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

type ProductRow = {
  id: string;
  type: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  currency: string;
  compareAtPrice: number | null;
  sku: string | null;
  category: string | null;
  tags: string[];
  imageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  stockCount: number | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductService {
  constructor(private readonly db: DbClient) {}

  async list(filter: ProductFilter = {}): Promise<ProductDto[]> {
    const where: Record<string, unknown> = {};

    if (filter.category) where.category = filter.category;
    if (filter.type) where.type = filter.type;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.tags && filter.tags.length > 0) where.tags = { hasSome: filter.tags };
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { summary: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, unknown> = {};
    const sortField = filter.sortBy ?? 'sortOrder';
    orderBy[sortField] = filter.sortOrder ?? 'asc';

    const rows = await (this.db as unknown as PrismaClient).product.findMany({
      where,
      orderBy,
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
    });

    return (rows as ProductRow[]).map((r) => this.toDto(r));
  }

  async getBySlug(slug: string): Promise<ProductDto | null> {
    const row = await (this.db as unknown as PrismaClient).product.findUnique({
      where: { slug },
    });
    return row ? this.toDto(row as ProductRow) : null;
  }

  async getById(id: string): Promise<ProductDto | null> {
    const row = await (this.db as unknown as PrismaClient).product.findUnique({
      where: { id },
    });
    return row ? this.toDto(row as ProductRow) : null;
  }

  async create(data: ProductInput): Promise<ProductDto> {
    const row = await (this.db as unknown as PrismaClient).product.create({
      data: {
        type: data.type ?? 'product',
        name: data.name,
        slug: data.slug,
        summary: data.summary,
        description: data.description,
        price: data.price,
        currency: data.currency ?? 'USD',
        compareAtPrice: data.compareAtPrice ?? null,
        sku: data.sku ?? null,
        category: data.category ?? null,
        tags: data.tags ?? [],
        imageUrl: data.imageUrl ?? null,
        galleryUrls: data.galleryUrls ?? [],
        videoUrl: data.videoUrl ?? null,
        stockCount: data.stockCount ?? null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        metadata: data.metadata ?? {},
      },
    });
    return this.toDto(row as ProductRow);
  }

  async update(id: string, data: ProductInput): Promise<ProductDto> {
    const existing = await (this.db as unknown as PrismaClient).product.findUnique({
      where: { id },
    });
    if (!existing) throw new Error('Product not found');

    const updateData: Record<string, unknown> = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.galleryUrls !== undefined) updateData.galleryUrls = data.galleryUrls;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.stockCount !== undefined) updateData.stockCount = data.stockCount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const row = await (this.db as unknown as PrismaClient).product.update({
      where: { id },
      data: updateData,
    });
    return this.toDto(row as ProductRow);
  }

  async delete(id: string): Promise<void> {
    await (this.db as unknown as PrismaClient).product.delete({ where: { id } });
  }

  private toDto(row: ProductRow): ProductDto {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      slug: row.slug,
      summary: row.summary,
      description: row.description,
      price: row.price,
      currency: row.currency,
      compareAtPrice: row.compareAtPrice,
      sku: row.sku,
      category: row.category,
      tags: row.tags,
      imageUrl: row.imageUrl,
      galleryUrls: row.galleryUrls,
      videoUrl: row.videoUrl,
      stockCount: row.stockCount,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      metadata: row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}