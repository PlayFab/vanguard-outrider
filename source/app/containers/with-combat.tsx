import React from "react";
import { ITitleDataEnemy, IWeaponItemCustomData, IArmorItemCustomData } from "../shared/types";
import { utilities } from "../shared/utilities";
import { is } from "../shared/is";

export interface IWithCombatProps {
    readonly combatPlayerHP: number;
    readonly combatEnemies: ITitleDataEnemy[];
    readonly combatStage: CombatStage;
    readonly combatLastRound: ICombatEvent;
    readonly isCombatActionHappening: boolean;

    readonly onCombatStart: (enemies: ITitleDataEnemy[], playerHP: number, weapon: PlayFabClientModels.CatalogItem, armor: PlayFabClientModels.CatalogItem) => void;
    readonly onCombatPlayerAttack: (enemyIndex: number) => void;
    readonly onCombatEnemyAttack: () => void;
    readonly onCombatAdvanceStage: () => void;
}

interface IState {
    playerHP: number;
    enemies: ITitleDataEnemy[];
    stage: CombatStage;
    lastRound: ICombatEvent;
    playerWeapon: PlayFabClientModels.CatalogItem;
    playerDamage: number;
    playerArmor: PlayFabClientModels.CatalogItem;
    playerArmorData: IArmorItemCustomData;
    isActionHappening: boolean;
}

export enum CombatStage {
    Introduction,
    Fighting,
    Dead,
    Victory
}

export interface ICombatEvent {
    source: "player" | "enemy";
    enemyIndex?: number;
    enemyName?: string;
    damage?: number;
    message?: string;
}

export const withCombat = <P extends IWithCombatProps>(Component: React.ComponentType<P>) => {
    return class WithCombat extends React.Component<Omit<P, keyof IWithCombatProps>, IState> {
        public state: IState = {
            enemies: [],
            playerHP: 0,
            lastRound: null,
            stage: CombatStage.Introduction,
            playerWeapon: null,
            playerDamage: 0,
            playerArmor: null,
            playerArmorData: null,
            isActionHappening: false,
        };

        private readonly zeroArmorData: IArmorItemCustomData = {
            block: 0,
            reduce: 0,
        };

        public render(): React.ReactNode {
            return (
                <Component
                    {...this.props as P}
                    combatEnemies={this.state.enemies}
                    combatPlayerHP={this.state.playerHP}
                    combatStage={this.state.stage}
                    onCombatStart={this.start}
                    onCombatPlayerAttack={this.onPlayerAttack}
                    onCombatEnemyAttack={this.onEnemyAttack}
                    onCombatAdvanceStage={this.onAdvanceStage}
                    combatLastRound={this.state.lastRound}
                    isCombatActionHappening={this.state.isActionHappening}
                />
            );
        }

        private start = (enemies: ITitleDataEnemy[], playerHP: number, weapon: PlayFabClientModels.CatalogItem, armor: PlayFabClientModels.CatalogItem): void => {
            this.setState({
                enemies,
                playerHP,
                stage: CombatStage.Introduction,
                playerWeapon: weapon,
                playerDamage: this.getPlayerDamage(weapon),
                playerArmor: armor,
                playerArmorData: this.getPlayerArmorCustomData(armor),
            });
        }

        private onEnemyAttack = (): void => {
            // Pick someone to attack
            const attackingEnemyIndex = utilities.getRandomInteger(0, this.state.enemies.length - 1);
            let damage = utilities.getRandomInteger(Math.ceil(this.state.enemies[attackingEnemyIndex].damage / 3), this.state.enemies[attackingEnemyIndex].damage);
            const armorData = this.state.playerArmorData;

            if(damage < armorData.block) {
                damage = 0;
            }
            else if(armorData.reduce > 0) {
                damage = Math.floor(damage * ((100 - armorData.reduce) / 100));
            }

            const playerHP = this.state.playerHP - damage;
            const enemyName = this.state.enemies[attackingEnemyIndex].name;

            this.setState(prevState => {
                if(playerHP <= 0) {
                    return {
                        ...prevState,
                        playerHP: 0,
                        enemyName,
                        isActionHappening: false,
                        stage: CombatStage.Dead
                    };
                }
                else {
                    return {
                        ...prevState,
                        lastRound: {
                            enemyIndex: attackingEnemyIndex,
                            damage,
                            enemyName,
                            source: "enemy"
                        },
                        isActionHappening: false,
                        playerHP
                    };
                }
            });
        }

        private onPlayerAttack = (enemyIndex: number): void => {
            this.setState(prevState => {
                if(enemyIndex < 0 || enemyIndex > prevState.enemies.length - 1) {
                    // You're trying to attack an invalid enemy index, weird.
                    return prevState;
                }

                const playerDamage = Math.ceil(this.state.playerDamage * (utilities.getRandomInteger(80, 120) / 100));

                const enemyName = prevState.enemies[enemyIndex].name;
                const enemyHP = prevState.enemies[enemyIndex].hp - playerDamage;
                
                if(enemyHP <= 0) {
                    // You killed an enemy
                    if(prevState.enemies.length === 1) {
                        // You killed the last enemy and it's victory time
                        return {
                            ...prevState,
                            enemies: [],
                            stage: CombatStage.Victory,
                            isActionHappening: false,
                        }
                    }

                    // More enemies remain
                    return {
                        ...prevState,
                        lastRound: {
                            source: "player",
                            enemyIndex,
                            enemyName,
                            damage: playerDamage,
                            message: `You defeated ${enemyName} #${enemyIndex + 1}`,
                        },
                        isActionHappening: true,
                        enemies: prevState.enemies.filter((_, index) => index !== enemyIndex),
                    };
                }
                else {
                    // You didn't kill all the enemies
                    return {
                        ...prevState,
                        lastRound: {
                            source: "player",
                            enemyIndex,
                            enemyName,
                            damage: playerDamage,
                        },
                        isActionHappening: true,
                        enemies: prevState.enemies.map((e, index) => {
                            if(index !== enemyIndex) {
                                return e;
                            }

                            return {
                                ...e,
                                hp: enemyHP,
                            };
                        })
                    }
                }
            }, () => {
                // If the battle's not over, the enemy gets to attack
                if(this.state.stage === CombatStage.Fighting) {
                    window.setTimeout(() => {
                        this.onEnemyAttack();
                    }, this.getActionDelay());
                }
            });
        }

        private onAdvanceStage = (): void => {
            this.setState((prevState) => {
                let stage = prevState.stage;

                switch(this.state.stage) {
                    case CombatStage.Introduction:
                        stage = CombatStage.Fighting;
                        break;
                }

                return {
                    ...prevState,
                    stage,
                    lastRound: null,
                }
            });
        }

        private getPlayerDamage(weapon: PlayFabClientModels.CatalogItem): number {
            if(is.null(weapon)) {
                // Should not be possible!
                return 1;
            }

            const data = JSON.parse(weapon.CustomData) as IWeaponItemCustomData;

            if(is.null(data) || is.null(data.damage)) {
                // TODO: Alert?
                return 1;
            }

            return data.damage;
        }

        private getPlayerArmorCustomData(armor: PlayFabClientModels.CatalogItem): IArmorItemCustomData {
            if(is.null(armor)) {
                // Should not be possible!
                return this.zeroArmorData;
            }

            const data = JSON.parse(armor.CustomData) as IArmorItemCustomData;

            if(is.null(data) || is.null(data.block) || is.null(data.reduce)) {
                // TODO: Alert?
                return this.zeroArmorData;
            }

            return data;
        }

        private getActionDelay = (): number => {
            return utilities.getRandomInteger(400, 600);
        }
    }
}