import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.availabilities)
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @Column()
  instructorId: number;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;
}
