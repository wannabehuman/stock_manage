import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('inbound')
export class Inbound {
  @PrimaryColumn({ name: 'inbound_date', type: 'date' })
  inbound_date: Date;

  @PrimaryColumn({ name: 'stock_code' })
  stock_code: string;


  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'int', nullable: true })
  max_use_period: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

}
