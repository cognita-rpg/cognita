from ..models import Session, User
from litestar.connection import ASGIConnection
from litestar.handlers import BaseRouteHandler
from litestar.exceptions import *


async def guard_user(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    session: Session = connection.scope["token"]
    if session and session.user_id:
        if await session.user():
            return None

    raise NotAuthorizedException("error.api.general.login_required")


async def provide_user(session: Session) -> User | None:
    return await session.user()
