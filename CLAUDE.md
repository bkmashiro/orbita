# Rubik's Cube × Group Theory — Interactive Learning Site

## 项目目标

做一个让**完全不懂群论的人**也能通过交互逐渐理解的网站。核心是**知识 ↔ 3D 可视化 ↔ 公式**三者高强度联动，而不是三个独立模块。

## 技术栈

- **React 19 + Vite + TypeScript**
- **@react-three/fiber + @react-three/drei** — 3D 魔方
- **KaTeX** — 数学公式渲染
- **Zustand** — 全局状态（魔方状态是单一数据源，驱动3D+公式+解释）
- **Framer Motion** — UI 动画
- **Tailwind CSS v4**

## 核心设计原则

### 单一数据源
魔方状态 = 置换群元素（`number[]` 长度48）。这个状态驱动：
- Three.js 3D 渲染
- KaTeX 公式显示
- 群论属性计算（阶、循环表示、陪集）
- 解释性文字

### 联动规则
- **悬停公式中的单个操作符** → 3D 高亮对应面，半透明预览效果
- **点击公式符号** → 执行该步动画
- **拖拽3D魔方某面** → 公式末尾追加符号，解释面板更新
- **选中知识点** → 公式高亮相关部分，3D 展示对应状态

### 用户友好
- 每个术语首次出现有 tooltip 解释（用简单语言）
- 所有操作可撤销
- 步骤时间轴可拖拽回放
- 动画速度可调（快/慢/逐步）
- 新手引导 overlay

## 文件结构

```
src/
  core/
    permutation.ts      # 置换群数学引擎
    cube.ts             # 魔方状态管理
    moves.ts            # 18个生成元的置换定义
    groupTheory.ts      # 阶、循环表示、陪集等计算
  store/
    useCubeStore.ts     # Zustand store — 单一数据源
  components/
    cube3d/             # Three.js 魔方组件
    formula/            # KaTeX 公式 + 联动
    explanation/        # 解释面板
    timeline/           # 步骤时间轴
    ui/                 # 通用UI组件（tooltip、按钮等）
  pages/
    Explore.tsx         # 主探索界面
    Learn.tsx           # 学习模块
    Algorithms.tsx      # 算法+助记词库
  styles/
```

## 美学方向

- 深色主题（深蓝黑背景）
- 魔方颜色：饱和度高但不刺眼
- 公式区：淡金色高亮
- 玻璃态 UI 面板（backdrop-blur）
- 字体：Inter（UI）+ JetBrains Mono（代码/公式旁的符号）

## 开发顺序

1. 置换群引擎（core/）
2. Zustand store
3. 3D 魔方渲染 + 拖拽
4. 公式渲染 + 悬停联动
5. 解释面板
6. 学习模块内容
7. Landing 页
