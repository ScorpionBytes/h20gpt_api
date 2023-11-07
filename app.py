from flask import Flask, render_template, request, jsonify
from gradio_client import Client
import json
import ast

app = Flask(__name__)

HOST_URL = "https://d8b8336c5200f99184.gradio.live"


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
    instruction_nochat='Du bist ein Assistent für Fragen zu öffentlichen IT-Publikationen. Du hielfst dabei relevante Informationen bereitzustellen.' + 'USER: '+ user_input,
    langchain_action="Query",
    top_k_docs=3,
    document_subset='Relevant',
    document_choice='ALL',
    max_new_tokens=1024,
    max_time=120,
    do_sample=True,
    stream_output=False,    temperature = 0.9, top_p = 0.85, top_k = 70, penalty_alpha = 0.0,
        num_beams= 1

)

    res_string = client.predict(str(dict(kwargs)), api_name=api_name)

    try:
        res_dict = ast.literal_eval(res_string)
        antwort = res_dict.get('response')
        sources = res_dict.get('sources', [])  # Angenommen, die Quellen sind unter dem Schlüssel "sources" gespeichert
    except Exception as e:
        return jsonify({'error': str(e)})
    print(antwort)
    return jsonify({'response': antwort, 'sources': sources})




if __name__ == '__main__':

    #app.run(host='0.0.0.0', port=5000)

    app.run(debug=True)
