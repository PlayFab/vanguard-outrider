import React from "react";
import { RouteComponentProps, Redirect } from "react-router";
import { PrimaryButton, DocumentCard, DocumentCardTitle } from "office-ui-fabric-react";

import { is } from "../shared/is";
import { PlayFabHelper } from "../shared/playfab";
import { IPlanetData } from "../shared/types";
import { routes } from "../routes";
import { Page } from "../components/page";
import styled, { UlInline, SpinnerLeft, DlStats, DivDocumentCardInterior } from "../styles";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { actionSetInventory, actionSetPlayerXP, actionSetPlayerLevel, actionSetPlayerHP } from "../store/actions";
import { IWithPageProps, withPage } from "../containers/with-page";
import { utilities } from "../shared/utilities";
import { Combat } from "../components/combat";
import { IKilledEnemyGroupRequest } from "../../cloud-script/main";
import { CloudScriptHelper } from "../shared/cloud-script";
import { BackLink } from "../components/back-link";

interface IState {
    areaName: string;
    enemyGroupName: string;
    itemsGranted: string[];
    newLevel: number;
    newXP: number;
    isLoadingRewards: boolean;
    isCombatFinished: boolean;
}

interface IPlanetPageRouteProps {
    name: string;
}

const DocumentCardCombat = styled(DocumentCard)`
    margin-top: ${s => s.theme.size.spacer};
`;

type Props = RouteComponentProps<IPlanetPageRouteProps> & IWithAppStateProps & IWithPageProps;

class PlanetPageBase extends React.Component<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            areaName: null,
            enemyGroupName: null,
            itemsGranted: null,
            newLevel: null,
            newXP: null,
            isLoadingRewards: false,
            isCombatFinished: false,
        }
    }

    public render(): React.ReactNode {
        if(!this.props.appState.hasTitleId) {
            return null;
        }
        
        if(!this.props.appState.hasPlayerId) {
            return (<Redirect to={routes.MainMenu((this.props.match.params as any).cloud, this.props.appState.titleId)} />);
        }

        return (
            <Page
                {...this.props}
                title={this.getPageTitle()}
                shouldShowPlayerInfo
            >
                {this.renderPlanet()}
            </Page>
        );
    }

    private renderPlanet(): React.ReactNode {
        const planet = this.getPlanetData();

        if(is.null(this.state.areaName)) {
            return (
                <React.Fragment>
                    <BackLink to={routes.Guide(this.props.appState.cloud, this.props.appState.titleId)} label="Back to guide" />
                    <h2>Welcome to {planet.name}</h2>
                    <p>Choose a region to fight in:</p>
                    <UlInline>
                        {planet.areas.map((area) => (
                            <li key={area.name}><PrimaryButton text={area.name} onClick={this.setArea.bind(this, area.name)} /></li>
                        ))}
                    </UlInline>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <BackLink onClick={this.onLeaveCombat} label={`Back to ${planet.name}`} />
                <h2>{planet.name}, near {this.state.areaName}</h2>
                {this.renderCombatVictory()}
                {this.renderCombat()}
            </React.Fragment>
        );
    }

    private renderCombatVictory(): React.ReactNode {
        if(!this.state.isCombatFinished) {
            return null;
        }

        const title = (
            <h3>Excellent work, soldier!</h3>
        );
        
        if(this.state.isLoadingRewards) {
            return (
                <DocumentCardCombat>
                    <DivDocumentCardInterior>
                        {title}
                        <SpinnerLeft label="Reporting victory to headquarters..." labelPosition="right" />
                    </DivDocumentCardInterior>
                </DocumentCardCombat>
            );
        }

        return (
            <DocumentCardCombat>
                <DivDocumentCardInterior>
                    {title}
                    <DlStats>
                        {!is.null(this.state.newXP) && (
                            <React.Fragment>
                                <dt>Experience</dt>
                                <dd>{this.state.newXP} XP gained</dd>
                            </React.Fragment>
                        )}
                        {!is.null(this.state.newLevel) && (
                            <React.Fragment>
                                <dt>Level</dt>
                                <dd>Congratulations, you reached level {this.state.newLevel}</dd>
                            </React.Fragment>
                        )}
                    </DlStats>
                    <DlStats>
                        <dt>Rewards</dt>
                        {this.state.itemsGranted.map((itemId, index) => (
                            <dd key={index}>{this.props.appState.catalog.find(i => i.ItemId === itemId).DisplayName}</dd>
                        ))}
                    </DlStats>
                    <p><PrimaryButton onClick={this.onLeaveCombat} text={`Return to ${this.getPlanetName()}`} /></p>
                </DivDocumentCardInterior>
            </DocumentCardCombat>
        );
    }

    private renderCombat(): React.ReactNode {
        const enemyGroup = this.props.appState.enemies.enemyGroups.find(g => g.name === this.state.enemyGroupName);
        const enemyData = enemyGroup.enemies.map(e => this.props.appState.enemies.enemies.find(d => d.name === e));

        return (
            <Combat
                planet={this.getPlanetName()}
                area={this.state.areaName}
                enemyGroup={enemyGroup}
                enemies={enemyData}
                onCombatFinished={this.onCombatFinished}
                onLeaveCombat={this.onLeaveCombat}
                onReturnToHeadquarters={this.onReturnToHeadquarters}
            />
        );
    }

    private onCombatFinished = (): void => {
        // I'm going to assume that if you're alive, you won
        if(this.props.appState.playerHP === 0) {
            return;
        }

        this.setState({
            isLoadingRewards: true,
            isCombatFinished: true,
        });

        const combatReport: IKilledEnemyGroupRequest = {
            area: this.state.areaName,
            enemyGroup: this.state.enemyGroupName,
            planet: this.getPlanetName(),
            playerHP: this.props.appState.playerHP,
        };

        CloudScriptHelper.killedEnemyGroup(combatReport, (response) => {
            if(!is.null(response.errorMessage)) {
                this.props.onPageError(`Error when finishing combat: ${response.errorMessage}`);
                return;
            }

            if(!is.null(response.hp)) {
                // Your HP might be filled when you level up
                this.props.dispatch(actionSetPlayerHP(response.hp));
            }

            if(!is.null(response.itemsGranted)) {
                this.setState({
                    itemsGranted: response.itemsGranted
                });

                this.refreshInventory();
            }

            if(!is.null(response.xp)) {
                this.setState({
                    newXP: response.xp - this.props.appState.playerXP
                });

                this.props.dispatch(actionSetPlayerXP(response.xp));
            }
            else {
                this.setState({
                    newXP: null,
                });
            }

            if(!is.null(response.level)) {
                this.props.dispatch(actionSetPlayerLevel(response.level));
                this.setState({
                    newLevel: response.level,
                });
            }
            else {
                this.setState({
                    newLevel: null,
                });
            }

            this.setState({
                isLoadingRewards: false,
            });
        }, this.props.onPageError);
    }

    private onLeaveCombat = (): void => {
        this.setArea(null);
    }

    private refreshInventory(): void {
        PlayFabHelper.GetUserInventory(data => this.props.dispatch(actionSetInventory(data)), this.props.onPageError);
    }

    private setArea = (area: string): void => {
        if(is.null(area)) {
            this.setState({
                areaName: null,
                enemyGroupName: null,
                itemsGranted: null,
                isCombatFinished: false,
            });

            return;
        }

        // Pick an enemy group to fight
        const thisArea = this.props.appState.planets
            .find(p => p.name === this.getPlanetName())
            .areas
            .find(a => a.name === area);

        if(is.null(thisArea)) {
            return this.props.onPageError(`Area ${area} not found somehow`);
        }

        const enemyGroupIndex = utilities.getRandomInteger(0, thisArea.enemyGroups.length - 1);

        this.setState({
            areaName: area,
            enemyGroupName: thisArea.enemyGroups[enemyGroupIndex],
            itemsGranted: null,
        });
    }

    private getPlanetData(): IPlanetData {
        const planetName = this.getPlanetName();

        return this.props.appState.planets.find(p => p.name === planetName);
    }

    private getPlanetName(): string {
        return this.props.match.params.name;
    }

    private getPageTitle(): string {
        const planetName = this.getPlanetName();

        if(is.null(this.state.areaName)) {
            return planetName;
        }

        return `${planetName}, ${this.state.areaName}`;
    }

    private onReturnToHeadquarters = (): void => {
        this.props.history.push(routes.Headquarters(this.props.appState.cloud, this.props.appState.titleId));
    }
}

export const PlanetPage = withAppState(withPage(PlanetPageBase));