import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Availability } from '../calendar/availability.entity';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => Availability, (availability) => availability.instructor)
  availabilities: Availability[];
}
