from traceback import format_exc
from litestar import Litestar, get
from litestar.datastructures import State
from litestar.di import Provide
from datetime import datetime
from .util import Context, CookieSessionManager, provide_session, PluginManifest
from .models import *
from .controllers import *
from litestar import MediaType, Request, Response
from litestar.status_codes import HTTP_500_INTERNAL_SERVER_ERROR

@get("/")
async def get_state(session: Session) -> AuthStateModel:
    return await AuthStateModel.from_session(session)


async def on_startup(app: Litestar) -> None:
    context = Context()
    await context.initialize()
    app.state.context = context


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
    route_handlers=[get_state, AuthController, PluginController, UserSelfController],
    dependencies={
        "context": Provide(depends_context),
        "session": Provide(provide_session),
    },
    on_startup=[on_startup],
    middleware=[CookieSessionManager],
    exception_handlers={HTTP_500_INTERNAL_SERVER_ERROR: plain_text_exception_handler},
)
