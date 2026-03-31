from random import choice, seed
import base64
import json

def flip_coin(cookie):
    data = base64.b64decode(cookie)
    json_part = data.split(b'}')[0] + b'}'
    obj = json.loads(json_part.decode())

    session_id = obj["session_id"]
    # print(session_id_hex)
    # session_id = int(session_id_hex, 16)
    # print(session_id)
    round = 10

    seed(str(round) + "_" + session_id)

    print(choice(["tails", "heads"]))



cookie = "eyJjcmVkaXRzIjoxMCwicm91bmQiOjEsInNlc3Npb25faWQiOiIyMjY3N2ZiZDM0NmM3MTkxNWViYTRjYmU2OTA2NDIyOCJ9.acs45g.924X6IBbg36w4kFNGh5_h1z5Nic"
flip_coin(cookie)