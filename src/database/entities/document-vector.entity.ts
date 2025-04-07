import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { DocumentChunk } from './document-chunk.entity';

@Entity()
export class DocumentVector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => DocumentChunk, chunk => chunk.vector)
  @JoinColumn()
  chunk: DocumentChunk;

  @Column('simple-array')
  embedding: number[];
}
