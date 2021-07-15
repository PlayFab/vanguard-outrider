import React from "react";
import { IWithCombatProps, withCombat, CombatStage, ICombatEvent } from "../containers/with-combat";
import { ITitleDataEnemy, ITitleDataEnemyGroup } from "../shared/types";
import { IWithAppStateProps, withAppState } from "../containers/with-app-state";
import { actionSetPlayerHP } from "../store/actions";
import { is } from "../shared/is";
import { PrimaryButton, MessageBar, MessageBarType, DefaultButton, DocumentCard } from "office-ui-fabric-react";
import styled, { UlInline, UlNull, DivDocumentCardInterior, DlStats } from "../styles";
import { Grid } from "./grid";

interface IProps {
    planet: string;
    area: string;
    enemyGroup: ITitleDataEnemyGroup;
    enemies: ITitleDataEnemy[];
    onCombatFinished: () => void;
    onLeaveCombat: () => void;
    onReturnToHeadquarters: () => void;
}

interface IState {
    events: ICombatEvent[];
}

interface ILiCombatEventProps {
    isPlayer: boolean;
}

const DivBattle = styled.div`
    margin-top: ${s => s.theme.size.spacer};
`;

const UlCombatEvents = styled(UlNull)`
    max-height: ${s => s.theme.breakpointUnits.tiny};
    overflow-y: auto;
`;

const LiCombatEvent = styled.li<ILiCombatEventProps>`
    margin-top: ${s => s.theme.size.spacerD2};
    color: ${s => s.theme.color.text000};
    padding: ${s => s.theme.size.spacerD2};
    background-color: ${s => s.isPlayer
        ? s.theme.color.backgroundPlayer500
        : s.theme.color.backgroundEnemy500};
`;

const LiCombatEventNeutral = styled.li`
    margin-top: ${s => s.theme.size.spacerD2};
    color: ${s => s.theme.color.text000};
    padding: ${s => s.theme.size.spacerD2};
    background-color: ${s => s.theme.color.background500};
`;

const DivEnemyWrapper = styled.div`
    margin-top: ${s => s.theme.size.spacerD2};
`;

type Props = IProps & IWithCombatProps & IWithAppStateProps;

class CombatBase extends React.PureComponent<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            events: [],
        };
    }

    public componentDidMount(): void {
        this.props.onCombatStart(this.props.enemies, this.props.appState.playerHP, this.getWeapon(), this.getArmor());
    }

    public componentDidUpdate(prevProps: Props): void {
        if(this.props.combatStage !== CombatStage.Victory && this.props.combatPlayerHP !== this.props.appState.playerHP) {
            this.props.dispatch(actionSetPlayerHP(this.props.combatPlayerHP));
        }

        if(prevProps.combatStage !== CombatStage.Victory && this.props.combatStage === CombatStage.Victory) {
            this.props.onCombatFinished();
        }

        if(prevProps.combatLastRound !== this.props.combatLastRound && !is.null(this.props.combatLastRound)) {
            // Add the latest event to the list
            this.setState((prevState) => ({
                events: [this.props.combatLastRound].concat(prevState.events)
            }));
        }
    }

    public render(): React.ReactNode {
        if(this.props.combatPlayerHP <= 0 && this.props.combatStage !== CombatStage.Dead) {
            return (
                <MessageBar title="Dead people cannot fight" messageBarType={MessageBarType.blocked} />
            );
        }

        switch(this.props.combatStage) {
            case CombatStage.Introduction:
                return (
                    <React.Fragment>
                        <p>There are {this.props.combatEnemies.length} {this.props.combatEnemies.length === 1 ? "enemy" : "enemies"} ahead.</p>
                        <UlInline>
                            <li><PrimaryButton text="Fight" onClick={this.props.onCombatAdvanceStage} /></li>
                            <li><DefaultButton text="Retreat" onClick={this.props.onLeaveCombat} /></li>
                        </UlInline>
                    </React.Fragment>
                );
            case CombatStage.Dead:
                return (
                    <React.Fragment>
                        <p>You are dead. It happens sometimes!</p>
                        <p>Go back to headquarters to be revived.</p>
                        <UlInline>
                            <li><PrimaryButton text="Return to Headquarters" onClick={this.props.onReturnToHeadquarters} /></li>
                        </UlInline>
                    </React.Fragment>
                );
            case CombatStage.Victory:
                // This is handled in the parent component
                return null;
            case CombatStage.Fighting:
            default:
                return (
                    <DivBattle>
                        <Grid grid4x8>
                            <React.Fragment>
                                <h3>Events</h3>
                                <UlCombatEvents>
                                    {!is.null(this.state.events) && this.state.events.map(this.renderEvent)}
                                    <LiCombatEventNeutral>You encounter {this.props.enemies.length} {this.props.enemies.length === 1 ? "enemy" : "enemies"}</LiCombatEventNeutral>
                                </UlCombatEvents>
                            </React.Fragment>
                            <React.Fragment>
                                <h3>Enemies</h3>
                                <DivEnemyWrapper>
                                    <Grid grid4x4x4 reduce>
                                        {this.props.combatEnemies.map((enemy, index) => (
                                            <DocumentCard key={index}>
                                                <DivDocumentCardInterior>
                                                    <h3>{enemy.name} #{index + 1}</h3>
                                                    <DlStats>
                                                        <dt>HP</dt>
                                                        <dd>{enemy.hp}</dd>
                                                    </DlStats>
                                                    <PrimaryButton onClick={this.props.onCombatPlayerAttack.bind(this, index)} text={`Fire!`} disabled={this.props.isCombatActionHappening} />
                                                </DivDocumentCardInterior>
                                            </DocumentCard>
                                        ))}
                                    </Grid>
                                </DivEnemyWrapper>
                            </React.Fragment>
                        </Grid>
                    </DivBattle>
                );
        }
    }

    private renderEvent = (event: ICombatEvent, index: number): React.ReactNode => {
        const isPlayer = event.source === "player";
        let message = "";

        if(!is.null(event.message)) {
            message = event.message;
        }
        else if(isPlayer) {
            if(event.damage === 0) {
                message = `You missed ${event.enemyName} #${event.enemyIndex + 1}`;
            }
            else {
                message = `You hit ${event.enemyName} #${event.enemyIndex + 1} for ${event.damage} damage`;
            }
        }
        else {
            // It's an enemy attacking
            if(event.damage === 0) {
                message = `${event.enemyName} #${event.enemyIndex + 1} missed you`;
            }
            else {
                message = `${event.enemyName} #${event.enemyIndex + 1} hit you for ${event.damage} damage`;
            }
        }

        return <LiCombatEvent key={index} isPlayer={isPlayer}>{message}</LiCombatEvent>
    }

    private getWeapon(): PlayFabClientModels.CatalogItem {
        return this.props.appState.catalog.find(i => i.ItemId === this.props.appState.equipment.weapon.ItemId);
    }

    private getArmor(): PlayFabClientModels.CatalogItem {
        let armor: PlayFabClientModels.CatalogItem = null;
        if(!is.null(this.props.appState.equipment.armor)) {
            armor = this.props.appState.catalog.find(i => i.ItemId === this.props.appState.equipment.armor.ItemId);
        }

        return armor;
    }
}

export const Combat = withAppState(withCombat(CombatBase));