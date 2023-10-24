from flask import Flask, render_template, request, jsonify
from gradio_client import Client
import json
import ast

app = Flask(__name__)

HOST_URL = "https://68b9a5bec6d39df45e.gradio.live"


@app.route('/')
def index():
    return render_template('index.html')
    return render_template('index.html', host_url_from_flask=HOST_URL)

@app.route('/get_response', methods=['POST'])
def get_response():
    user_input = request.json['user_input']

    # Ihr vorhandener Code
    client = Client(HOST_URL)
    api_name = '/submit_nochat_api'
    kwargs = dict(
        langchain_mode='UserData',
    instruction_nochat=user_input,
    langchain_action="Query",
    top_k_docs=4,
    document_subset='Relevant',
    document_choice='ALL',
    max_new_tokens=1024,
    max_time=300,
    do_sample=False,
    stream_output=False)

    res_string = client.predict(str(dict(kwargs)), api_name=api_name)

    try:
        res_dict = ast.literal_eval(res_string)
        antwort = res_dict.get('response')
        sources = res_dict.get('sources', [])  # Angenommen, die Quellen sind unter dem Schlüssel "sources" gespeichert
    except Exception as e:
        return jsonify({'error': str(e)})

    return jsonify({'response': antwort, 'sources': sources})




if __name__ == '__main__':
    app.run(debug=True)
