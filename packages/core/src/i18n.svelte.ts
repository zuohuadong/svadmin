// Minimal i18n — simple key-value translation

type Locale = Record<string, string>;

const locales: Record<string, Locale> = {
  'zh-CN': {
    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.create': '新建',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索...',
    'common.confirm': '确定',
    'common.loading': '加载中...',
    'common.noData': '暂无数据',
    'common.actions': '操作',
    'common.total': '共 {total} 条',
    'common.page': '{current} / {total}',
    'common.export': '导出',
    'common.import': '导入',
    'common.clone': '克隆',
    'common.autoSaving': '自动保存中...',
    'common.autoSaved': '已自动保存',
    'common.selectAll': '全选',
    'common.batchDelete': '批量删除 ({count})',
    'common.unsavedChanges': '有未保存的修改，确定离开吗？',
    'common.unsaved': '未保存',
    'common.deleteConfirm': '确定要删除这条记录吗？此操作不可撤销。',
    'common.batchDeleteConfirm': '确定要删除选中的 {count} 条记录吗？此操作不可撤销。',
    'common.confirmAction': '确认操作',
    'common.operationSuccess': '操作成功',
    'common.operationFailed': '操作失败',
    'common.createSuccess': '创建成功',
    'common.updateSuccess': '更新成功',
    'common.deleteSuccess': '删除成功',
    'common.loginFailed': '登录失败',
    'common.home': '首页',
    'common.logout': '退出登录',
    'common.toggleTheme': '切换主题',
    'common.switchLanguage': '切换语言',
    'common.clear': '清除',
    'common.menu': '菜单',
    'common.darkMode': '暗色模式',
    'common.lightMode': '亮色模式',
    'common.detail': '详情',
    'common.loadFailed': '加载失败: {message}',
    'common.pageNotFound': '页面未找到',
    'common.error': '出错了',
    'common.retry': '重试',
    'common.yes': '是',
    'common.no': '否',
    'common.undo': '撤销',
    'common.filter': '筛选',
    'common.reset': '重置',
    'common.welcome': '欢迎使用 {title}',
    'common.dashboardHint': '从侧边栏选择一个资源开始。',
    'common.redirecting': '正在跳转到登录页...',
    'common.expand': '展开',
    'common.collapse': '收起',
    'common.close': '关闭',
    'common.copy': '复制',
    'common.copyAll': '复制全部',
    'common.copied': '已复制',
    'common.next': '下一步',
    'common.back': '返回',
    'common.step': '步骤',
    'common.columns': '列',
    'common.perPage': '每页',
    'common.copyId': '复制 ID',
    'common.showMore': '展开更多',
    'common.showLess': '收起',
    // Field
    'field.enterValue': '输入{label}',
    'field.selectPlaceholder': '请选择',
    'field.tagsPlaceholder': '输入标签后按回车...',
    'field.noOptions': '无可用选项',
    'field.addImage': '添加图片',
    // Config errors
    'config.missingEnvTitle': '环境配置缺失',
    'config.missingEnvDescription': '应用无法启动，因为缺少必要的环境变量。',
    'config.addToEnvFile': '请在 .env 文件中添加以下内容：',
    'config.envFilePath': '文件路径: .env',
    'config.reload': '配置完成后刷新页面',
    'config.reloadButton': '重新加载页面',
    // Auth pages
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.forgotPassword': '忘记密码',
    'auth.resetPassword': '重置密码',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.rememberMe': '记住我',
    'auth.loginButton': '登录',
    'auth.registerButton': '注册',
    'auth.sendResetLink': '发送重置链接',
    'auth.backToLogin': '返回登录',
    'auth.noAccount': '还没有账号？',
    'auth.hasAccount': '已有账号？',
    'auth.forgotPasswordLink': '忘记密码？',
    'auth.forgotPasswordDescription': '输入您的邮箱地址，我们将发送重置密码的链接。',
    'auth.resetLinkSent': '重置链接已发送，请查看您的邮箱。',
    'auth.passwordMismatch': '两次输入的密码不一致',
    'auth.emailRequired': '请输入邮箱',
    'auth.passwordRequired': '请输入密码',
    'auth.registerSuccess': '注册成功',
    'auth.welcomeBack': '欢迎回来',
    'auth.welcomeMessage': '登录以继续使用管理后台',
    'auth.createAccount': '创建账号',
    'auth.createAccountMessage': '填写信息以创建您的账号',
    // AutoSave
    'autoSave.idle': '已保存',
    'autoSave.saving': '保存中...',
    'autoSave.saved': '已保存',
    'autoSave.error': '保存失败',
    // Empty states
    'empty.title': '暂无数据',
    'empty.description': '没有找到符合条件的记录。',
    'empty.noMore': '没有更多了',
    // DevTools
    'devtools.title': '开发者工具 (Ctrl+Shift+D)',
    // Validation
    'validation.required': '此字段为必填项',
    'validation.minLength': '最少 {min} 个字符',
    'validation.maxLength': '最多 {max} 个字符',
    'validation.invalidEmail': '请输入有效的邮箱地址',
    'validation.invalidFormat': '格式不正确',
  },
  'en': {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search...',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.noData': 'No data',
    'common.actions': 'Actions',
    'common.total': 'Total: {total}',
    'common.page': '{current} / {total}',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.clone': 'Clone',
    'common.autoSaving': 'Auto-saving...',
    'common.autoSaved': 'Saved',
    'common.selectAll': 'Select All',
    'common.batchDelete': 'Batch Delete ({count})',
    'common.unsavedChanges': 'You have unsaved changes. Leave anyway?',
    'common.unsaved': 'Unsaved',
    'common.deleteConfirm': 'Are you sure you want to delete this record? This cannot be undone.',
    'common.batchDeleteConfirm': 'Delete {count} selected records? This cannot be undone.',
    'common.confirmAction': 'Confirm Action',
    'common.operationSuccess': 'Operation successful',
    'common.operationFailed': 'Operation failed',
    'common.createSuccess': 'Created successfully',
    'common.updateSuccess': 'Updated successfully',
    'common.deleteSuccess': 'Deleted successfully',
    'common.loginFailed': 'Login failed',
    'common.home': 'Home',
    'common.logout': 'Log out',
    'common.toggleTheme': 'Toggle theme',
    'common.switchLanguage': 'Switch language',
    'common.clear': 'Clear',
    'common.menu': 'Menu',
    'common.darkMode': 'Dark mode',
    'common.lightMode': 'Light mode',
    'common.detail': 'Detail',
    'common.loadFailed': 'Load failed: {message}',
    'common.pageNotFound': 'Page not found',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.undo': 'Undo',
    'common.filter': 'Filter',
    'common.reset': 'Reset',
    'common.welcome': 'Welcome to {title}',
    'common.dashboardHint': 'Select a resource from the sidebar to get started.',
    'common.redirecting': 'Redirecting to login...',
    'common.expand': 'Expand',
    'common.collapse': 'Collapse',
    'common.close': 'Close',
    'common.copy': 'Copy',
    'common.copyAll': 'Copy All',
    'common.copied': 'Copied!',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.step': 'Step',
    'common.columns': 'Columns',
    'common.perPage': 'per page',
    'common.copyId': 'Copy ID',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
    // Field
    'field.enterValue': 'Enter {label}',
    'field.selectPlaceholder': 'Select...',
    'field.tagsPlaceholder': 'Type a tag and press Enter...',
    'field.noOptions': 'No options available',
    'field.addImage': 'Add image',
    // Config errors
    'config.missingEnvTitle': 'Missing Configuration',
    'config.missingEnvDescription': 'The app cannot start because required environment variables are missing.',
    'config.addToEnvFile': 'Add the following to your .env file:',
    'config.envFilePath': 'File path: .env',
    'config.reload': 'Refresh page after configuration',
    'config.reloadButton': 'Reload Page',
    // Auth pages
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgotPassword': 'Forgot Password',
    'auth.resetPassword': 'Reset Password',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.rememberMe': 'Remember me',
    'auth.loginButton': 'Sign In',
    'auth.registerButton': 'Sign Up',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.backToLogin': 'Back to Login',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.forgotPasswordLink': 'Forgot password?',
    'auth.forgotPasswordDescription': 'Enter your email address and we will send you a reset link.',
    'auth.resetLinkSent': 'Reset link sent! Check your email.',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.registerSuccess': 'Registration successful',
    'auth.welcomeBack': 'Welcome Back',
    'auth.welcomeMessage': 'Sign in to continue to admin panel',
    'auth.createAccount': 'Create Account',
    'auth.createAccountMessage': 'Fill in your details to create an account',
    // AutoSave
    'autoSave.idle': 'Saved',
    'autoSave.saving': 'Saving...',
    'autoSave.saved': 'Saved',
    'autoSave.error': 'Save failed',
    // Empty states
    'empty.title': 'No data',
    'empty.description': 'No records found matching your criteria.',
    'empty.noMore': 'No more items',
    // DevTools
    'devtools.title': 'DevTools (Ctrl+Shift+D)',
    // Validation
    'validation.required': 'This field is required',
    'validation.minLength': 'Minimum {min} characters',
    'validation.maxLength': 'Maximum {max} characters',
    'validation.invalidEmail': 'Please enter a valid email address',
    'validation.invalidFormat': 'Invalid format',
  },
};

/** Detect best locale from browser language */
function detectLocale(): string {
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN';
  // Exact match
  if (locales[browserLang]) return browserLang;
  // Prefix match (e.g., 'zh' → 'zh-CN', 'en-US' → 'en')
  const prefix = browserLang.split('-')[0];
  for (const key of Object.keys(locales)) {
    if (key.startsWith(prefix)) return key;
  }
  return 'en';
}

let currentLocale = $state(detectLocale());

export function setLocale(locale: string): void {
  currentLocale = locale;
}

export function getLocale(): string {
  return currentLocale;
}

export function getAvailableLocales(): string[] {
  return Object.keys(locales);
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = locales[currentLocale] ?? locales['en'];
  let text = locale[key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export function addTranslations(locale: string, translations: Record<string, string>): void {
  locales[locale] = { ...locales[locale], ...translations };
}

/**
 * useTranslation — standard i18n hook
 * Returns { translate, getLocale, changeLocale }
 */
export function useTranslation() {
  return {
    translate: t,
    getLocale,
    changeLocale: setLocale,
  };
}
