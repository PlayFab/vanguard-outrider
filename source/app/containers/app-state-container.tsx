import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";

import { IApplicationState, IAction } from "../store/types";
import { AppStateProvider, IWithAppStateProps } from "./with-app-state";

interface IPropsFromState {
    appState: IApplicationState;
}

interface IPropsFromDispatch {
    dispatch: Dispatch;
}

type Props = IPropsFromState & IPropsFromDispatch;

const AppStateContainerBase: React.FunctionComponent<Props> = (props): JSX.Element => {
    const stateContext: IWithAppStateProps = {
        ...props,
    };

    return (
        <AppStateProvider value={stateContext}>
            {props.children}
        </AppStateProvider>
    );
}

const mapStateToProps = (state: IApplicationState): IPropsFromState => ({
    appState: state,
});

const mapDispatchToProps = (dispatch: Dispatch<IAction<any>>): IPropsFromDispatch => ({
    dispatch,
});

export const AppStateContainer = connect<IPropsFromState, IPropsFromDispatch>(mapStateToProps, mapDispatchToProps)(AppStateContainerBase);