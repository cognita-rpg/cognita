from datetime import datetime, UTC, timedelta
from hashlib import pbkdf2_hmac
import os
from .base import BaseObject
from pydantic import BaseModel
from beanie import ValidateOnSave, before_event


class Session(BaseObject):
    user_id: str | None = None
    creation: datetime
    access: datetime

    class Settings:
        name = "sessions"

    async def user(self) -> "User | None":
        return await User.get(self.user_id) if self.user_id else None

    @classmethod
    def create(cls) -> "Session":
        return Session(creation=datetime.now(tz=UTC), access=datetime.now(tz=UTC))

    @before_event(ValidateOnSave)
    def update_access(self):
        self.access = datetime.now(tz=UTC)

    def is_expired(self, max_delta: timedelta) -> bool:
        return datetime.now(tz=UTC) > self.access + max_delta


class PasswordModel(BaseModel):
    hash: str
    salt: str

    @classmethod
    def derive(cls, password: str) -> "PasswordModel":
        salt = os.urandom(16)
        hashed = pbkdf2_hmac("sha256", password.encode(), salt, 500000)
        return PasswordModel(hash=hashed.hex(), salt=salt.hex())

    def verify(self, password: str) -> bool:
        salt = bytes.fromhex(self.salt)
        hashed = pbkdf2_hmac("sha256", password.encode(), salt, 500000)
        return hashed.hex() == self.hash


class RedactedUser(BaseModel):
    id: str
    username: str

    async def user(self) -> "User | None":
        return await User.get(self.id)


class User(BaseObject):
    username: str
    password: PasswordModel

    class Settings:
        name = "users"

    async def session(self) -> Session | None:
        return await Session.find_one(Session.user_id == self.id)

    @classmethod
    def create(cls, username: str, password: str) -> "User":
        return User(username=username, password=PasswordModel.derive(password))

    @property
    def redacted(self) -> RedactedUser:
        return RedactedUser(id=self.id, username=self.username)


class AuthStateModel(BaseModel):
    session: Session
    user: RedactedUser | None

    @classmethod
    async def from_session(cls, session: Session) -> "AuthStateModel":
        user = await session.user()
        return AuthStateModel(session=session, user=user.redacted if user else None)
