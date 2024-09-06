document.addEventListener('DOMContentLoaded', function() {
    const articleLinkInput = document.getElementById('article-link');
    const qrCodeUrlInput = document.getElementById('qr-code-url-input');
    const loadingIndicator = document.getElementById('loading-indicator'); // 加载提示元素

    articleLinkInput.addEventListener('input', async function() {
        const url = articleLinkInput.value;
        qrCodeUrlInput.value = url;
        generateQRCode(url);

        // 判断链接类型
        let apiEndpoint = '/extract_article_content'; // 默认公众号链接
        if (url.includes('weibo.com')) {
            apiEndpoint = '/extract_weibo_content'; // 如果是微博链接，使用微博的处理方法
        } else if (url.includes('okjike.com')) {
            apiEndpoint = '/extract_okjike_content'; // 如果是即刻链接，使用即刻的处理方法
        }
         // 显示加载提示
        loadingIndicator.style.display = 'block';

        // 添加循环请求逻辑，确保提取到需要的数据
        async function fetchWithRetry(apiUrl, options, retries = 10, delay = 2000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(apiUrl, options);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(`Attempt ${i + 1} fetched data:`, data);

                    // 检查是否成功提取到作者和正文内容
                    const author = data.author || data.js_name || '未知';
                    const content = data.content || '没有找到正文内容';

                    // 如果正文或作者内容为空，继续重试
                    if (author === '未知' || content === '没有找到正文内容') {
                        console.warn(`Attempt ${i + 1} failed to extract content/author`);
                        if (i < retries - 1) {
                            await new Promise(resolve => setTimeout(resolve, delay)); // 等待后重试
                        } else {
                            throw new Error(`Failed to extract valid content/author after ${retries} attempts`);
                        }
                    } else {
                        // 成功提取到内容，更新页面
                        return data; // 成功返回提取到的数据
                    }
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed: ${error.message}`);
                    if (i < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, delay)); // 等待后重试
                    } else {
                        throw new Error(`Failed after ${retries} attempts`);
                    }
                }
            }
        }

        // 发起请求并处理响应
        try {
            const data = await fetchWithRetry(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            console.log('Extracted data:', data);

            // 更新页面内容
            if (apiEndpoint === '/extract_weibo_content' || apiEndpoint === '/extract_okjike_content') {
                document.getElementById('source').innerText = '';  // 清空 source 内容
                document.getElementById('author').innerText = data.author || '未知';  // 默认显示“未知”
                document.getElementById('content').innerHTML = data.content || '没有找到正文内容';
            }  else if (apiEndpoint === '/extract_okjike_content') {
                document.getElementById('source').innerText = '';  // 清空 source 内容
                document.getElementById('author').innerText = data.author || '';
                document.getElementById('content').innerHTML = data.content || '';
            } else {
                document.getElementById('source').innerText = data.activity_name || '未提供活动名称';
                document.getElementById('author').innerText = data.js_name || '未知作者';
                document.getElementById('content').innerHTML = data.content || '没有找到正文内容';
            }

            console.log('Content element HTML:', document.getElementById('content').innerHTML);
            // 隐藏加载提示
            loadingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Error extracting content after retries:', error);
             // 隐藏加载提示
            loadingIndicator.style.display = 'none';
        }
    });
});
