#!/usr/bin/env python3
"""动效词典 — 分层关键词体系（从 22 条已收录提示词提炼，去掉具体内容）。
输出 data/lexicon.json。每个关键词：
 id, layer, group, level, zh(名称), en(可直接粘贴的英文写法), zh_phrase(中文写法),
 what(它是什么/为什么有效), see(演示要展示什么 —— 同时是给演示构建者的规格),
 ab([不加, 加上] 两个模式标签，可选), controls(滑块，可选), when(推荐场景), avoid(避坑),
 pairs(常搭配的词 id), src(出处：片库条目 id 或来源名), scene(对参数化场景的影响，可选), builder(演示分组)
"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "src" / "lexicon"
GALLERY = "gallery/index.html"

LAYERS = [
 dict(id="L1", zh="底座", en="Foundation", tag="与内容无关，每条提示词都该有",
      what="交付形态、确定性渲染、画幅、验收方式。决定它能不能稳定出片、能不能导出成视频。"),
 dict(id="L2", zh="质感", en="Finish", tag="决定看起来是什么级别",
      what="留白与信息密度、色彩策略、字体角色、材质与光、禁用清单。同样的动画，质感词决定它像模板还是像成品。"),
 dict(id="L3", zh="运动", en="Motion", tag="决定东西怎么动",
      what="缓动与物理、节奏、转场、镜头、文字动效、生成氛围。这是「动效方向」的核心词汇。"),
 dict(id="L4", zh="交互", en="Interaction", tag="网页专属：什么在驱动动效",
      what="滚动、指针、状态切换、声音。视频由时间驱动，网页还可以由用户驱动。"),
 dict(id="L5", zh="结构", en="Structure", tag="与内容解耦的叙事骨架",
      what="把内容换掉仍然成立的时间结构或页面结构。先选骨架，再往里填内容。"),
]

GROUPS = {
 "L1": ["交付形态", "确定性渲染", "质检与导出", "画幅与平台"],
 "L2": ["信息密度", "色彩", "字体", "材质与光", "禁用清单"],
 "L3": ["缓动与物理", "节奏", "转场", "镜头", "文字动效", "生成氛围"],
 "L4": ["滚动驱动", "指针驱动", "状态反馈", "声音"],
 "L5": ["视频骨架", "网页骨架"],
}

K = []
def k(id, layer, group, zh, en, zh_phrase, what, see, when, avoid="", pairs=(), src=(), level="基础", ab=None, controls=None, scene=None, builder=None):
    K.append(dict(id=id, layer=layer, group=group, level=level, zh=zh, en=en, zh_phrase=zh_phrase, what=what, see=see,
                  ab=ab, controls=controls, when=list(when), avoid=avoid, pairs=list(pairs), src=list(src), scene=scene, builder=builder))

# ───────────────────────── L1 底座 ─────────────────────────
k("fixed-stage", "L1", "交付形态", "固定舞台，等比缩放",
  "One self-contained HTML file on a fixed 1920x1080 stage, scaled to fit the window (letterboxed), all CSS and JS inline.",
  "单个 HTML 文件，固定 1920x1080 舞台，按窗口等比缩放、留黑边，CSS/JS 全部内联。",
  "先定一个逻辑画布，再整体缩放。构图永远不会因为窗口尺寸而错位，导出视频时像素也是确定的。",
  "容器宽高持续变化：A 模式里元素随窗口重排、挤压错位；B 模式里舞台整体等比缩放、四周留边，构图不变。",
  ["产品发布片", "知识科普", "社媒竖屏", "片头/Logo"], "网页落地页不要用固定舞台，用响应式布局。",
  ["seek-t", "aspect-ratios"], ["v02-app-launch", "v03-high-end-product"], ab=["响应式重排", "固定舞台缩放"], builder="A")
k("duration-fps", "L1", "交付形态", "时长与帧率",
  "15 seconds at 60fps (900 frames).", "时长 15 秒，60fps（共 900 帧）。",
  "写明秒数和帧率，模型才能把节拍、镜头换算成帧，也决定运动是否顺滑。24fps 有电影感，60fps 适合 UI 与快速运动。",
  "同一个快速横移的物体，用滑块在 12 / 24 / 30 / 60 fps 间切换，看到阶梯感变化；下方一条帧刻度尺同步显示帧数。",
  ["产品发布片", "UI 动效展示", "社媒竖屏"], "不写帧率时模型常默认 30fps，快速运动会发涩。",
  ["subframe-blur", "on-twos"], ["v07-ui-morph", "v08-kinetic-type"],
  controls=[dict(name="fps", label="帧率", min=12, max=60, step=1, value=24, ticks=[12, 24, 30, 60])], builder="A")
k("seek-t", "L1", "确定性渲染", "seek(t) 纯函数渲染",
  "Every style is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames. Expose window.seek(t) and window.DURATION.",
  "所有样式都在 seek(t) 里由时间 t 计算：不用 CSS 过渡、不用定时器、帧与帧之间不存状态。暴露 window.seek(t) 和 window.DURATION。",
  "画面只由 t 决定，所以可以任意拖动时间线、逐帧截图导出 MP4，每次渲染结果都一样。这是「用代码做视频」的地基。",
  "一个可拖动的时间线滑块 + 一段小动画（形状移动、文字出现）。拖到任意时刻画面立刻精确对应；旁边显示 t 值。",
  ["产品发布片", "知识科普", "UI 动效展示", "片头/Logo"], "网页交互动效不需要这么严格，但凡要导出视频就必须写。",
  ["seeded-random", "loop-seam", "export-mp4"], ["v03-high-end-product", "v07-ui-morph", "v08-kinetic-type"],
  controls=[dict(name="t", label="时间 t", min=0, max=6, step=0.01, value=1.5)], level="基础", builder="A")
k("seeded-random", "L1", "确定性渲染", "固定种子随机数",
  "Use a seeded PRNG for every random value; never Math.random.", "所有随机数用固定种子的伪随机数生成器，禁止 Math.random。",
  "每帧重新调用 Math.random 会让星星、颗粒、噪点每帧跳动，导出的视频闪烁。固定种子让「随机」可复现。",
  "两块并排的星空/颗粒：A 每帧用 Math.random 重新撒点（明显闪烁）；B 用固定种子，只做平滑的呼吸闪烁。",
  ["片头/Logo", "沉浸式体验", "知识科普"], "", ["seek-t"], ["v03-high-end-product", "w01-aurora-glass"],
  ab=["Math.random", "固定种子"], builder="A")
k("loop-seam", "L1", "确定性渲染", "首尾无缝循环",
  "The last frame is the first frame, so it loops — cursor position and speed included.", "最后一帧与第一帧完全一致（包括光标位置和速度），可以无缝循环。",
  "社媒自动循环播放、网页背景视频都需要无缝接缝。只说「循环」不够，要说清首尾帧必须一致，连速度也要连续。",
  "环上的接缝刻度标出首末帧位置。A：末帧没接上首帧，红弧缺口，圆点在接缝处跳回，残影断开；B：两个记号重合，残影连续穿过接缝，底部时间尺两端同为一帧。",
  ["社媒竖屏", "UI 动效展示", "沉浸式体验"], "", ["seek-t"], ["v07-ui-morph", "v19-water-cycle"],
  ab=["有接缝", "无缝"], builder="A")
k("storyboard-first", "L1", "质检与导出", "先出分镜，再写代码",
  "Ask me for the inputs, then show me a storyboard with every timing on the beat grid before you write any code.",
  "先向我要输入，再给我一份每个时间点都对齐节拍的分镜表，确认后再写代码。",
  "在最便宜的阶段改方向：分镜错了改一行字，代码错了要重写。也让模型先想清楚节奏再动手。",
  "四个分镜格依次排开，随后收拢成一条带节拍刻度的时间线，各格按时长占宽，钴蓝播放头扫过并读出时间码。",
  ["产品发布片", "知识科普", "UI 动效展示"], "一句话试水时不用，复杂片子必用。",
  ["beat-grid", "contact-sheet"], ["v03-high-end-product", "v07-ui-morph"], builder="A")
k("contact-sheet", "L1", "质检与导出", "联系表抽帧自检",
  "Before the full render, probe 20+ frames (one per beat, or a still every 0.5s). Fix anything cluttered, overlapping or hard to read.",
  "全量渲染前抽 20 帧以上（每拍一帧或每 0.5 秒一帧）拼成联系表，修掉拥挤、重叠、看不清的地方。",
  "模型看不到动画，但能看截图。让它自己抽帧检查，最常见的文字重叠、空帧、出画就会被提前修掉。",
  "一排缩略帧被逐帧抽检，停在有问题的一帧并放大，可见两行字重叠、被红框标出，随后拉开变绿、缩回原格。",
  ["产品发布片", "知识科普", "社媒竖屏"], "", ["storyboard-first", "seek-t"], ["v03-high-end-product", "v06-sky-blue"], builder="A")
k("subframe-blur", "L1", "质检与导出", "子帧运动模糊",
  "Render 3 subframes per frame (t − 1/240s, t, t + 1/240s) and blend them with ffmpeg tmix for real motion blur at 60fps.",
  "每帧渲染 3 个子帧（t−1/240s、t、t+1/240s），用 ffmpeg tmix 混合，得到真实的运动模糊。",
  "代码渲染的画面默认每帧都锐利，快速运动会显得像幻灯片。子帧混合模拟快门，快动作立刻有电影感。",
  "一个快速甩过画面的方块/卡片：A 每帧锐利（频闪感）；B 叠加 3–5 个半透明子帧形成拖影。",
  ["产品发布片", "UI 动效展示", "片头/Logo"], "只影响导出的视频，网页实时预览里不需要。",
  ["whip-pan", "export-mp4"], ["v03-high-end-product", "v07-ui-morph"], ab=["无模糊", "子帧模糊"], level="进阶", builder="A")
k("export-mp4", "L1", "质检与导出", "导出 MP4 流程",
  "Render with Playwright: step through seek(t) frame by frame, encode with ffmpeg (libx264, crf 18, yuv420p); loudnorm audio to −14 LUFS.",
  "用 Playwright 逐帧调用 seek(t) 截图，ffmpeg 编码（libx264、crf 18、yuv420p）；音频响度标准化到 −14 LUFS。",
  "把 HTML 变成可发布的视频文件。写清编码参数，交付物就能直接上传各平台。",
  "源帧一格格截出，落进带齿孔的胶片带，最后并成一个带播放三角的视频文件；衬线大数字从 0 数到 900 帧。",
  ["产品发布片", "社媒竖屏", "片头/Logo"], "需要能跑代码的环境（Claude Code / Cowork）。", ["seek-t", "subframe-blur"],
  ["v03-high-end-product"], level="进阶", builder="A")
k("aspect-ratios", "L1", "画幅与平台", "画幅：16:9 / 9:16 / 1:1 / 2.39:1",
  "Stage 1080x1920 (9:16) for TikTok/Reels; 1920x1080 (16:9) for YouTube; 1080x1080 (1:1) for feeds; 2.39:1 letterbox for cinematic.",
  "竖屏 1080x1920（抖音/小红书）；横屏 1920x1080（B站/YouTube）；方形 1080x1080（信息流）；2.39:1 遮幅做电影感。",
  "画幅决定构图。直接写平台名，模型会自动带出画幅；写像素更精确。",
  "同一个构图（标题 + 主体 + 按钮）在 16:9 → 9:16 → 1:1 → 2.39:1 之间平滑变形，元素重新排布；角落显示当前比例。",
  ["社媒竖屏", "产品发布片", "片头/Logo"], "", ["safe-zone", "fixed-stage"], ["v18-noise-cancelling", "v12-rain-station"], builder="A")
k("safe-zone", "L1", "画幅与平台", "竖屏安全区与字号下限",
  "Keep all text inside mobile safe zones (150px top, 170px bottom, 60px sides at 1080 wide). Headlines ≥ 56px, body ≥ 36px, labels ≥ 28px.",
  "文字全部放在安全区内（1080 宽时上 150、下 170、左右 60 像素）。标题 ≥56px、正文 ≥36px、标签 ≥28px。",
  "平台的按钮、标题栏、评论区会盖住画面边缘。不写安全区，关键字常被 UI 挡住。",
  "竖屏画面上叠一层模拟的平台 UI（顶部栏、右侧按钮列、底部文案），A 模式文字被遮挡；B 模式显示安全区虚线框，文字在框内。",
  ["社媒竖屏"], "", ["aspect-ratios"], ["v18-noise-cancelling"], ab=["不设安全区", "安全区内"], builder="A")
k("reduced-motion", "L1", "画幅与平台", "尊重「减少动态」",
  "Honour prefers-reduced-motion with a calmer fallback: slow or stop ambient motion, turn big moves into fades.",
  "尊重系统的「减少动态效果」设置：环境动画放慢或停止，大幅运动改成淡入淡出。",
  "网页必备的无障碍底线，也是质量信号。好的动效在减弱后仍然成立。",
  "同一组入场动画：A 完整版（位移 + 缩放 + 视差）；B 减弱版（只有透明度淡入、背景静止）。",
  ["品牌官网", "SaaS 落地页", "长文专题"], "", ["scroll-reveal"], ["w01-aurora-glass", "w05-escapement"],
  ab=["完整动效", "减弱版"], builder="A")

# ───────────────────────── L2 质感 ─────────────────────────
k("one-idea", "L2", "信息密度", "一个镜头只讲一件事",
  "High-end minimal. One idea per shot, lots of empty space.", "高端极简。每个镜头只讲一件事，大量留白。",
  "高级感首先来自克制。一屏里元素越少，每个元素的运动越显眼、越可信。",
  "A：一屏塞满标题、三个图标、徽章、按钮同时动；B：同样内容拆成 3 个镜头依次出现，每个镜头只有一个主角和大量留白。",
  ["产品发布片", "品牌官网", "奢侈品/高端"], "信息型内容（数据汇报）要平衡，不能为留白牺牲可读。",
  ["one-accent", "slow-ease"], ["v03-high-end-product"], ab=["信息堆满", "一镜一事"], scene=dict(density="minimal"), builder="C")
k("restraint", "L2", "信息密度", "克制即设计",
  "Restraint is the design. Enormous whitespace. The pacing IS the brand.", "克制就是设计。大量留白。节奏本身就是品牌。",
  "把「慢」和「少」当成品牌资产写进去，模型会主动放慢节奏、减少装饰，而不是加更多效果。",
  "同一个标题入场：A 快速弹入 + 旋转 + 闪光；B 1.2 秒缓慢淡入上移，停留，周围大面积留白。",
  ["奢侈品/高端", "品牌官网"], "活动页、游戏类不适用。", ["slow-ease", "one-idea"], ["w05-escapement"], ab=["热闹", "克制"], builder="C")
k("one-accent", "L2", "色彩", "单一强调色",
  "One accent color only; everything else neutral. Dominant colors with sharp accents, not evenly distributed palettes.",
  "只用一个强调色，其余全部中性色。主色大面积 + 强调色点睛，而不是平均分配多种颜色。",
  "强调色越少，视线越集中。平均分配的多色方案是 AI 默认审美的典型特征。",
  "同一张 UI 卡片/画面：A 五六种颜色平均分布；B 黑白灰 + 一个强调色只用在关键按钮和数字上，视线立即聚焦。可切换 3 种强调色。",
  ["产品发布片", "SaaS 落地页", "UI 动效展示"], "", ["one-idea", "anti-slop"], ["v03-high-end-product", "v07-ui-morph"],
  ab=["多色平均", "单一强调色"], scene=dict(palette="one-accent"), builder="C")
k("type-roles", "L2", "字体", "字体分角色",
  "A high-contrast serif for display, a clean grotesk for body, a restrained monospace for specs and timecodes.",
  "展示用高对比衬线体，正文用干净的无衬线体，参数和时间码用克制的等宽字体。",
  "给每种字体一个职责，比指定具体字体名更稳定。三种角色的对比本身就构成层级和质感。",
  "同一段信息（大标题、一句说明、一行参数/时间码）：A 全用同一种无衬线；B 衬线大标题 + 无衬线正文 + 等宽参数，层级立现。",
  ["品牌官网", "奢侈品/高端", "长文专题", "知识科普"], "中文场景可写「宋体/明朝体做标题 + 黑体正文 + 等宽数字」。",
  ["type-extremes", "kinetic-type"], ["w05-escapement", "v08-kinetic-type"], ab=["一种字体", "分角色"], scene=dict(type="roles"), builder="C")
k("type-extremes", "L2", "字体", "字重与字号走极端",
  "Use extremes: 100/200 weight vs 800/900, size jumps of 3x or more — not 400 vs 600.", "字重走极端（100/200 对 800/900），字号跳 3 倍以上，而不是 400 对 600。",
  "犹豫的层级看起来平庸。极端对比让画面有张力，也让动画的主次一目了然。",
  "A：标题 32px/600 + 正文 20px/400（平淡）；B：标题 120px/900 + 细体 18px/200，对比强烈。标题做一次缓慢入场。",
  ["产品发布片", "片头/Logo", "品牌官网"], "", ["type-roles"], ["v01-showreel"], ab=["温和层级", "极端层级"], scene=dict(type="extremes"), builder="C")
k("frosted-glass", "L2", "材质与光", "毛玻璃",
  "Frosted-glass panels: backdrop-filter blur + saturate, a 1px inner highlight border, subtle grain.", "毛玻璃面板：背景模糊 + 饱和度提升、1px 内高光描边、细微颗粒。",
  "只说 glassmorphism 往往只得到半透明白块。拆成模糊、饱和、内高光、颗粒四个要素，质感才对。",
  "彩色流动背景上一块玻璃面板：A 只有半透明白色；B 模糊 + 饱和 + 1px 高光边 + 颗粒，背景色透过来。",
  ["SaaS 落地页", "消费类 App", "沉浸式体验"], "背景没有色彩变化时毛玻璃看不出来，要配有氛围的背景。",
  ["layered-atmosphere", "tilt-glare"], ["w01-aurora-glass"], ab=["半透明白", "四要素毛玻璃"], scene=dict(texture="glass"), builder="C")
k("print-texture", "L2", "材质与光", "印刷质感：纸纹、网点、有限油墨",
  "Limited ink palette, halftone dots and paper grain, engraved-diagram lines — like a printed page.", "有限油墨配色、半色调网点、纸张颗粒、雕版式线条，像印刷品。",
  "给数字画面加上物理介质的痕迹，立刻脱离「屏幕默认感」，适合复古、科普、编辑风。",
  "同一张示意图：A 纯平面矢量；B 米色纸底 + 网点阴影 + 纸纹 + 两三种油墨色，像旧教科书插图。",
  ["知识科普", "长文专题", "品牌官网"], "", ["type-roles"], ["v06-sky-blue", "w02-longform"], ab=["纯矢量", "印刷质感"], scene=dict(texture="halftone"), builder="C")
k("layered-atmosphere", "L2", "材质与光", "有层次的氛围背景",
  "Create atmosphere and depth rather than solid colors: layer gradients, soft noise, a vignette, a slow ambient drift.",
  "背景要有氛围和纵深，不用纯色：叠加渐变、柔和噪点、暗角、缓慢的环境漂移。",
  "纯色背景让前景像贴在上面。有层次的背景让画面有空气感，而且几乎不增加信息负担。",
  "同一行标题：A 纯色背景；B 多层柔和渐变缓慢漂移 + 细噪点 + 暗角。",
  ["品牌官网", "片头/Logo", "沉浸式体验"], "氛围不能抢前景，保持低对比。", ["frosted-glass", "aurora"], ["w01-aurora-glass"],
  ab=["纯色", "有层次"], scene=dict(texture="grain"), builder="C")
k("metal-sheen", "L2", "材质与光", "金属/箔面光泽扫过",
  "A foil-like gradient clipped to text (background-clip: text) sweeping across headings; a faint metal sheen that follows the cursor.",
  "箔面渐变裁切在文字上（background-clip:text），光泽定时扫过标题；金属高光跟随鼠标。",
  "一道移动的高光就能暗示材质。比整片金色渐变克制得多。",
  "一行大标题：一道窄窄的高光带周期性扫过；鼠标悬停时高光跟随指针位置。",
  ["奢侈品/高端", "品牌官网", "活动/发布会"], "扫光频率要低（3–5 秒一次），太频繁很廉价。", ["type-roles", "tilt-glare"], ["w03-art-deco"], builder="C")
k("studio-light-3d", "L2", "材质与光", "3D 摄影棚布光",
  "Soft key light, env-map reflections, ACES filmic tone mapping, a shallow depth-of-field feel; materials named precisely (polished steel, brushed metal).",
  "柔和主光、环境贴图反射、ACES 电影色调映射、浅景深感；材质写具体（抛光钢、拉丝金属）。",
  "3D 场景好不好看主要看光和材质。点名布光方式和材质，比说「逼真」「高级」有效得多。",
  "一个缓慢旋转的简单 3D 物体（如圆环结/齿轮）：A 默认平光、塑料感；B 主光 + 环境反射 + 色调映射，金属质感。（three.js r134）",
  ["品牌官网", "奢侈品/高端", "产品发布片"], "", ["parallax-depth", "orbit-drift"], ["w05-escapement", "v09-room-to-quarks"],
  ab=["默认平光", "摄影棚布光"], level="进阶", builder="C")
k("anti-slop", "L2", "禁用清单", "禁用清单（去 AI 味）",
  "Banned: bouncy easing, particle bursts, shockwave rings, glows, lens flares, RGB split, camera shake, typewriter text, purple gradients on white, Inter as the display face.",
  "禁用：弹跳缓动、粒子爆炸、冲击波圈、光晕、镜头光斑、RGB 分离、镜头抖动、打字机文字、白底紫渐变、Inter 做标题字。",
  "模型的默认审美会往这些效果上靠。明确禁用比描述想要什么更能拉开质感差距。",
  "同一个标题镜头：A 堆满弹跳、光晕、粒子爆炸、镜头抖动、紫色渐变；B 去掉全部，只剩干净的遮罩揭示。",
  ["产品发布片", "品牌官网", "SaaS 落地页", "UI 动效展示"], "禁用清单按场景增减：游戏/活动页可保留部分特效。",
  ["one-accent", "spring"], ["v03-high-end-product", "v07-ui-morph"], ab=["AI 默认", "禁用之后"], scene=dict(slop=False), builder="C")

# ───────────────────────── L3 运动 ─────────────────────────
k("spring", "L3", "缓动与物理", "弹簧缓动，轻微过冲",
  "Springs everywhere, a tiny overshoot at most.", "全部用弹簧缓动，最多轻微过冲。",
  "弹簧有质量和惯性，比 ease-in-out 更像真实物体。「轻微过冲」同时排除了廉价的弹跳。",
  "三个小球同时从左到右：linear、ease-in-out、spring（轻微过冲）。点击画面重新触发；下方画出三条缓动曲线。",
  ["UI 动效展示", "SaaS 落地页", "产品发布片"], "不要写 bouncy，过冲超过 10% 就显得廉价。",
  ["dual-spring", "shape-morph"], ["v07-ui-morph"], controls=[dict(name="overshoot", label="过冲", min=0, max=0.3, step=0.01, value=0.06)],
  scene=dict(easing="spring"), builder="B")
k("slow-ease", "L3", "缓动与物理", "慢缓动，不弹不闪",
  "Slow easings (0.9–1.4s). Nothing bounces. Nothing flashes.", "慢缓动（0.9–1.4 秒）。不弹跳，不闪烁。",
  "时长本身传递价值感：越贵的东西动得越慢。适合奢侈品、品牌站、长文。",
  "两条细线上的圆点赛跑：0.3 秒与慢缓动时长（滑块 0.2–2 秒）对比；每 0.1 秒留一道刻度，快线刻度挤在一起，慢线均匀展开。",
  ["奢侈品/高端", "品牌官网", "长文专题"], "UI 反馈（点击、切换）不要超过 0.3 秒，慢缓动只用于入场和叙事。",
  ["restraint", "scroll-reveal"], ["w05-escapement"], controls=[dict(name="dur", label="时长(秒)", min=0.2, max=2, step=0.05, value=1.2)],
  scene=dict(easing="slow"), builder="B")
k("expo-out", "L3", "缓动与物理", "快起慢收（expo out）",
  "Ease-out expo: fast start, long soft landing.", "指数缓出：起步快，落地长而柔。",
  "元素像被「推」进来然后平稳停下，是界面和标题入场最通用的高级缓动。",
  "一组标题行依次滑入：左边 ease-in（慢起急停，别扭）；右边 expo-out（利落）。",
  ["SaaS 落地页", "产品发布片", "UI 动效展示"], "", ["stagger", "masked-reveal"], ["v02-app-launch"], ab=["ease-in", "expo-out"], scene=dict(easing="expo"), builder="B")
k("dual-spring", "L3", "缓动与物理", "双弹簧拉伸",
  "The indicator's two edges ride different springs, so the leading edge stretches ahead of the trailing one.", "指示条的前后两条边用不同的弹簧，前沿先到、后沿跟上，形成拉伸。",
  "Tab 指示条、开关滑块的「液体感」就来自这个技巧，一句话写清楚模型就能做出来。",
  "一排 4 个标签页，指示条自动在标签间移动：A 整体平移；B 前沿先冲出、后沿追上，拉伸再收回。可点击标签。",
  ["UI 动效展示", "SaaS 落地页"], "", ["spring", "spring-toggle"], ["v07-ui-morph"], ab=["整体平移", "双弹簧拉伸"], level="进阶", builder="B")
k("on-twos", "L3", "缓动与物理", "一拍二（手作感）",
  "Motion on twos (24fps with 2-frame holds) for a hand-made feel.", "一拍二：24fps 下每张画面停 2 帧，做出手绘动画感。",
  "刻意降低运动帧率，画面立刻有手作、定格动画的温度。适合童趣、复古、插画风。",
  "一个钟摆圆盘来回摆动。A：60fps 丝滑；B：12fps 一拍二，弧线上标出保持帧的刻度，留下前两帧的淡影，轮廓轻微抖动。",
  ["片头/Logo", "知识科普", "故事短片"], "UI 与数据类内容不要用。", ["print-texture"], ["v16-bedtime-opener"], ab=["丝滑", "一拍二"], scene=dict(onTwos=True), level="进阶", builder="B")
k("beat-grid", "L3", "节奏", "节拍网格与卡点",
  "120 BPM, 2 seconds per bar. Every cut sits on a downbeat, every UI hit on a beat.", "120 BPM，每小节 2 秒。每个剪辑点落在强拍，每个界面动作落在拍子上。",
  "给时间一个网格，所有事件对齐它，画面就有音乐性，即使没有配乐也能感到节奏。",
  "一个节拍器（4 拍闪烁）+ 一串镜头切换：A 切换时刻随机、偏离拍子；B 全部落在强拍。可调 BPM。",
  ["产品发布片", "社媒竖屏", "UI 动效展示"], "没有配乐也可以用，但要统一一个 BPM。",
  ["word-on-beat", "no-dead-time", "storyboard-first"], ["v03-high-end-product", "v07-ui-morph"],
  controls=[dict(name="bpm", label="BPM", min=80, max=160, step=1, value=120)], scene=dict(onBeat=True), builder="B")
k("word-on-beat", "L3", "节奏", "逐词落拍",
  "The hook lands word by word on the beats.", "开场钩子一词一拍地落下。",
  "把一句话拆成节拍，观众被节奏带着读完，开场 2 秒就抓住注意力。",
  "一句 3–4 个词的短句，每个词在节拍上用遮罩/位移落下，节拍点在下方闪烁。",
  ["产品发布片", "社媒竖屏", "片头/Logo"], "", ["beat-grid", "masked-reveal"], ["v03-high-end-product"], builder="B")
k("stagger", "L3", "节奏", "错峰入场",
  "Staggered reveals: children enter one after another with a 60–90ms offset.", "错峰入场：子元素依次出现，间隔 60–90 毫秒。",
  "同时出现显得生硬，错峰让视线有路径。间隔是关键参数：太小像同时，太大像卡顿。",
  "3×3 小方块按顺序升起入场，最前沿一格短暂带钴蓝，错峰节奏像一个移动的点；滑块调节间隔 0–300ms，点击重播。",
  ["SaaS 落地页", "产品发布片", "数据汇报"], "", ["expo-out", "orchestrated-load"], ["w01-aurora-glass"],
  controls=[dict(name="gap", label="间隔(ms)", min=0, max=300, step=10, value=70)], scene=dict(stagger=True), builder="B")
k("no-dead-time", "L3", "节奏", "每一拍都有事发生",
  "Something happens on every beat. No dead time, no frozen frames.", "每一拍都有事情发生。没有空档，没有冻结画面。",
  "代码动画最常见的问题是某几秒画面静止。这句话让模型主动检查并填满时间线。",
  "上方一条时间线把「静止」区段标红；A 模式有 2 秒空档（画面冻结，红色区段）；B 模式每拍都有微小变化。",
  ["产品发布片", "社媒竖屏"], "「每拍有事」不等于「每拍都是大动作」，可以是微小的次级运动。", ["beat-grid"], ["v07-ui-morph"], ab=["有空档", "每拍有事"], builder="B")
k("orchestrated-load", "L3", "节奏", "一次编排好的入场",
  "One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.", "一次精心编排的页面入场（错峰揭示），胜过到处零散的微交互。",
  "把动效预算集中在一个高光时刻。零散的小动画会互相抢注意力。",
  "一个迷你网页首屏：A 各元素各自随机弹动、闪烁；B 标题→副标题→按钮→图片按顺序一次入场后安静下来。点击重播。",
  ["SaaS 落地页", "品牌官网"], "", ["stagger", "one-idea"], ["w01-aurora-glass"], ab=["零散", "编排"], builder="B")
k("masked-reveal", "L3", "转场", "遮罩揭示",
  "Masked type reveals: each line rises from behind an invisible mask.", "遮罩文字揭示：每一行从看不见的遮罩后升起。",
  "文字像从缝里被推出来，比淡入更有力、更「设计」。标题入场的首选。",
  "三行大字依次从各自的遮罩下方升起；A 为普通淡入对比。",
  ["产品发布片", "品牌官网", "片头/Logo"], "", ["expo-out", "word-on-beat"], ["v03-high-end-product"], ab=["淡入", "遮罩揭示"], scene=dict(transition="masked"), builder="B")
k("match-cut", "L3", "转场", "匹配剪辑",
  "Match cuts: measure element positions at runtime so a shape in one shot continues as a shape in the next.", "匹配剪辑：运行时测量元素位置，让上一镜的形状在下一镜里延续成另一个形状。",
  "镜头切了，但视线没断。最能体现「设计过」的转场。",
  "一个圆在镜头 1 是太阳，切到镜头 2 成为按钮，切到镜头 3 成为头像；位置和大小连续。",
  ["产品发布片", "片头/Logo"], "", ["shape-morph", "zoom-to-fill"], ["v03-high-end-product"], scene=dict(transition="match"), level="进阶", builder="B")
k("shape-morph", "L3", "转场", "一个形体不切镜",
  "One shape, never cut: every state is the same element morphing its size, radius and color while its content swaps with a short blur.",
  "一个形体不切镜：每个状态都是同一个元素改变尺寸、圆角和颜色，内容用短暂模糊切换。",
  "连续感极强，适合讲一个产品的多个功能或状态。UI 动效作品的经典手法。",
  "一个圆角矩形依次变成按钮 → 加载圈 → 对勾 → 胶囊条 → 卡片，内容以短模糊切换，循环。",
  ["UI 动效展示", "产品发布片"], "内容切换要有独立的进出时间，否则文字会叠在一起。", ["spring", "match-cut"], ["v07-ui-morph"], builder="B")
k("iris-open", "L3", "转场", "从元素里打开的圆形转场",
  "The drop: a circle opens out of the button into a dark scene.", "转场点：一个圆从按钮里扩张开，进入深色场景。",
  "转场从画面里的一个元素生长出来，比全屏擦除更有因果感。常用于「点击后进入」。",
  "一个按钮被光标点击，圆形从按钮位置扩散覆盖全屏，进入深色新场景；循环。",
  ["产品发布片", "SaaS 落地页"], "", ["match-cut", "beat-grid"], ["v03-high-end-product"], scene=dict(transition="iris"), builder="B")
k("whip-pan", "L3", "转场", "带模糊的甩镜",
  "A motion-blurred whip onto the hero element.", "带运动模糊的甩镜，甩到主角元素上。",
  "极快的横移加拖影，制造能量和强调。一支片子用一两次即可。",
  "一排卡片横向快速甩过（带拖影），急停在中间主卡片上，主卡轻微放大。",
  ["产品发布片", "片头/Logo", "社媒竖屏"], "不能多用，也不要和镜头抖动混用。", ["subframe-blur", "push-cut"], ["v03-high-end-product"], scene=dict(transition="whip"), builder="B")
k("push-cut", "L3", "转场", "推进硬切",
  "Big stats on push cuts: each cut lands with a slight scale push on the beat.", "大数字用推进硬切：每次切换在拍子上伴随轻微放大推进。",
  "硬切干脆，加一点推进就有冲击力，适合一连串数字或关键词。",
  "三个大数字依次硬切出现，每次切换时画面从 1.06 缩放到 1.0，落在节拍上。",
  ["产品发布片", "数据汇报", "社媒竖屏"], "", ["counter-roll", "beat-grid"], ["v03-high-end-product"], scene=dict(transition="push"), builder="B")
k("material-wipe", "L3", "转场", "材质化擦除",
  "Scene changes use a wipe shaped like the subject's material (a liquid pour, a paper fold, a light sweep).", "场景切换用与主题材质相关的擦除（液体倾倒、纸张翻折、光扫过）。",
  "把转场和内容的材质绑定，转场就成了叙事的一部分，而不是通用特效。",
  "纸色与夜色两个大号数字场景之间，交替用“液体波浪边缘”和“光扫”擦除切换，边缘只有一道钴蓝细线。",
  ["品牌官网", "产品发布片", "知识科普"], "", ["one-accent"], ["v04-business-explainer"], builder="B")

k("push-in-journey", "L3", "镜头", "一镜到底尺度推进",
  "One continuous push-in: starts at [A], zooms into [B], then [C], and finally [D] — cross-fade scenes at matched framing so it reads as one shot.",
  "一镜到底推进：从 [A] 推进到 [B]，再到 [C]，最后到 [D]；在匹配构图处交叉淡化，看起来是一个镜头。",
  "尺度变化本身就是叙事。关键写法是「在匹配构图处交叉淡化」，否则会变成几段硬切。",
  "嵌套的细线画幅持续推近，每层在匹配构图处淡入下一层；四角裁切标记不动，左下大字显示当前放大倍数。",
  ["知识科普", "品牌官网", "片头/Logo"], "", ["zoom-to-fill", "match-cut"], ["v09-room-to-quarks"], level="进阶", builder="C")
k("zoom-to-fill", "L3", "镜头", "镜头推到状态填满画面",
  "The camera zooms so each state fills the frame.", "镜头缩放，让每个状态都填满画面。",
  "小组件在大画面里显得空。让镜头跟着主角缩放，每个状态都是特写。",
  "一个小 UI 组件在画面中依次变化：A 镜头固定（组件很小）；B 镜头推近让组件始终占画面 60%。",
  ["UI 动效展示", "产品发布片"], "", ["shape-morph"], ["v07-ui-morph"], ab=["固定镜头", "推到填满"], scene=dict(camera="zoom"), builder="C")
k("parallax-depth", "L3", "镜头", "视差纵深",
  "Mouse parallax: layers move at different depths; the scene tilts gently toward the pointer.", "鼠标视差：不同层以不同深度移动，场景轻轻朝指针倾斜。",
  "最便宜的 3D 感。前后层移动量的差异让平面有了纵深。",
  "4 层剪影（远山、中景、近景、前景文字）随鼠标移动产生视差；无鼠标时自动缓慢漂移。",
  ["品牌官网", "沉浸式体验", "片头/Logo"], "位移量要小，前景最多十几像素。", ["layered-atmosphere", "tilt-glare"], ["w05-escapement", "v12-rain-station"], scene=dict(camera="parallax"), builder="C")
k("follow-cam", "L3", "镜头", "跟随镜头",
  "The camera follows the moving head of the line, with a gentle zoom.", "镜头跟随运动线条的前端，并轻微缩放。",
  "路径、流程、增长曲线的动画里，让镜头跟着「正在发生的地方」，观众不用自己找。",
  "一条路线在大地图/网格上画出，镜头始终跟随线头平移，并在途经点轻微推近。",
  ["数据汇报", "知识科普", "产品发布片"], "", ["counter-roll"], ["v10-map-route"], builder="C")
k("rack-focus", "L3", "镜头", "景深与移焦",
  "2.5D layered parallax with depth of field; focus shifts from the foreground to the subject.", "2.5D 分层视差加景深；焦点从前景移到主体。",
  "电影语言里最有情绪的手法之一。画面分层后，模糊程度的变化就能引导视线。",
  "前景（雨滴/枝叶）、主体（人物剪影）、背景（灯光光斑）三层；焦点在前景与主体之间来回移动，模糊程度随之变化。",
  ["故事短片", "品牌官网", "片头/Logo"], "", ["parallax-depth", "rain-bokeh"], ["v12-rain-station"], level="进阶", builder="C")
k("orbit-drift", "L3", "镜头", "缓慢环绕漂移",
  "A slow auto camera drift orbiting the subject; multiple preset views the user can switch.", "镜头缓慢自动环绕主体漂移；提供几个可切换的预设机位。",
  "3D 场景静止时像截图。缓慢漂移让场景「活着」，预设机位让用户不迷路。",
  "线框柱与方块缓慢环绕漂移，地面有网格与轨道环，柱顶一个钴蓝点；三个机位按钮可切换，平滑过渡。",
  ["沉浸式体验", "品牌官网", "游戏/沉浸"], "", ["studio-light-3d"], ["w07-sakura-valley"], level="进阶", builder="C")

k("kinetic-type", "L3", "文字动效", "文字即结构",
  "Kinetic typography: every line changes the architecture of the frame; later words stand on what earlier words built.", "动态排版：每一句都改变画面的结构，后面的词站在前面的词搭起的结构上。",
  "文字不只是出现，而是占据、支撑、推开空间。适合宣言、金句、品牌口号。",
  "4 个词依次入场：横向的大词成为「地面」，竖排词成为「柱子」，最后一句落在它们搭起的结构上。",
  ["片头/Logo", "活动/发布会", "社媒竖屏"], "", ["type-extremes", "type-roles"], ["v08-kinetic-type"], builder="C")
k("counter-roll", "L3", "文字动效", "数字滚动计数",
  "Numbers count up with an ease-out and tabular digits; units settle last.", "数字用缓出曲线滚动计数，等宽数字，单位最后落定。",
  "数字从 0 涨到目标值，比直接显示更有分量。等宽数字避免跳动。",
  "三个统计数字从 0 滚动到目标值（缓出），单位在最后淡入；A 为非等宽数字（抖动）对比。",
  ["数据汇报", "产品发布片", "SaaS 落地页"], "数字必须来自真实数据，别让模型编。", ["push-cut", "stagger"], ["w05-escapement", "v03-high-end-product"], ab=["非等宽", "等宽缓出"], builder="C")
k("light-on-text", "L3", "文字动效", "光照亮文字",
  "A beam sweeps across the headline and actually lights it: a lit copy of the text is clipped to the beam shape every frame.", "一道光扫过标题并真正照亮文字：每帧把「亮版文字」裁切到光束形状里。",
  "光不只是叠在文字上，而是让文字在光里显形。需要点名「裁切到光束形状」的实现方式。",
  "深色背景上的标题，一道锥形光束来回扫过，被照到的部分文字变亮变暖。",
  ["长文专题", "片头/Logo", "品牌官网"], "", ["metal-sheen", "layered-atmosphere"], ["w02-longform"], level="进阶", builder="C")

k("aurora", "L3", "生成氛围", "极光飘带",
  "Slow-drifting aurora ribbons on canvas: layered sine-deformed gradient bands, additive blending, very soft.", "Canvas 上缓慢飘动的极光带：多层正弦变形的渐变带，叠加混合，非常柔和。",
  "点名「正弦变形 + 叠加混合 + 非常柔和」，模型就能画出高质量的极光而不是彩色条纹。",
  "深色背景上 3 条极光带缓慢飘动，鼠标附近的极光轻微弯曲；可切换配色。",
  ["消费类 App", "片头/Logo", "沉浸式体验"], "", ["layered-atmosphere", "cursor-reactive"], ["w01-aurora-glass"], builder="D")
k("feedback-trail", "L3", "生成氛围", "画布反馈拖尾",
  "Canvas feedback: each frame redraws the previous frame slightly zoomed, rotated and faded, turning motion into smoke and spirals.", "画布反馈：每帧把上一帧略微放大、旋转、淡化后重绘，让运动变成烟雾和螺旋。",
  "一行实现，效果极强。适合音乐可视化、片头、氛围背景。",
  "中心几条随时间变化的线条/频谱花瓣，叠加反馈后形成螺旋烟雾拖尾；滑块调节旋转量。",
  ["片头/Logo", "音乐/活动", "沉浸式体验"], "参数稍大就会糊成一片，要限制淡化速度。", ["audio-reactive"], ["w04-pulse"],
  controls=[dict(name="rot", label="旋转量", min=0, max=0.03, step=0.001, value=0.008)], builder="D")
k("flow-field", "L3", "生成氛围", "流场与流体",
  "A flow field / fluid simulation stirred by the cursor (and by a scripted ghost cursor when idle).", "由鼠标搅动的流场/流体模拟（空闲时由脚本模拟的「幽灵光标」搅动）。",
  "生成艺术背景的主力。「幽灵光标」保证没人操作时画面也在动。",
  "数百条粒子沿噪声流场流动留下细线，鼠标经过处产生涡旋；无操作时幽灵光标沿曲线自动搅动。",
  ["沉浸式体验", "科技品牌首屏", "片头/Logo"], "", ["ghost-cursor", "cursor-reactive"], ["w06-neon-fluid"], builder="D")
k("rain-bokeh", "L3", "生成氛围", "雨与光斑",
  "Rain streaks at two depths, raindrops on glass, and soft bokeh from distant lights.", "两层深度的雨丝、玻璃上的雨滴、远处灯光的柔和光斑。",
  "天气是最便宜的情绪。分层（远雨、近雨、光斑）是做出电影感的关键。",
  "夜色背景：远处雨丝细而慢、近处雨丝粗而快、几个暖色光斑缓慢呼吸。",
  ["故事短片", "片头/Logo", "品牌官网"], "", ["rack-focus", "layered-atmosphere"], ["v12-rain-station"], builder="D")

# ───────────────────────── L4 交互 ─────────────────────────
k("pinned-scrub", "L4", "滚动驱动", "固定段落 + 滚动擦洗",
  "A pinned scroll section (≈400vh): one continuous choreographed sequence driven by scroll scrub, not a slideshow.", "一个固定的滚动段落（约 400vh）：由滚动擦洗驱动的一段连续编排动画，不是幻灯片。",
  "网页的「招牌时刻」。关键词是「连续编排、不是幻灯片」，否则模型会做成几张图切换。",
  "滚动时一个几何体按顺序拆成四块并标出 01–04，原位留虚线对位；底部刻度线上的蓝点显示擦洗位置，回滚则依次复原。",
  ["品牌官网", "产品发布页", "奢侈品/高端"], "一页最多一两处，太多会让人迷失。", ["exploded-view", "slow-ease"], ["w05-escapement"], builder="D")
k("exploded-view", "L4", "滚动驱动", "拆解爆炸图 + 细线标注",
  "The object disassembles into its parts, which drift apart and hold in an exploded view with hairline annotation lines naming each part.", "物体拆解成零件，漂开后停在爆炸图状态，用细线标注每个零件的名称。",
  "展示产品构成最直观的方式，也是硬件/奢侈品官网的高级感来源。",
  "一个由 5–6 个几何零件组成的物体，悬停/自动在「组装」与「爆炸」之间切换，爆炸时细线标注逐个出现。",
  ["品牌官网", "硬件产品", "知识科普"], "", ["pinned-scrub", "type-roles"], ["w05-escapement", "w02-longform"], builder="D")
k("scroll-reveal", "L4", "滚动驱动", "滚动揭示（上浮淡入）",
  "Sections fade and rise in as they enter the viewport, batched with a stagger; the page is complete at rest.", "区块进入视口时上浮淡入，成组错峰；静止时页面内容完整。",
  "最通用的滚动动效。「静止时完整」防止内容因为观察器没触发而一直隐形。",
  "卡片内可滚动的迷你页面，内容块进入视口时依次上浮淡入。",
  ["SaaS 落地页", "品牌官网", "长文专题"], "不要让内容初始 opacity:0 等待触发；首屏内容必须直接可见。", ["stagger", "reduced-motion"], ["w01-aurora-glass", "w02-longform"], builder="D")
k("scroll-interpolate", "L4", "滚动驱动", "滚动插值场景",
  "A sticky scene whose colors and lighting interpolate with scroll progress (e.g. dusk to night).", "一个固定场景，颜色和光线随滚动进度插值变化（比如黄昏到夜晚）。",
  "滚动变成时间旅行。比切换图片更沉浸，适合讲时间、过程、变化。",
  "卡片内可滚动窗口，天空渐变随滚动从黄昏过渡到夜晚，星星渐显、月亮升起。",
  ["长文专题", "品牌官网", "知识科普"], "", ["pinned-scrub", "layered-atmosphere"], ["w02-longform"], builder="D")
k("draw-on-scroll", "L4", "滚动驱动", "滚动绘制线条",
  "An SVG line draws itself as you scroll (pathLength + stroke-dashoffset), with milestones attaching to it.", "SVG 线条随滚动自我绘制（pathLength + stroke-dashoffset），里程碑节点依次挂上。",
  "时间线、流程、路线的标准做法。线条是视线的引导。",
  "卡片内可滚动窗口，一条曲线随滚动绘制，经过的节点依次点亮并出现标签。",
  ["品牌官网", "长文专题", "SaaS 落地页"], "", ["scroll-reveal"], ["w05-escapement", "w03-art-deco"], builder="D")
k("progress-metaphor", "L4", "滚动驱动", "有隐喻的阅读进度",
  "A reading-progress indicator styled as something from the subject's world (a beam, a thread, a fuse).", "阅读进度条做成主题世界里的东西（一道光、一根线、一条引信）。",
  "把通用组件主题化，是「为这个内容设计过」的信号。",
  "滚动时顶部一道钴蓝光束随进度变长，末端发光；中央的大号衬线数字同步计数，左侧刻度尺随之滚动，表明整页在移动。",
  ["长文专题", "品牌官网"], "", ["scroll-reveal"], ["w02-longform"], builder="D")
k("tilt-glare", "L4", "指针驱动", "倾斜卡片 + 移动高光",
  "Cards tilt in 3D toward the pointer with a moving specular glare.", "卡片朝指针方向 3D 倾斜，高光随之移动。",
  "最受欢迎的指针微交互。高光让倾斜有了材质。",
  "三张空白深色卡片朝指针方向倾斜，一块柔和高光跟着指针在卡面上移动，无人操作时由钴蓝小点自动演示。",
  ["SaaS 落地页", "作品集", "消费类 App"], "倾斜角度控制在 8° 以内。触屏设备关闭。", ["frosted-glass", "metal-sheen"], ["w01-aurora-glass"], builder="D")
k("magnetic-btn", "L4", "指针驱动", "磁吸按钮（很轻）",
  "Magnetic buttons, very subtle: the button drifts a few pixels toward the cursor.", "磁吸按钮，非常轻微：按钮向光标方向偏移几个像素。",
  "给主要按钮一点「吸引力」。关键是「很轻」，否则像玩具。",
  "两个按钮：一个普通，一个磁吸（最多 6px 偏移 + 内部文字反向微移）；无鼠标时幽灵光标演示。",
  ["品牌官网", "作品集", "SaaS 落地页"], "", ["spring"], ["w05-escapement"], builder="D")
k("custom-cursor", "L4", "指针驱动", "贴合主题的自定义光标",
  "A custom cursor drawn from the subject's world; on hover over interactive elements it contracts and a hairline circle closes around it. Hidden on touch.",
  "按主题设计的自定义光标；悬停在可交互元素上时收缩，并有一圈细线合拢。触屏隐藏。",
  "光标是用户每时每刻都看着的东西，主题化光标是极强的品牌细节。",
  "迷你页面上的十字准星光标，悬停到按钮时收缩并出现细圆环；无鼠标时幽灵光标演示。",
  ["品牌官网", "作品集", "奢侈品/高端"], "不要影响可用性：保留系统光标的可点击区域判断。", ["magnetic-btn"], ["w05-escapement"], level="进阶", builder="D")
k("cursor-reactive", "L4", "指针驱动", "背景响应光标",
  "The ambient background bends toward the cursor with a soft Gaussian falloff.", "环境背景以柔和的高斯衰减向光标弯曲。",
  "让用户感到页面在「回应」自己，但不打扰阅读。",
  "一片线条/网格背景，光标附近的线条被轻轻吸引弯曲；无鼠标时幽灵光标游走。",
  ["品牌官网", "沉浸式体验", "片头/Logo"], "", ["aurora", "flow-field"], ["w01-aurora-glass", "w06-neon-fluid"], builder="D")
k("spring-toggle", "L4", "状态反馈", "滑动药丸切换",
  "A toggle whose pill slides with a spring; values roll numerically when the state changes.", "切换控件的药丸用弹簧滑动；状态变化时数值滚动过渡。",
  "定价页月付/年付、明暗模式切换的标准高级做法。",
  "月付/年付切换：药丸弹簧滑动，下方价格数字滚动到新值；自动每 2 秒切换一次，也可点击。",
  ["SaaS 落地页", "消费类 App"], "", ["spring", "counter-roll"], ["w01-aurora-glass"], builder="D")
k("hover-reveal", "L4", "状态反馈", "悬停揭示第二面",
  "Hover reveals a second face (the back, the inside, the detail) with a slow flip or cross-fade.", "悬停时揭示第二面（背面、内部、细节），用慢速翻转或交叉淡化。",
  "给好奇心一个奖励，同时节省版面。",
  "三张卡片，悬停（或自动轮播）时翻转显示背面细节；注意翻转时外层淡出而不是 3D 元素本身。",
  ["作品集", "品牌官网", "电商"], "不要在 preserve-3d 元素上设 opacity，要在外层包裹元素上淡出。", ["tilt-glare"], ["w05-escapement"], builder="D")
k("ghost-cursor", "L4", "状态反馈", "幽灵光标自动演示",
  "When idle, a scripted ghost cursor demonstrates the interaction along smooth paths; control hands back to the real pointer on input.", "空闲时由脚本控制的幽灵光标沿平滑路径演示交互；用户一操作就交还控制权。",
  "预览、封面、没人操作时也要有生命。也是录制演示视频的好办法。",
  "一个交互区域（按钮 + 滑块），幽灵光标自动移动、点击、拖动；鼠标移入后幽灵光标消失。",
  ["沉浸式体验", "UI 动效展示", "产品演示"], "", ["flow-field", "cursor-reactive"], ["w06-neon-fluid", "v07-ui-morph"], builder="D")
k("audio-reactive", "L4", "声音", "声音驱动画面",
  "Web Audio synthesizes the track in the browser; an AnalyserNode drives the visuals. Audio starts only after a click, with a visible mute.",
  "浏览器内用 Web Audio 合成音乐，AnalyserNode 驱动画面。只在点击后发声，并有可见的静音按钮。",
  "不依赖任何音频文件就能做出音画同步。「未播放时也要好看」同样要写上。",
  "一圈频谱柱：默认由合成的伪频谱呼吸；点击「播放」后用 Web Audio 合成简单鼓点，频谱随真实音频跳动；有静音按钮。",
  ["活动/发布会", "音乐/活动", "沉浸式体验"], "", ["feedback-trail", "beat-grid"], ["w04-pulse"], level="进阶", builder="D")

# ───────────────────────── L5 结构 ─────────────────────────
k("s-five-scene", "L5", "视频骨架", "五幕解说：痛点→方案→三步→证据→落版",
  "5 scenes: the customer's problem, what we do, how it works in 3 steps, one proof point, and the name at the end.", "5 个场景：客户痛点、我们做什么、三步流程、一个证据、最后落版名字。",
  "商业解说视频最稳的骨架。每个场景一个任务，天然适配 20–30 秒。",
  "一条时间轴分成 5 段，播放头走过时每段展示一个抽象缩略画面（问题符号、方案图形、1-2-3、大数字、Logo 位）。",
  ["产品发布片", "官网首屏视频", "销售开场"], "", ["one-idea", "material-wipe"], ["v04-business-explainer"], builder="A")
k("s-launch-bars", "L5", "视频骨架", "卡点发布片：钩子→变 UI→转场点→一小节一动作→落版",
  "10 bars at 120 BPM. Bar 1: the hook word by word. Bar 2: a hook word morphs into the product UI. The drop: a circle opens into a dark scene. Then one move per bar. End on the logo.",
  "120 BPM 共 10 小节。第 1 小节钩子逐词落拍；第 2 小节一个词变成产品界面；转场点圆形打开进入深色场景；之后每小节一个动作；最后落版。",
  "高端产品片的节奏模板。每小节只做一件事，天然避免拥挤。",
  "一条 10 格的小节时间轴，每格显示该小节的动作图标，播放头按 BPM 走过，第 3 格标注「DROP」。",
  ["产品发布片", "社媒竖屏"], "", ["beat-grid", "iris-open", "word-on-beat"], ["v03-high-end-product"], level="进阶", builder="A")
k("s-mechanism", "L5", "视频骨架", "原理讲解：提问→模型→公式→结论",
  "Open with the question, build the mechanism visually, let the formula assemble itself from the visuals, end on the payoff.", "用问题开场，视觉化搭建原理，让公式从画面里自己组装出来，最后给出结论。",
  "科普视频的骨架。关键是「公式从画面里组装」，数字和画面来自同一个模型，不会讲错。",
  "4 段时间轴：问号 → 示意图搭建 → 符号飞入组成公式 → 结论高亮；播放头循环。",
  ["知识科普", "教程/课程"], "数值必须由同一个物理/数学模型计算，写明这一点。", ["counter-roll", "print-texture"], ["v05-transformer", "v06-sky-blue", "v14-lab-explainer"], builder="A")
k("s-scale-journey", "L5", "视频骨架", "尺度之旅：一镜到底",
  "One continuous take through scales: [macro] → [object] → [part] → [micro] → [smallest].", "一镜到底穿越尺度：[宏观] → [物体] → [部件] → [微观] → [最小单位]。",
  "适合讲「深入细节」「从整体到本质」。结构简单，冲击力强。",
  "一排嵌套方框依次放大进入，每层显示尺度标签（10^0 m → 10^-15 m），播放头循环。",
  ["知识科普", "品牌官网", "片头/Logo"], "", ["push-in-journey"], ["v09-room-to-quarks"], builder="A")
k("s-loop-cycle", "L5", "视频骨架", "循环周期",
  "A cycle of 3–5 stages that returns exactly to its start, with a small label per stage.", "3–5 个阶段构成的循环，精确回到起点，每个阶段一个小标签。",
  "过程类内容（周期、工作流、生命周期）的骨架，天然可以无缝循环。",
  "一个环形轨道分 4 段，指示点绕行，经过每段时对应标签亮起；首尾衔接。",
  ["知识科普", "社媒竖屏", "网站背景"], "", ["loop-seam"], ["v19-water-cycle"], builder="A")
k("s-shot-list", "L5", "视频骨架", "分镜表叙事",
  "A numbered shot list with timecodes: shot size, camera move and action per shot (e.g. 0–6.4s close-up → pull back, focus shifts).", "带时间码的编号分镜表：每个镜头写景别、运镜和动作（如 0–6.4 秒 特写 → 拉远，焦点转移）。",
  "故事类短片最可靠的写法。模型对「景别 + 运镜 + 时间码」的理解非常准确。",
  "分镜卡片依次翻出：镜号、时间码、景别（特写/中景/全景图标）、运镜箭头。",
  ["故事短片", "品牌短片", "片头/Logo"], "", ["rack-focus", "storyboard-first"], ["v12-rain-station"], level="进阶", builder="A")
k("s-landing-signature", "L5", "网页骨架", "招牌时刻型官网",
  "Hero with the signature object → a quiet credibility strip in mono → three pillars → ONE pinned scroll interlude → preview grid → numbers band → quiet quotes → FAQ → final CTA.",
  "首屏招牌物体 → 等宽字体的低调信任条 → 三大支柱 → 一个固定滚动段落 → 预览网格 → 数字带 → 安静的引语 → 常见问题 → 最终行动按钮。",
  "高端官网的通用页面骨架。所有动效预算集中在首屏和一个滚动段落。",
  "竖页线框自动滚动，只有首屏和固定滚动段亮起钴蓝；右侧 2 / 9 与一排方块标明九个区块里只有两处用动效。",
  ["品牌官网", "硬件产品", "奢侈品/高端"], "", ["pinned-scrub", "restraint"], ["w05-escapement"], builder="A")
k("s-longread", "L5", "网页骨架", "滚动长文专题",
  "Full-bleed illustrated hero → chapters with drop cap and pull quotes → one sticky scene that changes with scroll → one figure that assembles on scroll → endnotes.",
  "通栏插画首屏 → 带首字下沉和引语的章节 → 一个随滚动变化的固定场景 → 一张随滚动组装的图 → 尾注。",
  "编辑类长文的骨架：以阅读为主，只放两个滚动高光。",
  "一个竖长的迷你长文线框自动滚动；固定场景段颜色渐变、组装图段零件合拢，其余为文字行线框。",
  ["长文专题", "品牌故事", "年度报告"], "", ["scroll-interpolate", "progress-metaphor"], ["w02-longform"], builder="A")

# ───────────────────────── 场景配方 ─────────────────────────
SCENARIOS = [
 dict(id="launch", kind="video", zh="产品发布片（15–30 秒）", intent="让一个产品/功能在 30 秒内被记住",
      keys=["fixed-stage", "duration-fps", "seek-t", "storyboard-first", "contact-sheet",
            "one-idea", "one-accent", "type-extremes", "anti-slop",
            "spring", "beat-grid", "word-on-beat", "masked-reveal", "match-cut", "iris-open", "push-cut", "s-launch-bars"]),
 dict(id="saas", kind="web", zh="SaaS / App 落地页", intent="首屏讲清价值，滚动建立信任",
      keys=["reduced-motion", "one-accent", "type-roles", "frosted-glass", "layered-atmosphere", "anti-slop",
            "expo-out", "stagger", "orchestrated-load", "scroll-reveal", "tilt-glare", "spring-toggle", "counter-roll"]),
 dict(id="luxury", kind="web", zh="高端品牌官网", intent="用节奏和材质传递价值感",
      keys=["reduced-motion", "restraint", "one-idea", "type-roles", "metal-sheen", "studio-light-3d", "anti-slop",
            "slow-ease", "parallax-depth", "pinned-scrub", "exploded-view", "custom-cursor", "magnetic-btn", "s-landing-signature"]),
 dict(id="explainer", kind="video", zh="知识科普解说", intent="把一个原理讲清楚，而且不讲错",
      keys=["fixed-stage", "seek-t", "storyboard-first", "contact-sheet", "type-roles", "print-texture",
            "expo-out", "stagger", "counter-roll", "push-in-journey", "follow-cam", "s-mechanism"]),
 dict(id="data", kind="video", zh="数据汇报动画", intent="让数字有分量、趋势一眼可见",
      keys=["fixed-stage", "seek-t", "one-accent", "type-roles", "anti-slop",
            "expo-out", "stagger", "counter-roll", "push-cut", "follow-cam", "s-five-scene"]),
 dict(id="vertical", kind="video", zh="社媒竖屏短视频", intent="前 2 秒抓住人，不被平台界面挡住",
      keys=["aspect-ratios", "safe-zone", "seek-t", "loop-seam", "type-extremes", "anti-slop",
            "beat-grid", "word-on-beat", "no-dead-time", "whip-pan", "push-cut", "kinetic-type"]),
 dict(id="opener", kind="video", zh="片头 / Logo 演绎", intent="5–15 秒建立气质，落在名字上",
      keys=["fixed-stage", "loop-seam", "subframe-blur", "layered-atmosphere", "type-extremes",
            "masked-reveal", "match-cut", "kinetic-type", "light-on-text", "on-twos", "rain-bokeh"]),
 dict(id="immersive", kind="web", zh="沉浸式体验页（3D / 生成艺术）", intent="第一眼就是一个活的世界",
      keys=["seeded-random", "reduced-motion", "layered-atmosphere", "studio-light-3d",
            "aurora", "flow-field", "orbit-drift", "parallax-depth", "cursor-reactive", "ghost-cursor", "audio-reactive"]),
 dict(id="longread", kind="web", zh="长文 / 故事专题页", intent="以阅读为主，两处滚动高光",
      keys=["reduced-motion", "type-roles", "print-texture", "restraint",
            "slow-ease", "light-on-text", "scroll-reveal", "scroll-interpolate", "draw-on-scroll", "progress-metaphor", "s-longread"]),
 dict(id="uimotion", kind="video", zh="UI 动效展示 / 作品集", intent="展示交互质感与细节功夫",
      keys=["fixed-stage", "duration-fps", "seek-t", "loop-seam", "subframe-blur", "one-accent", "anti-slop",
            "spring", "dual-spring", "shape-morph", "zoom-to-fill", "beat-grid", "ghost-cursor"]),
]

# 第一屏流程舞台展示的 4 个词：取自各组合演示 active() 里实际出现的词，限 L2–L4（只有这三层进 <direction>）
SHOW = {
 "launch": [
  "word-on-beat",
  "one-accent",
  "push-cut",
  "spring"
 ],
 "saas": [
  "frosted-glass",
  "tilt-glare",
  "scroll-reveal",
  "counter-roll"
 ],
 "luxury": [
  "metal-sheen",
  "parallax-depth",
  "pinned-scrub",
  "magnetic-btn"
 ],
 "explainer": [
  "print-texture",
  "follow-cam",
  "push-in-journey",
  "counter-roll"
 ],
 "data": [
  "one-accent",
  "follow-cam",
  "push-cut",
  "counter-roll"
 ],
 "vertical": [
  "type-extremes",
  "whip-pan",
  "kinetic-type",
  "push-cut"
 ],
 "opener": [
  "layered-atmosphere",
  "masked-reveal",
  "light-on-text",
  "on-twos"
 ],
 "immersive": [
  "layered-atmosphere",
  "aurora",
  "flow-field",
  "parallax-depth"
 ],
 "longread": [
  "type-roles",
  "draw-on-scroll",
  "scroll-interpolate",
  "light-on-text"
 ],
 "uimotion": [
  "spring",
  "dual-spring",
  "shape-morph",
  "zoom-to-fill"
 ]
}

# ───────────────────────── 描述方法 ─────────────────────────
METHOD = dict(
 formula=[
  dict(part="形态", q="这是视频还是网页？多长、什么画幅、多少帧？", layer="L1"),
  dict(part="主角", q="观众第一眼该看到什么？每个镜头/每屏只讲哪一件事？", layer="L2"),
  dict(part="运动", q="东西怎么动？缓动、节奏、转场、镜头各选一个方向。", layer="L3"),
  dict(part="驱动", q="（网页）什么驱动动效：时间、滚动、指针还是声音？", layer="L4"),
  dict(part="骨架", q="按什么顺序展开？先选一个结构，再填内容。", layer="L5"),
  dict(part="禁用与验收", q="什么绝对不要？怎么检查：先出分镜、抽帧自检。", layer="L2"),
 ],
 rewrites=[
  dict(vague="做得高级一点", precise="High-end minimal. One idea per shot, lots of empty space, one accent color. Slow easings (0.9–1.4s). Nothing bounces.", keys=["one-idea", "one-accent", "slow-ease"]),
  dict(vague="动画流畅一点", precise="Springs everywhere, a tiny overshoot at most. Every style is computed from time inside seek(t). Render 3 subframes per frame for motion blur.", keys=["spring", "seek-t", "subframe-blur"]),
  dict(vague="转场酷一点", precise="Match cuts: measure element positions at runtime so a shape continues into the next shot. One smooth camera language.", keys=["match-cut", "zoom-to-fill"]),
  dict(vague="要有节奏感", precise="120 BPM, every cut on a downbeat; the hook lands word by word on the beats. Something happens on every beat.", keys=["beat-grid", "word-on-beat", "no-dead-time"]),
  dict(vague="页面要有互动", precise="One pinned scroll section that scrubs a continuous sequence, not a slideshow. Cards tilt toward the pointer with a moving glare. Buttons are subtly magnetic.", keys=["pinned-scrub", "tilt-glare", "magnetic-btn"]),
  dict(vague="别像 AI 做的", precise="Banned: bouncy easing, particle bursts, glows, lens flares, RGB split, camera shake, typewriter text, purple gradients on white, Inter as the display face.", keys=["anti-slop"]),
  dict(vague="背景别太单调", precise="Create atmosphere and depth rather than solid colors: layered gradients, soft noise, a vignette, a slow ambient drift. Keep it low-contrast behind the content.", keys=["layered-atmosphere", "aurora"]),
  dict(vague="要能直接发抖音", precise="Stage 1080x1920, 20 seconds at 30fps. Keep all text inside safe zones (150 top, 170 bottom, 60 sides); headlines ≥ 56px. The last frame is the first frame.", keys=["aspect-ratios", "safe-zone", "loop-seam"]),
 ],
)

# 形态归属：只适用视频 / 只适用网页的词（其余两者皆可）。配方器的冲突提示据此判断。
MEDIA = dict(
 video=["fixed-stage", "duration-fps", "seek-t", "storyboard-first", "contact-sheet", "subframe-blur", "export-mp4",
        "aspect-ratios", "safe-zone", "s-five-scene", "s-launch-bars", "s-mechanism", "s-shot-list"],
 web=["reduced-motion", "orchestrated-load", "pinned-scrub", "exploded-view", "scroll-reveal", "scroll-interpolate",
      "draw-on-scroll", "progress-metaphor", "tilt-glare", "magnetic-btn", "custom-cursor", "cursor-reactive",
      "spring-toggle", "hover-reveal", "s-landing-signature", "s-longread"],
)

# 参数化场景：关键词 → 场景参数（配方器与滚动解剖共用）
SCENE_PARAMS = dict(
 easing=["linear", "bouncy", "expo", "spring", "slow"], transition=["cut", "masked", "match", "iris", "whip", "push"],
 texture=["flat", "grain", "halftone", "glass"], palette=["default", "one-accent", "ink-paper", "dark-premium"],
 type=["default", "roles", "extremes"], camera=["static", "zoom", "parallax"], density=["busy", "minimal"],
 flags=["onBeat", "stagger", "onTwos", "slop", "frame", "blur"],
)

ANATOMY = [
 dict(step=0, title="只写内容", add=[], prompt="做一个 15 秒的产品介绍动画，产品叫 Nimbus，有三个功能。",
      note="模型会用它的默认审美：多种颜色平均分布、线性或弹跳缓动、光晕和粒子、一屏塞满。",
      scene=dict(easing="bouncy", transition="cut", texture="flat", palette="default", type="default", camera="static", density="busy", slop=True, onBeat=False, stagger=False, frame=False)),
 dict(step=1, title="＋ 底座", add=["fixed-stage", "duration-fps", "seek-t", "loop-seam"],
      note="固定舞台和 seek(t) 让画面可复现、可拖动、可导出；首尾衔接可循环。", scene=dict(frame=True)),
 dict(step=2, title="＋ 质感", add=["one-idea", "one-accent", "type-extremes", "layered-atmosphere", "anti-slop"],
      note="一镜一事、单一强调色、极端字体层级、有层次的背景，并禁用光晕弹跳。", scene=dict(density="minimal", palette="one-accent", type="extremes", texture="grain", slop=False)),
 dict(step=3, title="＋ 缓动", add=["spring", "stagger"], note="弹簧缓动轻微过冲，元素错峰入场。", scene=dict(easing="spring", stagger=True)),
 dict(step=4, title="＋ 节奏", add=["beat-grid", "word-on-beat"], note="120 BPM 节拍网格，所有切换落在拍子上，标题逐词落拍。", scene=dict(onBeat=True)),
 dict(step=5, title="＋ 转场与镜头", add=["masked-reveal", "match-cut", "zoom-to-fill"], note="遮罩揭示、匹配剪辑、镜头推到主体填满画面。", scene=dict(transition="match", camera="zoom")),
 dict(step=6, title="＋ 验收", add=["storyboard-first", "contact-sheet"], note="先出分镜再写代码，渲染前抽帧自检。这一步不改变画面，改变的是成功率。", scene=dict(blur=True)),
]

by_id = {x["id"]: x for x in K}
# sanity: references resolve
for x in K:
    for p in x["pairs"]:
        assert p in by_id, (x["id"], p)
for s in SCENARIOS:
    for key in s["keys"]:
        assert key in by_id, (s["id"], key)
for r in METHOD["rewrites"]:
    for key in r["keys"]:
        assert key in by_id, key
for a in ANATOMY:
    for key in a["add"]:
        assert key in by_id, key
assert len(by_id) == len(K), "duplicate ids"
for m, ids in MEDIA.items():
    for key in ids:
        assert key in by_id, key
        by_id[key]["media"] = m
for x in K:
    x.setdefault("media", "both")
for s_ in SCENARIOS:
    assert s_["kind"] in ("video", "web"), s_["id"]
    s_["show"] = SHOW[s_["id"]]
    assert len(s_["show"]) == 4 and all(key in s_["keys"] and by_id[key]["layer"] in ("L2", "L3", "L4") for key in s_["show"]), s_["id"]
    bad = [key for key in s_["keys"] if by_id[key]["media"] not in ("both", s_["kind"])]
    assert not bad, (s_["id"], bad)

out = dict(as_of="2026-09-27", gallery=GALLERY, layers=LAYERS, groups=GROUPS, keywords=K, scenarios=SCENARIOS,
           method=METHOD, scene_params=SCENE_PARAMS, anatomy=ANATOMY)
(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data" / "lexicon.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
from collections import Counter
print(len(K), "keywords", dict(Counter(x["layer"] for x in K)), "builders", dict(Counter(x["builder"] for x in K)))
