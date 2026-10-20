# AGENTS.md — AI 开发规范

> 本文件约束所有参与本项目的 AI/人类开发者。**动手前先读本文件**，并遵守 `PRD.md` 与 `TECH_DESIGN.md`。
> 若本文件与临时指令冲突，以本文件与两份设计文档为准；有疑问先说明再执行。

---

## 1. 项目速览

- **是什么**：深色星空风格的个人展示网站 + `/admin` 管理后台。
- **核心机制**：前台/后台经统一数据 API 层 `src/api` 读写 `localStorage` 模拟数据库，**网页内修改即持久化，刷新不丢**。
- **技术栈（固定，不得替换）**：React 18 + TypeScript（strict）+ Vite + TailwindCSS + react-router-dom v6。

---

## 2. 铁律（违反即视为缺陷）

1. **数据只走 `src/api`**：任何组件/页面**禁止直接调用 `localStorage`**、禁止直接用 `JSON.parse(localStorage...)`。读写一律通过 `api.*`。
2. **API 契约不变**：`src/api/types.ts` 与 `src/api/index.ts` 的对外签名是前后端迁移的保障，改字段须同步更新文档并说明。
3. **前后台隔离**：`/admin/*` 必须被 `ProtectedRoute` 包裹；前台不得依赖后台代码（后台页面用 `React.lazy` 懒加载）。
4. **类型安全**：全程 TypeScript strict，**禁止 `any`**（确需时用 `unknown` + 类型收窄，并注释原因）。提交前 `npx tsc --noEmit` 必须通过。
5. **禁止使用被禁库**（见 §8）。
6. **持久化必须可验证**：任何"保存"功能完成后，刷新页面数据仍在，才算完成。
7. **不得留下死代码 / 未使用导入 / 空函数**。

---

## 3. 代码风格

### 3.1 通用

- **函数式组件 + Hooks**，禁止 class 组件（错误边界等极少数场景除外）。
- 每个组件单一职责，文件聚焦；超过约 200 行考虑拆分。
- 使用**命名导出**（`export function Xxx`），页面组件可用默认导出；全项目保持一致。
- 优先 `const`、纯函数、早返回，减少嵌套。
- **不写解释"做了什么"的废话注释**；只对非显然的意图、权衡、约束写注释。
- 项目未配置 ESLint/Prettier；统一使用双引号、语句以分号结尾、2 空格缩进，并与既有代码保持一致。

### 3.2 TypeScript

- 接口/类型放 `src/api/types.ts`（数据模型）或就近定义（仅组件内部使用的 props 类型可就近）。
- Props 显式声明类型；避免 `React.FC`（直接标注参数类型）。
- 事件类型用 React 内置类型（`React.ChangeEvent<HTMLInputElement>` 等）。
- 联合类型收窄优先于类型断言；**禁止非空断言滥用**（`!` 仅在确实不可能为空的场景，加注释）。

### 3.3 异步与错误

- 所有 `api.*` 调用按 `async/await` 处理，配合 `try/catch` + Toast 反馈。
- 表单提交需有 loading/disabled 态，防重复提交。
- 不吞异常：捕获后要么提示用户，要么向上抛，不写空 `catch {}`。

---

## 4. 组件命名与组织规则

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 组件文件 | PascalCase，与组件同名 | `ProjectRow.tsx` |
| 页面组件 | `XxxPage` | `HomePage.tsx` / `ProjectsManagePage.tsx` |
| 布局 | `XxxLayout` | `PublicLayout.tsx` |
| Hook | `useXxx` | `useInView.ts` |
| 工具函数 | camelCase | `compressImage.ts` / `format.ts` |
| 类型/接口 | PascalCase | `Profile` / `ProjectInput` |
| 常量 | UPPER_SNAKE（全局）/ camelCase（局部） | `STORAGE_NS` |
| CSS 类 | 语义化 + Tailwind 工具类 | — |

- 组件按 `components/ui`（可复用原子）、`components`（业务通用）、`pages`（页面）、`layouts`（布局）分层。
- 一个文件一个主组件；同文件内的很小的子组件可放下方，但不得超过 1 个导出主组件以外的公开组件。
- 组件命名必须表达用途，**禁止** `Component1`、`Item`、`Box`、`MyComponent` 等空泛名。

---

## 5. TailwindCSS 规范

1. **用设计 Token，不用魔法值**：颜色用 `bg-ground` / `text-ink` / `text-accent` 等（见 `tailwind.config`）或 CSS 变量；禁止随手写 `#1a1a2e`、`rgb(...)` 这类散落色值。
2. **类名顺序**：布局（display/position/flex/grid）→ 尺寸 → 间距 → 颜色 → 排版 → 效果 → 状态（hover/focus）→ 响应式。保持全项目一致。
3. **响应式移动优先**：默认写移动端，再用 `md:` / `lg:` 覆盖。
4. **复用优先**：同一组类出现 3 次以上，抽为组件或 `@apply` 的语义类（少用 `@apply`，优先组件化）。
5. **禁止**用大量任意值 `[...]` 绕过 Token；确需一次性微调可用，但不得成为常态。
6. **禁用视觉元素**：emoji 装饰、渐变文字/背景、发光阴影、紫色/靛蓝、玻璃拟态堆砌、图标堆砌的功能卡、细线网格装饰（见 PRD §7.5）。
7. **间距与留白**：区块间距明显大于内部间距；面与面用色阶差分层而非描边/阴影。
8. **圆角与阴影统一决策**：圆角走配置的小值/默认值；静态元素无投影，仅真正浮层（Modal/菜单）可用。

---

## 6. 数据访问规范

- 只从 `src/api` 导入 `api`：`import { api } from "@/api";`（若配置了路径别名）。
- 读：`const profile = await api.profile.get()`；写：`await api.profile.update(patch)`。
- **不得**在组件里拼 `localStorage` 键名、不得手写序列化逻辑——这些属于 `api/storage`。
- 后台写操作成功后：刷新本地 state 或重新拉取，保证 UI 与存储一致。
- 新增数据字段：**先**更新 `types.ts` + `seed.ts` + API 实现 + 相关表单/展示，**再**提交。
- `Resume.dataUrl` 可为 Base64（后台上传）或指向 `public/` 静态文件的 URL（默认简历走后者）；**不要**再往 `seed.ts` 里内联超大 Base64（易被破坏导致文件打不开）。
- 默认简历为静态文件 `public/resume.docx`：替换同名文件即全局生效；上传请走后台上传。

---

## 7. 路由守卫要求

1. 所有 `/admin/*`（除 `/admin/login`）**必须**由 `ProtectedRoute` 保护。
2. `AuthContext` 负责登录态：初始化时通过 `api.auth.isAuthenticated()` 读取；登录/退出更新并同步到 `api.auth`。
3. 守卫逻辑：未登录 → `Navigate` 到 `/admin/login` 并携带 `state.from`；已登录访问登录页 → 重定向 `/admin`；初始化期间显示 loading（避免闪烁）。
4. 登录页不得被守卫包裹（否则死循环）。
5. 前台与后台使用独立布局树，禁止在 `PublicLayout` 内渲染后台组件。
6. 后台页面用 `React.lazy(() => import(...))` + `Suspense` 懒加载。

---

## 8. 禁止使用的库 / 做法

**禁止引入以下依赖**（除非经明确批准并更新本文档）：

- 状态库：Redux、MobX、Recoil、Jotai、Zustand（本项目用 Context + Hooks 足够）。
- CSS 方案：styled-components、emotion、Sass/Less（统一 Tailwind + 原生 CSS 变量）。
- UI 组件库：Ant Design、MUI、Chakra、Mantine、Bootstrap（会破坏设计一致性并引入体积）。
- 请求库：axios（用原生 `fetch`；当前阶段根本不必发请求）。
- 日期库：moment.js（用原生 `Date` 或按需轻量工具）。
- DOM 操作库：jQuery、lodash 全量引入（确有需要按需引入单一函数或用原生实现）。
- 表单库：react-hook-form / formik（当前表单简单，用受控组件 + 校验工具）。
- 任何直接读写 `localStorage` 的第三方持久化插件。

**其他禁止**：

- 禁止 `any`、`@ts-ignore`（确需时用 `@ts-expect-error` 并注释原因）。
- 禁止在组件里直接访问 `localStorage` / `sessionStorage`。
- 禁止把后台逻辑打进前台首包。
- 禁止提交注释掉的旧代码、调试 `console.log`（保留必要的 `console.error` 需克制）。
- 禁止引入未经说明的图片/字体 CDN 依赖（字体用 `@fontsource` 自托管）。

**允许的依赖**：react、react-dom、react-router-dom、tailwindcss、typescript、vite、postcss、autoprefixer、@fontsource 字体、@types/*。

> 本项目**未使用**图标库（图标为内联 SVG 组件，如 `ArrowIcon`）、动画库（动效用 CSS 过渡 + `IntersectionObserver` + `requestAnimationFrame`），也**未配置 eslint**（类型检查以 `npm run typecheck` 为准）。

---

## 9. 可访问性与体验基线

- 语义化标签：`<nav> <main> <section> <article> <button>`；可点击元素用 `<button>`/`<a>`，不用 `<div onClick>`。
- 所有图片有 `alt`（装饰性图用 `alt=""`）。
- 键盘可达、`focus-visible` 明显；Modal 支持 Esc 关闭与焦点管理。
- 颜色对比满足 WCAG AA；正文用足墨色。
- 尊重 `prefers-reduced-motion`（星空与入场动画降级）。
- 触控目标 ≥ 44px；移动端布局为独立构图而非简单堆叠。

---

## 10. 提交与验收

### 10.1 提交前自检（Definition of Done）

- [ ] `npx tsc --noEmit` 通过，无 `any`、无未使用变量/导入。
- [ ] 无 lint 错误（如有配置）。
- [ ] 涉及持久化的改动，**刷新后数据仍在**（手动验证）。
- [ ] 新页面/组件符合命名与分层规范。
- [ ] 新增内容只经 `api.*` 读写。
- [ ] 空状态、加载态、错误态处理到位。
- [ ] 响应式正常（移动 / 桌面）。
- [ ] 未引入禁用库或禁用视觉元素。

### 10.2 提交信息

- 使用清晰的祈使句，必要时加范围前缀：`feat: 新增项目排序`、`fix: 修复头像上传后不刷新`、`docs: 更新 AGENTS.md`、`refactor: 抽取 ImageUploader`。

---

## 11. AI 行为准则（针对本项目的 AI 开发）

1. **先读后改**：改任何文件前先读取其内容与相邻上下文；不确定数据流时先查 `src/api`。
2. **最小改动**：只改与任务相关的代码，不做无关重构/格式化，不"顺手"改动其它文件。
3. **保持契约**：不得擅自更改 `api` 接口签名、数据结构或存储键名；确需变更须同步文档并说明理由。
4. **端到端完成**：一个功能要连同空/错/加载态、持久化验证一起交付，而不是只写 happy path。
5. **诚实报告**：未运行的检查不谎称通过；无法完成或有取舍时要说明。
6. **遵守风格**：组件分层、命名、Tailwind 规范、禁止库，一概遵循本文件；与既有代码风格冲突时以既有一致性优先。
7. **不要新建多余文档**：除明确要求外，不主动创建 README/说明类文件。
