# 技术设计文档（TECH_DESIGN）— 个人展示网站 + 管理后台

> 文档版本：v1.0
> 关联文档：`PRD.md`（产品需求）、`AGENTS.md`（AI 开发规范）

---

## 1. 技术选型

| 领域 | 选型 | 理由 |
| --- | --- | --- |
| 构建工具 | **Vite** | 极快的冷启动与 HMR，现代前端默认选择，配置简单 |
| 框架 | **React 18** | 生态成熟、函数式组件 + Hooks 模型 |
| 语言 | **TypeScript（strict）** | 强类型保障数据结构与 API 契约，利于长期维护 |
| 样式 | **TailwindCSS** | 原子化、与设计 Token 配合好、便于统一风格、无运行时开销 |
| 路由 | **react-router-dom v6** | 声明式路由、嵌套路由、便于做布局与守卫 |
| 图标 | **lucide-react** | 轻量、树摇友好、风格统一（按需使用，不滥造卡片） |
| 动画 | **framer-motion**（可选，克制使用） | 声明式动效、支持 `prefers-reduced-motion`；也可纯 CSS 实现 |
| 字体 | `@fontsource` 自托管 Space Grotesk / Inter | 不依赖第三方 CDN，离线可用 |
| 数据 | **localStorage**（通过统一 API 层） | 零后端、持久化、可平滑迁移 |

**核心设计思想**

1. **内容与呈现分离**：所有内容经统一数据 API 层 `src/api` 读写，UI 组件只消费数据、不关心存储细节。
2. **前后台隔离**：前台与 `/admin` 各自独立布局树，后台受路由守卫保护。
3. **可迁移**：API 层方法统一返回 `Promise`，即便底层是同步的 `localStorage`。未来替换真实后端时，仅改写 `src/api` 内部实现，调用方零改动。
4. **单一数据源**：前台与后台读同一数据源，后台写入后前台刷新即反映（并支持跨标签页同步）。

---

## 2. 依赖清单（package.json 关键项）

```jsonc
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "lucide-react": "^0.4xx",
    "framer-motion": "^11.x", // 可选
    "@fontsource/space-grotesk": "^5.x",
    "@fontsource/inter": "^5.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^9.x"
  }
}
```

> 实际版本以 `npm install` 装出的最新稳定版为准，禁止手填不存在的版本号（见 `AGENTS.md`）。

---

## 3. 项目目录结构

```text
my-portfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                      # 应用入口，挂载 Provider 与 Router
│   ├── App.tsx                       # 顶层路由出口
│   ├── index.css                     # Tailwind 指令 + CSS 变量（设计 Token）+ 基础样式
│   │
│   ├── api/                          # ★ 统一数据 API 层（唯一对外数据接口）
│   │   ├── index.ts                  # 汇总导出 api 对象（profile/projects/resume/auth/db）
│   │   ├── storage.ts                # localStorage 读写封装（命名空间、JSON 序列化、容错）
│   │   ├── seed.ts                   # 默认种子数据（首次访问初始化）
│   │   ├── profile.ts                # 个人信息读写
│   │   ├── projects.ts               # 项目 CRUD
│   │   ├── resume.ts                 # 简历上传/读取/删除（File ↔ DataURL）
│   │   ├── auth.ts                   # 本地会话标记（登录态）
│   │   └── types.ts                  # 数据模型类型定义（Profile/Project/Resume…）
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # 登录态 Context（供路由守卫）
│   │   └── DataContext.tsx           # 前台数据 Context（首屏拉取、跨标签同步）
│   │
│   ├── components/                   # 通用组件
│   │   ├── ui/                       # 原子组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Modal.tsx             # 二次确认
│   │   │   ├── Toast.tsx             # 全局提示
│   │   │   ├── EmptyState.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── StarField.tsx             # 星空背景 Canvas
│   │   └── ImageUploader.tsx         # 头像/封面通用图片上传（压缩 + 预览）
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx          # 前台布局：导航 + StarField + 页脚
│   │   └── AdminLayout.tsx           # 后台布局：侧边导航 + 顶栏
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
│   │   ├── index.tsx                 # 路由表装配
│   │   └── ProtectedRoute.tsx        # 后台路由守卫
│   │
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── useToast.ts
│   │   └── useLocalStorageState.ts   # 可选
│   │
│   └── lib/
│       ├── compressImage.ts          # 图片压缩为 DataURL
│       ├── format.ts                 # 日期/文件大小格式化
│       └── validate.ts               # 表单校验工具
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

---

## 4. 数据模型与类型定义（`src/api/types.ts`）

```ts
export interface SocialLink {
  id: string;
  platform: string;   // 如 "GitHub" / "LinkedIn" / "博客"
  url: string;
}

export interface Profile {
  name: string;
  title: string;        // 一句话定位/职位
  bio: string;          // 自我介绍，允许换行
  avatar: string | null; // Base64 Data URL；null 表示使用默认
  location: string;
  email: string;
  skills: string[];     // 技能标签
  socials: SocialLink[];
  availability: string; // 如 "可接受合作"
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

/** 新建项目时的入参（id/时间由 API 生成） */
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export interface Resume {
  fileName: string;
  mimeType: string;
  size: number;         // 字节
  dataUrl: string;      // Base64 Data URL
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

---

## 5. 存储层（`src/api/storage.ts`）

职责：唯一接触 `localStorage` 的地方。对外提供带命名空间、带容错、可选的类型化读写。

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
};
```

**存储键规划**

| 键（含命名空间） | 内容 |
| --- | --- |
| `portfolio:v1:profile` | `Profile` |
| `portfolio:v1:projects` | `Project[]` |
| `portfolio:v1:resume` | `Resume \| null` |
| `portfolio:v1:auth` | 会话标记（如 `{ loggedIn: true, at: ISO }`） |

**初始化（`seed.ts`）**：首次访问时若 `has("profile")` 为假，则用种子数据填充 `profile`、`projects`（示例项目）与 `resume`（null），保证站点首屏不为空且演示完整。种子数据中的头像/封面可为 null（前端展示默认图形）。

---

## 6. 统一数据 API 层（`src/api/index.ts`）★

**这是本项目的核心契约。** 全部 UI 只通过 `api.*` 读写数据，绝不直接接触 `localStorage`。所有方法返回 `Promise`（即便底层同步），以便未来无痛替换为真实后端。

### 6.1 对外接口形态

```ts
import type { Profile, Project, ProjectInput, Resume, Database } from "./types";

export interface Api {
  profile: {
    get(): Promise<Profile>;
    update(patch: Partial<Profile>): Promise<Profile>;
    updateAvatar(dataUrl: string | null): Promise<Profile>;
  };
  projects: {
    list(): Promise<Project[]>;                 // 已按 order 排序
    get(id: string): Promise<Project | null>;
    create(input: ProjectInput): Promise<Project>;
    update(id: string, patch: Partial<ProjectInput>): Promise<Project>;
    remove(id: string): Promise<void>;
    reorder(orderedIds: string[]): Promise<Project[]>;
    featured(): Promise<Project[]>;             // 精选项目
  };
  resume: {
    get(): Promise<Resume | null>;
    upload(file: File): Promise<Resume>;        // 内部转为 DataURL 存储
    remove(): Promise<void>;
  };
  auth: {
    login(password: string): Promise<boolean>;
    logout(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
  };
  db: {
    export(): Promise<string>;                  // 返回 JSON 字符串
    import(json: string): Promise<void>;        // 校验后整体覆盖
    reset(): Promise<void>;                     // 恢复种子数据
  };
}

export const api: Api = { /* 各域实现 */ };
```

### 6.2 实现要点（示例片段）

```ts
// src/api/projects.ts
import { storage } from "./storage";
import { seedProjects } from "./seed";
import type { Project, ProjectInput } from "./types";

const KEY = "projects";
const readAll = (): Project[] =>
  storage.get<Project[]>(KEY, seedProjects).sort((a, b) => a.order - b.order);

export const projectsApi = {
  async list() {
    return readAll();
  },
  async get(id: string) {
    return readAll().find((p) => p.id === id) ?? null;
  },
  async create(input: ProjectInput): Promise<Project> {
    const all = readAll();
    const now = new Date().toISOString();
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      order: input.order ?? all.length,
      createdAt: now,
      updatedAt: now,
    };
    storage.set(KEY, [...all, project]);
    return project;
  },
  async update(id: string, patch: Partial<ProjectInput>): Promise<Project> {
    const all = readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("项目不存在");
    const updated: Project = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    storage.set(KEY, all);
    return updated;
  },
  async remove(id: string) {
    storage.set(KEY, readAll().filter((p) => p.id !== id));
  },
  async reorder(orderedIds: string[]) {
    const map = new Map(readAll().map((p) => [p.id, p]));
    const next = orderedIds
      .map((id, i) => {
        const p = map.get(id);
        return p ? { ...p, order: i } : null;
      })
      .filter(Boolean) as Project[];
    storage.set(KEY, next);
    return next;
  },
  async featured() {
    return readAll().filter((p) => p.featured);
  },
};
```

其余域（profile / resume / auth / db）同构实现；`resume.upload` 使用 `FileReader.readAsDataURL`；`db.import` 先 `JSON.parse` + 结构校验再整体写入。

### 6.3 为什么用 Promise + 统一 API

- **迁移零成本**：真实后端接入时，把上述函数体替换成 `fetch(...)` 即可，`await api.projects.list()` 调用方完全不变。
- **一致的异步心智**：UI 始终按异步处理（含 loading/错误态）。
- **唯一入口**：便于集中做校验、错误处理、日志、埋点。

---

## 7. 状态管理

不引入 Redux 等重型库（见 `AGENTS.md` 禁止项），采用 **Context + Hooks**：

- **AuthContext**：持有登录态，提供 `login/logout/isAuthenticated`，初始化时从 `api.auth` 读取。供 `ProtectedRoute` 消费。
- **DataContext**（前台）：首屏 `Promise.all([api.profile.get(), api.projects.list(), ...])` 拉取数据，向下提供；监听 `window` 的 `storage` 事件，其他标签页改动时重新拉取，实现跨页同步。
- 后台页面直接调用 `api.*`（写操作后可用本地 state 刷新列表），无需全局 store。

---

## 8. 路由设计（前台与 `/admin` 隔离）

### 8.1 路由表

```tsx
// src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,               // 前台布局（含 StarField/导航/页脚）
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "resume", element: <ResumePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "/admin/login", element: <LoginPage /> },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>, // 守卫 + 后台布局
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfileEditPage /> },
      { path: "projects", element: <ProjectsManagePage /> },
      { path: "resume", element: <ResumeManagePage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
```

### 8.2 隔离原则

- **布局隔离**：前台 `PublicLayout`（海报感、星空）与后台 `AdminLayout`（工具感、侧边栏）互不嵌套。
- **鉴权隔离**：`/admin` 及其子路由统一由 `ProtectedRoute` 包裹；`/admin/login` 独立于守卫之外。
- **代码分割**：后台页面用 `React.lazy` + `Suspense` 懒加载，避免后台代码进入前台首包。
- **视觉隔离**：前台不暴露管理入口（可选的隐蔽页脚入口由配置控制）。

---

## 9. 路由守卫（`src/routes/ProtectedRoute.tsx`）

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoader />;          // 等待登录态初始化
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

要求：

- 未登录访问任意 `/admin/*` → 重定向到 `/admin/login`，并记录来源以便登录后跳回。
- 已登录访问 `/admin/login` → 重定向到 `/admin`。
- 登录态初始化期间显示加载，避免"闪烁后跳转"。
- 退出登录后立即失效并跳回登录页。

---

## 10. 主题与样式系统

### 10.1 Tailwind 配置（`tailwind.config.ts`）要点

```ts
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#070912",
        "ground-2": "#0C101C",
        "ground-3": "#121828",
        ink: "#EEF1F6",
        "ink-muted": "#8B95A7",
        "ink-faint": "#5A6478",
        line: "rgba(255,255,255,0.08)",
        accent: "#F2C879",
        "accent-dim": "#C9A25E",
        star: "#CFE0FF",
        danger: "#E5484D",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      maxWidth: { content: "1200px" },
      letterSpacing: { tightest: "-0.045em" },
    },
  },
} satisfies Config;
```

字体经 `@fontsource/*` 自托管，在 `main.tsx` 按需引入权重（Space Grotesk 400–700、Inter 400–600、JetBrains Mono 400/500）。

### 10.2 CSS 变量（`index.css`）

设计 Token 以 CSS 变量集中定义（色板见 PRD 7.2），Tailwind 引用同一套色值，组件优先用语义化类名或变量，避免散落魔法值。

### 10.3 星空背景（`StarField.tsx`）

- `position: fixed; inset: 0; z-index: -1; pointer-events: none;`。
- Canvas 2D 绘制，星数随视口自适应（上限约 200），逐帧亮度呼吸 + 滚动视差。
- `IntersectionObserver`/`visibilitychange` 在不可见时暂停 `requestAnimationFrame`。
- `matchMedia("(prefers-reduced-motion: reduce)")` 命中时静态渲染。

---

## 11. 图像与文件处理

- **图片上传**（头像 / 项目封面）：`ImageUploader` 读取 `File` → `compressImage()`（Canvas 缩放、控制边长与质量）→ 输出 Data URL → 存入对应字段。限制类型（png/jpg/webp）与原始大小（≤ 2MB）。
- **简历上传**：`FileReader.readAsDataURL` 转 Base64 存入 `Resume.dataUrl`；限制 PDF（可放宽 doc/docx）、≤ 5MB。
- **容量管理**：所有 Data URL 共享 `localStorage` 配额（约 5MB），设置页展示占用并提供导入导出/重置以清理。
- **下载**：简历下载用 `<a href={dataUrl} download={fileName}>` 触发。

---

## 12. 错误处理与反馈

- 统一 `Toast`（成功 / 错误 / 提示），挂在根级 Provider。
- API 层抛出的错误（如"项目不存在"）在调用处 `try/catch` 并 Toast。
- 表单：字段级校验（`lib/validate.ts`）+ 提交态（禁用按钮、loading）。
- 路由级：`NotFoundPage`、`ProjectDetailPage` 的"项目不存在"兜底。

---

## 13. 数据种子与版本迁移

- `seed.ts` 提供首访默认数据（示例项目 2–3 个、默认 Profile、`resume: null`）。
- `Database.version` 字段预留：读取时若版本低于当前，执行迁移函数（未来用），避免数据结构演进导致白屏。
- `storage.get` 解析失败回退默认值，保证鲁棒性。

---

## 14. 迁移到真实后端的路径（设计保障）

| 步骤 | 操作 |
| --- | --- |
| 1 | 保留 `src/api/types.ts` 与 `src/api/index.ts` 的**接口签名不变** |
| 2 | 将 `profile.ts / projects.ts / resume.ts` 内部实现改为 `fetch` 调用真实接口 |
| 3 | 前端调用方（页面/Context）**零改动** |
| 4 | `auth` 改为真实登录（JWT/Cookie），守卫逻辑不变 |
| 5 | 上传改为 multipart 上传，返回 URL 替代 Data URL |

因为所有调用已经是 `Promise`，迁移对 UI 完全透明。

---

## 15. 构建与部署

- 开发：`npm run dev`。
- 类型检查：`npx tsc --noEmit`。
- 构建：`npm run build`（产物在 `dist/`）。
- 预览：`npm run preview`。
- 部署：静态托管（Vercel / Netlify / GitHub Pages 等）。若部署到子路径，需配置 Vite `base`；SPA 需配置 history 回落（`/index.html`）以支持 `/admin` 等深链刷新。

---

## 16. 当前实现进度

**已完成（可 `npm run dev` / `npm run build` 运行，`tsc --noEmit` 通过）**

- 工程脚手架：Vite + React 18 + TS(strict) + Tailwind v3，路径别名 `@ → src`，字体自托管。
- 设计系统：`tailwind.config.ts` 色板、`index.css` CSS 变量与 `.display-xl/l/m` 流体字号、星空/星图组件。
- 数据层：`src/api`（`types / storage / seed / index`）完整实现 profile / projects / resume / auth / db，统一返回 `Promise`；`import.meta.env.VITE_ADMIN_PASSWORD` 提供默认口令。
- 前台：`PublicLayout` + 首页 / 关于 / 项目 / 项目详情 / 简历 / 404，数据经 `DataContext` 读取，含空/错/加载态、响应式与减少动效支持。

**待实现（下一步）**

- 后台 `/admin`：`AuthContext` + `ProtectedRoute` 守卫、登录页、仪表盘、个人资料（含头像压缩上传）、项目管理（增删改/排序/精选）、简历上传、设置（导入/导出/重置）。
- 跨标签页同步已就绪（`DataContext` 监听 `storage` 事件）。
