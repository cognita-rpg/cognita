from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from pydantic import BaseModel
from ..models import Session, User, RedactedUser


class UserModel(BaseModel):
    username: str
    password: str


class AuthController(Controller):
    path = "/auth"

    @post("/create")
    async def create_user(self, session: Session, data: UserModel) -> RedactedUser:
        existing = await User.find_one(User.username == data.username)
        if existing:
            raise NotAuthorizedException("error.api.auth.create.user_exists")

        new_user = User.create(data.username, data.password)
        await new_user.save()
        session.user_id = new_user.id
        await session.save()
        return new_user.redacted

    @post("/login")
    async def login_user(self, session: Session, data: UserModel) -> RedactedUser:
        result = await User.find_one(User.username == data.username)
        if not result:
            raise NotFoundException("error.api.auth.login.unknown")

        if not result.password.verify(data.password):
            raise NotFoundException("error.api.auth.login.unknown")

        session.user_id = result.id
        await session.save()
        return result.redacted
