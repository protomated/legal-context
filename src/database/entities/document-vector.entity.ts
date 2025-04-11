import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class DocumentVector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('DocumentChunk', 'vector')
  @JoinColumn()
  chunk: any; // Using 'any' to avoid circular reference issue

  @Column('simple-array')
  embedding: number[];
}
