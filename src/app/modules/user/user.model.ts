import mongoose, { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../../config';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: 0,
  },
});

userSchema.methods.isUserExist = async function (
  identifier: string,
  checkPassword = false
): Promise<Partial<IUser> | null> {
  let query: any = {};

  if (checkPassword) {
    query = { password: identifier };
  } else {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { email: identifier };
    }
  }

  return await User.findOne(query, {
    _id: 1,
    email: 1,
    password: 1,
  });
};

userSchema.methods.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword?: string
): Promise<boolean> {
  if (savedPassword && givenPassword) {
    return await bcrypt.compare(givenPassword, savedPassword);
  }
  return false;
};

userSchema.pre('save', async function (next) {
  // hashing user password
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );

  next();
});

export const User = model<IUser, UserModel>('User', userSchema);
