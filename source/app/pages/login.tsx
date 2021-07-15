import React from "react";
import { RouteComponentProps } from "react-router";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, MessageBar, MessageBarType } from "office-ui-fabric-react";

import { is } from "../shared/is";
import { routes } from "../routes";
import { PlayFabHelper } from "../shared/playfab";
import { Page } from "../components/page";
import { DivConfirm, DivField, SpinnerLeft } from "../styles";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { TITLE_DATA_PLANETS, CATALOG_VERSION, TITLE_DATA_STORES, TITLE_DATA_ENEMIES } from "../shared/types";
import { IWithPageProps, withPage } from "../containers/with-page";
import { IEquipItemInstance } from "../store/types";
import { CloudScriptHelper } from "../shared/cloud-script";
import { IPlayerLoginResponse } from "../../cloud-script/main";
import { actionSetPlayerId, actionSetPlayerName, actionSetCatalog, actionSetInventory, actionSetPlanetsFromTitleData, actionSetStoreNamesFromTitleData, actionSetPlayerHP, actionSetEnemiesFromTitleData, actionSetEquipmentMultiple, actionSetPlayerLevel, actionSetPlayerXP } from "../store/actions";
import { BackLink } from "../components/back-link";

type Props = RouteComponentProps & IWithAppStateProps & IWithPageProps;

interface IState {
    playerName: string;
    isLoggingIn: boolean;
}

class LoginPageBase extends React.Component<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            playerName: "",
            isLoggingIn: false,
        };
    }

    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }

        return (
            <Page {...this.props} title="Login">
                {!is.null(this.props.pageError) && (
                    <MessageBar messageBarType={MessageBarType.error} role="alert">{this.props.pageError}</MessageBar>
                )}
                <form onSubmit={this.login}>
                    <BackLink to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} label="Back to main menu" />
                    <h2>Player name</h2>
                    <p>Enter your name to play. Names are case sensitive.</p>
                    <p>This will create a new player using <a href="https://api.playfab.com/documentation/client/method/LoginWithCustomID">Custom ID</a> or log you in with an existing account.</p>
                    <DivField>
                        <TextField label="Player name" value={this.state.playerName} onChange={this.onChangePlayerName} />
                    </DivField>
                    <DivConfirm>
                        {this.state.isLoggingIn
                            ? <SpinnerLeft label="Logging in..." labelPosition="right" />
                            : <PrimaryButton text="Login" onClick={this.login} />}
                    </DivConfirm>
                </form>
            </Page>
        );
    }

    private login = (e: React.SyntheticEvent<any>): void => {
        if(!is.null(e)) {
            e.preventDefault();
        }

        if(is.null(this.state.playerName.trim())) {
            this.props.onPageError("Player name is required");
            return;
        }

        this.props.onPageClearError();

        this.setState({
            isLoggingIn: true,
        });

        PlayFabHelper.LoginWithCustomID(this.props.appState.titleId, this.state.playerName, this.onLoginComplete, this.props.onPageError);
    }

    private onLoginComplete = (player: PlayFabClientModels.LoginResult): void => {
        this.props.dispatch(actionSetPlayerId(player.PlayFabId));
        this.props.dispatch(actionSetPlayerName(this.state.playerName));

        if(player.NewlyCreated) {
            PlayFabHelper.UpdateUserTitleDisplayName(this.state.playerName, this.props.onPageNothing, this.props.onPageError);
        }

        CloudScriptHelper.login((response) => {
            this.props.dispatch(actionSetPlayerHP(response.playerHP));
            this.props.dispatch(actionSetPlayerLevel(response.level));
            this.props.dispatch(actionSetPlayerXP(response.xp));
            this.props.dispatch(actionSetInventory(response.inventory));
            this.loadEquipment(response);
            this.goToGuide();
        }, this.props.onPageError);

        PlayFabHelper.GetTitleData([TITLE_DATA_PLANETS, TITLE_DATA_STORES, TITLE_DATA_ENEMIES], (data) => {
            this.props.dispatch(actionSetPlanetsFromTitleData(data, TITLE_DATA_PLANETS));
            this.props.dispatch(actionSetStoreNamesFromTitleData(data, TITLE_DATA_STORES));
            this.props.dispatch(actionSetEnemiesFromTitleData(data, TITLE_DATA_ENEMIES));
            this.goToGuide();
        }, this.props.onPageError);
        
        PlayFabHelper.GetCatalogItems(CATALOG_VERSION, (catalog) => {
            this.props.dispatch(actionSetCatalog(catalog));
            this.goToGuide();
        }, this.props.onPageError);
        
        this.goToGuide();
    }

    private loadEquipment(response: IPlayerLoginResponse): void {
        if(is.null(response.equipment)) {
            // You have no equipment
            return;
        }

        const equipmentSlots = Object.keys(response.equipment);

        if(is.null(equipmentSlots)) {
            // You have an equipment log in user data, but nothing actually in there
            return;
        }

        const equipment = equipmentSlots
            .map(slot => {
                const item = response.inventory.Inventory.find(i => i.ItemInstanceId === response.equipment[slot]);

                if(is.null(item)) {
                    // You have an item in your equipment list that isn't in your inventory. That's bad.
                    // We'll filter these out
                    return null;
                }
                
                return {
                    slot,
                    item,
                } as IEquipItemInstance;
            })
            .filter(i => !is.null(i));

        this.props.dispatch(actionSetEquipmentMultiple(equipment));
    }

    private goToGuide(): void {
        const haveDownloadedEverything = !is.null(this.props.appState.playerLevel)
            && !is.null(this.props.appState.inventory)
            && !is.null(this.props.appState.catalog)
            && !is.null(this.props.appState.planets);

        if(!haveDownloadedEverything) {
            return;
        }

        this.setState({
            isLoggingIn: false,
        }, () => {
            this.props.history.push(routes.Guide(this.props.appState.cloud, this.props.appState.titleId));
        });
    }

    private onChangePlayerName = (_: any, playerName: string): void => {
        this.setState({
            playerName,
        });
    }
}

export const LoginPage = withAppState(withPage(LoginPageBase));