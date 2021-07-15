import React from "react";
import { Dispatch } from "redux";
import { RouteComponentProps } from "react-router";

import { IApplicationState } from "../store/types";
import { IEquipItemInstanceRequest } from "../../cloud-script/main";
import { actionSetTitleId, actionSetPlayerId, actionSetCloud } from "../store/actions";
import { is } from "../shared/is";
import { utilities } from "../shared/utilities";

const AppStateContext = React.createContext<IWithAppStateProps>(null);
export const AppStateProvider = AppStateContext.Provider;

export interface IWithAppStateProps {
    readonly appState: IApplicationState;
    readonly dispatch: Dispatch;
}

export interface ICloudScriptFunctions {
    equipItem: (items: IEquipItemInstanceRequest[], success: (data: PlayFabClientModels.ExecuteCloudScriptResult) => void, error: (message: string) => void) => void;
}

export const withAppState = <P extends IWithAppStateProps>(Component: React.ComponentType<P>) => {
    return class WithAppState extends React.Component<Omit<P, keyof IWithAppStateProps>> {
        public static contextType = AppStateContext;

        public render(): React.ReactNode {
            return (
                <Component
                    {...this.props as P}
                    appState={this.context.appState}
                    dispatch={this.context.dispatch}
                />
            );
        }

        public componentDidMount(): void {
            this.checkForURIParameters();
        }

        public componentDidUpdate(): void {
            this.checkForURIParameters();
        }

        private checkForURIParameters(): void {
            // I'm cheating, but I can't figure out how to tell this HOC that there
            // *might* be RouteComponentProps coming in from the parent component.
            // Got an idea that'll compile? Send in a pull request!
            if(is.null((this.props as any).match) || is.null((this.props as any).match.params)) {
                return;
            }

            const params = (this.props as any).match.params;

            if(params.titleid !== this.context.appState.titleId) {
                PlayFab.settings.titleId = params.titleid;
                this.context.dispatch(actionSetTitleId(params.titleid));
            }
        
            if(params.cloud !== this.context.appState.cloud) {
                utilities.setCloud(params.cloud);
                this.context.dispatch(actionSetCloud(params.cloud));
            }
        }
    }
}