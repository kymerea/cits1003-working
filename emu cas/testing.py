import base64

cookie = "eyJjcmVkaXRzIjoxMCwicm91bmQiOjEsInNlc3Npb25faWQiOiIyMjY3N2ZiZDM0NmM3MTkxNWViYTRjYmU2OTA2NDIyOCJ9.acs45g.924X6IBbg36w4kFNGh5_h1z5Nic"
cookie = cookie + "=="
session_id = base64.b64decode(cookie)

print(session_id)