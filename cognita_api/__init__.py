from litestar import Litestar, get
from litestar.datastructures import State
from litestar.di import Provide
from datetime import datetime
from .util import Context, CookieSessionManager, provide_session
from .models import *
from .controllers import *


@get("/")
async def get_state(session: Session) -> AuthStateModel:
    return await AuthStateModel.from_session(session)


async def on_startup(app: Litestar) -> None:
    context = Context()
    await context.initialize()
    app.state.context = context


async def depends_context(state: State) -> Context:
    return state.context


app = Litestar(
    route_handlers=[get_state, AuthController],
    dependencies={
        "context": Provide(depends_context),
        "session": Provide(provide_session),
    },
    on_startup=[on_startup],
    middleware=[CookieSessionManager],
)
