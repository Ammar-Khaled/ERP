import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  context?: string;

  @Column({ type: 'text', nullable: true })
  trace?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;
}
