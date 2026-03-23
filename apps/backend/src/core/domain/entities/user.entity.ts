export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  role: 'TEACHER';
  createdAt: Date;
  updatedAt: Date;
}
