import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { Document } from './document.entity';

@Entity()
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Document', 'chunks', { onDelete: 'CASCADE' })
  document: any; // Using 'any' to avoid circular reference issue

  @Column('text')
  content: string;

  @Column('int')
  startIndex: number;

  @Column('int')
  endIndex: number;

  @OneToOne('DocumentVector', 'chunk', { cascade: true })
  vector: any; // Using 'any' to avoid circular reference issue
}
