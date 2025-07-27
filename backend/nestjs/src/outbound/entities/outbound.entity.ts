import { Entity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbound')
export class Outbound {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  stock_code: string;
  @Column()
  outboundDate: Date;

  @Column()
  quantity: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
