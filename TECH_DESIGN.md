# 技术设计文档（TECH_DESIGN）— 个人展示网站 + 管理后台

> 文档版本：v1.1（与当前代码同步）
> 关联文档：`PRD.md`（产品需求）、`AGENTS.md`（AI 开发规范）

---

## 1. 技术选型

| 领域 | 选型 | 理由 |
| --- | --- | --- |
| 构建工具 | **Vite 5** | 极快的冷启动与 HMR，配置简单 |
| 框架 | **React 18.3** | 函数式组件 + Hooks |
| 语言 | **TypeScript（strict）** | 强类型保障数据结构与 API 契约 |
| 样式 | **TailwindCSS 3.4** | 原子化、与设计 Token 配合、无运行时开销 |
| 路由 | **react-router-dom v6** | 声明式路由、嵌套路由、便于布局与守卫 |
| 图标 | **内联 SVG 组件**（如 `ArrowIcon`） | 不引入图标库；按需手绘、可控、零额外依赖 |
| 动画 | **纯 CSS + IntersectionObserver + requestAnimationFrame** | 不引入 framer-motion；轻量、尊重 `prefers-reduced-motion` |
| 字体 | `@fontsource` 自托管 Space Grotesk / Inter / JetBrains Mono | 不依赖第三方 CDN，离线可用 |
| 数据 | **localStorage**（通过统一 API 层） | 零后端、持久化、可平滑迁移 |

> 说明：实际项目**没有**使用 `lucide-react`、`framer-motion`、`eslint`。图标为自定义 SVG 组件，动画为 CSS 过渡 + 观察器实现，类型检查用 `tsc --noEmit`。

**核心设计思想**

1. **内容与呈现分离**：所有内容经统一数据 API 层 `src/api` 读写，UI 组件只消费数据。
2. **前后台隔离**：前台与 `/admin` 各自独立布局树，后台受路由守卫保护、页面懒加载。
3. **可迁移**：API 层方法统一返回 `Promise`，未来替换真实后端只改 `src/api` 内部实现。
4. **单一数据源**：前台与后台读同一数据源，写入后前台刷新即反映，并监听 `storage` 事件跨标签页同步。

---

## 2. 依赖清单（`package.json` 实际内容）

```jsonc
{
  "dependencies": {
    "@fontsource/inter": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "@fontsource/space-grotesk": "^5.0.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

**脚本**：`dev`（vite）、`build`（`tsc --noEmit && vite build`）、`preview`、`typecheck`（`tsc --noEmit`）。

> 禁止手填不存在的版本号；新增依赖须先说明并遵守 `AGENTS.md` 第 8 节（见其禁止项）。

---

## 3. 项目目录结构（当前实际）

```text
my-portfolio/
├── public/
│   ├── favicon.svg
│   └── resume.docx                  # 默认简历（静态文件，由 seedResume 以 URL 引用）
├── src/
│   ├── main.tsx                     # 入口：自托管字体引入 + 挂载 <App/>
│   ├── App.tsx                      # 顶层：BrowserRouter + Providers + 路由表（含懒加载后台）
│   ├── index.css                    # Tailwind 指令 + 设计 Token(CSS 变量) + .display-* / reveal 样式
│   ├── vite-env.d.ts
│   │
│   ├── api/                         # ★ 统一数据 API 层（唯一对外数据接口）
│   │   ├── index.ts                 # 汇总导出 api 对象（profile/projects/resume/auth/db 全在此实现）
│   │   ├── storage.ts               # localStorage 读写封装（命名空间、JSON、容错、clearAll）
│   │   ├── seed.ts                  # 默认种子数据（seedProfile / seedProjects / seedResume）
│   │   └── types.ts                 # 数据模型类型（Profile/Project/Resume/Database…）
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # 登录态（login/logout/isAuthenticated），供 ProtectedRoute
│   │   └── DataContext.tsx          # 前台数据（profile/projects/resume + reload + storage 同步）
│   │
│   ├── components/
│   │   ├── StarField.tsx            # Canvas 星空背景（rAF、可见性暂停、减少动效静态化）
│   │   ├── CelestialChart.tsx       # Hero 右侧 SVG 观测星图
│   │   ├── ScrollReveal.tsx         # 全局滚动揭示（IntersectionObserver + MutationObserver）
│   │   ├── ProjectRow.tsx           # 项目索引行（列表用）
│   │   ├── ImageUploader.tsx        # 头像/封面通用图片上传（压缩 + 预览）
│   │   └── ui/                       # 原子组件
│   │       ├── Button.tsx            # primary / ghost / link 变体（导出 buttonClass）
│   │       ├── Field.tsx            # 表单字段（标签 + 输入/textarea 包装）
│   │       ├── Modal.tsx            # 二次确认弹窗
│   │       ├── Toast.tsx            # 全局提示（含 ToastProvider）
│   │       ├── PageLoader.tsx       # 页面/加载态
│   │       ├── SectionLabel.tsx     # § 编号 + 标题标签
│   │       ├── Tag.tsx              # 技术栈标签
│   │       ├── Avatar.tsx           # 头像（无图时生成星环单字）
│   │       ├── ArrowIcon.tsx        # 箭头 SVG
│   │       ├── CountUp.tsx          # 数字滚动（进入视口递增，减少动效直接显示）
│   │       └── MaskText.tsx         # 文字遮罩升起（大标题揭示）
│   │
│   ├── hooks/
│   │   ├── useInView.ts             # 元素进入视口检测
│   │   └── usePrefersReducedMotion.ts # 是否偏好减少动效
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx         # 前台：StarField + 顶栏(等宽导航) + 移动菜单 + 页脚
│   │   └── AdminLayout.tsx          # 后台：侧边导航 + 顶栏
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   ├── ResumePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ProfileEditPage.tsx
│   │       ├── ProjectsManagePage.tsx
│   │       ├── ResumeManagePage.tsx
│   │       └── SettingsPage.tsx
│   │
│   ├── routes/
│   │   └── ProtectedRoute.tsx       # 后台路由守卫（路由表本身在 App.tsx）
│   │
│   └── lib/
│       ├── cn.ts                    # className 合并
│       ├── format.ts                # formatDate / formatYear / formatBytes / initials
│       └── compressImage.ts         # 图片压缩为 DataURL
│
├── index.html
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
├── PRD.md
├── TECH_DESIGN.md
└── AGENTS.md
```

> 注意：API 层采用**单一 `index.ts` 聚合实现**（`profile / projects / resume / auth / db` 五个域都在其中），**没有** `api/profile.ts`、`api/projects.ts`、`api/resume.ts`、`api/auth.ts` 等拆分文件；路由表写在 `App.tsx` 内，**没有** `routes/index.tsx`。

---

## 4. 数据模型与类型定义（`src/api/types.ts`）

```ts
export interface SocialLink {
  id: string;
  platform: string;   // 如 "GitHub"
  url: string;
}

export interface Profile {
  name: string;
  title: string;        // 一句话定位/职位
  bio: string;          // 自我介绍，允许换行
  avatar: string | null; // Base64 Data URL；null 表示使用默认星环
  location: string;
  email: string;
  skills: string[];     // 技能标签
  socials: SocialLink[];
  availability: string; // 如 "可接受有限合作"
  updatedAt: string;    // ISO 时间
}

export interface Project {
  id: string;
  title: string;
  summary: string;      // 列表摘要
  detail: string;       // 详情正文（支持换行）
  cover: string | null; // Base64 Data URL 或外链
  tags: string[];       // 技术栈
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;        // 排序权重，越小越靠前
  createdAt: string;
  updatedAt: string;
}

/** 新建项目的入参（id/时间由 API 生成） */
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export interface Resume {
  fileName: string;
  mimeType: string;
  size: number;         // 字节；0 表示不显示体积（如静态文件引用）
  dataUrl: string;      // Base64 Data URL 或静态文件 URL（如 "/resume.docx"）
  uploadedAt: string;   // ISO 时间
}

/** 导出/导入的完整数据快照 */
export interface Database {
  version: number;      // 数据结构版本号，便于未来迁移
  profile: Profile;
  projects: Project[];
  resume: Resume | null;
}
```

> 关键点：`Resume.dataUrl` 既可以是**上传文件转成的 Base64 Data URL**，也可以是**指向 `public/` 下静态文件的 URL**（当前默认简历即走后者，见第 5、11 节）。

---

## 5. 存储层（`src/api/storage.ts`）

职责：唯一接触 `localStorage` 的地方。对外提供带命名空间、带容错、类型化的读写。

```ts
const NS = "portfolio:v1:";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback; // 解析失败不崩溃，回退默认值
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(NS + key, JSON.stringify(value));
  },
  remove(key: string): void {
    localStorage.removeItem(NS + key);
  },
  has(key: string): boolean {
    return localStorage.getItem(NS + key) !== null;
  },
  keys(): string[] {
    return ["profile", "projects", "resume", "auth"];
  },
  clearAll(): void {
    for (const key of storage.keys()) storage.remove(key);
  },
};
```

**存储键规划**

| 键（含命名空间） | 内容 |
| --- | --- |
| `portfolio:v1:profile` | `Profile` |
| `portfolio:v1:projects` | `Project[]` |
| `portfolio:v1:resume` | `Resume \| null` |
| `portfolio:v1:auth` | 会话标记（`{ loggedIn: true, at: ISO }`） |

**初始化（`seed.ts` + `index.ts` 的 `ensureSeed`）**：模块加载时若某键不存在则用种子填充
—— `profile` ← `seedProfile`、`projects` ← `seedProjects`、`resume` ← `seedResume`。
因此**首次访问即带一条示例项目与一份默认简历**（指向 `public/resume.docx`），首屏不为空。

---

## 6. 统一数据 API 层（`src/api/index.ts`）★

**这是本项目的核心契约。** 全部 UI 只通过 `api.*` 读写，绝不直接接触 `localStorage`。所有方法返回 `Promise`（即便底层同步），以便未来替换为真实后端。

### 6.1 对外接口形态

```ts
export const api = {
  profile: {
    get(): Promise<Profile>;
    update(patch: Partial<Profile>): Promise<Profile>;
    updateAvatar(dataUrl: string | null): Promise<Profile>;
  };
  projects: {
    list(): Promise<Project[]>;                 // 已按 order 排序
    get(id: string): Promise<Project | null>;
    featured(): Promise<Project[]>;             // 精选项目
    create(input: ProjectInput): Promise<Project>;
    update(id: string, patch: Partial<ProjectInput>): Promise<Project>;
    remove(id: string): Promise<void>;
    reorder(orderedIds: string[]): Promise<Project[]>;
  };
  resume: {
    get(): Promise<Resume | null>;
    upload(file: File): Promise<Resume>;        // 内部 FileReader 转 DataURL
    remove(): Promise<void>;
  };
  auth: {
    login(password: string): Promise<boolean>;
    logout(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
  };
  db: {
    export(): Promise<string>;                  // JSON 字符串
    import(json: string): Promise<void>;        // 结构校验后整体覆盖
    reset(): Promise<void>;                     // 恢复种子数据（含 seedResume）
  };
};
```

### 6.2 实现要点

- 项目管理以 `order` 升序排序（`readAll().sort((a,b)=>a.order-b.order)`），`create` 默认 `order = all.length`，`reorder` 按传入顺序重写 `order`。
- `resume.upload` 用 `FileReader.readAsDataURL` 将文件转为 DataURL 存入 `dataUrl`；`remove` 置空。
- `db.import`：`JSON.parse` 后校验 `profile` 存在且 `projects` 为数组，再整体写入；`db.reset` 用 `seedProfile / seedProjects / seedResume` 覆盖（**注意：reset 会把简历也恢复为默认 `seedResume`**）。
- 口令：`import.meta.env.VITE_ADMIN_PASSWORD ?? "admin"`。

### 6.3 为什么用 Promise + 统一 API

- **迁移零成本**：接入真实后端时把函数体换成 `fetch(...)`，`await api.projects.list()` 调用方不变。
- **一致的异步心智**：UI 始终按异步处理（含 loading/错误态）。
- **唯一入口**：集中做校验、错误处理、日志。

---

## 7. 状态管理

不引入 Redux 等重型库（见 `AGENTS.md` 禁止项），采用 **Context + Hooks**：

- **AuthProvider / `useAuth()`**：持有 `isAuthenticated`、`loading`、`login`、`logout`；初始化时调 `api.auth.isAuthenticated()`。供 `ProtectedRoute` 消费。
- **DataProvider / `useData()`**：首屏 `Promise.all([api.profile.get(), api.projects.list(), api.resume.get()])` 拉取，暴露 `profile / projects / resume / loading / reload`；监听 `window` 的 `storage` 事件（键前缀 `portfolio:v1:`）实现**跨标签页同步**。
- 后台页面直接调用 `api.*`，写操作后本地刷新列表。

**Provider 嵌套顺序（`App.tsx`）**：`BrowserRouter → ToastProvider → AuthProvider → DataProvider → 路由`。

---

## 8. 路由设计（前台与 `/admin` 隔离）

路由表直接写在 `src/App.tsx`（`BrowserRouter` + `Routes`），不使用 `createBrowserRouter`。

```tsx
<BrowserRouter>
  <ToastProvider><AuthProvider><DataProvider>
    <ScrollReveal />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />   {/* 懒加载，不守卫 */}

        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfileEditPage />} />
          <Route path="projects" element={<ProjectsManagePage />} />
          <Route path="resume" element={<ResumeManagePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  </DataProvider></AuthProvider></ToastProvider>
</BrowserRouter>
```

### 隔离原则

- **布局隔离**：`PublicLayout`（星空海报感）与 `AdminLayout`（工具感侧边栏）互不嵌套。
- **鉴权隔离**：`/admin` 及子路由统一由 `ProtectedRoute` 包裹；`/admin/login` 独立于守卫之外。
- **代码分割**：所有后台页面用 `React.lazy` + 顶层 `Suspense` 懒加载，不进入前台首包。
- **视觉隔离**：前台不暴露管理入口。

---

## 9. 路由守卫（`src/routes/ProtectedRoute.tsx`）

- 未登录访问任意 `/admin/*` → `Navigate` 到 `/admin/login` 并携带 `state.from`。
- 登录态初始化（`loading`）期间显示加载，避免"闪烁后跳转"。
- 已登录访问 `/admin/login` 的处理在登录页内完成（重定向到 `/admin`）。
- 退出登录立即失效并跳回登录页。

---

## 10. 主题与样式系统

### 10.1 Tailwind（`tailwind.config.ts`）

```ts
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#070912", "ground-2": "#0C101C", "ground-3": "#121828",
        ink: "#EEF1F6", "ink-muted": "#8B95A7", "ink-faint": "#5A6478",
        line: "rgba(255,255,255,0.08)",
        accent: "#F2C879", "accent-dim": "#C9A25E", star: "#CFE0FF", danger: "#E5484D",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: { content: "1200px" },
      letterSpacing: { tightest: "-0.045em" },
    },
  },
  plugins: [],
} satisfies Config;
```

字体经 `@fontsource/*` 在 `main.tsx` 按需引入（Space Grotesk 400–700、Inter 400–600、JetBrains Mono 400/500）。

### 10.2 CSS 变量与流体字号（`index.css`）

设计 Token 以 CSS 变量集中定义；含流体标题类 `.display-xl / .display-l / .display-m` 及滚动揭示相关 `.reveal` / `.is-visible` 过渡样式。组件优先使用 Tailwind 语义色或 CSS 变量，避免散落魔法值。

### 10.3 星空与星图

- `StarField.tsx`：`position: fixed; inset: 0; z-index: -1; pointer-events: none;`，Canvas 2D 绘制，星数随视口自适应，逐帧亮度呼吸 + 滚动视差；`visibilitychange` 不可见时暂停 `requestAnimationFrame`；命中 `prefers-reduced-motion: reduce` 时静态渲染。
- `CelestialChart.tsx`：Hero 右侧 SVG「观测星图」（刻度框、同心圆、放射刻度、星座连线、编号星点、坐标标注、中心暖金星）。

---

## 11. 图像与文件处理

- **图片上传**（头像 / 项目封面）：`ImageUploader` 读取 `File` → `compressImage()`（Canvas 缩放控制边长与质量）→ Data URL → 存入对应字段。
- **简历上传**：`FileReader.readAsDataURL` 转 Base64 存入 `Resume.dataUrl`；限制类型与大小。
- **默认简历（静态文件）**：`seedResume.dataUrl` 指向 `public/resume.docx`（URL，而非内联 Base64）。
  - **为什么不用内联 Base64**：超大 Base64 字符串在源码/编辑器/复制粘贴中极易被破坏，一旦字节损坏（长度不符、zip 中央目录错乱）文件即打不开。改为静态文件由浏览器直接提供原始字节最稳定。
  - **替换方式**：用相同文件名覆盖 `public/resume.docx`（全局立即生效）；或在后台「简历」重新上传（写入 `localStorage`，仅当前浏览器）。传 **PDF** 可获得前台内嵌预览。
- **容量管理**：上传的 Data URL 共享 `localStorage`（约 5MB）配额；设置页展示占用并提供导入导出/重置以清理。静态文件不计入配额。
- **下载**：`<a href={dataUrl} download={fileName}>`；`dataUrl` 为静态 URL 时同样可下载。

---

## 12. 错误处理与反馈

- 统一 `Toast`（成功 / 错误 / 提示），由 `ToastProvider` 挂在根级。
- API 抛错（如"项目不存在"）在调用处 `try/catch` 并 Toast。
- 表单：受控组件 + 提交态（禁用按钮、loading）。
- 路由级：`NotFoundPage`、`ProjectDetailPage` 的"项目不存在"兜底。

---

## 13. 数据种子与版本迁移

- `seed.ts` 提供首访默认数据：`seedProfile`（当前为「范梦菡」）、`seedProjects`（当前 **1 个**示例项目「每日一语插件」）、`seedResume`（指向 `public/resume.docx`）。
- `Database.version` 字段预留，便于未来迁移。
- `storage.get` 解析失败回退默认值，保证鲁棒性。

---

## 14. 迁移到真实后端的路径（设计保障）

| 步骤 | 操作 |
| --- | --- |
| 1 | 保留 `src/api/types.ts` 与 `src/api/index.ts` 的**接口签名不变** |
| 2 | 将 `index.ts` 各域内部实现改为 `fetch` 调用真实接口 |
| 3 | 前端调用方（页面 / Context）**零改动** |
| 4 | `auth` 改为真实登录（JWT/Cookie），守卫逻辑不变 |
| 5 | 上传改为 multipart 上传，返回 URL 替代 Data URL |

因为所有调用已是 `Promise`，迁移对 UI 完全透明。

---

## 15. 构建与部署

- 开发：`npm run dev`。
- 类型检查：`npm run typecheck`（等价 `npx tsc --noEmit`）。
- 构建：`npm run build`（`tsc --noEmit && vite build`，产物在 `dist/`）。
- 预览：`npm run preview`。
- 部署：静态托管（Vercel / Netlify / GitHub Pages 等）。子路径部署需配置 Vite `base`（并相应把 `seedResume.dataUrl` 改成带 base 的路径）；SPA 需配置 history 回落以支持 `/admin` 等深链刷新。

---

## 16. 当前实现进度

**已全部完成**（可 `npm run dev` / `npm run build`，`npm run typecheck` 通过）

- 工程脚手架：Vite + React 18 + TS(strict) + Tailwind v3，路径别名 `@ → src`，字体自托管。
- 设计系统：`tailwind.config.ts` 色板、`index.css` CSS 变量与 `.display-*` 流体字号、`StarField` / `CelestialChart`。
- 动效体系：`ScrollReveal`（全局滚动揭示）、`MaskText`（标题遮罩升起）、`CountUp`（数字滚动）、`useInView` / `usePrefersReducedMotion`，全程尊重减少动效偏好。
- 数据层：`src/api`（`types / storage / seed / index`）完整实现 profile / projects / resume / auth / db，统一返回 `Promise`；`VITE_ADMIN_PASSWORD` 提供默认口令；简历默认走静态文件。
- 前台：`PublicLayout` + 首页 / 关于 / 项目 / 项目详情 / 简历 / 404，数据经 `DataContext` 读取，含空 / 错 / 加载态、响应式与减少动效。
- 后台：`AuthContext` + `ProtectedRoute` 守卫、登录页、仪表盘、个人资料（含头像压缩上传）、项目管理（增删改 / 排序 / 精选）、简历上传、设置（导入 / 导出 / 重置），全部懒加载。
- 同步：`DataContext` 监听 `storage` 事件，跨标签页改动自动刷新。
