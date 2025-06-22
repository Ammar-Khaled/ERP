import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'اسم الصلاحية',
  })
  nameAr: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  // Arabic description
  @Column({ type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
