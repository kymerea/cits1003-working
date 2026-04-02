# Challenge Name: Feathered Forums Parts 1, 2 and 3
# Challenge Category: Vulnerabilities

from flask import Flask, render_template, request, redirect, url_for, send_file
from functools import wraps
import copy
import csv
import hashlib
import hmac
import json
import os

app = Flask(__name__)

# The emu intelligence agency has been tracking all known hooman hackers
# We registered every single one of them by their secret agent numbers
# Only registered hoomans can even attempt to login, so we are totally safe
with open('students.csv', 'r') as f:
    STUDENT_IDS = {row['student_id'] for row in csv.DictReader(f)}

HMAC_SECRET = os.environ['HMAC_SECRET']


def generate_flag(student_id, part):
    key = f"{HMAC_SECRET}:{part}".encode()
    digest = hmac.new(key, student_id.encode(), hashlib.sha256).hexdigest()[:8]
    if part == "part1":
        return f"UWA{{C00k13333z_4r3_Th3_W4y_T0_4n_3mu's_H34rt_<333_{digest}}}"
    if part == "part2":
        return f"UWA{{CWE-22_{digest}}}"
    if part == "part3":
        return f"UWA{{Dir_Trav3rs4l_{digest}}}"
    return f"UWA{{{digest}}}"


# Load in posts for the forum (i haven't figured out how to use a database yet)
with open('./forum-data/posts.json', 'r') as f:
    POSTS = json.load(f)["posts"]
    for index, post in enumerate(POSTS):
        post["id"] = index
        post["replies_len"] = len(post["replies"])


# I know websites use Cookies to handle authentication
# Pretty sure I did this correctly.
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Just check that the "username" cookie matches a known hooman agent number
        # If their agent number is in our records, they must be who they say they are right???
        if not request.cookies.get('username', None) in STUDENT_IDS:
            return redirect(url_for('index'))
        return f(*args, **kwargs)

    return decorated_function


# This is the gateway to my forum. The hoomans will never be able to get past this login page.
# I gave them all random passwords that they don't even know. Pretty secure right???
@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # Every hooman hacker has been assigned a super duper random password that even they don't know
    # There is absolutely no other way into the forum hehehe
    if username in STUDENT_IDS and password == os.urandom(16).hex():
        response = redirect(url_for('forum'))
        response.set_cookie('username', username)
        return response

    return redirect(url_for('index'))


@app.route('/forum')
# Check the hooman is logged in
@auth_required
def forum():
    student_id = request.cookies.get('username')
    flag_part1 = generate_flag(student_id, "part1")
    flag_part2 = generate_flag(student_id, "part2")

    # Welcome the hooman agent and show them what we know about them
    # This is totally fine to show them, it's not like they can do anything with it
    posts = copy.deepcopy(POSTS)
    for post in posts:
        for reply in post.get("replies", []):
            reply["content"] = reply["content"].replace("{student_id}", student_id)
            reply["content"] = reply["content"].replace("{flag_part2}", flag_part2)

    return render_template('forum.html', posts=posts, student_id=student_id, flag_part1=flag_part1)


@app.route('/forum/<id>')
# Check the hooman is logged in
@auth_required
def forum_post(id):
    try:
        id = int(id)
        student_id = request.cookies.get('username')
        flag_part2 = generate_flag(student_id, "part2")
        post = copy.deepcopy(POSTS[id])
        for reply in post.get("replies", []):
            reply["content"] = reply["content"].replace("{student_id}", student_id)
            reply["content"] = reply["content"].replace("{flag_part2}", flag_part2)
        return render_template('forum-post.html', post=post)
    except Exception as e:
        return redirect(url_for('forum'))


@app.route('/static')
def get_static_file():
    file_path = request.args.get('filename')

    # Make sure the hoomans cannot just read any file
    # Set the start of the file path to "./static"
    file_path = os.path.join("./static", file_path)

    if os.path.exists(file_path):
        if os.path.realpath(file_path) == os.path.realpath('config.yaml'):
            student_id = request.cookies.get('username')
            if student_id in STUDENT_IDS:
                flag_part3 = generate_flag(student_id, "part3")
                content = (
                    f'# Top Secret FeatheredForum Config\n'
                    f'# DO NOT SHARE with any hoomans!!! (especially not Agent {student_id})\n'
                    f'secret_key: "{flag_part3}"\n'
                    f'# BeakMaster: i made the secret_key very long and random so it is very secure\n'
                    f'# OstrichOutlaw: wait is this file accessible from the internet???\n'
                    f'# BeakMaster: no dont be silly i set the file path to start with ./static so its fine\n'
                )
            else:
                content = (
                    f'# Top Secret FeatheredForum Config\n'
                    f'# DO NOT SHARE with any hoomans!!!\n'
                    f'secret_key: "UWA{{Dir_Trav3rs4l_deadc0de}}"\n'
                    f'# hold on... who is reading this??? ur not even registered in our system!!!\n'
                    f'# shoo shoo hooman go away!!! this is a private emu forum!!!\n'
                )
            return content, 200, {'Content-Type': 'text/plain; charset=utf-8'}
        if os.path.realpath(file_path) == os.path.realpath('students.csv'):
            return "File not found", 404
        return send_file(file_path)
    else:
        return "File not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
