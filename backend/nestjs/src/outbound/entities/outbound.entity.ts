import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbound')
export class Outbound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stock_code: string;

  @Column({ type: 'date', nullable: true })
  inbound_date: Date;

  @Column({ type: 'date' })
  outboundDate: Date;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ default: 'PENDING' }) // PENDING, COMPLETED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
