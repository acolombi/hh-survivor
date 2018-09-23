import * as React from 'react';
import { RouteStore } from '../stores/RouteStore';

interface IProps {
    to: string;
    routeStore: RouteStore;
    className?: string;
    children?: string;
}

export class MyLink extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
        this.onClickHandler = this.onClickHandler.bind(this);
    }

    public render() {
        return <a onClick={this.onClickHandler} className={this.props.className}>{this.props.children}</a>;
    }

    private onClickHandler() {
        this.props.routeStore.push(this.props.to);
    }
}
