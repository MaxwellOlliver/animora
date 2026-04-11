import type { User } from '../user.entity';

export type RegisterLocalInput = {
  email: string;
  password: string;
  profileName: string;
};

export type RegisterWithGoogleInput = {
  email: string;
  googleId: string;
  profileName: string;
};

export abstract class UserRegistrationPort {
  abstract registerLocal(input: RegisterLocalInput): Promise<User>;
  abstract registerWithGoogle(input: RegisterWithGoogleInput): Promise<User>;
}
