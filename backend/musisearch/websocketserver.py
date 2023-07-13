import os, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "musisearch.settings")
django.setup()

from backend import models

import asyncio
import itertools
import json
import websockets
from asgiref.sync import sync_to_async

websocket_connections = []


@sync_to_async
def get_starter(chat):
    return chat.starter

@sync_to_async
def get_recipient(chat):
    return chat.recipient

@sync_to_async
def get_blocked(block):
    return block.blocked

@sync_to_async
def get_blocker(block):
    return block.blocker

async def handler(websocket):
    async for message in websocket:
        req_object = json.loads(message)
        command = req_object[0]
        match command:
            case "connect":
                websocket_connections.append({'connection': websocket, 'profile_id': int(req_object[1])})


            case "chats changed":
                chat_id = int(req_object[1])
                chat = await sync_to_async(models.Chat.objects.get)(pk=chat_id)
                starter = await get_starter(chat)
                recipient = await get_recipient(chat)
                for conn in websocket_connections:
                    if conn['profile_id'] == starter.id or conn['profile_id'] == recipient.id:
                        await conn['connection'].send(json.dumps(["chats changed", chat_id]))

            case "block":
                block_id = int(req_object[1])
                block = await sync_to_async(models.ProfileBlockedMap.objects.get)(pk=block_id)
                blocked = await get_blocked(block)
                blocker = await get_blocker(block)
                for conn in websocket_connections:
                    if conn['profile_id'] == blocked.id or conn['profile_id'] == blocker.id:
                        await conn['connection'].send(json.dumps(["block", block.id]))

            case "picture":
                profile_id = int(req_object[1])
                for conn in websocket_connections:
                    if conn['profile_id'] == profile_id:
                        await conn['connection'].send(json.dumps(["picture", profile_id]))

            case "track":
                profile_id = int(req_object[1])
                for conn in websocket_connections:
                    if conn['profile_id'] == profile_id:
                        await conn['connection'].send(json.dumps(["track", profile_id]))

            case "message sent":
                chat_id = int(req_object[1])
                chat = await sync_to_async(models.Chat.objects.get)(pk=chat_id)
                starter = await get_starter(chat)
                recipient = await get_recipient(chat)
                for conn in websocket_connections:
                    if conn['profile_id'] == starter.id or conn['profile_id'] == recipient.id:
                        await conn['connection'].send(json.dumps(["message sent", chat_id]))

            case "profile changed":
                profile_id = int(req_object[1])
                for conn in websocket_connections:
                    if conn['profile_id'] == profile_id:
                        await conn['connection'].send(json.dumps(["message sent", profile_id]))


async def main():
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
