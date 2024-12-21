import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../roles/role.entity';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

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
