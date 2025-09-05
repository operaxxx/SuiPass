module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // CI配置
        'build', // 构建相关
        'revert', // 回滚
        'wip', // 进行中的工作
        'security', // 安全相关
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: '选择你要提交的更改类型:',
        enum: {
          feat: {
            description: '新功能',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'Bug修复',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: '文档更新',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: '代码格式（不影响代码运行的变动）',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: '重构（既不是新增功能，也不是修改bug的代码变动）',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: '性能优化',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: '增加测试',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: '构建相关',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'CI配置',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: '构建过程或辅助工具的变动',
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: '回滚',
            title: 'Reverts',
            emoji: '🗑',
          },
          security: {
            description: '安全相关',
            title: 'Security',
            emoji: '🔒',
          },
        },
      },
      scope: {
        description: '此更改的范围是什么（例如组件或文件名）:',
      },
      subject: {
        description: '写一个简短的变更描述:',
      },
      body: {
        description: '提供更详细的变更描述:',
      },
      isBreaking: {
        description: '是否有破坏性更改?',
      },
      breakingBody: {
        description: '破坏性变更的详细描述:',
      },
      breaking: {
        description: '描述破坏性变更:',
      },
      isIssueAffected: {
        description: '此变更是否影响任何开放的issue?',
      },
      issuesBody: {
        description: '如果issues被关闭，提交需要一个body。请输入更长的变更描述:',
      },
      issues: {
        description: '添加issue引用 (例如 "fix #123", "re #123".):',
      },
    },
  },
};
