# 视频与封面位置

主 README 的「视频预览」位于项目介绍之后、静态截图之前。先用当前页面截图介绍项目，录屏完成后在 `VIDEO_PREVIEW_START` 与 `VIDEO_PREVIEW_END` 之间放视频链接。

建议录制 45–60 秒：首屏与流程舞台 → 词条 A/B 对比 → 载入一套场景配方 → 填入主题 → 复制提示词。

## 文件约定

| 文件 | 用途 |
| --- | --- |
| `preview.mp4` | 项目介绍或操作录屏，建议 MP4 / H.264 |
| `poster.jpg` | 视频封面 |

以上文件名为预留约定，当前尚未加入视频或封面。

GitHub README 可参照之前图鉴的做法：在 GitHub 编辑界面上传录屏，把生成的 `https://github.com/user-attachments/assets/...` 链接单独放在「视频预览」下。上传完后用未登录页面检查能否播放。

需要把视频随本地资料包一起交付时，把文件放在本目录，再运行 `python3 scripts/package.py`。大视频可以作为 GitHub Release 附件保存，README 链接到附件。
