import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['timestamp', 'userId'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column()
  level: string;

  @Column()
  packetType: string;

  @Column({ nullable: true })
  userId: number;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  action: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column({ nullable: true })
  responseTime?: number;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  trace?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;
}
