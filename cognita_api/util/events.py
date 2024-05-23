from contextlib import contextmanager
import json
from secrets import token_urlsafe
from typing import TypeVar
from pydantic import BaseModel, Field
from litestar.channels import ChannelsPlugin

TData = TypeVar("TData")


class Event[TData](BaseModel):
    id: str = Field(default_factory=lambda: token_urlsafe())
    event_type: str
    data: TData | None = None


class EventManager:
    def __init__(self, channels: ChannelsPlugin):
        self.channels = channels

    def publish[TData](self, type: str, data: TData | None = None) -> None:
        self.channels.publish(
            Event[TData](event_type=type, data=data).model_dump(mode="json"),
            type,
        )

    @contextmanager
    async def subscribe[TData](self, *types: str):
        async with self.channels.start_subscription(
            [type for type in types]
        ) as subscriber:
            async for message in subscriber.iter_events():
                yield Event[TData](**json.loads(message.decode()))


async def provide_events(channels: ChannelsPlugin) -> EventManager:
    return EventManager(channels)
