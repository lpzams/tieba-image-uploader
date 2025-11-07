
#tieba-image-uploader

使得贴吧可以直接复制图片到发帖回帖的文本框
=======
# 百度贴吧直接粘贴图片脚本（支持 Typora）

## 功能介绍

这是一个浏览器脚本(Tampermonkey/Greasemonkey)，让百度贴吧编辑器支持**直接粘贴图片**的功能。

### 主要功能
- 支持通过 `Ctrl+V` (Windows) 或 `Cmd+V` (Mac) 直接粘贴图片到编辑框
- 图片会立即显示在编辑器中，就像粘贴文字一样
- **🆕 支持从 Typora 等富文本编辑器复制带图片的内容**
- **🆕 自动提取 HTML 中的图片并转换**
- 自动将图片转换为 Base64 格式嵌入
- 支持富文本编辑器、contenteditable 元素和 textarea
- 提供可视化的操作提示
- 支持多种图片格式(PNG、JPG、GIF等)

### 新功能 v2.3
- ✅ **保留原文本格式和换行** - 修复粘贴后段落和换行丢失的问题
- ✅ **智能清理 Markdown 语法** - 只删除图片语法标记，保留其他内容
- ✅ 自动清理 `![xxx](` 前缀和 `)` 后缀
- ✅ 支持从 Typora 复制包含图片的 Markdown 内容
- ✅ 自动解析 HTML 中的所有图片
- ✅ 支持网络图片 URL (http/https)
- ✅ 支持 Base64 DataURL

## 安装步骤

### 1. 安装浏览器扩展

首先需要安装一个用户脚本管理器扩展:

#### Chrome/Edge 浏览器
1. 访问 [Tampermonkey Chrome 扩展页面](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. 点击"添加至 Chrome" 或 "添加至 Edge"
3. 确认安装

#### Firefox 浏览器
1. 访问 [Tampermonkey Firefox 扩展页面](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
2. 点击"添加到 Firefox"
3. 确认安装

#### 其他浏览器
- Safari: 安装 [Userscripts](https://apps.apple.com/app/userscripts/id1463298887)
- Opera: 直接使用 Chrome 扩展商店

### 2. 安装脚本

#### 方法一：直接安装(推荐)
1. 点击 [tieba-paste-image.user.js](tieba-paste-image.user.js) 文件
2. Tampermonkey 会自动识别并打开安装页面
3. 点击"安装"按钮

#### 方法二：手动安装
1. 打开 Tampermonkey 管理面板
2. 点击"添加新脚本"
3. 复制 `tieba-paste-image.user.js` 文件的全部内容
4. 粘贴到编辑器中
5. 按 `Ctrl+S` 保存

### 3. 验证安装

1. 访问 [百度贴吧](https://tieba.baidu.com/)
2. 进入任意贴吧，点击发帖
3. 页面右上角应该会出现绿色提示: "图片粘贴功能已启用！"

## 使用方法

### 基本使用

1. **打开发帖页面**
   - 进入任意贴吧
   - 点击"发表新贴"或"回复"

2. **复制图片**
   - 从任何地方复制图片(右键复制图片、截图工具等)
   - 或使用 `Ctrl+C` / `Cmd+C` 复制图片

3. **粘贴图片**
   - 将光标放在编辑框内
   - 按 `Ctrl+V` (Windows) 或 `Cmd+V` (Mac)
   - 图片会立即显示在编辑器中，就像粘贴文字一样

### 支持的图片来源

- 网页上的图片(右键复制图片)
- 截图工具截取的图片
- 从图片编辑软件复制的图片
- 从文件管理器复制的图片文件
- **🆕 从 Typora 复制的带图片内容**
- **🆕 其他富文本编辑器（Word、Notion 等）**

### 操作提示

脚本会在页面右上角显示提示信息:

- **绿色提示**: 操作成功
  - "正在处理图片..." - 图片正在转换
  - "图片已粘贴到编辑器！" - 图片已成功插入
- **红色提示**: 操作失败或需要注意
  - "未找到编辑器，请确保光标在编辑框内" - 需要先点击编辑框

## 常见问题

### Q1: 粘贴后没有反应?

**解决方法:**
1. **确保光标在编辑框内** - 先点击一下编辑框，让光标闪烁
2. 确认已经正确安装脚本
3. 刷新页面重试
4. 按 F12 打开控制台，查看是否有错误信息

### Q2: 提示"未找到编辑器"?

**解决方法:**
1. **点击编辑框** - 确保编辑框被激活
2. 等待页面完全加载完成
3. 尝试点击一下编辑器内部再粘贴
4. 查看控制台日志，确认脚本是否正确加载

### Q3: 从 Typora 复制的图片无法显示?

**原因:**
- Typora 中的图片如果使用**本地路径** (`file://`)，浏览器安全策略不允许加载
- 只有**网络 URL** 的图片才能正常加载

**解决方法:**
1. **配置 Typora 图床上传**（推荐）
   - 文件 → 偏好设置 → 图像
   - 设置"插入图片时" → "上传图片"
   - 配置图床（如 PicGo + Gitee/阿里云OSS）

2. **使用网络图片**
   - 确保图片 URL 是 `https://` 开头

3. **单独复制图片**
   - 在 Typora 中右键图片 → 复制图像
   - 直接粘贴到贴吧

**查看详细说明**: [TYPORA_GUIDE.md](TYPORA_GUIDE.md)

### Q4: 图片可以粘贴但发帖后看不到?

**说明:**
- 图片使用 Base64 格式嵌入
- 如果百度贴吧不支持 Base64 图片，可能需要配合贴吧自己的上传功能
- 建议先在编辑器中粘贴预览，然后使用贴吧的图片上传功能正式上传

### Q5: 支持哪些浏览器?

**兼容性:**
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ⚠️ 旧版本浏览器可能不支持

### Q6: 可以同时粘贴多张图片吗?

可以！从 Typora 等编辑器复制包含多张图片的内容时，脚本会自动提取所有图片并逐一处理。

### Q7: 脚本是否安全?

- 脚本完全开源，代码可见
- 仅在百度贴吧网站运行
- 不收集任何用户信息
- 不向第三方发送数据
- 图片仅在本地转换为 Base64，不会上传到其他服务器

## 技术原理

1. **监听粘贴事件**: 监听文档和编辑器 iframe 的 `paste` 事件
2. **提取图片数据**: 从剪贴板 `clipboardData` 中提取图片 Blob
3. **转换为 Base64**: 使用 FileReader API 将 Blob 转换为 Base64 DataURL
4. **插入到编辑器**:
   - 富文本编辑器: 创建 `<img>` 元素插入到光标位置
   - Textarea: 插入 Markdown 格式的图片链接
5. **保持光标位置**: 将光标移动到插入的图片后面

## 故障排除

### 启用脚本调试

1. 打开浏览器控制台(F12)
2. 切换到"控制台"选项卡
3. 查看脚本输出的调试信息:
   ```
   百度贴吧直接粘贴图片脚本已加载
   粘贴事件触发，检查剪贴板内容
   检测到图片: Blob {...}
   图片转换为 Base64 完成
   找到富文本编辑器 iframe: ...
   图片插入成功
   ```

### 手动测试编辑器检测

在控制台中运行以下代码，查看脚本能否找到编辑器:

```javascript
// 测试是否能找到 iframe 编辑器
document.querySelectorAll('iframe').forEach(iframe => {
    try {
        const doc = iframe.contentDocument;
        console.log('iframe:', iframe, 'body:', doc.body, 'contentEditable:', doc.body.contentEditable);
    } catch(e) {
        console.log('无法访问 iframe');
    }
});

// 测试是否能找到 contenteditable 元素
console.log('contenteditable 元素:', document.querySelectorAll('[contenteditable="true"]'));
```

### 检查脚本状态

1. 点击浏览器右上角的 Tampermonkey 图标
2. 查看脚本是否处于启用状态
3. 如果显示为禁用，点击切换为启用

### 重新安装脚本

1. 打开 Tampermonkey 管理面板
2. 找到"百度贴吧粘贴上传图片增强"
3. 点击删除
4. 按照安装步骤重新安装

## 高级配置

### 自定义配置

你可以编辑脚本来调整一些行为:

```javascript
// 修改提示显示时间(第 70 行)
setTimeout(() => hint.remove(), 300);
}, 2500); // 改为 3000 可以显示更久

// 修改图片样式(第 49-55 行)
.pasted-image {
    max-width: 100%;     // 可以改为固定宽度，如 500px
    height: auto;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

// 添加图片压缩功能(可选)
// 在 blobToBase64 函数中添加压缩逻辑
```

## 更新日志

### v2.3 (2025-11-07)
- **保留文本格式和换行** - 修复粘贴后段落消失的问题
- **智能清理 Markdown** - 只删除 `![xxx](` 和 `)`，保留其他文本
- 改进文本节点处理逻辑
- 使用 replace 替代 remove，保留文本内容
- 添加 inline-block 样式保持图片占位符正确显示

### v2.2 (2025-11-07)
- **自动清理 Markdown 语法** - 粘贴时自动去掉 `![image-xxx](` 前缀和 `)` 后缀
- 修复图片前后残留 Markdown 标记的问题
- 优化 HTML 内容解析逻辑
- 改进占位符替换机制

### v2.1 (2025-11-07)
- 支持从 Typora 复制带图片的内容
- 自动提取 HTML 中的图片 URL
- 支持批量处理多张图片
- 添加网络图片加载功能

### v2.0 (2025-11-03)
- 重新设计粘贴逻辑，支持直接在编辑框中显示图片
- 使用 Base64 格式嵌入图片
- 改进编辑器检测机制
- 支持富文本编辑器、contenteditable 和 textarea
- 优化图片插入到光标位置的逻辑
- 添加更详细的调试日志

### v1.0 (2025-11-03)
- 首次发布
- 基础粘贴功能

## 反馈与支持

如果遇到问题或有改进建议，请:

1. 查看本文档的"常见问题"部分
2. 在浏览器控制台查看错误信息
3. 提供详细的问题描述和截图

## 许可证

本脚本采用 MIT 许可证，可自由使用和修改。

---

**享受更便捷的贴吧发帖体验！**
