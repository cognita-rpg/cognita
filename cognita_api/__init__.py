from litestar import Litestar, get
from litestar.datastructures import State
from litestar.di import Provide
from datetime import datetime
from .util import Context


@get("/")
async def get_root() -> datetime:
    return datetime.now()


async def on_startup(app: Litestar) -> None:
    context = Context()
    await context.initialize()
    app.state.context = context


async def depends_context(state: State) -> Context:
    return state.context


app = Litestar(
    route_handlers=[get_root],
    dependencies={"context": Provide(depends_context)},
    on_startup=[on_startup],
)
