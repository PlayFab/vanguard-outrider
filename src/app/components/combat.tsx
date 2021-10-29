import React, { useCallback, useEffect } from "react";
import { ITitleDataEnemy, ITitleDataEnemyGroup } from "../shared/types";
import { PrimaryButton, MessageBar, MessageBarType, DefaultButton, DocumentCard } from "@fluentui/react";
import styled, { UlInline, UlNull, DivDocumentCardInterior, DlStats } from "../styles";
import { Grid } from "./grid";
import { IApplicationState, mainReducer } from "../store/reducers";
import { is } from "../shared/is";
import { CombatStage, ICombatEvent, useCombat } from "../hooks/use-combat";
import { useDispatch, useSelector } from "react-redux";

interface IProps {
	planet: string;
	area: string;
	enemyGroup: ITitleDataEnemyGroup;
	enemies: ITitleDataEnemy[];
	onCombatStarted: () => void;
	onCombatFinished: () => void;
	onLeaveCombat: () => void;
	onReturnToHeadquarters: () => void;
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
	background-color: ${s => (s.isPlayer ? s.theme.color.backgroundPlayer500 : s.theme.color.backgroundEnemy500)};
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

export const Combat: React.FunctionComponent<IProps> = React.memo(props => {
	const { enemies, onCombatStarted, onCombatFinished, onLeaveCombat, onReturnToHeadquarters } = props;
	const {
		combatEnemies,
		combatPlayerHP,
		combatStage,
		events,
		isCombatActionHappening,
		onCombatAdvanceStage,
		onCombatPlayerAttack,
		onCombatStart,
	} = useCombat();
	const refCombatEvents = React.createRef<HTMLUListElement>();
	const { catalog, equipment, playerHP } = useSelector((state: IApplicationState) => ({
		catalog: state.catalog,
		equipment: state.equipment,
		playerHP: state.playerHP,
	}));
	const dispatch = useDispatch();

	const getWeapon = useCallback((): PlayFabClientModels.CatalogItem => {
		return catalog.find(c => c.ItemId === equipment.weapon.ItemId);
	}, [catalog, equipment.weapon.ItemId]);

	const getArmor = useCallback((): PlayFabClientModels.CatalogItem => {
		let armor: PlayFabClientModels.CatalogItem = null;
		if (!is.null(equipment.armor)) {
			armor = catalog.find(c => c.ItemId === equipment.armor.ItemId);
		}

		return armor;
	}, [catalog, equipment.armor]);

	// Will happen multiple times, but the hook will disregard multiple updates
	useEffect(() => {
		onCombatStart(enemies, playerHP, getWeapon(), getArmor());
	}, [enemies, getArmor, getWeapon, onCombatStart, playerHP]);

	// Should happen when stage changes or player HP changes
	useEffect(() => {
		if (combatStage !== CombatStage.Victory && combatPlayerHP !== playerHP) {
			dispatch(mainReducer.actions.setPlayerHP(combatPlayerHP));
		}

		if (combatStage === CombatStage.Victory) {
			onCombatFinished();
		}
	}, [combatPlayerHP, combatStage, dispatch, onCombatFinished, playerHP]);

	const onCombatFight = useCallback((): void => {
		onCombatAdvanceStage();
		onCombatStarted();
	}, [onCombatAdvanceStage, onCombatStarted]);

	const renderEvent = useCallback((event: ICombatEvent, index: number): React.ReactNode => {
		if (is.null(event)) {
			return null;
		}

		const isPlayer = event.source === "player";
		let message = "";

		if (!is.null(event.message)) {
			message = event.message;
		} else if (isPlayer) {
			if (event.damage === 0) {
				message = `You missed ${event.enemyName} #${event.enemyIndex + 1}`;
			} else {
				message = `You hit ${event.enemyName} #${event.enemyIndex + 1} for ${event.damage} damage`;
			}
		} else {
			// It's an enemy attacking
			if (event.damage === 0) {
				message = `${event.enemyName} #${event.enemyIndex + 1} missed you`;
			} else {
				message = `${event.enemyName} #${event.enemyIndex + 1} hit you for ${event.damage} damage`;
			}
		}

		return (
			<LiCombatEvent key={index} isPlayer={isPlayer} role="alert">
				{message}
			</LiCombatEvent>
		);
	}, []);

	if (is.null(combatEnemies)) {
		return null;
	}

	if (combatPlayerHP <= 0 && combatStage !== CombatStage.Dead) {
		return <MessageBar title="Dead people cannot fight" messageBarType={MessageBarType.blocked} />;
	}

	switch (combatStage) {
		case CombatStage.Introduction:
			const combatantCount = `There are ${combatEnemies.length} ${
				combatEnemies.length === 1 ? "enemy" : "enemies"
			} ahead.`;
			return (
				<React.Fragment>
					<p>{combatantCount}</p>
					<UlInline>
						<li>
							<PrimaryButton text="Fight" onClick={onCombatFight} ariaLabel={`${combatantCount} Fight`} />
						</li>
						<li>
							<DefaultButton
								text="Retreat"
								onClick={onLeaveCombat}
								ariaLabel={`${combatantCount} Retreat`}
							/>
						</li>
					</UlInline>
				</React.Fragment>
			);
		case CombatStage.Dead:
			return (
				<div role="alert">
					<p>You are dead. It happens sometimes!</p>
					<p>Go back to headquarters to be revived.</p>
					<UlInline>
						<li>
							<PrimaryButton text="Return to Headquarters" onClick={onReturnToHeadquarters} />
						</li>
					</UlInline>
				</div>
			);
		case CombatStage.Victory:
			// This is handled in the parent component
			return null;
		case CombatStage.Fighting:
		default:
			const encounterString = `You encounter ${enemies.length} ${enemies.length === 1 ? "enemy" : "enemies"}`;
			return (
				<DivBattle>
					<Grid grid4x8>
						<React.Fragment>
							<h3>Events</h3>
							<UlCombatEvents ref={refCombatEvents}>
								{!is.null(events) && events.map(renderEvent)}
								<LiCombatEventNeutral role="alert">{encounterString}</LiCombatEventNeutral>
							</UlCombatEvents>
						</React.Fragment>
						<React.Fragment>
							<h3>Enemies</h3>
							<DivEnemyWrapper>
								<Grid grid4x4x4 reduce>
									{combatEnemies.map((enemy, index) => {
										const enemyButtonLabel = `Fire on ${enemy.name} #${index + 1}, HP ${enemy.hp}`;

										return (
											<DocumentCard key={index}>
												<DivDocumentCardInterior>
													<h3>
														{enemy.name} #{index + 1}
													</h3>
													<DlStats>
														<dt>HP</dt>
														<dd>{enemy.hp}</dd>
													</DlStats>
													<PrimaryButton
														onClick={onCombatPlayerAttack.bind(this, index)}
														text={`Fire!`}
														disabled={isCombatActionHappening}
														ariaLabel={enemyButtonLabel}
													/>
												</DivDocumentCardInterior>
											</DocumentCard>
										);
									})}
								</Grid>
							</DivEnemyWrapper>
						</React.Fragment>
					</Grid>
				</DivBattle>
			);
	}
});
