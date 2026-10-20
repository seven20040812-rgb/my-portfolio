import type { Profile, Project, Resume } from "./types";

export const seedProfile: Profile = {
  name: "范梦菡",
  title: "全栈工程师 · 交互设计",
  bio: "我在产品需求与工程实现之间工作，把复杂系统收敛成克制、可读的界面。\n\n过去几年主要做数据密集型产品与设计系统：既写代码，也负责信息的组织方式。我相信好的产品是「被删到不能再删」之后仍然成立的那部分——结构清晰、动线明确、细节耐看。\n\n",
  avatar: null,
  location: "大连",
  email: "541713240@qq.com",
  skills: ["TypeScript", "React", "Node.js", "设计系统", "数据可视化", "产品思维", "Rust", "Figma"],
  socials: [
    {
      id: "s1",
      platform: "GitHub",
      url: "https://github.com/seven20040812-rgb"
    }
  ],
  availability: "可接受有限合作",
  updatedAt: "2026-10-20T06:36:00.501Z",
};

export const seedProjects: Project[] = [
  {
    id: "prj-startrack",
    title: "每日一语插件",
    summary: "「每日励志语录」是一个 Chrome Manifest V3 扩展。",
    detail: "用户点击浏览器工具栏的插件图标后，会弹出一个米白色极简卡片，展示一句随机挑选的中文励志语录，点击「✨ 换一句」即可淡入淡出切换下一条，且自动避开与上一条重复。配套 index.html 官网落地页提供下载入口、功能特色与安装指引。",
    cover: null,
    tags: ["Chrome", "Extension", "Manifest", "V3"],
    repoUrl: "https://github.com/seven20040812-rgb/my_plugin",
    liveUrl: "https://seven20040812-rgb.github.io/my_plugin/",
    featured: true,
    order: 0,
    createdAt: "2025-11-12T08:00:00.000Z",
    updatedAt: "2026-10-20T06:51:02.009Z",
  },
];

/**
 * 默认简历：引用 public/ 下的静态文件，而不是内联 Base64。
 * 内联大段 Base64 极易在复制/编辑器换行时损坏（会导致文件打不开），
 * 放在 public 下由浏览器直接提供原始字节，最稳定。
 * 想换成你的真实简历：用同名文件覆盖 public/resume.docx 即可（全局立即生效），
 * 或在后台「简历」重新上传。
 */
export const seedResume: Resume = {
  fileName: "简历.docx",
  mimeType:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  size: 0, // 0 表示不显示体积；真实上传的文件会自动带体积
  dataUrl: "/resume.docx",
  uploadedAt: "2026-10-20T06:53:51.616Z",
};
