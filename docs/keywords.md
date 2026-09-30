# 动效关键词手册

[打开交互词典](../index.html) · [配方器使用说明书](usage.md)

词条来源数据截至 2026-09-27。文字版由当前词典数据生成，共 75 个词。

## L1 底座

交付形态、确定性渲染、画幅、验收方式。决定它能不能稳定出片、能不能导出成视频。

### 固定舞台，等比缩放 · `fixed-stage`

先定一个逻辑画布，再整体缩放。构图永远不会因为窗口尺寸而错位，导出视频时像素也是确定的。

**中文写法**

单个 HTML 文件，固定 1920x1080 舞台，按窗口等比缩放、留黑边，CSS/JS 全部内联。

**英文写法**

```text
One self-contained HTML file on a fixed 1920x1080 stage, scaled to fit the window (letterboxed), all CSS and JS inline.
```

**看点：**容器宽高持续变化：A 模式里元素随窗口重排、挤压错位；B 模式里舞台整体等比缩放、四周留边，构图不变。

**适用：**产品发布片、知识科普、社媒竖屏、片头/Logo

**避坑：**网页落地页不要用固定舞台，用响应式布局。

**来源：**[v02-app-launch](../gallery/index.html#v02-app-launch) · [v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 时长与帧率 · `duration-fps`

写明秒数和帧率，模型才能把节拍、镜头换算成帧，也决定运动是否顺滑。24fps 有电影感，60fps 适合 UI 与快速运动。

**中文写法**

时长 15 秒，60fps（共 900 帧）。

**英文写法**

```text
15 seconds at 60fps (900 frames).
```

**看点：**同一个快速横移的物体，用滑块在 12 / 24 / 30 / 60 fps 间切换，看到阶梯感变化；下方一条帧刻度尺同步显示帧数。

**适用：**产品发布片、UI 动效展示、社媒竖屏

**避坑：**不写帧率时模型常默认 30fps，快速运动会发涩。

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph) · [v08-kinetic-type](../gallery/index.html#v08-kinetic-type)

### seek(t) 纯函数渲染 · `seek-t`

画面只由 t 决定，所以可以任意拖动时间线、逐帧截图导出 MP4，每次渲染结果都一样。这是「用代码做视频」的地基。

**中文写法**

所有样式都在 seek(t) 里由时间 t 计算：不用 CSS 过渡、不用定时器、帧与帧之间不存状态。暴露 window.seek(t) 和 window.DURATION。

**英文写法**

```text
Every style is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames. Expose window.seek(t) and window.DURATION.
```

**看点：**一个可拖动的时间线滑块 + 一段小动画（形状移动、文字出现）。拖到任意时刻画面立刻精确对应；旁边显示 t 值。

**适用：**产品发布片、知识科普、UI 动效展示、片头/Logo

**避坑：**网页交互动效不需要这么严格，但凡要导出视频就必须写。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph) · [v08-kinetic-type](../gallery/index.html#v08-kinetic-type)

### 固定种子随机数 · `seeded-random`

每帧重新调用 Math.random 会让星星、颗粒、噪点每帧跳动，导出的视频闪烁。固定种子让「随机」可复现。

**中文写法**

所有随机数用固定种子的伪随机数生成器，禁止 Math.random。

**英文写法**

```text
Use a seeded PRNG for every random value; never Math.random.
```

**看点：**两块并排的星空/颗粒：A 每帧用 Math.random 重新撒点（明显闪烁）；B 用固定种子，只做平滑的呼吸闪烁。

**适用：**片头/Logo、沉浸式体验、知识科普

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 首尾无缝循环 · `loop-seam`

社媒自动循环播放、网页背景视频都需要无缝接缝。只说「循环」不够，要说清首尾帧必须一致，连速度也要连续。

**中文写法**

最后一帧与第一帧完全一致（包括光标位置和速度），可以无缝循环。

**英文写法**

```text
The last frame is the first frame, so it loops — cursor position and speed included.
```

**看点：**环上的接缝刻度标出首末帧位置。A：末帧没接上首帧，红弧缺口，圆点在接缝处跳回，残影断开；B：两个记号重合，残影连续穿过接缝，底部时间尺两端同为一帧。

**适用：**社媒竖屏、UI 动效展示、沉浸式体验

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph) · [v19-water-cycle](../gallery/index.html#v19-water-cycle)

### 先出分镜，再写代码 · `storyboard-first`

在最便宜的阶段改方向：分镜错了改一行字，代码错了要重写。也让模型先想清楚节奏再动手。

**中文写法**

先向我要输入，再给我一份每个时间点都对齐节拍的分镜表，确认后再写代码。

**英文写法**

```text
Ask me for the inputs, then show me a storyboard with every timing on the beat grid before you write any code.
```

**看点：**四个分镜格依次排开，随后收拢成一条带节拍刻度的时间线，各格按时长占宽，钴蓝播放头扫过并读出时间码。

**适用：**产品发布片、知识科普、UI 动效展示

**避坑：**一句话试水时不用，复杂片子必用。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 联系表抽帧自检 · `contact-sheet`

模型看不到动画，但能看截图。让它自己抽帧检查，最常见的文字重叠、空帧、出画就会被提前修掉。

**中文写法**

全量渲染前抽 20 帧以上（每拍一帧或每 0.5 秒一帧）拼成联系表，修掉拥挤、重叠、看不清的地方。

**英文写法**

```text
Before the full render, probe 20+ frames (one per beat, or a still every 0.5s). Fix anything cluttered, overlapping or hard to read.
```

**看点：**一排缩略帧被逐帧抽检，停在有问题的一帧并放大，可见两行字重叠、被红框标出，随后拉开变绿、缩回原格。

**适用：**产品发布片、知识科普、社媒竖屏

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v06-sky-blue](../gallery/index.html#v06-sky-blue)

### 子帧运动模糊 · `subframe-blur`

代码渲染的画面默认每帧都锐利，快速运动会显得像幻灯片。子帧混合模拟快门，快动作立刻有电影感。

**中文写法**

每帧渲染 3 个子帧（t−1/240s、t、t+1/240s），用 ffmpeg tmix 混合，得到真实的运动模糊。

**英文写法**

```text
Render 3 subframes per frame (t − 1/240s, t, t + 1/240s) and blend them with ffmpeg tmix for real motion blur at 60fps.
```

**看点：**一个快速甩过画面的方块/卡片：A 每帧锐利（频闪感）；B 叠加 3–5 个半透明子帧形成拖影。

**适用：**产品发布片、UI 动效展示、片头/Logo

**避坑：**只影响导出的视频，网页实时预览里不需要。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 导出 MP4 流程 · `export-mp4`

把 HTML 变成可发布的视频文件。写清编码参数，交付物就能直接上传各平台。

**中文写法**

用 Playwright 逐帧调用 seek(t) 截图，ffmpeg 编码（libx264、crf 18、yuv420p）；音频响度标准化到 −14 LUFS。

**英文写法**

```text
Render with Playwright: step through seek(t) frame by frame, encode with ffmpeg (libx264, crf 18, yuv420p); loudnorm audio to −14 LUFS.
```

**看点：**源帧一格格截出，落进带齿孔的胶片带，最后并成一个带播放三角的视频文件；衬线大数字从 0 数到 900 帧。

**适用：**产品发布片、社媒竖屏、片头/Logo

**避坑：**需要能跑代码的环境（Claude Code / Cowork）。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 画幅：16:9 / 9:16 / 1:1 / 2.39:1 · `aspect-ratios`

画幅决定构图。直接写平台名，模型会自动带出画幅；写像素更精确。

**中文写法**

竖屏 1080x1920（抖音/小红书）；横屏 1920x1080（B站/YouTube）；方形 1080x1080（信息流）；2.39:1 遮幅做电影感。

**英文写法**

```text
Stage 1080x1920 (9:16) for TikTok/Reels; 1920x1080 (16:9) for YouTube; 1080x1080 (1:1) for feeds; 2.39:1 letterbox for cinematic.
```

**看点：**同一个构图（标题 + 主体 + 按钮）在 16:9 → 9:16 → 1:1 → 2.39:1 之间平滑变形，元素重新排布；角落显示当前比例。

**适用：**社媒竖屏、产品发布片、片头/Logo

**来源：**[v18-noise-cancelling](../gallery/index.html#v18-noise-cancelling) · [v12-rain-station](../gallery/index.html#v12-rain-station)

### 竖屏安全区与字号下限 · `safe-zone`

平台的按钮、标题栏、评论区会盖住画面边缘。不写安全区，关键字常被 UI 挡住。

**中文写法**

文字全部放在安全区内（1080 宽时上 150、下 170、左右 60 像素）。标题 ≥56px、正文 ≥36px、标签 ≥28px。

**英文写法**

```text
Keep all text inside mobile safe zones (150px top, 170px bottom, 60px sides at 1080 wide). Headlines ≥ 56px, body ≥ 36px, labels ≥ 28px.
```

**看点：**竖屏画面上叠一层模拟的平台 UI（顶部栏、右侧按钮列、底部文案），A 模式文字被遮挡；B 模式显示安全区虚线框，文字在框内。

**适用：**社媒竖屏

**来源：**[v18-noise-cancelling](../gallery/index.html#v18-noise-cancelling)

### 尊重「减少动态」 · `reduced-motion`

网页必备的无障碍底线，也是质量信号。好的动效在减弱后仍然成立。

**中文写法**

尊重系统的「减少动态效果」设置：环境动画放慢或停止，大幅运动改成淡入淡出。

**英文写法**

```text
Honour prefers-reduced-motion with a calmer fallback: slow or stop ambient motion, turn big moves into fades.
```

**看点：**同一组入场动画：A 完整版（位移 + 缩放 + 视差）；B 减弱版（只有透明度淡入、背景静止）。

**适用：**品牌官网、SaaS 落地页、长文专题

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass) · [w05-escapement](../gallery/index.html#w05-escapement)

## L2 质感

留白与信息密度、色彩策略、字体角色、材质与光、禁用清单。同样的动画，质感词决定它像模板还是像成品。

### 一个镜头只讲一件事 · `one-idea`

高级感首先来自克制。一屏里元素越少，每个元素的运动越显眼、越可信。

**中文写法**

高端极简。每个镜头只讲一件事，大量留白。

**英文写法**

```text
High-end minimal. One idea per shot, lots of empty space.
```

**看点：**A：一屏塞满标题、三个图标、徽章、按钮同时动；B：同样内容拆成 3 个镜头依次出现，每个镜头只有一个主角和大量留白。

**适用：**产品发布片、品牌官网、奢侈品/高端

**避坑：**信息型内容（数据汇报）要平衡，不能为留白牺牲可读。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 克制即设计 · `restraint`

把「慢」和「少」当成品牌资产写进去，模型会主动放慢节奏、减少装饰，而不是加更多效果。

**中文写法**

克制就是设计。大量留白。节奏本身就是品牌。

**英文写法**

```text
Restraint is the design. Enormous whitespace. The pacing IS the brand.
```

**看点：**同一个标题入场：A 快速弹入 + 旋转 + 闪光；B 1.2 秒缓慢淡入上移，停留，周围大面积留白。

**适用：**奢侈品/高端、品牌官网

**避坑：**活动页、游戏类不适用。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 单一强调色 · `one-accent`

强调色越少，视线越集中。平均分配的多色方案是 AI 默认审美的典型特征。

**中文写法**

只用一个强调色，其余全部中性色。主色大面积 + 强调色点睛，而不是平均分配多种颜色。

**英文写法**

```text
One accent color only; everything else neutral. Dominant colors with sharp accents, not evenly distributed palettes.
```

**看点：**同一张 UI 卡片/画面：A 五六种颜色平均分布；B 黑白灰 + 一个强调色只用在关键按钮和数字上，视线立即聚焦。可切换 3 种强调色。

**适用：**产品发布片、SaaS 落地页、UI 动效展示

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 字体分角色 · `type-roles`

给每种字体一个职责，比指定具体字体名更稳定。三种角色的对比本身就构成层级和质感。

**中文写法**

展示用高对比衬线体，正文用干净的无衬线体，参数和时间码用克制的等宽字体。

**英文写法**

```text
A high-contrast serif for display, a clean grotesk for body, a restrained monospace for specs and timecodes.
```

**看点：**同一段信息（大标题、一句说明、一行参数/时间码）：A 全用同一种无衬线；B 衬线大标题 + 无衬线正文 + 等宽参数，层级立现。

**适用：**品牌官网、奢侈品/高端、长文专题、知识科普

**避坑：**中文场景可写「宋体/明朝体做标题 + 黑体正文 + 等宽数字」。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [v08-kinetic-type](../gallery/index.html#v08-kinetic-type)

### 字重与字号走极端 · `type-extremes`

犹豫的层级看起来平庸。极端对比让画面有张力，也让动画的主次一目了然。

**中文写法**

字重走极端（100/200 对 800/900），字号跳 3 倍以上，而不是 400 对 600。

**英文写法**

```text
Use extremes: 100/200 weight vs 800/900, size jumps of 3x or more — not 400 vs 600.
```

**看点：**A：标题 32px/600 + 正文 20px/400（平淡）；B：标题 120px/900 + 细体 18px/200，对比强烈。标题做一次缓慢入场。

**适用：**产品发布片、片头/Logo、品牌官网

**来源：**[v01-showreel](../gallery/index.html#v01-showreel)

### 毛玻璃 · `frosted-glass`

只说 glassmorphism 往往只得到半透明白块。拆成模糊、饱和、内高光、颗粒四个要素，质感才对。

**中文写法**

毛玻璃面板：背景模糊 + 饱和度提升、1px 内高光描边、细微颗粒。

**英文写法**

```text
Frosted-glass panels: backdrop-filter blur + saturate, a 1px inner highlight border, subtle grain.
```

**看点：**彩色流动背景上一块玻璃面板：A 只有半透明白色；B 模糊 + 饱和 + 1px 高光边 + 颗粒，背景色透过来。

**适用：**SaaS 落地页、消费类 App、沉浸式体验

**避坑：**背景没有色彩变化时毛玻璃看不出来，要配有氛围的背景。

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 印刷质感：纸纹、网点、有限油墨 · `print-texture`

给数字画面加上物理介质的痕迹，立刻脱离「屏幕默认感」，适合复古、科普、编辑风。

**中文写法**

有限油墨配色、半色调网点、纸张颗粒、雕版式线条，像印刷品。

**英文写法**

```text
Limited ink palette, halftone dots and paper grain, engraved-diagram lines — like a printed page.
```

**看点：**同一张示意图：A 纯平面矢量；B 米色纸底 + 网点阴影 + 纸纹 + 两三种油墨色，像旧教科书插图。

**适用：**知识科普、长文专题、品牌官网

**来源：**[v06-sky-blue](../gallery/index.html#v06-sky-blue) · [w02-longform](../gallery/index.html#w02-longform)

### 有层次的氛围背景 · `layered-atmosphere`

纯色背景让前景像贴在上面。有层次的背景让画面有空气感，而且几乎不增加信息负担。

**中文写法**

背景要有氛围和纵深，不用纯色：叠加渐变、柔和噪点、暗角、缓慢的环境漂移。

**英文写法**

```text
Create atmosphere and depth rather than solid colors: layer gradients, soft noise, a vignette, a slow ambient drift.
```

**看点：**同一行标题：A 纯色背景；B 多层柔和渐变缓慢漂移 + 细噪点 + 暗角。

**适用：**品牌官网、片头/Logo、沉浸式体验

**避坑：**氛围不能抢前景，保持低对比。

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 金属/箔面光泽扫过 · `metal-sheen`

一道移动的高光就能暗示材质。比整片金色渐变克制得多。

**中文写法**

箔面渐变裁切在文字上（background-clip:text），光泽定时扫过标题；金属高光跟随鼠标。

**英文写法**

```text
A foil-like gradient clipped to text (background-clip: text) sweeping across headings; a faint metal sheen that follows the cursor.
```

**看点：**一行大标题：一道窄窄的高光带周期性扫过；鼠标悬停时高光跟随指针位置。

**适用：**奢侈品/高端、品牌官网、活动/发布会

**避坑：**扫光频率要低（3–5 秒一次），太频繁很廉价。

**来源：**[w03-art-deco](../gallery/index.html#w03-art-deco)

### 3D 摄影棚布光 · `studio-light-3d`

3D 场景好不好看主要看光和材质。点名布光方式和材质，比说「逼真」「高级」有效得多。

**中文写法**

柔和主光、环境贴图反射、ACES 电影色调映射、浅景深感；材质写具体（抛光钢、拉丝金属）。

**英文写法**

```text
Soft key light, env-map reflections, ACES filmic tone mapping, a shallow depth-of-field feel; materials named precisely (polished steel, brushed metal).
```

**看点：**一个缓慢旋转的简单 3D 物体（如圆环结/齿轮）：A 默认平光、塑料感；B 主光 + 环境反射 + 色调映射，金属质感。（three.js r134）

**适用：**品牌官网、奢侈品/高端、产品发布片

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [v09-room-to-quarks](../gallery/index.html#v09-room-to-quarks)

### 禁用清单（去 AI 味） · `anti-slop`

模型的默认审美会往这些效果上靠。明确禁用比描述想要什么更能拉开质感差距。

**中文写法**

禁用：弹跳缓动、粒子爆炸、冲击波圈、光晕、镜头光斑、RGB 分离、镜头抖动、打字机文字、白底紫渐变、Inter 做标题字。

**英文写法**

```text
Banned: bouncy easing, particle bursts, shockwave rings, glows, lens flares, RGB split, camera shake, typewriter text, purple gradients on white, Inter as the display face.
```

**看点：**同一个标题镜头：A 堆满弹跳、光晕、粒子爆炸、镜头抖动、紫色渐变；B 去掉全部，只剩干净的遮罩揭示。

**适用：**产品发布片、品牌官网、SaaS 落地页、UI 动效展示

**避坑：**禁用清单按场景增减：游戏/活动页可保留部分特效。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

## L3 运动

缓动与物理、节奏、转场、镜头、文字动效、生成氛围。这是「动效方向」的核心词汇。

### 弹簧缓动，轻微过冲 · `spring`

弹簧有质量和惯性，比 ease-in-out 更像真实物体。「轻微过冲」同时排除了廉价的弹跳。

**中文写法**

全部用弹簧缓动，最多轻微过冲。

**英文写法**

```text
Springs everywhere, a tiny overshoot at most.
```

**看点：**三个小球同时从左到右：linear、ease-in-out、spring（轻微过冲）。点击画面重新触发；下方画出三条缓动曲线。

**适用：**UI 动效展示、SaaS 落地页、产品发布片

**避坑：**不要写 bouncy，过冲超过 10% 就显得廉价。

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 慢缓动，不弹不闪 · `slow-ease`

时长本身传递价值感：越贵的东西动得越慢。适合奢侈品、品牌站、长文。

**中文写法**

慢缓动（0.9–1.4 秒）。不弹跳，不闪烁。

**英文写法**

```text
Slow easings (0.9–1.4s). Nothing bounces. Nothing flashes.
```

**看点：**两条细线上的圆点赛跑：0.3 秒与慢缓动时长（滑块 0.2–2 秒）对比；每 0.1 秒留一道刻度，快线刻度挤在一起，慢线均匀展开。

**适用：**奢侈品/高端、品牌官网、长文专题

**避坑：**UI 反馈（点击、切换）不要超过 0.3 秒，慢缓动只用于入场和叙事。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 快起慢收（expo out） · `expo-out`

元素像被「推」进来然后平稳停下，是界面和标题入场最通用的高级缓动。

**中文写法**

指数缓出：起步快，落地长而柔。

**英文写法**

```text
Ease-out expo: fast start, long soft landing.
```

**看点：**一组标题行依次滑入：左边 ease-in（慢起急停，别扭）；右边 expo-out（利落）。

**适用：**SaaS 落地页、产品发布片、UI 动效展示

**来源：**[v02-app-launch](../gallery/index.html#v02-app-launch)

### 双弹簧拉伸 · `dual-spring`

Tab 指示条、开关滑块的「液体感」就来自这个技巧，一句话写清楚模型就能做出来。

**中文写法**

指示条的前后两条边用不同的弹簧，前沿先到、后沿跟上，形成拉伸。

**英文写法**

```text
The indicator's two edges ride different springs, so the leading edge stretches ahead of the trailing one.
```

**看点：**一排 4 个标签页，指示条自动在标签间移动：A 整体平移；B 前沿先冲出、后沿追上，拉伸再收回。可点击标签。

**适用：**UI 动效展示、SaaS 落地页

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 一拍二（手作感） · `on-twos`

刻意降低运动帧率，画面立刻有手作、定格动画的温度。适合童趣、复古、插画风。

**中文写法**

一拍二：24fps 下每张画面停 2 帧，做出手绘动画感。

**英文写法**

```text
Motion on twos (24fps with 2-frame holds) for a hand-made feel.
```

**看点：**一个钟摆圆盘来回摆动。A：60fps 丝滑；B：12fps 一拍二，弧线上标出保持帧的刻度，留下前两帧的淡影，轮廓轻微抖动。

**适用：**片头/Logo、知识科普、故事短片

**避坑：**UI 与数据类内容不要用。

**来源：**[v16-bedtime-opener](../gallery/index.html#v16-bedtime-opener)

### 节拍网格与卡点 · `beat-grid`

给时间一个网格，所有事件对齐它，画面就有音乐性，即使没有配乐也能感到节奏。

**中文写法**

120 BPM，每小节 2 秒。每个剪辑点落在强拍，每个界面动作落在拍子上。

**英文写法**

```text
120 BPM, 2 seconds per bar. Every cut sits on a downbeat, every UI hit on a beat.
```

**看点：**一个节拍器（4 拍闪烁）+ 一串镜头切换：A 切换时刻随机、偏离拍子；B 全部落在强拍。可调 BPM。

**适用：**产品发布片、社媒竖屏、UI 动效展示

**避坑：**没有配乐也可以用，但要统一一个 BPM。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 逐词落拍 · `word-on-beat`

把一句话拆成节拍，观众被节奏带着读完，开场 2 秒就抓住注意力。

**中文写法**

开场钩子一词一拍地落下。

**英文写法**

```text
The hook lands word by word on the beats.
```

**看点：**一句 3–4 个词的短句，每个词在节拍上用遮罩/位移落下，节拍点在下方闪烁。

**适用：**产品发布片、社媒竖屏、片头/Logo

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 错峰入场 · `stagger`

同时出现显得生硬，错峰让视线有路径。间隔是关键参数：太小像同时，太大像卡顿。

**中文写法**

错峰入场：子元素依次出现，间隔 60–90 毫秒。

**英文写法**

```text
Staggered reveals: children enter one after another with a 60–90ms offset.
```

**看点：**3×3 小方块按顺序升起入场，最前沿一格短暂带钴蓝，错峰节奏像一个移动的点；滑块调节间隔 0–300ms，点击重播。

**适用：**SaaS 落地页、产品发布片、数据汇报

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 每一拍都有事发生 · `no-dead-time`

代码动画最常见的问题是某几秒画面静止。这句话让模型主动检查并填满时间线。

**中文写法**

每一拍都有事情发生。没有空档，没有冻结画面。

**英文写法**

```text
Something happens on every beat. No dead time, no frozen frames.
```

**看点：**上方一条时间线把「静止」区段标红；A 模式有 2 秒空档（画面冻结，红色区段）；B 模式每拍都有微小变化。

**适用：**产品发布片、社媒竖屏

**避坑：**「每拍有事」不等于「每拍都是大动作」，可以是微小的次级运动。

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 一次编排好的入场 · `orchestrated-load`

把动效预算集中在一个高光时刻。零散的小动画会互相抢注意力。

**中文写法**

一次精心编排的页面入场（错峰揭示），胜过到处零散的微交互。

**英文写法**

```text
One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.
```

**看点：**一个迷你网页首屏：A 各元素各自随机弹动、闪烁；B 标题→副标题→按钮→图片按顺序一次入场后安静下来。点击重播。

**适用：**SaaS 落地页、品牌官网

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 遮罩揭示 · `masked-reveal`

文字像从缝里被推出来，比淡入更有力、更「设计」。标题入场的首选。

**中文写法**

遮罩文字揭示：每一行从看不见的遮罩后升起。

**英文写法**

```text
Masked type reveals: each line rises from behind an invisible mask.
```

**看点：**三行大字依次从各自的遮罩下方升起；A 为普通淡入对比。

**适用：**产品发布片、品牌官网、片头/Logo

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 匹配剪辑 · `match-cut`

镜头切了，但视线没断。最能体现「设计过」的转场。

**中文写法**

匹配剪辑：运行时测量元素位置，让上一镜的形状在下一镜里延续成另一个形状。

**英文写法**

```text
Match cuts: measure element positions at runtime so a shape in one shot continues as a shape in the next.
```

**看点：**一个圆在镜头 1 是太阳，切到镜头 2 成为按钮，切到镜头 3 成为头像；位置和大小连续。

**适用：**产品发布片、片头/Logo

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 一个形体不切镜 · `shape-morph`

连续感极强，适合讲一个产品的多个功能或状态。UI 动效作品的经典手法。

**中文写法**

一个形体不切镜：每个状态都是同一个元素改变尺寸、圆角和颜色，内容用短暂模糊切换。

**英文写法**

```text
One shape, never cut: every state is the same element morphing its size, radius and color while its content swaps with a short blur.
```

**看点：**一个圆角矩形依次变成按钮 → 加载圈 → 对勾 → 胶囊条 → 卡片，内容以短模糊切换，循环。

**适用：**UI 动效展示、产品发布片

**避坑：**内容切换要有独立的进出时间，否则文字会叠在一起。

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 从元素里打开的圆形转场 · `iris-open`

转场从画面里的一个元素生长出来，比全屏擦除更有因果感。常用于「点击后进入」。

**中文写法**

转场点：一个圆从按钮里扩张开，进入深色场景。

**英文写法**

```text
The drop: a circle opens out of the button into a dark scene.
```

**看点：**一个按钮被光标点击，圆形从按钮位置扩散覆盖全屏，进入深色新场景；循环。

**适用：**产品发布片、SaaS 落地页

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 带模糊的甩镜 · `whip-pan`

极快的横移加拖影，制造能量和强调。一支片子用一两次即可。

**中文写法**

带运动模糊的甩镜，甩到主角元素上。

**英文写法**

```text
A motion-blurred whip onto the hero element.
```

**看点：**一排卡片横向快速甩过（带拖影），急停在中间主卡片上，主卡轻微放大。

**适用：**产品发布片、片头/Logo、社媒竖屏

**避坑：**不能多用，也不要和镜头抖动混用。

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 推进硬切 · `push-cut`

硬切干脆，加一点推进就有冲击力，适合一连串数字或关键词。

**中文写法**

大数字用推进硬切：每次切换在拍子上伴随轻微放大推进。

**英文写法**

```text
Big stats on push cuts: each cut lands with a slight scale push on the beat.
```

**看点：**三个大数字依次硬切出现，每次切换时画面从 1.06 缩放到 1.0，落在节拍上。

**适用：**产品发布片、数据汇报、社媒竖屏

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 材质化擦除 · `material-wipe`

把转场和内容的材质绑定，转场就成了叙事的一部分，而不是通用特效。

**中文写法**

场景切换用与主题材质相关的擦除（液体倾倒、纸张翻折、光扫过）。

**英文写法**

```text
Scene changes use a wipe shaped like the subject's material (a liquid pour, a paper fold, a light sweep).
```

**看点：**纸色与夜色两个大号数字场景之间，交替用“液体波浪边缘”和“光扫”擦除切换，边缘只有一道钴蓝细线。

**适用：**品牌官网、产品发布片、知识科普

**来源：**[v04-business-explainer](../gallery/index.html#v04-business-explainer)

### 一镜到底尺度推进 · `push-in-journey`

尺度变化本身就是叙事。关键写法是「在匹配构图处交叉淡化」，否则会变成几段硬切。

**中文写法**

一镜到底推进：从 [A] 推进到 [B]，再到 [C]，最后到 [D]；在匹配构图处交叉淡化，看起来是一个镜头。

**英文写法**

```text
One continuous push-in: starts at [A], zooms into [B], then [C], and finally [D] — cross-fade scenes at matched framing so it reads as one shot.
```

**看点：**嵌套的细线画幅持续推近，每层在匹配构图处淡入下一层；四角裁切标记不动，左下大字显示当前放大倍数。

**适用：**知识科普、品牌官网、片头/Logo

**来源：**[v09-room-to-quarks](../gallery/index.html#v09-room-to-quarks)

### 镜头推到状态填满画面 · `zoom-to-fill`

小组件在大画面里显得空。让镜头跟着主角缩放，每个状态都是特写。

**中文写法**

镜头缩放，让每个状态都填满画面。

**英文写法**

```text
The camera zooms so each state fills the frame.
```

**看点：**一个小 UI 组件在画面中依次变化：A 镜头固定（组件很小）；B 镜头推近让组件始终占画面 60%。

**适用：**UI 动效展示、产品发布片

**来源：**[v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 视差纵深 · `parallax-depth`

最便宜的 3D 感。前后层移动量的差异让平面有了纵深。

**中文写法**

鼠标视差：不同层以不同深度移动，场景轻轻朝指针倾斜。

**英文写法**

```text
Mouse parallax: layers move at different depths; the scene tilts gently toward the pointer.
```

**看点：**4 层剪影（远山、中景、近景、前景文字）随鼠标移动产生视差；无鼠标时自动缓慢漂移。

**适用：**品牌官网、沉浸式体验、片头/Logo

**避坑：**位移量要小，前景最多十几像素。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [v12-rain-station](../gallery/index.html#v12-rain-station)

### 跟随镜头 · `follow-cam`

路径、流程、增长曲线的动画里，让镜头跟着「正在发生的地方」，观众不用自己找。

**中文写法**

镜头跟随运动线条的前端，并轻微缩放。

**英文写法**

```text
The camera follows the moving head of the line, with a gentle zoom.
```

**看点：**一条路线在大地图/网格上画出，镜头始终跟随线头平移，并在途经点轻微推近。

**适用：**数据汇报、知识科普、产品发布片

**来源：**[v10-map-route](../gallery/index.html#v10-map-route)

### 景深与移焦 · `rack-focus`

电影语言里最有情绪的手法之一。画面分层后，模糊程度的变化就能引导视线。

**中文写法**

2.5D 分层视差加景深；焦点从前景移到主体。

**英文写法**

```text
2.5D layered parallax with depth of field; focus shifts from the foreground to the subject.
```

**看点：**前景（雨滴/枝叶）、主体（人物剪影）、背景（灯光光斑）三层；焦点在前景与主体之间来回移动，模糊程度随之变化。

**适用：**故事短片、品牌官网、片头/Logo

**来源：**[v12-rain-station](../gallery/index.html#v12-rain-station)

### 缓慢环绕漂移 · `orbit-drift`

3D 场景静止时像截图。缓慢漂移让场景「活着」，预设机位让用户不迷路。

**中文写法**

镜头缓慢自动环绕主体漂移；提供几个可切换的预设机位。

**英文写法**

```text
A slow auto camera drift orbiting the subject; multiple preset views the user can switch.
```

**看点：**线框柱与方块缓慢环绕漂移，地面有网格与轨道环，柱顶一个钴蓝点；三个机位按钮可切换，平滑过渡。

**适用：**沉浸式体验、品牌官网、游戏/沉浸

**来源：**[w07-sakura-valley](../gallery/index.html#w07-sakura-valley)

### 文字即结构 · `kinetic-type`

文字不只是出现，而是占据、支撑、推开空间。适合宣言、金句、品牌口号。

**中文写法**

动态排版：每一句都改变画面的结构，后面的词站在前面的词搭起的结构上。

**英文写法**

```text
Kinetic typography: every line changes the architecture of the frame; later words stand on what earlier words built.
```

**看点：**4 个词依次入场：横向的大词成为「地面」，竖排词成为「柱子」，最后一句落在它们搭起的结构上。

**适用：**片头/Logo、活动/发布会、社媒竖屏

**来源：**[v08-kinetic-type](../gallery/index.html#v08-kinetic-type)

### 数字滚动计数 · `counter-roll`

数字从 0 涨到目标值，比直接显示更有分量。等宽数字避免跳动。

**中文写法**

数字用缓出曲线滚动计数，等宽数字，单位最后落定。

**英文写法**

```text
Numbers count up with an ease-out and tabular digits; units settle last.
```

**看点：**三个统计数字从 0 滚动到目标值（缓出），单位在最后淡入；A 为非等宽数字（抖动）对比。

**适用：**数据汇报、产品发布片、SaaS 落地页

**避坑：**数字必须来自真实数据，别让模型编。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 光照亮文字 · `light-on-text`

光不只是叠在文字上，而是让文字在光里显形。需要点名「裁切到光束形状」的实现方式。

**中文写法**

一道光扫过标题并真正照亮文字：每帧把「亮版文字」裁切到光束形状里。

**英文写法**

```text
A beam sweeps across the headline and actually lights it: a lit copy of the text is clipped to the beam shape every frame.
```

**看点：**深色背景上的标题，一道锥形光束来回扫过，被照到的部分文字变亮变暖。

**适用：**长文专题、片头/Logo、品牌官网

**来源：**[w02-longform](../gallery/index.html#w02-longform)

### 极光飘带 · `aurora`

点名「正弦变形 + 叠加混合 + 非常柔和」，模型就能画出高质量的极光而不是彩色条纹。

**中文写法**

Canvas 上缓慢飘动的极光带：多层正弦变形的渐变带，叠加混合，非常柔和。

**英文写法**

```text
Slow-drifting aurora ribbons on canvas: layered sine-deformed gradient bands, additive blending, very soft.
```

**看点：**深色背景上 3 条极光带缓慢飘动，鼠标附近的极光轻微弯曲；可切换配色。

**适用：**消费类 App、片头/Logo、沉浸式体验

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 画布反馈拖尾 · `feedback-trail`

一行实现，效果极强。适合音乐可视化、片头、氛围背景。

**中文写法**

画布反馈：每帧把上一帧略微放大、旋转、淡化后重绘，让运动变成烟雾和螺旋。

**英文写法**

```text
Canvas feedback: each frame redraws the previous frame slightly zoomed, rotated and faded, turning motion into smoke and spirals.
```

**看点：**中心几条随时间变化的线条/频谱花瓣，叠加反馈后形成螺旋烟雾拖尾；滑块调节旋转量。

**适用：**片头/Logo、音乐/活动、沉浸式体验

**避坑：**参数稍大就会糊成一片，要限制淡化速度。

**来源：**[w04-pulse](../gallery/index.html#w04-pulse)

### 流场与流体 · `flow-field`

生成艺术背景的主力。「幽灵光标」保证没人操作时画面也在动。

**中文写法**

由鼠标搅动的流场/流体模拟（空闲时由脚本模拟的「幽灵光标」搅动）。

**英文写法**

```text
A flow field / fluid simulation stirred by the cursor (and by a scripted ghost cursor when idle).
```

**看点：**数百条粒子沿噪声流场流动留下细线，鼠标经过处产生涡旋；无操作时幽灵光标沿曲线自动搅动。

**适用：**沉浸式体验、科技品牌首屏、片头/Logo

**来源：**[w06-neon-fluid](../gallery/index.html#w06-neon-fluid)

### 雨与光斑 · `rain-bokeh`

天气是最便宜的情绪。分层（远雨、近雨、光斑）是做出电影感的关键。

**中文写法**

两层深度的雨丝、玻璃上的雨滴、远处灯光的柔和光斑。

**英文写法**

```text
Rain streaks at two depths, raindrops on glass, and soft bokeh from distant lights.
```

**看点：**夜色背景：远处雨丝细而慢、近处雨丝粗而快、几个暖色光斑缓慢呼吸。

**适用：**故事短片、片头/Logo、品牌官网

**来源：**[v12-rain-station](../gallery/index.html#v12-rain-station)

## L4 交互

滚动、指针、状态切换、声音。视频由时间驱动，网页还可以由用户驱动。

### 固定段落 + 滚动擦洗 · `pinned-scrub`

网页的「招牌时刻」。关键词是「连续编排、不是幻灯片」，否则模型会做成几张图切换。

**中文写法**

一个固定的滚动段落（约 400vh）：由滚动擦洗驱动的一段连续编排动画，不是幻灯片。

**英文写法**

```text
A pinned scroll section (≈400vh): one continuous choreographed sequence driven by scroll scrub, not a slideshow.
```

**看点：**滚动时一个几何体按顺序拆成四块并标出 01–04，原位留虚线对位；底部刻度线上的蓝点显示擦洗位置，回滚则依次复原。

**适用：**品牌官网、产品发布页、奢侈品/高端

**避坑：**一页最多一两处，太多会让人迷失。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 拆解爆炸图 + 细线标注 · `exploded-view`

展示产品构成最直观的方式，也是硬件/奢侈品官网的高级感来源。

**中文写法**

物体拆解成零件，漂开后停在爆炸图状态，用细线标注每个零件的名称。

**英文写法**

```text
The object disassembles into its parts, which drift apart and hold in an exploded view with hairline annotation lines naming each part.
```

**看点：**一个由 5–6 个几何零件组成的物体，悬停/自动在「组装」与「爆炸」之间切换，爆炸时细线标注逐个出现。

**适用：**品牌官网、硬件产品、知识科普

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [w02-longform](../gallery/index.html#w02-longform)

### 滚动揭示（上浮淡入） · `scroll-reveal`

最通用的滚动动效。「静止时完整」防止内容因为观察器没触发而一直隐形。

**中文写法**

区块进入视口时上浮淡入，成组错峰；静止时页面内容完整。

**英文写法**

```text
Sections fade and rise in as they enter the viewport, batched with a stagger; the page is complete at rest.
```

**看点：**卡片内可滚动的迷你页面，内容块进入视口时依次上浮淡入。

**适用：**SaaS 落地页、品牌官网、长文专题

**避坑：**不要让内容初始 opacity:0 等待触发；首屏内容必须直接可见。

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass) · [w02-longform](../gallery/index.html#w02-longform)

### 滚动插值场景 · `scroll-interpolate`

滚动变成时间旅行。比切换图片更沉浸，适合讲时间、过程、变化。

**中文写法**

一个固定场景，颜色和光线随滚动进度插值变化（比如黄昏到夜晚）。

**英文写法**

```text
A sticky scene whose colors and lighting interpolate with scroll progress (e.g. dusk to night).
```

**看点：**卡片内可滚动窗口，天空渐变随滚动从黄昏过渡到夜晚，星星渐显、月亮升起。

**适用：**长文专题、品牌官网、知识科普

**来源：**[w02-longform](../gallery/index.html#w02-longform)

### 滚动绘制线条 · `draw-on-scroll`

时间线、流程、路线的标准做法。线条是视线的引导。

**中文写法**

SVG 线条随滚动自我绘制（pathLength + stroke-dashoffset），里程碑节点依次挂上。

**英文写法**

```text
An SVG line draws itself as you scroll (pathLength + stroke-dashoffset), with milestones attaching to it.
```

**看点：**卡片内可滚动窗口，一条曲线随滚动绘制，经过的节点依次点亮并出现标签。

**适用：**品牌官网、长文专题、SaaS 落地页

**来源：**[w05-escapement](../gallery/index.html#w05-escapement) · [w03-art-deco](../gallery/index.html#w03-art-deco)

### 有隐喻的阅读进度 · `progress-metaphor`

把通用组件主题化，是「为这个内容设计过」的信号。

**中文写法**

阅读进度条做成主题世界里的东西（一道光、一根线、一条引信）。

**英文写法**

```text
A reading-progress indicator styled as something from the subject's world (a beam, a thread, a fuse).
```

**看点：**滚动时顶部一道钴蓝光束随进度变长，末端发光；中央的大号衬线数字同步计数，左侧刻度尺随之滚动，表明整页在移动。

**适用：**长文专题、品牌官网

**来源：**[w02-longform](../gallery/index.html#w02-longform)

### 倾斜卡片 + 移动高光 · `tilt-glare`

最受欢迎的指针微交互。高光让倾斜有了材质。

**中文写法**

卡片朝指针方向 3D 倾斜，高光随之移动。

**英文写法**

```text
Cards tilt in 3D toward the pointer with a moving specular glare.
```

**看点：**三张空白深色卡片朝指针方向倾斜，一块柔和高光跟着指针在卡面上移动，无人操作时由钴蓝小点自动演示。

**适用：**SaaS 落地页、作品集、消费类 App

**避坑：**倾斜角度控制在 8° 以内。触屏设备关闭。

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 磁吸按钮（很轻） · `magnetic-btn`

给主要按钮一点「吸引力」。关键是「很轻」，否则像玩具。

**中文写法**

磁吸按钮，非常轻微：按钮向光标方向偏移几个像素。

**英文写法**

```text
Magnetic buttons, very subtle: the button drifts a few pixels toward the cursor.
```

**看点：**两个按钮：一个普通，一个磁吸（最多 6px 偏移 + 内部文字反向微移）；无鼠标时幽灵光标演示。

**适用：**品牌官网、作品集、SaaS 落地页

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 贴合主题的自定义光标 · `custom-cursor`

光标是用户每时每刻都看着的东西，主题化光标是极强的品牌细节。

**中文写法**

按主题设计的自定义光标；悬停在可交互元素上时收缩，并有一圈细线合拢。触屏隐藏。

**英文写法**

```text
A custom cursor drawn from the subject's world; on hover over interactive elements it contracts and a hairline circle closes around it. Hidden on touch.
```

**看点：**迷你页面上的十字准星光标，悬停到按钮时收缩并出现细圆环；无鼠标时幽灵光标演示。

**适用：**品牌官网、作品集、奢侈品/高端

**避坑：**不要影响可用性：保留系统光标的可点击区域判断。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 背景响应光标 · `cursor-reactive`

让用户感到页面在「回应」自己，但不打扰阅读。

**中文写法**

环境背景以柔和的高斯衰减向光标弯曲。

**英文写法**

```text
The ambient background bends toward the cursor with a soft Gaussian falloff.
```

**看点：**一片线条/网格背景，光标附近的线条被轻轻吸引弯曲；无鼠标时幽灵光标游走。

**适用：**品牌官网、沉浸式体验、片头/Logo

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass) · [w06-neon-fluid](../gallery/index.html#w06-neon-fluid)

### 滑动药丸切换 · `spring-toggle`

定价页月付/年付、明暗模式切换的标准高级做法。

**中文写法**

切换控件的药丸用弹簧滑动；状态变化时数值滚动过渡。

**英文写法**

```text
A toggle whose pill slides with a spring; values roll numerically when the state changes.
```

**看点：**月付/年付切换：药丸弹簧滑动，下方价格数字滚动到新值；自动每 2 秒切换一次，也可点击。

**适用：**SaaS 落地页、消费类 App

**来源：**[w01-aurora-glass](../gallery/index.html#w01-aurora-glass)

### 悬停揭示第二面 · `hover-reveal`

给好奇心一个奖励，同时节省版面。

**中文写法**

悬停时揭示第二面（背面、内部、细节），用慢速翻转或交叉淡化。

**英文写法**

```text
Hover reveals a second face (the back, the inside, the detail) with a slow flip or cross-fade.
```

**看点：**三张卡片，悬停（或自动轮播）时翻转显示背面细节；注意翻转时外层淡出而不是 3D 元素本身。

**适用：**作品集、品牌官网、电商

**避坑：**不要在 preserve-3d 元素上设 opacity，要在外层包裹元素上淡出。

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 幽灵光标自动演示 · `ghost-cursor`

预览、封面、没人操作时也要有生命。也是录制演示视频的好办法。

**中文写法**

空闲时由脚本控制的幽灵光标沿平滑路径演示交互；用户一操作就交还控制权。

**英文写法**

```text
When idle, a scripted ghost cursor demonstrates the interaction along smooth paths; control hands back to the real pointer on input.
```

**看点：**一个交互区域（按钮 + 滑块），幽灵光标自动移动、点击、拖动；鼠标移入后幽灵光标消失。

**适用：**沉浸式体验、UI 动效展示、产品演示

**来源：**[w06-neon-fluid](../gallery/index.html#w06-neon-fluid) · [v07-ui-morph](../gallery/index.html#v07-ui-morph)

### 声音驱动画面 · `audio-reactive`

不依赖任何音频文件就能做出音画同步。「未播放时也要好看」同样要写上。

**中文写法**

浏览器内用 Web Audio 合成音乐，AnalyserNode 驱动画面。只在点击后发声，并有可见的静音按钮。

**英文写法**

```text
Web Audio synthesizes the track in the browser; an AnalyserNode drives the visuals. Audio starts only after a click, with a visible mute.
```

**看点：**一圈频谱柱：默认由合成的伪频谱呼吸；点击「播放」后用 Web Audio 合成简单鼓点，频谱随真实音频跳动；有静音按钮。

**适用：**活动/发布会、音乐/活动、沉浸式体验

**来源：**[w04-pulse](../gallery/index.html#w04-pulse)

## L5 结构

把内容换掉仍然成立的时间结构或页面结构。先选骨架，再往里填内容。

### 五幕解说：痛点→方案→三步→证据→落版 · `s-five-scene`

商业解说视频最稳的骨架。每个场景一个任务，天然适配 20–30 秒。

**中文写法**

5 个场景：客户痛点、我们做什么、三步流程、一个证据、最后落版名字。

**英文写法**

```text
5 scenes: the customer's problem, what we do, how it works in 3 steps, one proof point, and the name at the end.
```

**看点：**一条时间轴分成 5 段，播放头走过时每段展示一个抽象缩略画面（问题符号、方案图形、1-2-3、大数字、Logo 位）。

**适用：**产品发布片、官网首屏视频、销售开场

**来源：**[v04-business-explainer](../gallery/index.html#v04-business-explainer)

### 卡点发布片：钩子→变 UI→转场点→一小节一动作→落版 · `s-launch-bars`

高端产品片的节奏模板。每小节只做一件事，天然避免拥挤。

**中文写法**

120 BPM 共 10 小节。第 1 小节钩子逐词落拍；第 2 小节一个词变成产品界面；转场点圆形打开进入深色场景；之后每小节一个动作；最后落版。

**英文写法**

```text
10 bars at 120 BPM. Bar 1: the hook word by word. Bar 2: a hook word morphs into the product UI. The drop: a circle opens into a dark scene. Then one move per bar. End on the logo.
```

**看点：**一条 10 格的小节时间轴，每格显示该小节的动作图标，播放头按 BPM 走过，第 3 格标注「DROP」。

**适用：**产品发布片、社媒竖屏

**来源：**[v03-high-end-product](../gallery/index.html#v03-high-end-product)

### 原理讲解：提问→模型→公式→结论 · `s-mechanism`

科普视频的骨架。关键是「公式从画面里组装」，数字和画面来自同一个模型，不会讲错。

**中文写法**

用问题开场，视觉化搭建原理，让公式从画面里自己组装出来，最后给出结论。

**英文写法**

```text
Open with the question, build the mechanism visually, let the formula assemble itself from the visuals, end on the payoff.
```

**看点：**4 段时间轴：问号 → 示意图搭建 → 符号飞入组成公式 → 结论高亮；播放头循环。

**适用：**知识科普、教程/课程

**避坑：**数值必须由同一个物理/数学模型计算，写明这一点。

**来源：**[v05-transformer](../gallery/index.html#v05-transformer) · [v06-sky-blue](../gallery/index.html#v06-sky-blue) · [v14-lab-explainer](../gallery/index.html#v14-lab-explainer)

### 尺度之旅：一镜到底 · `s-scale-journey`

适合讲「深入细节」「从整体到本质」。结构简单，冲击力强。

**中文写法**

一镜到底穿越尺度：[宏观] → [物体] → [部件] → [微观] → [最小单位]。

**英文写法**

```text
One continuous take through scales: [macro] → [object] → [part] → [micro] → [smallest].
```

**看点：**一排嵌套方框依次放大进入，每层显示尺度标签（10^0 m → 10^-15 m），播放头循环。

**适用：**知识科普、品牌官网、片头/Logo

**来源：**[v09-room-to-quarks](../gallery/index.html#v09-room-to-quarks)

### 循环周期 · `s-loop-cycle`

过程类内容（周期、工作流、生命周期）的骨架，天然可以无缝循环。

**中文写法**

3–5 个阶段构成的循环，精确回到起点，每个阶段一个小标签。

**英文写法**

```text
A cycle of 3–5 stages that returns exactly to its start, with a small label per stage.
```

**看点：**一个环形轨道分 4 段，指示点绕行，经过每段时对应标签亮起；首尾衔接。

**适用：**知识科普、社媒竖屏、网站背景

**来源：**[v19-water-cycle](../gallery/index.html#v19-water-cycle)

### 分镜表叙事 · `s-shot-list`

故事类短片最可靠的写法。模型对「景别 + 运镜 + 时间码」的理解非常准确。

**中文写法**

带时间码的编号分镜表：每个镜头写景别、运镜和动作（如 0–6.4 秒 特写 → 拉远，焦点转移）。

**英文写法**

```text
A numbered shot list with timecodes: shot size, camera move and action per shot (e.g. 0–6.4s close-up → pull back, focus shifts).
```

**看点：**分镜卡片依次翻出：镜号、时间码、景别（特写/中景/全景图标）、运镜箭头。

**适用：**故事短片、品牌短片、片头/Logo

**来源：**[v12-rain-station](../gallery/index.html#v12-rain-station)

### 招牌时刻型官网 · `s-landing-signature`

高端官网的通用页面骨架。所有动效预算集中在首屏和一个滚动段落。

**中文写法**

首屏招牌物体 → 等宽字体的低调信任条 → 三大支柱 → 一个固定滚动段落 → 预览网格 → 数字带 → 安静的引语 → 常见问题 → 最终行动按钮。

**英文写法**

```text
Hero with the signature object → a quiet credibility strip in mono → three pillars → ONE pinned scroll interlude → preview grid → numbers band → quiet quotes → FAQ → final CTA.
```

**看点：**竖页线框自动滚动，只有首屏和固定滚动段亮起钴蓝；右侧 2 / 9 与一排方块标明九个区块里只有两处用动效。

**适用：**品牌官网、硬件产品、奢侈品/高端

**来源：**[w05-escapement](../gallery/index.html#w05-escapement)

### 滚动长文专题 · `s-longread`

编辑类长文的骨架：以阅读为主，只放两个滚动高光。

**中文写法**

通栏插画首屏 → 带首字下沉和引语的章节 → 一个随滚动变化的固定场景 → 一张随滚动组装的图 → 尾注。

**英文写法**

```text
Full-bleed illustrated hero → chapters with drop cap and pull quotes → one sticky scene that changes with scroll → one figure that assembles on scroll → endnotes.
```

**看点：**一个竖长的迷你长文线框自动滚动；固定场景段颜色渐变、组装图段零件合拢，其余为文字行线框。

**适用：**长文专题、品牌故事、年度报告

**来源：**[w02-longform](../gallery/index.html#w02-longform)
