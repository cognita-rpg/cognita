interface CollectionEntityBase {
    id: string;
    type: string;
    name: string;
    summary: string | null;
    tags: string[];
}

export interface CollectionFolderEntity extends CollectionEntityBase {
    type: "folder";
    content: any;
}

export interface CollectionImageEntity extends CollectionEntityBase {
    type: "image";
    url: string;
}

export interface CollectionFileEntity<TData = any>
    extends CollectionEntityBase {
    type: "file";
    template: {
        plugin: string;
        feature: string;
    };
    content: TData | null;
}

export type CollectionEntity =
    | CollectionFileEntity
    | CollectionFolderEntity
    | CollectionImageEntity;

interface CollectionEntityCreate extends Omit<CollectionEntityBase, "id"> {
    parent: string | null;
}

export interface CollectionFolderEntityCreate extends CollectionEntityCreate {
    type: "folder";
    icon: string | null;
    color: string | null;
}

export interface CollectionImageEntityCreate extends CollectionEntityCreate {
    type: "image";
    url: string;
}

export interface CollectionFileEntityCreate extends CollectionEntityCreate {
    type: "file";
    template: {
        plugin: string;
        feature: string;
    };
}

export type EntityCreate =
    | CollectionFileEntityCreate
    | CollectionFolderEntityCreate
    | CollectionImageEntityCreate;

export type ReducedEntity = {
    id: string;
    name: string;
    summary: string | null;
    tags: string[];
} & (
    | { type: "folder"; icon: string | null; color: string | null }
    | { type: "image"; url: string }
    | {
          type: "file";
          template: {
              plugin: string;
              feature: string;
          };
      }
);
