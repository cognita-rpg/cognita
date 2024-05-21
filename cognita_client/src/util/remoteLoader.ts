import createLoadRemoteModule, {
    createRequires,
} from "@paciolan/remote-module-loader";
import * as react from "react";
import * as reactJsx from "react/jsx-runtime";
import * as reactDom from "react-dom";
import * as mantineCore from "@mantine/core";
import * as mantineHooks from "@mantine/hooks";

const dependencies = {
    react: react,
    "react/jsx-runtime": reactJsx,
    "react-dom": reactDom,
    "@mantine/core": mantineCore,
    "@mantine/hooks": mantineHooks,
};

export default createLoadRemoteModule({
    requires: createRequires(dependencies),
});
