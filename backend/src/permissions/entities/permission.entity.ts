import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: false })
  controller: string;

  @Column({ nullable: false })
  action: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
