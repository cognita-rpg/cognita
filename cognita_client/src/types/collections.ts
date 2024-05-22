interface CollectionEntityBase {
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
    template_plugin: string;
    template_name: string;
    content: TData | null;
}

export type CollectionEntity =
    | CollectionFileEntity
    | CollectionFolderEntity
    | CollectionImageEntity;
