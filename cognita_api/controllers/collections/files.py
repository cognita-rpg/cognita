from typing import Any
from litestar import Controller, post
from litestar.di import Provide
from litestar.exceptions import *
from .util import *
from ...util import guard_user, provide_user, EventManager
from ...models import Session, FileEntity


class FileEntityController(Controller):
    path = "/collections/{id:str}/files"
    guards = [guard_user]
    dependencies = {"user": Provide(provide_user), "entity": Provide(provide_entity)}

    @post("/update")
    async def update_content(
        self, session: Session, entity: FileEntity, events: EventManager, data: Any
    ) -> FileEntity:
        if entity.type != "file":
            raise ClientException("error.api.entity.invalid_target")
        entity.content = data
        await entity.save()
        await events.publish(
            "entity.update",
            entity,
            data={"id": entity.id, "content": data, "origin": session.id},
        )
        return entity
