import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('statuses')
export class Status {
    @PrimaryGeneratedColumn()
    status_id: number;

    //# suggestion: add a unique name
    
    @Column({ type: 'varchar', length: 50, default: "Transaction Initiated", nullable: false })
    status_description: string;
}