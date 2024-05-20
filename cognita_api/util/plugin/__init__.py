from contextlib import contextmanager
import os
from ..config import Config

import yaml
from .models import PluginManifest, PluginManifest_ExportEntry, PluginManifest_Metadata


class Plugin:
    def __init__(self, plugin_folder: str):
        self.folder = plugin_folder
        if not os.path.exists(os.path.join(self.folder, "manifest.yaml")):
            raise FileNotFoundError(
                "Unable to locate required file: "
                + os.path.join(self.folder, "manifest.yaml")
            )

        with open(os.path.join(self.folder, "manifest.yaml"), "r") as f:
            self.manifest = PluginManifest(**yaml.load(f.read(), yaml.Loader))

    @property
    def metadata(self) -> PluginManifest_Metadata:
        return self.manifest.metadata

    @contextmanager
    def get_export(self, name: str):
        if not name in self.manifest.exports.keys():
            raise KeyError(f"Unknown export {name}")

        with open(
            os.path.join(self.folder, self.manifest.exports[name].file), "rb"
        ) as f:
            yield f


class PluginLoader:
    def __init__(self, config: Config):
        self.plugin_root = config.plugins.root
        self.enabled = config.plugins.enabled
        self.plugins: dict[str, Plugin] = {}
        for path in os.listdir(self.plugin_root):
            resolved = os.path.join(self.plugin_root, path)
            if os.path.isdir(resolved) and "manifest.yaml" in os.listdir(resolved):
                try:
                    plugin = Plugin(resolved)
                except:
                    continue

                if plugin.metadata.slug in self.enabled:
                    self.plugins[plugin.metadata.slug] = plugin

    def get(self, name: str) -> Plugin | None:
        return self.plugins.get(name, None)

    def __getitem__(self, key: str) -> Plugin:
        return self.plugins[key]