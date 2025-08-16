"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = require("bcrypt");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // Add index for faster queries
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
        index: true, // Add index for role-based queries
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
}, {
    timestamps: true,
});
// Hash password before saving if modified
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('passwordHash'))
        return next();
    try {
        // Don't hash if this is already a hashed password (starts with $)
        // This prevents double-hashing when a random password is set for social logins
        if (user.passwordHash.startsWith('$')) {
            return next();
        }
        const hashed = await (0, bcrypt_1.hash)(user.passwordHash, 10);
        user.passwordHash = hashed;
        next();
    }
    catch (err) {
        next(err);
    }
});
// Set lastLogin date method
userSchema.methods.setLastLogin = async function () {
    this.lastLogin = new Date();
    await this.save();
};
// Check if this is a social login
userSchema.methods.isSocialLogin = function () {
    return this.loginMethod !== 'email';
};
// Method to check password
userSchema.methods.isValidPassword = async function (password) {
    try {
        // Social login users don't use passwords
        if (this.isSocialLogin()) {
            return false;
        }
        return await (0, bcrypt_1.compare)(password, this.passwordHash);
    }
    catch (err) {
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
    .set(function (password) {
    this.passwordHash = password;
    // The pre-save hook will hash this before saving
});
// Add a name virtual that returns the fullName
userSchema.virtual('name')
    .get(function () {
    return this.fullName;
});
// Add compound indexes for common query patterns
userSchema.index({ role: 1, isActive: 1 }); // For querying active users by role
userSchema.index({ email: 1, role: 1 }); // For authentication with role check
userSchema.index({ facebookId: 1 }, { sparse: true }); // For Facebook login
userSchema.index({ username: 1 }, { sparse: true }); // For username lookup
userSchema.index({ isVerified: 1, role: 1 }); // For verified users by role
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
