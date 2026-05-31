import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export type DroneStatus = 'active' | 'offline' | 'maintenance';

@Entity('drones')
export class Drone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  stream_url: string;

  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  @Column({ type: 'int', nullable: true })
  group_id: number | null;

  @Column({ type: 'varchar', default: 'offline' })
  status: DroneStatus;

  @Column({ type: 'int', nullable: true })
  battery: number | null;

  @Column({ type: 'float', nullable: true })
  lat: number | null;

  @Column({ type: 'float', nullable: true })
  lng: number | null;

  @UpdateDateColumn()
  updated_at: Date;
}
