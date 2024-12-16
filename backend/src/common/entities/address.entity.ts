import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    street: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    city: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    state: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    zipCode: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;

    @OneToMany(() => Supplier, supplier => supplier.address)
    suppliers: Supplier[];

    // #todo: add longitude & latitude
}