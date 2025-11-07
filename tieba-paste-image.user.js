// ==UserScript==
// @name         百度贴吧直接粘贴图片（支持Typora）
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  支持在百度贴吧编辑器中直接Ctrl+V粘贴图片，图片会直接显示在编辑框中。支持从Typora等富文本编辑器复制带图片的内容，保留所有原始格式
// @author       You
// @match        *://tieba.baidu.com/*
// @license      MIT
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('百度贴吧直接粘贴图片脚本已加载');

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .paste-image-hint {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .paste-image-hint.error {
            background: #f44336;
        }

        .pasted-image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    // 显示提示信息
    function showHint(message, type = 'success') {
        const hint = document.createElement('div');
        hint.className = `paste-image-hint ${type}`;
        hint.textContent = message;
        document.body.appendChild(hint);

        setTimeout(() => {
            hint.style.opacity = '0';
            hint.style.transition = 'opacity 0.3s';
            setTimeout(() => hint.remove(), 300);
        }, 2500);
    }

    // 将Blob转换为Base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // 在富文本编辑器中插入图片
    function insertImageIntoRichEditor(editor, imageUrl) {
        try {
            const img = editor.ownerDocument.createElement('img');
            img.src = imageUrl;
            img.className = 'pasted-image';
            img.alt = '粘贴的图片';

            // 获取当前选区
            const selection = editor.ownerDocument.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);

                // 将光标移到图片后面
                range.setStartAfter(img);
                range.setEndAfter(img);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // 如果没有选区，就插入到编辑器末尾
                editor.appendChild(img);
            }

            return true;
        } catch (e) {
            console.error('插入图片到富文本编辑器失败:', e);
            return false;
        }
    }

    // 在普通元素中插入图片
    function insertImageIntoElement(element, imageUrl) {
        try {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'pasted-image';
            img.alt = '粘贴的图片';

            // 如果是 contenteditable 元素
            if (element.contentEditable === 'true') {
                return insertImageIntoRichEditor(element, imageUrl);
            }

            // 如果是 textarea 或 input，转换为 markdown 格式
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                const markdown = `\n![图片](${imageUrl})\n`;
                const start = element.selectionStart;
                const end = element.selectionEnd;
                const text = element.value;
                element.value = text.substring(0, start) + markdown + text.substring(end);
                element.selectionStart = element.selectionEnd = start + markdown.length;

                // 触发 input 事件
                element.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            }

            // 尝试直接插入
            if (element.appendChild) {
                element.appendChild(img);
                return true;
            }

            return false;
        } catch (e) {
            console.error('插入图片失败:', e);
            return false;
        }
    }

    // 查找编辑器元素
    function findEditor() {
        // 优先查找富文本编辑器的 iframe
        const iframes = document.querySelectorAll('iframe');
        for (let iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const body = iframeDoc.body;

                // 检查是否可编辑
                if (body && (body.contentEditable === 'true' || body.designMode === 'on')) {
                    console.log('找到富文本编辑器 iframe:', iframe);
                    return { type: 'iframe', element: body, iframe: iframe };
                }
            } catch (e) {
                // 跨域 iframe 无法访问
            }
        }

        // 查找 contenteditable 元素
        const editables = document.querySelectorAll('[contenteditable="true"]');
        if (editables.length > 0) {
            // 优先选择当前聚焦的元素
            for (let el of editables) {
                if (document.activeElement === el || el.contains(document.activeElement)) {
                    console.log('找到聚焦的 contenteditable 元素:', el);
                    return { type: 'contenteditable', element: el };
                }
            }
            console.log('找到 contenteditable 元素:', editables[0]);
            return { type: 'contenteditable', element: editables[0] };
        }

        // 查找 textarea
        const textareas = document.querySelectorAll('textarea');
        for (let textarea of textareas) {
            if (textarea.offsetParent !== null && !textarea.disabled) {
                console.log('找到 textarea:', textarea);
                return { type: 'textarea', element: textarea };
            }
        }

        // 查找可能的编辑区域
        const selectors = [
            '.edui-body-container',
            '.editor-content',
            '[role="textbox"]',
            '.post-editor'
        ];

        for (let selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                console.log('找到编辑区域:', selector, el);
                return { type: 'custom', element: el };
            }
        }

        return null;
    }

    // 从URL加载图片并转换为Blob
    async function urlToBlob(url) {
        try {
            // 如果是 data URL，直接转换
            if (url.startsWith('data:')) {
                const res = await fetch(url);
                return await res.blob();
            }

            // 如果是网络图片，尝试加载（可能有跨域问题）
            const res = await fetch(url);
            return await res.blob();
        } catch (e) {
            console.error('加载图片失败:', url, e);
            return null;
        }
    }

    // 处理HTML内容，替换图片为占位符（不删除任何Markdown语法）
    function processHTMLContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        console.log('处理前的HTML:', doc.body.innerHTML);

        // 只替换图片为占位符，保留所有原始文本内容
        doc.querySelectorAll('img').forEach((img) => {
            const placeholder = doc.createElement('span');
            placeholder.setAttribute('data-image-placeholder', 'true');
            placeholder.style.display = 'inline-block';
            img.replaceWith(placeholder);
        });

        const result = doc.body.innerHTML;
        console.log('处理后的HTML:', result);
        return result;
    }

    // 从HTML中提取图片
    async function extractImagesFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const images = doc.querySelectorAll('img');
        const imageData = [];

        for (let img of images) {
            const src = img.src;
            if (src) {
                console.log('发现HTML中的图片:', src);

                // 尝试加载图片
                const blob = await urlToBlob(src);
                if (blob) {
                    const base64 = await blobToBase64(blob);
                    imageData.push({
                        original: img,
                        src: src,
                        base64: base64,
                        alt: img.alt || '图片'
                    });
                }
            }
        }

        return imageData;
    }

    // 处理粘贴事件
    async function handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        console.log('粘贴事件触发，检查剪贴板内容');

        // 查找直接的图片文件
        let imageBlob = null;
        let htmlContent = null;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // 检查是否是图片文件
            if (item.type.indexOf('image') !== -1) {
                imageBlob = item.getAsFile();
                console.log('检测到图片文件:', imageBlob);
            }

            // 检查是否有HTML内容（Typora复制的内容）
            if (item.type === 'text/html') {
                htmlContent = await new Promise(resolve => {
                    item.getAsString(str => resolve(str));
                });
                console.log('检测到HTML内容');
            }
        }

        // 如果有直接的图片文件，优先处理
        if (imageBlob) {
            e.preventDefault();
            e.stopPropagation();

            try {
                showHint('正在处理图片...', 'success');
                const base64 = await blobToBase64(imageBlob);
                console.log('图片转换为 Base64 完成');

                const editorInfo = findEditor();
                if (!editorInfo) {
                    showHint('未找到编辑器，请确保光标在编辑框内', 'error');
                    console.error('未找到编辑器');
                    return;
                }

                let success = false;
                if (editorInfo.type === 'iframe') {
                    success = insertImageIntoRichEditor(editorInfo.element, base64);
                } else {
                    success = insertImageIntoElement(editorInfo.element, base64);
                }

                if (success) {
                    showHint('图片已粘贴到编辑器！', 'success');
                    console.log('图片插入成功');
                } else {
                    showHint('图片插入失败，请重试', 'error');
                    console.error('图片插入失败');
                }

            } catch (error) {
                console.error('处理图片时出错:', error);
                showHint('处理图片时出错: ' + error.message, 'error');
            }
            return;
        }

        // 如果有HTML内容，提取其中的图片
        if (htmlContent) {
            console.log('开始从HTML中提取图片');
            console.log('原始HTML内容:', htmlContent); // 调试日志

            const images = await extractImagesFromHTML(htmlContent);

            if (images.length > 0) {
                e.preventDefault();
                e.stopPropagation();

                console.log('从HTML中提取到', images.length, '张图片');
                showHint(`正在处理 ${images.length} 张图片...`, 'success');

                try {
                    const editorInfo = findEditor();
                    if (!editorInfo) {
                        showHint('未找到编辑器，请确保光标在编辑框内', 'error');
                        console.error('未找到编辑器');
                        return;
                    }

                    // 处理HTML内容，替换图片为占位符
                    let processedHTML = processHTMLContent(htmlContent);
                    console.log('处理后的HTML:', processedHTML); // 调试日志

                    // 插入内容到编辑器
                    if (editorInfo.type === 'iframe') {
                        const selection = editorInfo.element.ownerDocument.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();

                            // 插入HTML内容
                            const fragment = editorInfo.element.ownerDocument.createRange().createContextualFragment(processedHTML);
                            range.insertNode(fragment);

                            // 查找占位符并替换为实际图片
                            const placeholders = editorInfo.element.querySelectorAll('[data-image-placeholder]');
                            placeholders.forEach((placeholder, index) => {
                                if (images[index]) {
                                    const img = editorInfo.element.ownerDocument.createElement('img');
                                    img.src = images[index].base64;
                                    img.className = 'pasted-image';
                                    img.alt = images[index].alt;
                                    placeholder.replaceWith(img);
                                }
                            });
                        }
                    } else if (editorInfo.element.contentEditable === 'true') {
                        const selection = document.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();

                            const fragment = document.createRange().createContextualFragment(processedHTML);
                            range.insertNode(fragment);

                            const placeholders = editorInfo.element.querySelectorAll('[data-image-placeholder]');
                            placeholders.forEach((placeholder, index) => {
                                if (images[index]) {
                                    const img = document.createElement('img');
                                    img.src = images[index].base64;
                                    img.className = 'pasted-image';
                                    img.alt = images[index].alt;
                                    placeholder.replaceWith(img);
                                }
                            });
                        }
                    }

                    showHint(`已成功粘贴 ${images.length} 张图片！`, 'success');
                    console.log('所有图片插入成功');

                } catch (error) {
                    console.error('处理HTML内容时出错:', error);
                    showHint('处理内容时出错: ' + error.message, 'error');
                }

                return;
            }
        }

        console.log('剪贴板中没有图片或HTML内容');
    }

    // 添加粘贴监听
    function attachPasteListener() {
        // 全局监听
        document.addEventListener('paste', handlePaste, true);
        console.log('已添加全局粘贴监听');

        // 监听 iframe 编辑器
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    iframeDoc.addEventListener('paste', handlePaste, true);
                    console.log('已为 iframe 添加粘贴监听');
                }
            } catch (e) {
                // 跨域 iframe 无法访问
            }
        });
    }

    // 初始化
    function init() {
        console.log('初始化粘贴图片功能');
        attachPasteListener();

        // 监听动态加载的 iframe
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (node.tagName === 'IFRAME') {
                        setTimeout(() => {
                            try {
                                const iframeDoc = node.contentDocument || node.contentWindow.document;
                                if (iframeDoc) {
                                    iframeDoc.addEventListener('paste', handlePaste, true);
                                    console.log('为新加载的 iframe 添加粘贴监听');
                                }
                            } catch (e) {
                                // 跨域 iframe
                            }
                        }, 500);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 显示启用提示
        setTimeout(() => {
            showHint('图片粘贴功能已启用！支持从Typora复制带图片的内容', 'success');
        }, 1000);
    }

    // 等待页面加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
