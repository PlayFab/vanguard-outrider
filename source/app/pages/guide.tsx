import React from "react";
import { RouteComponentProps, Redirect } from "react-router-dom";
import { PrimaryButton, DefaultButton, Spinner } from "office-ui-fabric-react";

import { Page } from "../components/page";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { UlInline, SpinnerLeft } from "../styles";
import { routes } from "../routes";
import { is } from "../shared/is";

type Props = RouteComponentProps & IWithAppStateProps;

class GuidePageBase extends React.Component<Props> {
    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }

        if(!this.props.appState.hasPlayerId) {
            return (<Redirect to={routes.MainMenu(this.props.appState.cloud, this.props.appState.titleId)} />);
        }

        return (
            <Page
                {...this.props}
                title="Guide"
                shouldShowPlayerInfo
            >
                {this.renderPlanetMenu()}
            </Page>
        );
    }

    private renderPlanetMenu(): React.ReactNode {
        if(is.null(this.props.appState.planets)) {
            return <SpinnerLeft label="Loading planets..." labelPosition="right" />;
        }

        if(is.null(this.props.appState.equipment) || is.null(this.props.appState.equipment.weapon)) {
            return (
                <React.Fragment>
                    <h2>Destinations</h2>
                    <p>Welcome to the field, soldier.</p>
                    <p>You can't go into space without a weapon. Buy one at headquarters.</p>
                    <UlInline>
                        <li key={"homebase"}><PrimaryButton text="Headquarters" onClick={this.sendToHeadquarters} /></li>
                    </UlInline>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <h2>Destinations</h2>
                <UlInline>
                    <li key={"homebase"}><DefaultButton text="Headquarters" onClick={this.sendToHeadquarters} /></li>
                    {this.props.appState.planets.map((planet) => (
                        <li key={planet.name}><PrimaryButton text={`Fly to ${planet.name}`} onClick={this.sendToPlanet.bind(this, planet.name)} /></li>
                    ))}
                </UlInline>
            </React.Fragment>
        );
    }

    private sendToHeadquarters = (): void => {
        this.props.history.push(routes.Headquarters(this.props.appState.cloud, this.props.appState.titleId));
    }

    private sendToPlanet = (name: string): void => {
        this.props.history.push(routes.Planet(this.props.appState.cloud, this.props.appState.titleId, name));
    }
}

export const GuidePage = withAppState(GuidePageBase);