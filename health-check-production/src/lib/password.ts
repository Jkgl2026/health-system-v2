import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 检查密码强度
 * @param password 明文密码
 * @returns 密码强度对象
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('密码长度至少为8位');
  }

  // 大小写字母检查
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码应包含大小写字母');
  }

  // 数字检查
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码应包含数字');
  }

  // 特殊字符检查
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码应包含特殊字符');
  }

  return { score, feedback };
}
