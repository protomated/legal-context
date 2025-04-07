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
