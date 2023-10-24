from flask import Flask, render_template, request, jsonify
from gradio_client import Client
import json
import ast

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_response', methods=['POST'])
def get_response():
    user_input = request.json['user_input']

    # Ihr vorhandener Code
    HOST_URL = "https://68b9a5bec6d39df45e.gradio.live"
    client = Client(HOST_URL)
    api_name = '/submit_nochat_api'
    kwargs = dict(instruction_nochat=user_input, max_new_tokens=1024, max_time=300, do_sample=False)
    res_string = client.predict(str(dict(kwargs)), api_name=api_name)

    try:
        res_dict = ast.literal_eval(res_string)
        antwort = res_dict.get('response')
    except Exception as e:
        return jsonify({'error': str(e)})
    print(res_string)
    return jsonify({'response': antwort})


if __name__ == '__main__':
    app.run(debug=True)
