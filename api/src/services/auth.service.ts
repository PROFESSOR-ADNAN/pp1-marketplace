import crypto from 'crypto';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import User, { IUser } from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { generateAccessToken, generateRefreshTokenString, hashToken } from '../utils/token.js';
import { RegisterInput, LoginInput, ROLES } from '@souq/shared';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const registerUser = async (input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    const err: any = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const role = input.role === ROLES.SELLER ? ROLES.SELLER : ROLES.BUYER;
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role,
  });

  const tokens = await issueTokenPair(user);
  return { user, tokens };
};

export const loginUser = async (input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const user = await User.findOne({ email: input.email }).select('+password +totpSecret');

  // Constant-time behavior: verify dummy password if user not found to thwart timing attacks
  const dummyHash = '$2a$12$e80yq9g6G.iG.zV/nL7Pz.e6Xj7K2wO7y3eX/f6C8eK4V0k4rR3K.';
  const passwordValid = user
    ? await user.matchPassword(input.password)
    : await User.schema.methods.matchPassword.call({ password: dummyHash }, input.password);

  if (!user || !passwordValid) {
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const tokens = await issueTokenPair(user);
  return { user, tokens };
};

export const issueTokenPair = async (user: IUser, family?: string): Promise<AuthTokens> => {
  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const rawRefreshToken = generateRefreshTokenString();
  const tokenHash = hashToken(rawRefreshToken);
  const tokenFamily = family || crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    family: tokenFamily,
    expiresAt,
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

export const rotateRefreshToken = async (rawToken: string): Promise<AuthTokens> => {
  const tokenHash = hashToken(rawToken);
  const existingToken = await RefreshToken.findOne({ tokenHash });

  if (!existingToken) {
    const err: any = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  if (existingToken.isRevoked) {
    // Reuse detected! Compromised token family — revoke all tokens in family immediately
    await RefreshToken.updateMany({ family: existingToken.family }, { isRevoked: true });
    const err: any = new Error('Compromised token family detected, please re-authenticate');
    err.statusCode = 401;
    throw err;
  }

  // Mark token revoked
  existingToken.isRevoked = true;
  await existingToken.save();

  const user = await User.findById(existingToken.user);
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  return issueTokenPair(user, existingToken.family);
};

export const revokeRefreshToken = async (rawToken: string): Promise<void> => {
  const tokenHash = hashToken(rawToken);
  await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
};

export const setupTOTP = async (user: IUser): Promise<{ secret: string; qrCodeDataUrl: string }> => {
  const secret = authenticator.generateSecret();
  user.totpSecret = secret;
  await user.save();

  const otpauth = authenticator.keyuri(user.email, 'SOUQ Marketplace', secret);
  const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

  return { secret, qrCodeDataUrl };
};

export const verifyAndEnableTOTP = async (user: IUser, token: string): Promise<boolean> => {
  const fullUser = await User.findById(user._id).select('+totpSecret');
  if (!fullUser || !fullUser.totpSecret) {
    const err: any = new Error('MFA setup not initialized');
    err.statusCode = 400;
    throw err;
  }

  const isValid = authenticator.verify({ token, secret: fullUser.totpSecret });
  if (!isValid) {
    const err: any = new Error('Invalid authentication code');
    err.statusCode = 400;
    throw err;
  }

  fullUser.totpEnabled = true;
  await fullUser.save();
  return true;
};

export const exportUserData = async (userId: string): Promise<any> => {
  const [user, addresses, orders, reviews] = await Promise.all([
    User.findById(userId).select('-password -totpSecret'),
    Address.find({ user: userId }),
    Order.find({ buyer: userId }),
    Review.find({ buyer: userId }),
  ]);

  return {
    profile: user,
    addresses,
    orders,
    reviews,
    exportedAt: new Date().toISOString(),
  };
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      name: 'Deleted User',
      email: `deleted_${userId}_${Date.now()}@anonymized.souq`,
      password: crypto.randomBytes(32).toString('hex'),
      totpEnabled: false,
    }),
    Address.deleteMany({ user: userId }),
    RefreshToken.deleteMany({ user: userId }),
  ]);
};

export const demoLogin = async (requestedRole?: string): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const role = requestedRole === ROLES.ADMIN ? ROLES.ADMIN : requestedRole === ROLES.SELLER ? ROLES.SELLER : ROLES.BUYER;
  
  const emailMap: Record<string, { email: string; name: string }> = {
    [ROLES.BUYER]: { email: 'demo.buyer@souq.test', name: 'Demo Buyer (Addis)' },
    [ROLES.SELLER]: { email: 'demo.seller@souq.test', name: 'Bole Artisan Crafts' },
    [ROLES.ADMIN]: { email: 'admin@souq.test', name: 'SOUQ Platform Admin' },
  };

  const target = emailMap[role] || emailMap[ROLES.BUYER];
  let user = await User.findOne({ email: target.email });
  if (!user) {
    user = await User.create({
      name: target.name,
      email: target.email,
      password: 'DemoPassword123!',
      role,
      totpEnabled: role === ROLES.ADMIN,
    });
  } else {
    let changed = false;
    if (user.role !== role) {
      user.role = role;
      changed = true;
    }
    if (role === ROLES.ADMIN && !user.totpEnabled) {
      user.totpEnabled = true;
      changed = true;
    }
    if (changed) await user.save();
  }

  const tokens = await issueTokenPair(user);
  return { user, tokens };
};
