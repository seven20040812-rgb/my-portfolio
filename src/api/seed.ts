import type { Profile, Project } from "./types";

const baseTime = "2026-09-01T08:00:00.000Z";

export const seedProfile: Profile = {
  name: "陈知远",
  title: "全栈工程师 · 交互设计",
  bio: "我在产品需求与工程实现之间工作，把复杂系统收敛成克制、可读的界面。\n\n过去几年主要做数据密集型产品与设计系统：既写代码，也负责信息的组织方式。我相信好的产品是「被删到不能再删」之后仍然成立的那部分——结构清晰、动线明确、细节耐看。\n\n业余维护几个开源小工具，喜欢天文、制图与长时间阅读。",
  avatar: null,
  location: "上海 · Shanghai",
  email: "hello@zhiyuan.dev",
  skills: ["TypeScript", "React", "Node.js", "设计系统", "数据可视化", "产品思维", "Rust", "Figma"],
  socials: [
    { id: "s1", platform: "GitHub", url: "https://github.com/" },
    { id: "s2", platform: "LinkedIn", url: "https://www.linkedin.com/" },
    { id: "s3", platform: "博客", url: "https://example.com/notes" },
  ],
  availability: "可接受有限合作",
  updatedAt: baseTime,
};

export const seedProjects: Project[] = [
  {
    id: "prj-startrack",
    title: "星轨 · StarTrack",
    summary: "面向长周期的个人项目与目标追踪工具，用天文学的隐喻组织时间与进度。",
    detail:
      "星轨是一个把「长期目标」可视化为星图的效率工具。每个目标是一颗星，随投入时间累积亮度，里程碑之间连成星座。\n\n我负责从信息架构到前端实现的全部工作：设计了以时间为横轴、投入为纵轴的星图画布，用 Canvas + WebGL 承载上千个节点的平滑渲染，并用事件溯源模型记录每一次进展，保证可回溯。\n\n最终在不牺牲性能的前提下，让「坚持」这件事变得可以被看见。",
    cover: null,
    tags: ["React", "TypeScript", "Canvas", "设计系统"],
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com",
    featured: true,
    order: 0,
    createdAt: "2025-11-12T08:00:00.000Z",
    updatedAt: baseTime,
  },
  {
    id: "prj-tide",
    title: "潮汐 · Tide",
    summary: "一套面向运营团队的可视化报表引擎，把分散指标汇成一张可读的「潮汐图」。",
    detail:
      "潮汐是为一家增长团队做的内部数据产品。原先把十几个指标散落在不同表格里，团队每天要花大量时间拼接。\n\n我把它重构为一个可配置的报表引擎：指标以声明式 schema 描述，前端用统一的图表语言渲染，并内置了对比、下钻与导出。核心挑战是把「数据模型」与「视觉编码」解耦，让非工程同学也能自己搭看板。\n\n上线后报告制作时间从人均每天 40 分钟降到几乎为零。",
    cover: null,
    tags: ["TypeScript", "数据可视化", "D3", "Node.js"],
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com",
    featured: true,
    order: 1,
    createdAt: "2025-06-03T08:00:00.000Z",
    updatedAt: baseTime,
  },
  {
    id: "prj-atlas",
    title: "静默图集 · Silent Atlas",
    summary: "一个极简的阅读笔记与知识地图，强调留白、秩序与长期积累。",
    detail:
      "静默图集是我的个人知识管理实验：把零散笔记组织成一张可漫游的地图。\n\n设计上刻意做了减法——没有推荐流、没有红点，只有文字、链接与时间。技术上用纯前端增量构建索引，支持离线与全文检索。它更像一件给自己用的工具，而非追求增长的产品。",
    cover: null,
    tags: ["React", "设计系统", "IndexedDB", "编辑器"],
    repoUrl: "https://github.com/",
    featured: false,
    order: 2,
    createdAt: "2025-02-18T08:00:00.000Z",
    updatedAt: baseTime,
  },
];
