# This is a sample Python script.

# Press Umschalt+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
from gradio_client import Client
import json
import ast

import requests
import ast


def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.
    print(f'Hi, {name}')  # Press Strg+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    HOST_URL = "https://0bc88a01227859ba69.gradio.live"
    client = Client(HOST_URL)
    # print(client)
    h2ogpt_key = 'foodoo#'
    file_to_get = 'user_path'
    view_raw_text = False
    text_context_list = None
    view_raw_text = True
    stream_output = True
    system_prompt = ['', None, 'None', 'auto', 'You are a goofy lion who talks to kids']
    chat_conversation = [None, [('Who are you?', 'I am a big pig who loves to tell kid stories')]]

    langchain_mode = 'UserData'
    api_name = '/submit_nochat_api'  # NOTE: like submit_nochat but stable API for string dict passing
    kwargs = dict(
      langchain_mode=langchain_mode,
        instruction_nochat="what are you loving?",
      langchain_action="Query",
      top_k_docs=4,
      document_subset='Relevant',
       document_choice='ALL',
        max_new_tokens=1024,
        max_time=300,
        do_sample=False,
        stream_output=stream_output)

    res_string = client.predict(
        str(dict(kwargs)),
        api_name=api_name,
    )

    print(res_string)
    res_dict = ast.literal_eval(res_string)
    antwort = res_dict.get('response')

    print(antwort)
