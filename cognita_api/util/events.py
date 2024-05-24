from contextlib import contextmanager
import json
from secrets import token_urlsafe
from typing import TypeVar
from pydantic import BaseModel, Field
from litestar.channels import ChannelsPlugin
from ..models.base import BaseObject, EntityLink
from ..models.auth import User, Session
from .context import Context

TData = TypeVar("TData")


class Event[TData](BaseModel):
    id: str = Field(default_factory=lambda: token_urlsafe())
    event_type: str
    data: TData | None = None


class EventManager:

    def __init__(self, channels: ChannelsPlugin, context: Context):
        self.channels = channels
        self.context = context

    @contextmanager
    async def subscribe[TData](self, session_id: str, *types: str):
        async with self.channels.start_subscription(session_id) as subscriber:
            async for message in subscriber.iter_events():
                ev = Event[TData](**json.loads(message.decode()))
                if ev.event_type in types:
                    yield ev

    async def publish[
        TData
    ](self, type: str, *targets: BaseObject, data: TData | None = None) -> None:
        resolved_uids = []
        for target in targets:
            resolved_uids.extend(
                [
                    i.id
                    for i in (await self.context.get_connections(target)).values()
                    if isinstance(i, User)
                ]
            )

        if len(resolved_uids) == 0:
            return

        resolved_uids = list(set(resolved_uids))
        sessions = await Session.find({"user_id": {"$in": resolved_uids}}).to_list()
        if len(sessions) == 0:
            return

        self.channels.publish(
            Event[TData](event_type=type, data=data).model_dump(mode="json"),
            [s.id for s in sessions],
        )


async def provide_events(channels: ChannelsPlugin, context: Context) -> EventManager:
    return EventManager(channels, context)
