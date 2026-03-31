from random import choice, seed

from flask import session


def flip_coin():
    # set a super secure seed with the current round and session id
    seed(str(session["round"]) + "_" + session["session_id"])

    # randomly choose heads or tails!
    return choice(["tails", "heads"])
