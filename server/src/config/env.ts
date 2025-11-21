export const getConfig = () => ({
  port: process.env.PORT || '3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cyberdojo',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Comma-separated list of allowed hosts for attack/http executor (e.g. "example.com,api.internal,localhost:3000")
  allowedHosts: process.env.ATTACK_ALLOWLIST ? process.env.ATTACK_ALLOWLIST.split(',').map(s => s.trim()).filter(Boolean) : [],
  // Behavior when a step is blocked by allowlist: 'continue' or 'fail'
  attackBlockBehavior: (process.env.ATTACK_BLOCK_BEHAVIOR as 'continue' | 'fail') || 'continue',
});
