import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  @IsOptional()
  description: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  controller: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  action: string;

  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
