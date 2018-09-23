import * as React from 'react';

interface IProps {
    path: string;
    component: (params: any) => JSX.Element;
}

export class MyRoute extends React.Component<IProps, {}> {
    public render() {
        let regex = "";
        const paramNames = [];
        for (const pathPart of this.props.path.substr(1).split('/')) {
            const optional = pathPart.endsWith("?");
            regex += "/";
            if (optional) {
                regex += "?";
            }

            if (pathPart.startsWith(":")) {
                regex += "([^/]+)";
                paramNames.push(pathPart.substr(1, pathPart.length - (optional ? 2 : 1)));
            } else {
                regex += pathPart;
            }
            if (optional) {
                regex += "?";
            }
        }

        const match = window.location.pathname.match(regex);
        if (!match) {
            return null;
        }

        let idx = 1;
        const params = {};
        for (const paramName of paramNames) {
            params[paramName] = match[idx];
            idx += 1;
        }

        return this.props.component(params);
    }
}
