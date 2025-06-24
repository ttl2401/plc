import { User } from '@/models/user.model';

interface AdminPayload {
  name: string;
  email: string;
  role: string;
  password: string;
}

const migrate = async (): Promise<Boolean> => {
  const payload: AdminPayload = {
    name: 'admin',
    email: 'admin@admin.com',
    role: 'admin',
    password: '123456'
  };
  try {
    await User.create(
      payload
    );
  }
  catch (e){
    console.error(e);
    return false;
  }
  return true;
};

export { migrate }; 