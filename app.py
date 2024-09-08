from flask import Flask, render_template, request, send_file, jsonify
import qrcode
from io import BytesIO
import requests
from bs4 import BeautifulSoup
import re
from PIL import Image

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_qr_code', methods=['POST'])
def generate_qr_code():
    try:
        data = request.get_json()  # 获取JSON数据
        url = data.get('data') if data else None
        qr_color = data.get('qr_color') if data else 'black'  # 获取二维码前景色，默认黑色
        qr_background_color = data.get('qr_background_color') if data else 'white'  # 获取二维码背景色，默认白色

        if not url or not qr_color or not qr_background_color:
            return jsonify({'error': 'Invalid or missing URL or colors'}), 400

        # 检查URL是否以http://或https://开头
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url  # 如果没有，则添加https://前缀

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=1,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # 使用指定的前景色和背景色生成二维码
        img = qr.make_image(fill_color=qr_color, back_color=qr_background_color)

        # 如果需要确保 img 对象是 PIL 图像对象，可以执行以下转换
        if not isinstance(img, Image.Image):
            img = img.convert('RGB')  # 确保图像是 PIL 对象

        img_bytes = BytesIO()
        img.save(img_bytes, 'PNG')  # 不传递 format 参数，直接指定格式
        img_bytes.seek(0)

        return send_file(img_bytes, mimetype='image/png')
    except Exception as e:
        print(f"Error in /generate_qr_code: {e}")  # 记录详细的错误信息
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/extract_article_content', methods=['POST'])
def extract_article_content():
    try:
        data = request.get_json()  # 获取JSON数据
        url = data.get('url') if data else None

        if not url:
            return jsonify({'error': 'Invalid or missing URL'}), 400

        # 检查URL是否以http://或https://开头
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url  # 如果没有，则添加https://前缀

        # 请求网页内容
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 移除 <img> 标签
        for img in soup.find_all('img'):
            img.decompose()

        # 移除不需要的样式
        def remove_styles(tag):
            if 'style' in tag.attrs:
                styles = tag.attrs['style']
                # Remove visibility and opacity styles
                styles = styles.replace('visibility: hidden;', '')
                styles = styles.replace('opacity: 0;', '')
                tag.attrs['style'] = styles
            return tag

        # Apply style removal to all tags
        for tag in soup.find_all(True):  # Find all tags
            remove_styles(tag)

        # 提取数据
        activity_name = soup.find(id='activity-name').text if soup.find(id='activity-name') else ''
        js_name = soup.find(id='js_name').text if soup.find(id='js_name') else ''
        content = str(soup.find(id='js_content')) if soup.find(id='js_content') else ''  # 保留HTML标签

        return jsonify({
            'activity_name': activity_name,
            'content': content,
            'js_name': js_name
        })
    except Exception as e:
        print(f"Error in /extract_article_content: {e}")  # 记录详细的错误信息
        return jsonify({'error': 'Internal Server Error'}), 500



def extract_weibo_id(url):
    match = re.search(r'(?:weibo\.com/[^/]+/|m\.weibo\.cn/detail/)([a-zA-Z0-9_]+)', url)
    if match:
        return match.group(1)
    return None

def fetch_weibo_data(weibo_id):
    api_url = f'https://m.weibo.cn/api/statuses/show?id={weibo_id}'
    response = requests.get(api_url)
    if response.status_code == 200:
        json_data = response.json()

        screen_name = json_data.get('user', {}).get('screen_name', '')
        if 'isLongText' in json_data and json_data['isLongText']:
            text = json_data.get('longText', {}).get('longTextContent', '长文本内容缺失')
        else:
            text = json_data.get('text', '文本内容缺失')
        return screen_name, text
    return None, None

@app.route('/extract_weibo_content', methods=['POST'])
def extract_weibo_content():
    try:
        data = request.get_json()
        url = data.get('url') if data else None

        if not url:
            return jsonify({'error': 'Invalid or missing URL'}), 400

        weibo_id = extract_weibo_id(url)
        if not weibo_id:
            return jsonify({'error': 'Invalid Weibo ID'}), 400

        screen_name, text = fetch_weibo_data(weibo_id)

        soup = BeautifulSoup(text, 'html.parser')
        for img in soup.find_all('img'):
            img.decompose()

        return jsonify({
            'author': screen_name + ' 的微博 ',
            'content': str(soup)
        })
    except Exception as e:
        print(f"Error in /extract_weibo_content: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/extract_okjike_content', methods=['POST'])
def extract_okjike_content():
    try:
        data = request.get_json()  # 获取JSON数据
        url = data.get('url') if data else None

        if not url:
            return jsonify({'error': 'Invalid or missing URL'}), 400

        # 请求网页内容
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # 根据链接类型提取作者
        if 'web' in url:
            meta_author = soup.find('meta', {'property': 'article:author'})
            author = meta_author['content'] if meta_author else '未知'
        else:
            author_div = soup.find('div', class_='jsx-3802438259 title')
            author = author_div.get_text(strip=True) if author_div else '未知'

        # 提取正文内容
        if 'web' in url:
            content_div = soup.find('div', class_='break-words content_truncate__tFX8J')
        else:
            content_div = soup.find('div', class_='jsx-1330250023 text')

        # 移除 img 标签
        if content_div:
            for img in content_div.find_all('img'):
                img.decompose()
            content = str(content_div)  # 保留 HTML 格式
        else:
            content = '没有找到正文内容'

        return jsonify({
            'author': author + ' 的即刻 ',
            'content': content
        })
    except Exception as e:
        print(f"Error in /extract_okjike_content: {e}")  # 记录详细的错误信息
        return jsonify({'error': 'Internal Server Error'}), 500


if __name__ == '__main__':
    app.run(debug=True)
