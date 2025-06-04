import { User } from '@/models/user.model';

interface AdminPayload {
  name: string;
  email: string;
  role: string;
  password: string;
}

const migrate = async (): Promise<void> => {
  const payload: AdminPayload = {
    name: 'admin',
    email: 'admin@admin.com',
    role: 'admin',
    password: '123456'
  };

  await User.create(
    payload
  );
};

export { migrate }; 