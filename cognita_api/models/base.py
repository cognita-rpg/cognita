from secrets import token_urlsafe
from beanie import Document
from pydantic import Field


class BaseObject(Document):
    id: str = Field(default_factory=lambda: token_urlsafe(nbytes=16))
