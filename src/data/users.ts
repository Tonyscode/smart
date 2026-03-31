export type User = {
  username: string;
  password: string;
  role: 'standard' | 'locked' | 'problem' | 'performance_glitch';
};

export const users: Record<string, User> = {
  standard: {
    username: process.env.STANDARD_USER || 'standard_user',
    password: process.env.PASSWORD || 'secret_sauce',
    role: 'standard',
  },
  locked: {
    username: process.env.LOCKED_USER || 'locked_out_user',
    password: process.env.PASSWORD || 'secret_sauce',
    role: 'locked',
  },
  problem: {
    username: process.env.PROBLEM_USER || 'problem_user',
    password: process.env.PASSWORD || 'secret_sauce',
    role: 'problem',
  },
  performance: {
    username: 'performance_glitch_user',
    password: process.env.PASSWORD || 'secret_sauce',
    role: 'performance_glitch',
  },
};
