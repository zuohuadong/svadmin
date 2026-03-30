export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 禁止空 scope — 强制每个 commit 标明影响范围
    'scope-empty': [2, 'never'],
    // 标题最长 100 字符（monorepo scope 较长，放宽到 100）
    'header-max-length': [2, 'always', 100],
    // body 每行最长 200 字符（允许放链接和迁移说明）
    'body-max-line-length': [1, 'always', 200],
    // 允许的 type 白名单
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build', 'revert'],
    ],
  },
};
