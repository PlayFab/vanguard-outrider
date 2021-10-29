import { useCallback, useEffect, useState } from "react";
import { is } from "../shared/is";
import { IArmorItemCustomData, ITitleDataEnemy, IWeaponItemCustomData } from "../shared/types";
import { utilities } from "../shared/utilities";

interface IUseCombatResult {
	readonly combatPlayerHP: number;
	readonly combatEnemies: ITitleDataEnemy[];
	readonly combatStage: CombatStage;
	readonly isCombatActionHappening: boolean;
	readonly events: ICombatEvent[];

	readonly onCombatStart: (
		enemies: ITitleDataEnemy[],
		playerHP: number,
		weapon: PlayFabClientModels.CatalogItem,
		armor: PlayFabClientModels.CatalogItem
	) => void;
	readonly onCombatPlayerAttack: (enemyIndex: number) => void;
	readonly onCombatAdvanceStage: () => void;
}

export enum CombatStage {
	Introduction,
	Fighting,
	Dead,
	Victory,
}

export interface ICombatEvent {
	source: "player" | "enemy";
	enemyIndex?: number;
	enemyName?: string;
	damage?: number;
	message?: string;
}

const zeroArmorData: IArmorItemCustomData = {
	block: 0,
	reduce: 0,
};

export const useCombat = function (): IUseCombatResult {
	const [playerHP, setPlayerHP] = useState<number>();
	const [enemies, setEnemies] = useState<ITitleDataEnemy[]>();
	const [stage, setStage] = useState<CombatStage>(CombatStage.Introduction);
	const [lastRound, setLastRound] = useState<ICombatEvent>();
	const [playerDamage, setPlayerDamage] = useState<number>();
	const [playerArmorData, setPlayerArmorData] = useState<IArmorItemCustomData>();
	const [isActionHappening, setIsActionHappening] = useState<boolean>();
	const [events, setEvents] = useState<ICombatEvent[]>([]);
	const [shouldEnemiesAttack, setShouldEnemiesAttack] = useState(false);

	useEffect(() => {
		if (!is.null(lastRound) && lastRound !== events[0]) {
			setEvents([lastRound].concat(events));
		}
	}, [events, lastRound]);

	const getPlayerDamage = useCallback((weapon: PlayFabClientModels.CatalogItem): number => {
		if (is.null(weapon)) {
			// Should not be possible!
			return 1;
		}

		const data = JSON.parse(weapon.CustomData) as IWeaponItemCustomData;

		if (is.null(data) || is.null(data.damage)) {
			// TODO: Alert?
			return 1;
		}

		return data.damage;
	}, []);

	const getPlayerArmorCustomData = useCallback((armor: PlayFabClientModels.CatalogItem): IArmorItemCustomData => {
		if (is.null(armor)) {
			// Should not be possible!
			return zeroArmorData;
		}

		const data = JSON.parse(armor.CustomData) as IArmorItemCustomData;

		if (is.null(data) || is.null(data.block) || is.null(data.reduce)) {
			// TODO: Alert?
			return zeroArmorData;
		}

		return data;
	}, []);

	const getActionDelay = useCallback((): number => {
		return utilities.getRandomInteger(400, 600);
	}, []);

	const start = useCallback(
		(
			newEnemies: ITitleDataEnemy[],
			newPlayerHP: number,
			weapon: PlayFabClientModels.CatalogItem,
			armor: PlayFabClientModels.CatalogItem
		): void => {
			if (is.null(newPlayerHP) || !is.null(enemies)) {
				return;
			}

			setEnemies(newEnemies);
			setPlayerHP(newPlayerHP);
			setPlayerDamage(getPlayerDamage(weapon));
			setPlayerArmorData(getPlayerArmorCustomData(armor));
		},
		[enemies, getPlayerArmorCustomData, getPlayerDamage]
	);

	const onAdvanceStage = useCallback((): void => {
		let newStage = stage;

		switch (stage) {
			case CombatStage.Introduction:
				newStage = CombatStage.Fighting;
				break;
		}

		setStage(newStage);
		setLastRound(null);
	}, [stage]);

	const onEnemyAttack = useCallback((): void => {
		// Pick someone to attack
		const attackingEnemyIndex = utilities.getRandomInteger(0, enemies.length - 1);
		let damage = utilities.getRandomInteger(
			Math.ceil(enemies[attackingEnemyIndex].damage / 3),
			enemies[attackingEnemyIndex].damage
		);
		const armorData = playerArmorData;

		if (damage < armorData.block) {
			damage = 0;
		} else if (armorData.reduce > 0) {
			damage = Math.floor(damage * ((100 - armorData.reduce) / 100));
		}

		let newPlayerHP = Math.max(0, playerHP - damage);
		const enemyName = enemies[attackingEnemyIndex].name;

		setIsActionHappening(false);
		setPlayerHP(newPlayerHP);

		if (newPlayerHP === 0) {
			setStage(CombatStage.Dead);
		} else {
			setLastRound({
				enemyIndex: attackingEnemyIndex,
				damage,
				enemyName,
				source: "enemy",
			});
		}
	}, [enemies, playerArmorData, playerHP]);

	useEffect(() => {
		if (shouldEnemiesAttack) {
			onEnemyAttack();
			setShouldEnemiesAttack(false);
		}
	}, [onEnemyAttack, shouldEnemiesAttack]);

	const onPlayerAttack = useCallback(
		(enemyIndex: number): void => {
			if (enemyIndex < 0 || enemyIndex > enemies.length - 1) {
				// You're trying to attack an invalid enemy index, weird.
				return;
			}

			const newPlayerDamage = Math.ceil(playerDamage * (utilities.getRandomInteger(80, 120) / 100));
			const enemyName = enemies[enemyIndex].name;
			const enemyHP = Math.max(0, enemies[enemyIndex].hp - playerDamage);

			if (enemyHP === 0) {
				// You killed an enemy
				if (enemies.length === 1) {
					// You killed the last enemy and it's victory time
					setEnemies([]);
					setStage(CombatStage.Victory);
					setIsActionHappening(false);
				} else {
					// More enemies remain
					setIsActionHappening(true);
					setEnemies(enemies.filter((_, index) => index !== enemyIndex));
					setLastRound({
						source: "player",
						enemyIndex,
						enemyName,
						damage: newPlayerDamage,
						message: `You defeated ${enemyName} #${enemyIndex + 1}`,
					});
				}
			} else {
				// You didn't kill all the enemies
				setIsActionHappening(true);
				setEnemies(
					enemies.map((e, index) => {
						if (index !== enemyIndex) {
							return e;
						}

						return {
							...e,
							hp: enemyHP,
						};
					})
				);
				setLastRound({
					source: "player",
					enemyIndex,
					enemyName,
					damage: newPlayerDamage,
				});
			}

			// If the battle's not over, the enemy gets to attack
			if (stage === CombatStage.Fighting) {
				window.setTimeout(() => {
					setShouldEnemiesAttack(true);
				}, getActionDelay());
			}
		},
		[enemies, getActionDelay, playerDamage, stage]
	);

	return {
		combatEnemies: enemies,
		combatPlayerHP: playerHP,
		combatStage: stage,
		events,
		isCombatActionHappening: isActionHappening,
		onCombatStart: start,
		onCombatAdvanceStage: onAdvanceStage,
		onCombatPlayerAttack: onPlayerAttack,
	};
};
