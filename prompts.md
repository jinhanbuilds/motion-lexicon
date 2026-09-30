# Opus 5.5 动效提示词合集（2026-09-27）

每条：效果 → 适用场景 → 关键技法 → 提示词原文 → 出处。预览见 01-动效片库网页/index.html。

## 动态视频

### v01-showreel · 一句话动效作品集

- 分类：动效技法　画幅：16:9　提示词：原文
- 效果：15 秒动态图形 showreel，让模型自由发挥审美和节奏
- 适用：第一次试 Opus 5.5 的动效上限；给团队演示它能做到什么程度
- 技法：开放式指令；模型自选风格与节奏；社区多在 max effort 下运行
- 出处：@ajith_io（X（经 Tripo 提示词库收录），2026-09-25） https://www.tripo3d.ai/3d-prompts/claude-opus-5-5-2103504887439065439　原帖/成片：https://x.com/ajith_io/status/2103449416325890146

```text
make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.
```

中文模板：

```text
先调研 [产品网址]。为 [产品名] 做一支 [30] 秒的动态图形视频，展示你作为顶级动效设计师的水平，像简历里的作品集那样。放开做。
```

演示说明：示例输入——提示词无需填空；简化——展示了 6 个动效设计片段（标题、字体、几何、时间、深度、循环），纯 Canvas 动画无音乐与素材;时长 15 秒。

### v02-app-launch · 15 秒 App 发布片

- 分类：产品与品牌　画幅：16:9　提示词：原文
- 效果：开场品牌名 → 三个功能逐一动画出现 → 网址收尾
- 适用：新功能上线、App Store 预览、社媒发布贴
- 技法：固定分辨率 1920x1080；三段式结构；品牌色约束
- 出处：Scale My Vibe Code（博客，2026-09） https://scalemyvibe.dev/blog/opus-5-5-initial-thoughts-and-prompting-advice/

```text
Make a 15-second launch video for my app, [app name], at 1920x1080. Open with the name, show these three features one at a time with smooth animations: [feature 1], [feature 2], [feature 3], and end on [your URL]. Use these brand colors: [colors].
```

演示说明：示例输入——虚构语音笔记 App「driftnote」：三个功能「说话即成文字 / 笔记自动分类 / 每日早间回顾」，网址 driftnote.example，品牌色松绿 #0E2A27、柠檬黄 #DDF45B、珊瑚 #FF7A5C、雾白 #EEF2EA（均为虚构）。；简化——保留 15 秒三段式：品牌名开场 → 三个功能逐一用 UI 片段动画呈现（录音波形转文字、卡片飞入三栏看板、早间回顾清单打勾）→ 网址收尾；原提示词未要求配乐，演示无声。为无缝循环，结尾网址停留约 1.3 秒后收回，Logo 与字标缩放回开场构图。

### v03-high-end-product · 高端极简产品广告片

- 分类：产品与品牌　画幅：16:9　提示词：原文
- 效果：120 BPM 卡点：钩子逐词落拍 → 词变 UI → 圆形转场 → 3D 轮播 → 大数字 → Logo
- 适用：要 Apple 式克制高级感的产品片；有自己的实拍素材和音乐
- 技法：六段式结构 inputs/direction/structure/build/gotchas/start；seek(t) 纯函数渲染；numpy 分析节拍；子帧混合运动模糊；先出分镜再写代码
- 出处：@zero（twoclipping）（X（经 YouMind 收录），2026-09-23） https://youmind.com/video-prompts/high-end-product-video-prompt-11292

```text
<inputs>
Ask me for: the product name and a one-line promise, 3 to 5 UI moments to show, one accent color, 10 to 20 real vertical clips I own, and a royalty-free song with a clear drop (e.g. Mixkit, free for commercial use).
</inputs>

<direction>
High-end minimal. One idea per shot, lots of empty space, one accent color, one clean sans (Geist or Inter) with tight tracking. Masked type reveals, match cuts, one smooth camera language. Real footage only, never placeholder cards. No full stops in on-screen text.
Banned: shockwave rings, particle bursts, RGB split, camera shake, lens flares, neon glows, grid floors, flashing backgrounds, bouncy easing.
</direction>

<structure>
10 bars at 120 BPM, 2 seconds each.
Bar 1: the hook lands word by word on the beats.
Bar 2: one hook word morphs into the product UI. A cursor types and clicks.
The drop: a circle opens out of the button into a dark scene.
Then one move per bar: a wall of real clips with a scan line and 3 winners, the key output as big type, a 3D carousel of real videos with floor reflections and a motion-blurred whip onto one hero clip, the hero in a phone next to a panel that flips into results, big stats on push cuts, a 3-word ticker, a logo reveal, a fade to black.
</structure>

<build>
1. One HTML file at 1920x1080. Every style is computed from time inside seek(t): no CSS animations, no timers, no state between frames.
2. Real video: extract clips to 30fps JPEG sequences with ffmpeg and swap img sources per frame. seek awaits the image decodes.
3. Analyze the song with numpy: tempo, beat grid, energy per bar, the drop. Calibrate the grid to the real kick hits. Every cut sits on a downbeat, every UI hit on a beat.
4. Render with Playwright: 3 subframes per frame at t minus, at, and plus 1/240s, then blend with ffmpeg tmix for real motion blur at 60fps.
5. Place each sound effect so its measured peak, not its file start, lands on the event. Keep the effects quiet under the music. Loudnorm to -14 LUFS.
6. Probe 20 or more frames before the full render. Fix anything cluttered, overlapping or hard to read.
</build>

<gotchas>
Never set opacity or filter on a preserve-3d element, because it flattens and both faces show. Fade its wrapper instead. Measure element positions at runtime for match cuts. Only use music and sound effects whose license allows commercial use.
</gotchas>

<start>
Ask me for the inputs, then show me a storyboard with every timing on the beat grid before you write any code.
</start>
```

演示说明：示例输入——虚构产品「Culla」、品牌色、钩子文案；简化——使用程序化生成的虚拟「素材」替代真实视频片段（30 个程序性瓷砖）;省略了匹配切、音效处理和视频合成;时长压缩为 16 秒。

### v04-business-explainer · 30 秒业务解说

- 分类：产品与品牌　画幅：16:9　提示词：原文
- 效果：五个场景：客户痛点 → 你做什么 → 三步流程 → 一个证据 → 名字收尾
- 适用：官网首屏视频、销售开场、投资人一分钟介绍
- 技法：角色设定；场景清单；品牌色；单 HTML 交付
- 出处：@alex_prompter（Alex Prompter）（X（经 YouMind 收录），2026-09-25） https://youmind.com/video-prompts/business-explainer-video-prompt-11359

```text
Adopt the role of an expert motion designer. Build a 30-second animated explainer for my business as a single HTML page. 5 scenes. The customer's problem, what I do, how it works in 3 steps, one proof point, and my name at the end. Bold text, smooth transitions, my brand colours. My business [DESCRIBE WHAT YOU SELL, WHO IT'S FOR AND YOUR COLOURS]
```

演示说明：示例输入——虚构杭州茶订阅品牌「一月一山」：每月从浙江小茶园直采寄三泡当季茶，面向上班族；品牌色米纸 / 茶绿 / 朱砂；证据数字「86% 续订率」明确标注为示例数据；网址 yiyueyishan.example。；简化——严格五个场景（难题 → 做什么 → 三步 → 一个证据 → 名字），原提示词 30 秒压缩为 20 秒循环；无配音无配乐，文字全部上屏；场景间用「倒茶」波浪擦除过渡，最后一个波浪回到第一场景以实现无缝循环。

### v05-transformer · 什么是 Transformer

- 分类：知识科普　画幅：16:9　提示词：原文
- 效果：高中生能懂又有细节的科普动画：注意力机制与数学直觉
- 适用：技术概念科普、课程片头、公众号配图视频
- 技法：受众定位（高中生）；允许联网和装工具；给模型留惊喜空间
- 出处：@宝玉（dotey）（X（经 YouMind 收录），2026-09-26） https://youmind.com/video-prompts/transformer-explainer-video-11391

> YouMind 收录的是英文版；原帖为中文。

```text
Help me create a video using JS with the theme: What is a Transformer. It should be profound yet simple, understandable even for high school students. Not only explain it clearly at a high level but also include details, covering attention mechanisms and even some mathematical concepts. You can use any tools or install tools, and you can search online. Please surprise me.
```

演示说明：示例输入——中文句子「小猫没有过马路，因为它太累」作示例;词表编号、向量、权重均为示意；简化——纯 Canvas 和 SVG 动画演示，省略了交互与模型推理;用向量网格与权重弧线替代数学可视化;时长 20 秒，无音乐。

### v06-sky-blue · 天为什么是蓝的（1950 年代教科书风）

- 分类：知识科普　画幅：16:9　提示词：原文
- 效果：20 秒复古科学教科书风格解说，一句话指定主题 + 年代风格
- 适用：科普短视频；想要统一的复古画风
- 技法：主题先于风格；年代风格锚点；draw(ctx, t) 单函数绘制
- 出处：iArt.ai（博客，2026-09） https://www.iart.ai/blog/ai-javascript-animation

> 同一文章还给了竖屏 TikTok 解说、两幕式种子长成树、睡前故事频道片头等一句话示例。

```text
Why is the sky blue? A 20-second explainer in the style of a 1950s science textbook.
```

演示说明：示例输入——提示词无需填空；简化——采用 1950 年代科学教科书风格复古设计;用 Canvas 半色调和矢量图形展示光学原理，5 个图解;省略了音乐和交互;时长 20 秒。

### v07-ui-morph · 单一形体 UI 变形

- 分类：动效技法　画幅：1:1　提示词：原文
- 效果：一个形体不切镜头连续变成按钮、加载、播放器、滑块、开关、图表、⌘K、Toast，首尾相接可循环
- 适用：产品 UI 动效展示、Dribbble 作品、发布会过场
- 技法：闭式弹簧（纯时间函数）；双弹簧拉伸指示条；光标直接操控；首帧=末帧无缝循环；4 子帧运动模糊
- 出处：@zero（twoclipping）（X（经 YouMind 收录），2026-09-24） https://youmind.com/video-prompts/ui-morphing-motion-template-11361

```text
<inputs>
Ask me for: 8 to 12 UI states I want the shape to become (e.g. button, loader, player, slider, toggle, tabs, chart, command palette, toast), pure black and white or one accent color, and a royalty-free song around 120 BPM (e.g. Mixkit, free for commercial use).
</inputs>

<direction>
Dribbble-level UI motion. One shape, never cut: every state is the same element morphing its size, radius and color while its content swaps with a short blur. A cursor drives every change with real clicks and drags. Light warm-gray canvas, black and white components, one clean UI font (Geist). Springs everywhere, a tiny overshoot at most. The camera zooms so each state fills the frame. The last frame is the first frame, so it loops.
Banned: bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, anything that looks like a template.
</direction>

<structure>
120 BPM, 7 bars, something happens on every beat.
Button → loader → check → dynamic island → music player with a play/pause morph → scrub the progress bar → it becomes a volume slider that stretches when dragged past max → a toggle flips on the beat → the knob becomes a liquid tab indicator → the tabs open into a chart that draws itself, with a tooltip on hover → it collapses into ⌘K → type to filter → enter → toast → back to the button.
</structure>

<build>
1. One HTML file, square 1440x1440. Every style is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames.
2. Springs are closed-form step responses. A value that changes target many times is the sum of one spring per change, so it stays a pure function of time.
3. The tab indicator's two edges ride different springs, so the leading edge stretches ahead of the trailing one. Same trick for the toggle knob.
4. Drags are direct manipulation: while the cursor is held, the value is computed from its position. On release it springs back from wherever it was.
5. Analyze the song with numpy for the beat grid and start on a downbeat. Place every UI sound by its measured peak.
6. Render with Playwright: 4 subframes per frame, blended with ffmpeg tmix for motion blur at 60fps.
7. Render one frame per beat before the full render. Fix anything off the grid, cramped or hard to read.
</build>

<gotchas>
Never put will-change on anything the camera scales or the text renders blurry. Text that swaps inside a morphing container needs its own enter and exit timing or it overlaps. Make the last frame identical to the first, cursor position and speed included, or the loop stutters.
</gotchas>

<start>
Ask me for the inputs, then show me the state list on the beat grid before you write any code.
</start>
```

演示说明：示例输入——13 个 UI 状态（按钮、加载、复选、岛屿、播放器、音量、开关、标签页、图表、命令栏、Toast）；简化——采用黑白配色方案;用闭式弹簧函数实现平滑变形无动画库;省略了音乐;时长 14 秒(7 小节@120BPM)，4 子帧运动模糊。

### v08-kinetic-type · 演讲文字动效片《BUILD THE FLOOR》

- 分类：动效技法　画幅：1:1　提示词：摘录
- 效果：20 秒纯排版演讲：每句话改变画面结构，最后一句站在前面文字搭起的「地板」上
- 适用：金句海报视频、品牌宣言、发布会开场
- 技法：逐字原文锁定；三色 + 三字体角色；禁用陈词滥调清单；确定性 seek(t)
- 出处：@TechHalla（X（经 YouMind 收录），2026-09-25） https://youmind.com/video-prompts/kinetic-typography-speech-film-11293

> 原文后续还有完整分镜、编排、字体实现与工程规格，见溯源页。

```text
Create a 20.00-second kinetic spoken-word film titled "BUILD THE FLOOR." Treat this as an original miniature speech staged entirely through typography. Every line changes the architecture of the frame. The final declaration must stand on something the earlier words physically constructed. Deliver one self-contained HTML file, 1080×1080, targeting 60fps, using SVG and/or Canvas. Embed all required assets.

ART DIRECTION
Background #102820. Paper #F4E9D5. Structural accent #F2B544. A literary editorial world with the scale and confidence of a public monument. Use a high-contrast serif for the speech, a heavy grotesque for load-bearing words, and a restrained monospace for small timing marks. No distressed protest-poster clichés, megaphones, flags, crowds, microphones, or stock footage.

ORIGINAL SPEECH — EXACT WORDS, EXACT ORDER
"We were told to wait."
"So we learned the weight of waiting."
"Then one voice made room."
"Then another."
"Now the floor belongs to us."
```

演示说明：示例输入——原文演讲词：5 句英文宣言；简化——用 Canvas 实现排版与几何结构的关联(WAIT→WEIGHT、ROOM、ANOTHER、FLOOR);省略了原创音效与实拍素材;时长 20 秒，无交互。

### v09-room-to-quarks · 从房间推进到夸克

- 分类：镜头与地图　画幅：16:9　提示词：原文
- 效果：一镜到底连续推进：房间 → 笔记本 → 芯片 → 原子 → 夸克
- 适用：尺度类科普、品牌「深入细节」概念片
- 技法：Three.js；连续推镜；尺度转场
- 出处：Victor Taelin（@Taelin）（X（经 YouMind 收录），2026-09-25） https://youmind.com/video-prompts/room-to-quarks-zoom-animation-11283

```text
Create an animated sequence that starts in a room, zooms into a MacBook, then into an Apple M4 chip, followed by atoms, and finally quarks. Use HTML and Three.js for rendering.
```

演示说明：示例输入——尺度标注：房间(5m) → 笔记本(30cm) → 芯片(1cm) → 原子(0.2nm) → 质子(1.7fm)；简化——采用程序化 3D 几何体替代真实扫描数据;7 层场景用圆形转场无缝连接;省略了音乐和交互;时长 16 秒，对数尺度插值。

### v10-map-route · 地图路线动画

- 分类：镜头与地图　画幅：16:9　提示词：原文
- 效果：路线从洛杉矶画到纽约，镜头跟随
- 适用：物流/出行/融资路演里的地理叙事
- 技法：Remotion Agent Skills；/remotion-maps 技能；镜头跟随
- 出处：Remotion 官方文档（remotion.dev，2026） https://www.remotion.dev/docs/ai/skills

> 需先在 Remotion 项目里执行 npx skills add remotion-dev/skills。

```text
/remotion-maps Animate a route from Los Angeles to New York and make the camera follow it.
```

演示说明：示例输入——洛杉矶到纽约的真实坐标与地名；简化——地图投影用 Albers 等积圆锥投影;大圆弧线动画 + 景深跟随;距离计数器实时更新;省略了音乐与交互;时长 12 秒，纯 Canvas 2D。

### v12-rain-station · 雨夜站台重逢短片

- 分类：故事与片头　画幅：16:9　提示词：原文
- 效果：雨夜月台上二人隔着驶过的列车相望而错过，转场为撑伞背影的意外重逢
- 适用：情感向2D故事短片、影视分镜预览，需要一镜到底运镜与景深的叙事片段
- 技法：GPT Image出图+绿幕抠像；Real-ESRGAN四倍放大；深度估计做2.5D视差；自写合成器控制运镜景深；按剧情节点配乐配音
- 出处：Feicai（@zhu185178）（X（经 YouMind 收录），2026-09-26） https://youmind.com/video-prompts/rain-station-animated-short-11378　原帖/成片：https://x.com/zhu185178/status/2103757767727255661

> 作者为中文创作者，提示词以英文撰写；原文标注画幅为2.39:1电影宽银幕，此处按最接近的16:9归类。

```text
Help me create a 30-second 2D animated storyboard preview short film titled 'Rain Station', with benchmark-level quality. Do not use HyperFrames/Remotion; write all code yourself (Python + ffmpeg).

Story (24fps, 2.39:1, 4K): A rainy night at an elevated station platform. She wears a beige trench coat and holds a transparent umbrella, standing on the near-side platform; he stands under a streetlight on the opposite side, wearing a dark grey long coat and a scarf.
1. 0–6.4s Close-up of raindrops on the transparent umbrella → Pull back, focus shifts to him appearing on the opposite side (over-the-shoulder shot)
2. 6.4–9.4s Medium close-up of him: Head down → Looks up towards the left of the frame
3. 9.4–12.4s Frontal close-up of her: Blinks → Recognizes him; distant horn sound
4. 12.4–17s Long shot: Headlights arrive first, a 5-car train passes; he is still visible in the gap of the first car, but the second is empty
5. 17–18.8s Close-up of her teary eyes, light bands from windows sweep across her face, hair blown by wind
6. 18.8–22.4s Tail lights recede, opposite platform is empty; his streetlight flickers a few times then goes out
7. 22.4–28.6s Her back view, focus pulls from empty platform back to her; footsteps behind, a black umbrella covers her head, she turns to look at the camera; male voice says 'Long time no see.', with subtitles
8. 28.6–30s Black screen title 'Rain Station / RAIN STATION'

Method:
- Original Art: Use GPT Image 2.5 to draw the background, him, her, and the train (head/middle/tail cars). Characters must have pure green #00FF00 backgrounds for self-matting (using reference images with transparent backgrounds may result in fake checkerboards). Keep various poses of the same character in one session, editing continuously based on a base image; only composite changed areas when switching poses.
- Quality: Use Real-ESRGAN x4plus anime 6B (safetensors version from HF, write your own RRDBNet, run on MPS) to upscale all original art by 4x; use Depth Anything V2 to estimate background depth for per-pixel parallax.
- Rendering: Write your own 2.5D compositor. Place layers according to real depth, move pinhole camera according to real focal length; implement circular bokeh, rack focus, 3D rain streaks, train motion blur, volumetric light, bloom/glow/film halo, fine grain, and color grading. Use mesh deformation for characters to simulate breathing, wind-blown hair, and umbrella shake, switching key poses in Japanese 'one-frame-two' style. 4K supersampling, cache frames to disk, parallelize rendering into 3 processes by time segment (16GB memory).
- Sound: Mixkit real SFX (rain, umbrella rain, train, horn, footsteps); compose music according to plot nodes, render with Steinway piano and string samples from Logic/GarageBand; dialogue uses Kokoro Chinese male voice; apply distance-based audio panning/volume, loudness -16 LUFS.
- Render preview frames at each step, stitch them together for self-checking, fix issues before final output. Deliver 4K master and 1080p share version.
```

演示说明：示例输入——沿用原提示词的故事与 8 个镜头顺序（透明伞、米色风衣的她 / 路灯下深灰长大衣配围巾的他、5 节列车、黑伞重逢）；站名牌只画抽象色块，台词字幕排为「好久不见。/ Long time no see.」，片尾标题排为中英双语「雨站 / RAIN STATION」。；简化——30 秒压缩为 24 秒，镜头顺序和运镜保留（推拉、焦点转移、升格变速、尾灯远去）；GPT Image 出图、绿幕抠像、Real-ESRGAN 放大和 Depth Anything 深度全部换成 Canvas 程序化绘制的分层 2.5D 场景（针孔相机 + 按弥散圆逐层虚化 + 圆形焦外光斑），角色是简化剪影、姿态按一拍二（12fps）切换；原作的音效、配乐和中文配音都没做（远处汽笛改成画面左侧渐亮的暖光），信箱黑边里加了分镜编号、时间码和镜头进度条。

### v14-lab-explainer · 光学全反射实验室解说

- 分类：知识科普　画幅：16:9　提示词：原文
- 效果：暗色实验台上激光穿过半圆玻璃块，角度超过临界角后发生全反射，标题随公式实时改写
- 适用：物理/光学等硬核概念科普，需要真实公式驱动画面与字幕的讲解短片
- 技法：公式驱动全部数值与文字；控制台按钮+滑块联动；多机位实验镜头切换；大字幕逐句呈现；同一模型算光线也算数字
- 出处：misbahsy（GitHub：claude-horizon-animation，2026-09） https://github.com/misbahsy/claude-horizon-animation

> 出自开源 Skill `lab-explainer`（misbahsy/claude-horizon-animation）自带的示例提示词；仓库里 examples/refraction 对应此例，另有 examples/plane-of-focus（镜头对焦）等同类示例。

```text
Make a 30 second explainer on why light gets trapped in glass: a laser, a half-round block, the angle going past critical, then water and diamond.
```

中文模板：

```text
做一个 30 秒的解说：为什么会出现 [现象，如「光会被困在玻璃里」]。道具依次是 [激光、半圆玻璃块]，然后换成 [水和钻石] 做对比。
```

演示说明：示例输入——650 nm 红色激光、半圆玻璃块 n=1.50，对比材料水 n=1.33、钻石 n=2.42；台面、控制台和「LAB 03」编号都是示例。；简化——30 秒压缩为 24 秒，按原提示词的顺序走：激光 → 半圆块 → 角度越过临界角 → 水、钻石对比，最后加一屏 θc=arcsin(1/n) 曲线和三种材料的逃逸锥。所有光线、标题、公式、读数都由同一套斯涅尔定律加菲涅耳反射率模型实时算出（玻璃 41.8°、水 48.8°、钻石 24.4°）；光束亮度把菲涅耳反射/透射比例做了感知映射。「掠射」一段停在 41.7°（θ₂≈86°），因为正好在临界角时透射强度为 0。原 Skill 的多机位简化为「全景 → 界面微距推近 → 对比图切镜」，没有配音和音效。

### v16-bedtime-opener · 睡前故事频道片头

- 分类：故事与片头　画幅：16:9　提示词：原文
- 效果：15秒暖色调动画开场，灯笼与星光渐次亮起，收尾停在频道名上
- 适用：无露脸YouTube/播客频道的开场标识，尤其适合儿童向或助眠向内容
- 技法：一句话给受众+时长+收尾要求；代码逐帧绘制无需实拍素材；固定种子笔触避免闪烁；同一引擎输出HTML+MP4
- 出处：iArt.ai（博客，2026-09-24） https://www.iart.ai/blog/ai-javascript-animation

> 出自 iArt.ai 的 Animation 模式案例（Claude Code + iArt Animation skill，实测使用 Opus 5.5）；同一文章还给出 sky-blue（已收录为 v06）、seed-to-tree、noise-cancelling 等一句话示例。

```text
Opening sequence for my faceless YouTube bedtime-story channel 'Sleepy Lantern'. Cozy, 15 seconds, ends on the channel name.
```

中文模板：

```text
为我的无露脸 YouTube [睡前故事] 频道「[频道名]」做一段开场。风格 [温馨]，时长 [15] 秒，结尾停在频道名上。
```

演示说明：示例输入——直接用提示词里的频道名「Sleepy Lantern」，片尾副标题「bedtime stories · every night」为补充的示例文案；画面为原创剪纸风夜景（打瞌睡的月亮、挂着的纸灯笼、小屋、萤火虫）。；简化——原作用 iArt Animation skill 同时导出 HTML+MP4 并可配乐，演示只做 HTML 画面、无声；全部动作按 12fps「一拍二」量化，描边 3 帧抖动（line boil）+ 纸纹颗粒模拟手作感；频道名停留约 3 秒后柔和淡出、灯笼转暗，回到首帧以无缝循环。

### v18-noise-cancelling · 降噪耳机竖屏解说

- 分类：知识科普　画幅：9:16　提示词：原文
- 效果：9:16科普短片，三步讲清降噪原理，镜头推入耳罩内部演示声波抵消
- 适用：抖音/TikTok/小红书竖屏知识短视频、硬件原理科普
- 技法：一句话给主题+平台+时长；平台词自动决定画幅；代码逐帧绘制配合成音效
- 出处：iArt.ai（博客，2026-09-24） https://www.iart.ai/blog/ai-javascript-animation

> 出自 iArt.ai 同一篇文章；作者强调「写清题目/时长/平台即可，平台名会自动带出竖屏画幅」。实际渲染为9:16、22秒。

```text
How do noise-cancelling headphones actually cancel noise? Short vertical explainer for TikTok, ~20s.
```

中文模板：

```text
[你的问题，如「降噪耳机到底是怎么消除噪音的？」] 竖屏短解说，投给 [TikTok/抖音]，大约 [20] 秒。
```

演示说明：示例输入——原提示词只有一句话，画面文字由演示自拟为中文：钩子问题「降噪耳机怎么把噪音消掉？」加三步解说（麦克风采集 → 芯片反相 → 扬声器叠加抵消）和一条适用范围说明；耳机和头像都是通用造型，没有品牌。；简化——压缩到 20 秒、1080×1920 竖屏，文字全部放在安全区内（上 150、下 170、左右 60），标题 76–132px，正文 42px。波形由同一套声波模型实时算出，反相波逐点取负，叠加结果也是算出来的；最后一段用同一模型加一个处理延迟，演示低频抵消得干净、高频突发残留更多，这个延迟量为了看得清做了夸大。原作的音效和配音没有做。

### v19-water-cycle · 水循环无缝循环动画

- 分类：知识科普　画幅：16:9　提示词：原文
- 效果：蒸发-凝结-降水-径流首尾相接，云雨山川循环往复、无缝衔接
- 适用：科普短片素材、网站背景循环视频、社媒无缝循环片段
- 技法：一句话极简提示词；首尾帧无缝衔接；纯代码程序化绘制
- 出处：Higgsfield AI（@higgsfield_ai）（X（经 GitHub awesome-opus-5-5-prompts 收录），2026-09-23） https://github.com/TripoGrowthLab/awesome-opus-5-5-prompts/blob/main/docs/catalog.en.1.md　原帖/成片：https://x.com/higgsfield_ai/status/2102781807179735211

```text
Create a seamless looping animation of the water cycle, entirely in code.
```

演示说明：示例输入——无外部输入；海岸、雪山、河流、树林等地形和配色均为演示自拟，四个阶段用中英小标签（蒸发/凝结/降水/径流/汇集）按阶段依次出现。；简化——循环为 16 秒，全部用 Canvas 程序化绘制：静态地形在尺寸变化时预渲染一次；水汽粒子、云的生长和漂移、降雨、溪流和河面流光、海面闪光都是时间的周期函数（频率取 2π/16 的整数倍，虚线流速正好是虚线周期的整数倍，粒子寿命 4 秒），或者在接缝处包络正好为 0，所以 t=16 的画面和 t=0 一致。云是分层平涂的插画风格，不是体积云模拟；左下角加了标题，右下角加了循环进度环。

## 动效网页

### w01-aurora-glass · 玻璃拟态冥想 App 落地页

- 分类：落地页　画幅：16:10　提示词：原文
- 效果：Canvas 极光背景跟随鼠标弯曲；4-7-8 呼吸球；3D 倾斜卡片带高光
- 适用：消费类 App 官网、需要氛围感的首屏
- 技法：Canvas 叠加极光带；backdrop-filter 毛玻璃；指针驱动 3D 倾斜；价格切换滑动药丸
- 出处：miaai-lab（GitHub Pages：Claude Opus 5.5 100 HTML Files，2026-09） https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/001-aurora-glass.txt　原帖/成片：https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/001-aurora-glass.html

> 原作者对 100 个页面统一附加了「共享要求」10 条，见工具箱。

```text
Design a premium landing page for "Stillwater", a fictional breathing and meditation app, in refined glassmorphism. Background: deep midnight (#070b1f) with three slow-drifting aurora ribbons rendered on a canvas (layered, sine-deformed gradient bands in teal #2de2c4, violet #7b5cff and rose #ff6fa8, additive blending, very soft) over a faint twinkling star field. Foreground: frosted-glass panels (backdrop-filter blur + saturate, 1px inner highlight border, subtle grain) — a hero with a large, airy, light-weight sans headline; a centred "breathing orb" that expands and contracts on a 4-7-8 rhythm with a caption that cross-fades Inhale / Hold / Exhale; a row of three feature cards; a testimonial strip; and a pricing section whose monthly/yearly toggle animates a sliding glass pill. Delight: cards tilt in 3D toward the pointer with a moving specular glare; the aurora bends gently toward the cursor. Interaction: hover/tilt cards; click the orb to start/stop a guided one-minute session with a progress ring; pricing toggle. Mobile: cards stack, the orb stays hero-centred.
```

演示说明：示例输入——虚构冥想 App「Stillwater」：4-7-8 呼吸节奏、三张功能卡、五位虚构用户评价、Ripple/Stillwater/Tidepool 三档价格（均为虚构数据）。；简化——保留极光带跟随光标弯曲、星空闪烁、毛玻璃面板、4-7-8 呼吸球（字幕交叉淡入淡出 + 刻度表盘 + 点击开始一分钟练习的进度环）、3D 倾斜卡片带移动高光、月/年价格滑动玻璃药丸与数字滚动。省略了原作的可选「Chime」合成铃声和 conic 渐变遮罩式进度环（改为 SVG 描边进度环）；字体用系统无衬线栈。

### w02-longform · 灯塔守望者长文专题

- 分类：滚动叙事　画幅：16:10　提示词：原文
- 效果：灯塔光束扫过标题并真实照亮文字；滚动时天色由黄昏转入夜；菲涅耳透镜随滚动组装
- 适用：品牌故事、年度报告、杂志式长文
- 技法：光束 clip-path 照亮标题；滚动插值天色；滚动驱动 SVG 组装；阅读进度条做成光束
- 出处：miaai-lab（GitHub Pages：Claude Opus 5.5 100 HTML Files，2026-09） https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/008-lighthouse-longform.txt　原帖/成片：https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/008-lighthouse-longform.html

```text
Design a long-read editorial feature: "The Last Keepers — Life at the Edge of the Light", a fictional magazine story about lighthouse keepers. Write original, evocative literary prose (~900 words), impressionistic rather than presenting invented facts as real history. Typography-led: a classic book serif ("Iowan Old Style", "Palatino Linotype", Palatino, "P052", Georgia, serif) for body text at a comfortable measure, a large Didone-feeling headline, an ornamental drop cap, small-caps bylines, pull quotes that break the column, and marginal notes on wide screens. Palette: cream paper #f6f1e7, ink navy #14213d, signal red #c0392b, fog grey. Hero: a full-bleed SVG illustration of a lighthouse on rocks at dusk with a rotating light beam that sweeps across the headline and a gently animated sea. Scroll storytelling: sections fade and rise in; a reading-progress bar styled as a lighthouse beam; a section where the background shifts from dusk to night as you scroll; and an illustrated "anatomy of a lens" figure (Fresnel lens rings) that assembles on scroll. Footnotes pop up on click. Must read beautifully on phones.
```

演示说明：示例输入——虚构杂志《The Tidewater Quarterly》的虚构长文《The Last Keepers》，虚构作者 Maren Hollis；正文为原创散文，演示版缩短到约 400 字（原提示词要求约 900 字）。；简化——保留：SVG 黄昏灯塔首屏 + 双光束旋转并用逐帧 clip-path 真实照亮标题、动态海浪、灯塔光束式阅读进度条、黄昏→深夜的吸顶滚动场景（时钟 19:40→04:40 + 值班日志）、滚动组装的菲涅耳透镜图版、首字下沉/小型大写署名/破栏引语/宽屏边注、脚注弹层（手机为底部抽屉）。删减：正文从四章压到三章 + 尾声，去掉引语复制按钮与 toast、分章波浪过渡只保留首屏一处；字体为系统书籍衬线/Didone 栈。

### w03-art-deco · 装饰艺术风酒店落地页

- 分类：落地页　画幅：16:10　提示词：原文
- 效果：金色边框从中间向两侧自绘；旭日光芒旋转；标题掠过金箔光泽；电梯表盘指针跟随滚动
- 适用：酒店、奢侈品、复古主题活动页
- 技法：SVG 描边自绘 stroke-dashoffset；background-clip:text 金箔扫光；弹簧指针；滚动展开扇形
- 出处：miaai-lab（GitHub Pages：Claude Opus 5.5 100 HTML Files，2026-09） https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/015-art-deco-hotel.txt　原帖/成片：https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/015-art-deco-hotel.html

```text
Create a landing page for "The Aurelian", a fictional 1928 Art Deco grand hotel. Black lacquer (#0b0b0c) and deep emerald (#0f3d33) grounds with gold (#d4af37, grading to #f5e3a1) geometric ornament — sunbursts, stepped ziggurat frames, chevrons and fan motifs, all inline SVG. Typography: tall, thin, high-contrast display capitals (stack: Didot, "Bodoni 72", "Bodoni MT", "C059", Georgia, serif) with wide letter-spacing, plus refined small caps. Sections: a hero with an animated sunburst radiating behind the hotel name and a symmetrical Deco frame that draws itself in gold; "The Suites" as three arched cards with gilded hover states; a dining section with a menu styled as an engraved card; an elevator-dial floor selector that scrolls to sections while its needle rotates; and a reservation form with Deco-bordered inputs. Delight: a gold-foil shimmer sweeping across headings and fan patterns that open on scroll. Elegant and symmetrical on desktop, gracefully stacked on phones.
```

演示说明：示例输入——虚构 1928 年装饰艺术酒店「The Aurelian」：三间虚构套房（Meridian / Solstice / Spire）与虚构价格、Salon 爵士夜、夜宵菜单、前台预订表单（不发送任何数据）。；简化——保留：72 道旋转金色旭日光芒 + 反向虚线环与脉冲环、按首屏尺寸由 JS 计算的阶梯金字塔框从底部中点向两侧自绘（stroke-dashoffset）、金箔扫光标题（background-clip:text）与 SMIL 金色渐变高光、拱形套房卡片的鎏金悬停、滚动进入时从中心向外展开的扇形、雕版风菜单卡、阶梯角框输入框、电梯半圆表盘（弹簧指针跟随滚动、点击楼层跳转、上下呼梯键、楼层铭牌）。删减：可选 Web Audio 电梯铃、预订表单的实时房费估算与房卡动画；手机端表盘缩小而非折叠成可展开徽章；字体为系统 Didone/Baskerville 栈。

### w04-pulse · PULSE 生成式音乐可视化

- 分类：交互与声音　画幅：16:10　提示词：原文
- 效果：点击后浏览器现场合成电子乐，128 根频谱花瓣随鼓点绽放，三种模式切换
- 适用：活动页、音乐产品、需要「能玩」的首屏
- 技法：Web Audio 合成音乐；AnalyserNode 驱动画面；Canvas 反馈拖尾；未播放时也要好看
- 出处：miaai-lab（GitHub Pages：Claude Opus 5.5 100 HTML Files，2026-09） https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/026-pulse-visualizer.txt　原帖/成片：https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/026-pulse-visualizer.html

```text
Build "PULSE — Generative Audio Visualizer". On first click, a built-in generative electronic track starts, synthesized entirely with Web Audio (kick, hi-hat from filtered noise, a bassline and an arpeggiated pad in a minor key at ~110 BPM, evolving every 8 bars). An AnalyserNode drives the centrepiece: a radial frequency bloom — 128 bars around a circle with mirrored symmetry, a pulsating core that swells on each kick, orbiting particles that accelerate with high frequencies, and a smoky trail (canvas feedback with a slight zoom/rotation each frame). Before audio starts, an idle breathing version of the visual must already look beautiful. Palette: sunset-to-violet gradient (#ff9a3c → #ff3c78 → #7b2ff7 → #16d9e3) on deep plum-black #0c0612. Typography: wide, spaced uppercase sans for the title and a small monospace readout of BPM, bar count and track section. Controls: play/pause; mode switch between "Bloom", "Tunnel" (concentric rings rushing toward the viewer) and "Horizon" (mirrored waveform landscape); volume. Optional "Use microphone" button with a graceful fallback if permission is denied.
```

演示说明：示例输入——110 BPM 电子乐自动生成（鼓组、低音线、合成器垫音）；简化——支持三种可视化模式（Bloom/Tunnel/Horizon），缩减了原提示的交互范围;省略了麦克风输入与模式自定义;音乐纯 Web Audio 合成。

### w05-escapement · 独立制表品牌官网（3D 机芯 + 滚动拆解）

- 分类：滚动叙事　画幅：16:10　提示词：原文
- 效果：真实齿轮比运转的 3D 机芯；滚动时机芯拆成零件并标注，再重新组装
- 适用：硬件/奢侈品官网；需要一个「招牌时刻」的品牌站
- 技法：锁定技术栈版本；Three.js 程序化建模；400vh 固定滚动擦洗；慢缓动 0.9–1.4s；先输出共享文件再分页，禁止省略
- 出处：Promptslove（博客（Opus 5.5 评测 Test 1），2026-09） https://promptslove.com/blog/claude-opus-5-5-review/

> 原提示词是 6 页完整站点；本页演示只复现首页的 3D 机芯与滚动拆解。

```text
Build "Escapement" — the website for an independent mechanical watchmaker. A complete
MULTI-PAGE site: 6 interlinked pages sharing one design system, one nav, and smooth page
transitions. This is a luxury horology brand — the site must feel precise, patient, and
expensive. Restraint is the design.

STACK — pin this exact setup:
<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
}}
</script>
Plus GSAP 3.12 + ScrollTrigger, Lenis smooth scroll, Lucide icons, Google Fonts.
Modern API only — SRGBColorSpace, ACESFilmicToneMapping, BufferGeometry, no deprecated calls.
ALL imagery procedural — no external image files.

FILES:
  shared.css · shared.js
  index.html · calibre.html · collection.html · atelier.html · heritage.html · enquire.html
  js/home.js · js/calibre.js · js/collection.js · js/atelier.js · js/heritage.js · js/enquire.js

DESIGN DIRECTION — "patient precision":
  Light-first (luxury horology is photographed bright), with a full dark theme for the
  movement pages. Palette: warm bone-white, deep graphite ink, and ONE metal accent —
  a restrained rose-gold — plus a cool steel blue for technical annotation. Fonts: a fine
  high-contrast serif for display (the kind on a watch dial), a clean grotesk for body, and
  a mono for specifications and reference numbers. Enormous whitespace. Slow easings
  (0.9–1.4s). Nothing bounces. Nothing flashes. The pacing IS the brand.

THE 3D HERO (real Three.js WebGL — the centerpiece, and the hardest thing on the site):
  A mechanical watch MOVEMENT built from primitives — mainspring barrel, gear train (four
  meshing wheels), escape wheel, pallet fork, and a balance wheel. And it must actually RUN:
  the gears rotate at correct RELATIVE ratios (each wheel's angular velocity inversely
  proportional to its tooth count), the escape wheel ticks in discrete steps rather than
  sweeping, and the balance wheel oscillates back and forth at a steady beat. The pallet fork
  rocks in time with the escapement. Get the mechanical relationship right — that's the whole
  point of the object.
  Materials: polished steel, brushed rose-gold plates, blued screws, jewel bearings as tiny
  translucent red cylinders. Env-map reflections, soft key light, and a shallow depth-of-field
  feel. Mouse parallax tilts the movement gently. Dispose on page transition; static gradient
  fallback if WebGL is unavailable.

CUSTOM CURSOR (fresh — must differ from every other cursor style):
  A fine crosshair with a slowly sweeping second-hand tick around it — a thin line that
  advances one discrete step per second, like a watch's seconds hand. On hover over
  interactive elements the crosshair contracts and a hairline circle closes around it.
  Hidden on touch devices.

PAGE 1 — index.html (11 sections):
  1. Hero: the running 3D movement + brand name + a single line of positioning + two
     restrained CTAs. No urgency, no banners.
  2. A quiet credibility strip (founded year, pieces per year, patents, awards) in mono
  3. Three pillars (in-house calibre, hand finishing, limited production) — tilt cards
  4. THE PINNED SCROLL INTERLUDE (400vh) — "the movement, assembled": the signature moment.
     The watch movement DISASSEMBLES into its component parts, which drift apart and hold in
     an exploded view with hairline annotation lines naming each part and its function — then
     reassembles as the user continues scrolling. Each component labels itself as it separates.
     This must be one continuous choreographed sequence driven by scroll scrub, not a slideshow.
  5. The current collection preview (3 pieces, hover reveals the caseback) → collection.html
  6. Hand-finishing detail: a macro comparison slider (machine-finished vs hand-finished
     bevel), drawn procedurally as SVG
  7. Numbers band (animated counters: components per movement, hours of finishing, power
     reserve, beats per hour)
  8. Owner testimonials — set as short, quiet pull quotes, not a carousel of faces
  9. The atelier teaser (a wide procedural workshop illustration) → atelier.html
  10. FAQ accordion (delivery times, servicing, waitlist, water resistance)
  11. Final enquiry CTA + rich footer

PAGE 2 — calibre.html: the in-house movement. A sticky scroll-spy side nav through the
  movement's systems (power, gear train, escapement, regulation, finishing); an interactive
  exploded diagram where hovering a component highlights it and shows its specification;
  a technical spec table (jewels, frequency, power reserve, dimensions, tolerance); a
  finishing-techniques section (Côtes de Genève, perlage, anglage) each illustrated
  procedurally; a patents list; CTA.

PAGE 3 — collection.html: the watches. A collection grid where each piece has a front view,
  a caseback view showing the movement, and a strap selector that recolors live; a filter by
  case material, dial colour, and complication; a piece detail view with full specification,
  edition size, and price on application; a size-on-wrist visualizer (a simple scale
  comparison); waitlist CTA.

PAGE 4 — atelier.html: how they are made. A production-stages walkthrough where an SVG line
  draws between stations as you scroll; the watchmakers (cards with hover reveal); tooling
  and machinery; the quality-control protocol; annual production philosophy and why the
  numbers are small; a workshop gallery; CTA.

PAGE 5 — heritage.html: the house. Founding story; a timeline whose SVG line draws on scroll
  with milestone pieces attached to it; historic calibres; the founder's philosophy as a full-
  bleed statement; press and awards; museum and exhibition appearances; footer.

PAGE 6 — enquire.html: acquisition. A considered enquiry form (piece of interest, strap size,
  preferred contact, message) — validated, calm, no marketing language; boutique and
  authorized-dealer locations; the servicing programme; the waitlist explanation; response-time
  commitment; a closing macro shot of the movement. Footer.

SHARED SYSTEMS (shared.js):
  - Lenis smooth scroll + a hairline scroll-progress bar
  - The watch-tick cursor described above
  - Theme toggle persisted in localStorage, slow crossfade
  - [data-reveal] entrance system (up/left/right/scale, batched with stagger, slow easings)
  - Magnetic buttons (very subtle — this is a luxury brand, not a tech startup)
  - Tilt cards with a faint metal-sheen gradient following the cursor
  - PAGE TRANSITION VEIL: intercept internal links → veil in → navigate → veil out on load

REQUIREMENTS: 6 distinct background patterns (guilloché, perlage dots, hairline grid, warm
  paper grain, radial polish, fine diagonal); active nav link indicated; frosted nav after
  scroll; mobile overlay menu; fully responsive; reduced-motion fully respected (the movement
  slows and the explode becomes static); accessible (semantic HTML, visible focus, aria
  labels, aria-hidden on decorative SVG); 60fps; cap pixel ratio at 2. Every specification
  figure must be consistent across all six pages.

DELIVERY: output shared.css and shared.js complete FIRST, then each page with its JS. No
truncation, no "rest is similar" shortcuts. End with a validation checklist.
```

演示说明：示例输入——虚构制表品牌 Escapement 与虚构机芯 Calibre E-09（18,000 A/h、72 小时动储、21 钻等参数均为示例），页脚注明为虚构品牌。；简化——只复现首页两个招牌时刻：可运转的 3D 机芯 hero（同模数齿轮直接啮合、角速度∝1/齿数，擒纵轮每拍跳 12°，摆轮 2.5Hz 摆动、擒纵叉同步摆动，游丝随摆轮呼吸）与 400vh 固定滚动拆解/标注/重组，外加信誉条和结尾 CTA；省略其余 5 页、秒针光标、Lenis、转场遮罩、tilt 卡片等。three@0.170 ES module 换成 cdnjs r134 UMD（用 sRGBEncoding 代替 SRGBColorSpace），环境反射用程序化 PMREM 场景，浅景深用暗角近似；reduced-motion 下机芯减速、拆解变为静态爆炸图；无 WebGL 时显示静态渐变。

### w06-neon-fluid · 霓虹流体模拟

- 分类：3D 与 WebGL　画幅：16:10　提示词：原文
- 效果：GPU 流体随鼠标搅动，霓虹配色
- 适用：科技品牌首屏背景、互动装置
- 技法：WebGL 着色器；平流/压力求解/涡度约束；鼠标交互
- 出处：theailoser（Tripo（3D Prompts，收录自 X），2026-09-23） https://www.tripo3d.ai/3d-prompts/claude-opus-5-5-2102565611473661963　原帖/成片：https://x.com/theailoser/status/2102565612874596411

> 已打开 tripo3d.ai 单独提示词页，取得逐字原文，比种子里的摘要长得多、细节更完整（ping-pong FBO、Jacobi 迭代次数、HUD 控件清单等）。种子应替换为此原文并去掉 needs_verification。

```text
Write a complete, single-file HTML document containing a high-performance, GPU-accelerated interactive Eulerian Neon Fluid Simulation.

Strict Technical & Aesthetic Requirements:

1. Architecture & Performance:
   - Single-file: All HTML, CSS, and JavaScript/GLSL shaders inline.
   - Zero external dependencies: Pure WebGL 1.0 or 2.0 (no Three.js, no Pixi, no external libraries).
   - GPU-Computed Fluid Dynamics: The simulation must run entirely via ping-pong Framebuffer Objects (FBOs) using custom fragment shaders for:
     a) Advection (velocity & dye)
     b) Divergence calculation
     c) Pressure Poisson solver (Jacobi iteration, 20-30 iterations per frame)
     d) Gradient subtraction / velocity projection
     e) Vorticity confinement (adds turbulent swirls and prevents the fluid from turning into dull, blurry mush).

2. Visual Fidelity (The "Neon Smoke" Look):
   - Pitch-black void background (`#050508`).
   - Additive / High-Dynamic-Range blending for dye injection.
   - Dynamic palette: Each cursor flick or touch drag injects high-luminosity neon dye that cycles smoothly through vivid cyber hues (electric cyan `#00F0FF`, hot magenta `#FF007F`, deep ultraviolet, and radiant gold).
   - Display shader enhancements: Include a post-processing pass directly in the final render shader that applies subtle bloom/glow, tone mapping, and chromatic aberration around the swirling edges of the fluid.

3. Interaction:
   - Mouse & Touch: Rapid cursor movement or dragging injects velocity proportional to mouse speed, along with dense glowing dye.
   - Passive Ambient Motion: When idle, generate subtle procedural curl noise or gentle drifting vortices so the canvas is never completely static.
   - Controls: A sleek, ultra-minimal glassmorphism HUD tucked into a corner (with auto-hide on inactivity):
     * Viscosity slider
     * Dye dissipation / persistence slider
     * Splat radius slider
     * "Clear Canvas" button
     * Toggle button to cycle color themes (Cyberpunk, Thermal Inferno, Bioluminescent Deep).

4. Production Polish:
   - Automatically handle high-DPI displays and `resize` events without stretching or clearing the FBO textures.
   - Graceful fallback check for floating-point texture support (`OES_texture_float` / `OES_texture_half_float`).
   - Clean, bug-free, fully implemented code with zero placeholders or truncated comments.

Return only the fully populated HTML file ready to run directly in Chrome/Safari/Firefox.
```

演示说明：示例输入——无外部输入；霓虹色板（青、洋红、酸橙、橙、电光蓝）与两条 Lissajous 幽灵光标路径为演示自拟。；简化——原条目只有一句摘要式提示词，演示按摘要实现完整 GPU 流体：平流、Jacobi 压力求解 ×20、涡度约束、染料场、轻量 bloom，显示层用染料梯度描边做霓虹灯管感。为无人操作的缩略预览加入自动搅动的幽灵光标（用户移动时让出控制，空闲约 3 秒后接回），并定时甩出新色笔触；WebGL2 半浮点→WebGL1 半浮点/浮点→无线性过滤时手动双线性→都不支持时降级为程序化噪声画面。

### w07-sakura-valley · 樱花山谷 3D 体素场景

- 分类：3D 与 WebGL　画幅：16:10　提示词：原文
- 效果：体素风樱花谷，多机位切换，蓝调时刻/清晨/雨天氛围切换
- 适用：文旅、游戏官网、沉浸式首屏
- 技法：Three.js 体素；多机位；天气/时段切换
- 出处：@宝玉（dotey）（Tripo（3D Prompts，收录自 X），2026-09-23） https://www.tripo3d.ai/3d-prompts/claude-opus-5-5-2102565403109085669　原帖/成片：https://x.com/dotey/status/2102565403109085669

> 已打开 tripo3d.ai 单独提示词页，取得逐字原文（英文版，8 段完整规格：创作方向/参考图用法/构图/建模精度/色彩氛围/交互界面/工程性能/交付前校验）。种子里的摘要只覆盖了第 1、3、6 段的一小部分，应替换为此原文并去掉 needs_verification。原帖为中文写作，本页展示的是英文翻译版；未在页面上找到中文原文链接。

```text
Create a polished 3D landscape web experience that can be explored and interacted with in real time in a browser.

Theme: Japanese cherry blossom valley.
Use HTML, CSS, and JavaScript. Do not generate images or provide only a design concept,
and do not fake 3D with a single background image and parallax effects. I need a working, explorable finished product.

【1. Creative Direction】

Create a complete, continuous valley landscape with clear depth across near and distant areas,
not an isolated prop, floating island, diorama with a base, or mere technical demo.

The style is modern, refined voxel art:
retain the visual language of cubic geometry, while keeping the image high-resolution, antialiased, and finely lit.
Do not use retro low-resolution pixelation, oversized block construction, or a pixel filter over the scene.

Prioritize visual quality. It is better to include fewer features than to sacrifice composition, materials, or lighting.

【2. How to Use Reference Images】

If reference images are provided, first understand their compositional layers, scale, lighting, and color relationships.
Use them only as inspiration for the atmosphere and visual language, then redesign the scene,
without copying the positions of the buildings, trees, mountains, or roads or recreating the image 1:1.

The reference image is not background material for the web page. The scene itself must be built from real 3D geometry.

【3. Scene Composition】

When opened, the page should immediately show a complete, compelling composition,
so users should not have to rotate the camera first to find a good angle.

Use a perspective camera, not an orthographic, diorama-style top-down camera.
The composition must have a clear foreground, midground, and background:

Foreground:
a prominent old cherry tree with rocks, grasses, plants, a stone lantern, and a few fallen blossoms,
creating a natural frame around the edge of the image without blocking the river, bridge, or main buildings.

Midground:
a winding river that leads the eye into the scene, crossed by a red wooden bridge;
a village, teahouse, shrine, and paths distributed along the terrain, with believable circulation between the buildings.
The ground must have elevation changes, shorelines, and natural transitions rather than models placed evenly on a flat plane.

Background:
a multi-tiered pagoda on the hillside, forests at varying distances, mountain ridges, and snow-capped mountains in the distance.
Show distance through changes in scale, occlusion, warm-to-cool shifts, and atmospheric perspective,
rather than simply shrinking distant objects.

Do not distribute every element evenly across the scene. Establish hierarchy, variation in density, negative space, and a clear visual focal point.

【4. Modeling and Image Quality】

Cherry tree:
the trunk should have bends, branches, forks, and visible roots; the canopy should consist of irregular clusters of blossoms,
with gaps, variation in thickness, and visible branches. Do not make it out of a few regular spheres or blocky clumps.

Architecture:
roofs should include layered tiles, eaves, beams, columns, and lattice windows;
different buildings should vary in purpose, scale, and height. Do not fill the valley with copies of the same house.

Terrain:
include wet rocks, grasses, and vegetation transitions along the banks.
Avoid overly regular steps, repeating stripes, checkerboard patterns, and obvious procedural grids.

Water:
the surface must reflect its surroundings, with moderate ripples, depth variation, and natural transitions at the banks.
Use real scene reflections wherever possible; when reducing quality for performance, keep the result visually convincing.
Do not substitute flickering noise, extreme distortion, or a solid blue plane for water.

Details:
you may include a few koi, fallen blossoms, fireflies, waterfalls, and distant birds,
but they should support the atmosphere without making the image feel cluttered.
Do not pile on details just to advertise a high model count.

【5. Color and Atmosphere】

The default atmosphere is blue hour:
cool-toned valleys and distant mountains, soft pink cherry blossoms, and warm but not overexposed lantern and window light.
Keep the warm light concentrated in inhabited areas; do not tint the entire environment orange.

Use soft shadows, contact shading, sensible exposure,
restrained bloom, antialiasing, and layered fog that conveys distance.

Avoid a washed-out or gray appearance, oversaturation, dense fog across the entire scene, overexposed lights, and obvious aliasing.
The cubic geometry can remain crisp, but the rendering itself must not look crude.

Also provide "Morning" and "Rainy" atmospheres;
when switching between them, update the sky, ambient light, fog, and local effects together,
rather than merely changing the background color.

【6. Interaction and Interface】

Provide four designed camera views:
valley panorama, low riverside angle, temple path, and hillside overlook.
Transitions should be smooth, and each view must have its own compositional value.

Basic interaction:
drag with the mouse to look around, and use the scroll wheel to zoom or move forward; support dragging and pinch-to-zoom on touchscreens.
Provide controls to reset the view, hide the interface, and save the current image.

Optional enhancements:
free exploration, a slow camera tour, and ambient sound.
Ambient sound must be off by default and play only after the user clicks to enable it.
Additional features must not reduce the quality of the default composition.

Keep the interface restrained and thoughtfully designed, with the landscape taking priority.
Place the title and control bar at the edges so they do not obscure the visual focal point.
On both desktop and mobile, buttons must stay within the viewport, text must not overlap, and all controls must remain usable.

【7. Engineering and Performance】

You may use Three.js / WebGL and version-pinned, mutually compatible CDN dependencies.
Prefer mature rendering capabilities instead of rewriting an entire engine for the sake of "zero dependencies."

Keep the custom HTML, CSS, and JavaScript organized in a single HTML file wherever practical.
Generate the scenery with procedural geometry and materials; do not depend on external images or 3D model assets.

Use suitable batching or instanced rendering for repeated objects;
manage subdivisions, shadows, reflections, and render resolution appropriately.
Provide high-quality and lightweight modes, with lighter settings enabled by default on mobile.
Do not pursue detail by endlessly increasing the voxel count.

Include a loading indicator, a message when WebGL is unsupported, and necessary error handling.
Do not autoplay audio when sound has not been enabled; respect the system preference for reduced motion.

【8. Pre-Delivery Validation】

Do not deliver immediately after writing the code.

If the current environment supports running a browser and taking screenshots, open the page first,
check the default camera, all four views, atmosphere switching, and desktop and mobile layouts,
then correct obvious composition, exposure, occlusion, and rendering issues based on the screenshots.

Pay particular attention to:
blank screens, failed loading, and console errors;
intersections, flickering, shadow acne, overexposure, and abnormal water;
whether the default view truly looks like a complete landscape rather than a small diorama;
and whether the feature buttons actually work and stay within bounds on mobile.

You may use browser screenshots for validation, but do not call image-generation tools.
State honestly which tests were not completed; do not claim that they have been verified.

Final deliverables:
1. An actual, openable HTML file or an interactive preview supported by the current environment.
2. If screenshots are possible, include one real screenshot of the browser rendering.
3. A brief explanation of the controls and any required runtime conditions.

Complete the build directly; make consistent design decisions for noncritical details yourself,
rather than repeatedly asking me to decide implementation issues you can resolve independently.
```

演示说明：示例输入——樱花谷体素场景：河流、神社鸟居、瀑布、周期性樱花飘落；简化——采用体素风格 3D 场景;支持 5 个固定机位与 3 种天气模式(蓝调时刻/清晨/雨天)，自动巡游;省略了性能动态调整与完整 WebGL 回退渐进增强。

## 工具箱

### 六段式骨架模板

```text
<inputs>
先问我要：[产品名/主题]、[时长]、[画幅 1920x1080 / 1080x1920 / 1080x1080]、[1 个主色]、[参考素材：截图/实拍/音乐]
</inputs>

<direction>
风格：[一句话定调，如「高端极简，每个镜头只讲一件事，大量留白」]
字体：[1 个展示字体 + 1 个正文字体]
运动：[如「弹簧缓动，最多轻微过冲；遮罩文字揭示；匹配剪辑」]
禁用：弹跳缓动、粒子爆炸、光晕、镜头光斑、RGB 分离、镜头抖动、紫色渐变
</direction>

<structure>
[BPM] BPM，[N] 小节，每小节 [2] 秒。
第 1 小节：[钩子，逐词落在节拍上]
第 2 小节：[……]
最后：[Logo / 网址定格]
</structure>

<build>
1. 单个 HTML 文件，[分辨率]。所有样式在 seek(t) 里由时间计算：不用 CSS 动画、不用定时器、帧与帧之间不存状态。
2. 随机数用固定种子，禁止 Math.random。
3. 每个剪辑点落在强拍上。
4. 用 Playwright 逐帧渲染，ffmpeg 编码为 [60]fps MP4。
5. 全量渲染前先抽 20 帧检查，拥挤、重叠、看不清的先修。
</build>

<gotchas>
切换中的文字要有独立的进出时间，否则会重叠。
被镜头缩放的元素不要加 will-change，否则文字会糊。
</gotchas>

<start>
先问我要输入，再给我一份每个时间点都对齐节拍的分镜表，确认后再写代码。
</start>
```

### 前端审美增强块（Anthropic）

```text
<frontend_aesthetics>

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:

- Overused font families (Inter, Roboto, Arial, system fonts)

- Clichéd color schemes (particularly purple gradients on white backgrounds)

- Predictable layouts and component patterns

- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!

</frontend_aesthetics>
```

### 质量底线（miaai-lab 共享要求）

```text
SHARED REQUIREMENTS (apply to every page in this 100-page collection):
1. One standalone HTML5 file. All CSS inline in <style>, all JavaScript inline in <script>. No external resources of any kind: no CDN, no libraries, no web fonts, no external images/SVG/audio files, no network requests. All visuals come from CSS, inline SVG, Canvas and procedural code.
2. Valid HTML5: <!DOCTYPE html>, <html lang="en">, <meta charset="utf-8">, a viewport meta tag, a meaningful <title> and meta description, well-nested semantic markup, unique ids, labels/aria attributes for controls, <button type="button"> for actions.
3. Typography from local system font stacks only, always ending in a generic family; display lettering may be drawn with SVG or Canvas.
4. Responsive from 360px phones to large desktops with no horizontal page scroll; canvases match their container and devicePixelRatio (capped at 2) and re-layout on resize.
5. Works offline by opening the file directly (file://); no console errors; storage access guarded with try/catch.
6. Smooth motion via requestAnimationFrame and transform/opacity; animation pauses when the tab is hidden where it matters; honours prefers-reduced-motion with a calmer fallback.
7. Pointer events so mouse and touch both work; visible :focus-visible styles; keyboard support where it makes sense.
8. Any sound is synthesized with the Web Audio API, starts only after a user gesture, and has a visible mute/toggle.
9. Premium finish: a deliberate palette and spacing, polished micro-interactions, a beautiful first frame before any interaction, and original copy (no lorem ipsum). Factual content must be accurate; fictional brands, people and data are clearly fictional.
10. Quality bar: visually impressive, bookmark-worthy, showcase-grade, premium, full of delightful details, and clearly distinct from the other 99 pages in concept, layout, palette, typography and motion.
```

### 导出 MP4 提示词

```text
把这个动画导出成 MP4：
1. 页面暴露 window.DURATION 和 window.seek(t)；所有动画由 t 计算，不用 CSS transition、不用定时器、不用 Math.random（改用固定种子）。
2. 用 Playwright 打开页面，按 [60]fps 逐帧调用 seek(t) 并截图，分辨率 [1920x1080]。
3. 每帧渲染 3 个子帧（t−1/240s、t、t+1/240s），用 ffmpeg tmix 混合出运动模糊。
4. ffmpeg 编码 libx264、crf 18、yuv420p；有音轨就混进去，并 loudnorm 到 −14 LUFS。
5. 全量渲染前，先每 0.5 秒抽一帧拼成联系表给我看。
```

### 运动词汇表

| 想要的效果 | 提示词写法 | 说明 | 出处 |
|---|---|---|---|
| 弹簧缓动，轻微过冲 | springs everywhere, a tiny overshoot at most | 比 ease-in-out 更有物理感 | @zero UI 变形 |
| 慢而贵的节奏 | slow easings (0.9–1.4s). Nothing bounces. Nothing flashes. | 奢侈品、品牌站 | Promptslove Escapement |
| 遮罩文字揭示 | masked type reveals | 文字从遮罩里滑出 | @zero 高端产品片 |
| 逐词落拍 | the hook lands word by word on the beats | 开场钩子 | @zero 高端产品片 |
| 匹配剪辑 | match cuts (measure element positions at runtime) | 形状或位置连续切到下一镜 | @zero 高端产品片 |
| 带运动模糊的甩镜 | a motion-blurred whip onto one hero clip | 强调主角镜头 | @zero 高端产品片 |
| 一个形体不切镜 | one shape, never cut: the same element morphing its size, radius and color | UI 动效的连续感 | @zero UI 变形 |
| 错峰入场 | one well-orchestrated page load with staggered reveals (animation-delay) | 网页首屏 | Anthropic 前端审美 |
| 滚动擦洗的固定段落 | pinned scroll interlude, one continuous choreographed sequence driven by scroll scrub, not a slideshow | 网页招牌时刻 | Promptslove Escapement |
| 手作感帧率 | motion on twos (24fps, 2-frame holds) | 像手绘动画 | charlie947/motion-graphics-skills |
| 真实运动模糊 | render 3–4 subframes per frame, blend with ffmpeg tmix | 导出 MP4 时 | @zero |
| 无缝循环 | the last frame is the first frame, so it loops | 社媒循环、封面动图 | @zero UI 变形 |
| 卡点 | every cut sits on a downbeat, every UI hit on a beat | 配乐视频 | @zero 高端产品片 |
| 一镜到底推进 | starts in a room, zooms into …, then into …, finally … | 尺度类叙事 | @Taelin |

### 禁用词清单

bouncy easing, particle bursts, shockwave rings, glows, neon glows, lens flares, RGB split, camera shake, grid floors, flashing backgrounds, gradients on UI chrome, typewriter text, purple gradients on white, Inter / Roboto / Arial as the display face

### 翻车修正

| 症状 | 修正提示词 | 出处 |
|---|---|---|
| 画面平庸、有模板感 | 加上 direction 段和禁用清单；给一个具体参考；写明「不要最安全的平均版本」 | newfacedesign / Anthropic |
| 切换时文字叠在一起 | Text that swaps inside a morphing container needs its own enter and exit timing. 渲染每个节拍一帧，修掉重叠和拥挤。 | @zero |
| 有几秒画面不动 | Something happens on every beat. 删掉空帧和死时间。 | @zero / opus-visual-motion-engine |
| 角色粗圆描边，像儿童画 | 细线条、少描边、更成熟的造型语言；先定主题再定风格。 | iArt |
| 镜头放大后文字发糊 | Never put will-change on anything the camera scales. | @zero |
| 3D 翻转卡片两面同时显示 | Never set opacity or filter on a preserve-3d element. Fade its wrapper instead. | @zero |
| 循环接缝处卡一下 | Make the last frame identical to the first, cursor position and speed included. | @zero |
| 导出的帧闪烁、每次不一样 | 禁用 Math.random 和定时器，所有状态由 seek(t) 计算，随机数用固定种子。 | shipvideo / @TechHalla |
| 长页面输出被截断 | Output shared.css and shared.js complete FIRST, then each page. No truncation, no "rest is similar" shortcuts. 同时把输出上限调到 32k 以上。 | Promptslove / Promptowy |
| 音效忽大忽小、对不上画面 | Place each sound effect so its measured peak lands on the event. Keep the effects quiet under the music. | @zero / iArt |