// src/database/entities/document.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  clioId: string;

  @Column()
  mimeType: string;

  @Column('jsonb')
  metadata: Record<string, any>;

  @OneToMany(() => DocumentChunk, chunk => chunk.document)
  chunks: DocumentChunk[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/database/entities/document-chunk.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';
import { DocumentVector } from './document-vector.entity';

@Entity()
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, document => document.chunks, { onDelete: 'CASCADE' })
  document: Document;

  @Column('text')
  content: string;

  @Column('int')
  startIndex: number;

  @Column('int')
  endIndex: number;

  @OneToOne(() => DocumentVector, vector => vector.chunk, { cascade: true })
  vector: DocumentVector;
}

// src/database/entities/document-vector.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

@Entity()
export class DocumentVector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => DocumentChunk, chunk => chunk.vector)
  @JoinColumn()
  chunk: DocumentChunk;

  @Column('vector', { dimension: 1536 })
  embedding: number[];
}

// src/database/entities/oauth-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class OAuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
