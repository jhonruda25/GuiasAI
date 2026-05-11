export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'TEACHER';
  createdAt: Date;
  updatedAt: Date;
}
