from traceback import format_exc
from litestar import Litestar, get
from litestar.datastructures import State
from litestar.di import Provide
from litestar.channels import ChannelsPlugin
from litestar.channels.backends.redis import RedisChannelsPubSubBackend
from .util import (
    Context,
    CookieSessionManager,
    provide_session,
    provide_events,
)
from .models import *
from .controllers import *
from litestar import MediaType, Request, Response
from litestar.status_codes import HTTP_500_INTERNAL_SERVER_ERROR

CONTEXT = Context()
CHANNELS = ChannelsPlugin(
    backend=RedisChannelsPubSubBackend(redis=CONTEXT.redis_client),
    arbitrary_channels_allowed=True,
    subscriber_max_backlog=100,
    subscriber_backlog_strategy="dropleft",
    create_ws_route_handlers=True,
    ws_handler_base_path="/events",
)


@get("/")
async def get_state(session: Session) -> AuthStateModel:
    return await AuthStateModel.from_session(session)


async def on_startup(app: Litestar) -> None:
    global CONTEXT
    await CONTEXT.initialize()
    app.state.context = CONTEXT


async def depends_context(state: State) -> Context:
    return state.context


def plain_text_exception_handler(request: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)
    detail = getattr(exc, "detail", "")

    request.app.logger.error("Encountered a server error:\n\n" + format_exc())

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )


app = Litestar(
    route_handlers=[
        get_state,
        AuthController,
        PluginController,
        UserSelfController,
        CollectionsController,
        EntityController,
        FileEntityController,
    ],
    dependencies={
        "context": Provide(depends_context),
        "session": Provide(provide_session),
        "events": Provide(provide_events),
    },
    on_startup=[on_startup],
    middleware=[CookieSessionManager],
    exception_handlers={HTTP_500_INTERNAL_SERVER_ERROR: plain_text_exception_handler},
    plugins=[CHANNELS],
)
