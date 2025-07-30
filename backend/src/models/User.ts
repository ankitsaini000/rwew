import mongoose, { Schema, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  password?: string;
  fullName: string;
  username?: string;
  name?: string;
  avatar?: string;
  role: 'client' | 'creator' | 'admin' | 'brand';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  deactivatedAt?: Date;
  deactivationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Facebook Authentication
  facebookId?: string;
  loginMethod?: 'email' | 'facebook' | 'google' | 'apple';
  socialProfiles?: {
    facebook?: {
      id: string;
      name?: string;
      email?: string;
      profileUrl?: string;
      lastUpdated?: Date;
    }
  };
  phone?: string;
  phoneVerified?: boolean;
  phoneVerificationCode?: string;
  phoneVerificationExpires?: Date;
  isValidPassword(password: string): Promise<boolean>;
  // Utility methods
  setLastLogin(): Promise<void>;
  isSocialLogin(): boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['client', 'creator', 'admin', 'brand'],
      default: 'client',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    deactivationReason: {
      type: String,
      default: null,
    },
    // Facebook Authentication
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    loginMethod: {
      type: String,
      enum: ['email', 'facebook', 'google', 'apple'],
      default: 'email'
    },
    socialProfiles: {
      facebook: {
        id: String,
        name: String,
        email: String,
        profileUrl: String,
        lastUpdated: Date
      }
    },
    phone: {
      type: String,
      unique: false,
      sparse: true,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (!user.isModified('passwordHash')) return next();

  try {
    // Don't hash if this is already a hashed password (starts with $)
    // This prevents double-hashing when a random password is set for social logins
    if (user.passwordHash.startsWith('$')) {
      return next();
    }
    
    const hashed = await hash(user.passwordHash, 10);
    user.passwordHash = hashed;
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Set lastLogin date method
userSchema.methods.setLastLogin = async function(): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

// Check if this is a social login
userSchema.methods.isSocialLogin = function(): boolean {
  return this.loginMethod !== 'email';
};

// Method to check password
userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
  try {
    // Social login users don't use passwords
    if (this.isSocialLogin()) {
      return false;
    }
    
    return await compare(password, this.passwordHash);
  } catch (err) {
    console.error('Password validation failed:', err);
    return false;
  }
};

// Remove sensitive fields from JSON response
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

// Add this after your schema definition but before creating the model
// This adds a virtual password field that sets the passwordHash
userSchema.virtual('password')
  .set(function(password: string) {
    this.passwordHash = password;
    // The pre-save hook will hash this before saving
  });

// Add a name virtual that returns the fullName
userSchema.virtual('name')
  .get(function() {
    return this.fullName;
  });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
