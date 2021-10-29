import { DocumentCard, PrimaryButton } from "@fluentui/react";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router";
import { IKilledEnemyGroupRequest } from "../../cloud-script/main";
import { BackLink } from "../components/back-link";
import { Combat } from "../components/combat";
import { Page } from "../components/page";
import { ICloudParams, useCloud } from "../hooks/use-cloud";
import { usePage } from "../hooks/use-page";
import { routes } from "../routes";
import { CloudScriptHelper } from "../shared/cloud-script";
import { is } from "../shared/is";
import { PlayFabHelper } from "../shared/playfab";
import { IPlanetData, ITitleDataEnemies } from "../shared/types";
import { utilities } from "../shared/utilities";
import { IApplicationState, mainReducer } from "../store/reducers";
import styled, { DivDocumentCardInterior, DlStats, SpinnerLeft, UlInline } from "../styles";

const DocumentCardCombat = styled(DocumentCard)`
	margin-top: ${s => s.theme.size.spacer};
`;

export const PlanetPage: React.FunctionComponent = React.memo(() => {
	const params = useCloud(useParams<ICloudParams>());
	const history = useHistory();
	const dispatch = useDispatch();
	const { cloud, titleId, playerHP, playerXP, planets, enemies, hasTitleId, hasPlayerId, catalog, playerName } =
		useSelector((state: IApplicationState) => ({
			cloud: state.cloud,
			titleId: state.titleId,
			playerHP: state.playerHP,
			playerXP: state.playerXP,
			planets: state.planets,
			enemies: state.enemies,
			hasTitleId: state.hasTitleId,
			hasPlayerId: state.hasPlayerId,
			catalog: state.catalog,
			playerName: state.playerName,
		}));

	const { onPageError } = usePage();

	const [areaName, setareaName] = useState<string>(null);
	const [enemyGroupName, setenemyGroupName] = useState<string>(null);
	const [itemsGranted, setitemsGranted] = useState<string[]>(null);
	const [newLevel, setnewLevel] = useState<number>(null);
	const [newXP, setnewXP] = useState<number>(null);
	const [isLoadingRewards, setisLoadingRewards] = useState<boolean>(false);
	const [hasCombatStarted, sethasCombatStarted] = useState<boolean>(false);
	const [isCombatFinished, setisCombatFinished] = useState<boolean>(false);

	const planetName = params.name;

	const onCombatStarted = useCallback((): void => {
		sethasCombatStarted(true);
	}, []);

	const refreshInventory = useCallback((): void => {
		PlayFabHelper.GetUserInventory(data => dispatch(mainReducer.actions.setInventory(data)), onPageError);
	}, [dispatch, onPageError]);

	const onCombatFinished = useCallback((): void => {
		// I'm going to assume that if you're alive, you won.
		// Also you can't win multiple times.
		if (playerHP === 0 || isCombatFinished) {
			return;
		}

		setisLoadingRewards(true);
		setisCombatFinished(true);
		sethasCombatStarted(false);

		const combatReport: IKilledEnemyGroupRequest = {
			area: areaName,
			enemyGroup: enemyGroupName,
			planet: params.name,
			playerHP: playerHP,
		};

		CloudScriptHelper.killedEnemyGroup(
			combatReport,
			response => {
				if (!is.null(response.errorMessage)) {
					onPageError(`Error when finishing combat: ${response.errorMessage}`);
					return;
				}

				if (!is.null(response.hp)) {
					// Your HP might be filled when you level up
					dispatch(mainReducer.actions.setPlayerHP(response.hp));
				}

				if (!is.null(response.itemsGranted)) {
					setitemsGranted(response.itemsGranted);
					refreshInventory();
				}

				if (!is.null(response.xp)) {
					setnewXP(response.xp - playerXP);

					dispatch(mainReducer.actions.setPlayerXP(response.xp));
				} else {
					setnewXP(null);
				}

				if (!is.null(response.level)) {
					dispatch(mainReducer.actions.setPlayerLevel(response.level));
					setnewLevel(response.level);
				} else {
					setnewLevel(null);
				}

				setisLoadingRewards(false);
			},
			onPageError
		);
	}, [
		areaName,
		dispatch,
		enemyGroupName,
		isCombatFinished,
		onPageError,
		params.name,
		playerHP,
		playerXP,
		refreshInventory,
	]);

	const setArea = useCallback(
		(area: string): void => {
			if (is.null(area)) {
				setareaName(null);
				setenemyGroupName(null);
				setitemsGranted(null);
				setisCombatFinished(false);

				return;
			}

			// Pick an enemy group to fight
			const thisArea = planets.find(p => p.name === params.name).areas.find(a => a.name === area);

			if (is.null(thisArea)) {
				return onPageError(`Area ${area} not found somehow`);
			}

			const enemyGroupIndex = utilities.getRandomInteger(0, thisArea.enemyGroups.length - 1);

			setareaName(area);
			setenemyGroupName(thisArea.enemyGroups[enemyGroupIndex]);
			setitemsGranted(null);
		},
		[onPageError, params.name, planets]
	);

	const onLeaveCombat = useCallback((): void => {
		setArea(null);
		sethasCombatStarted(false);
	}, [setArea]);

	const getPlanetData = useCallback((): IPlanetData => {
		const planetName = params.name;

		if (is.null(planets)) {
			return null;
		}

		return planets.find(p => p.name === planetName);
	}, [params.name, planets]);

	const getPageTitle = useCallback((): string => {
		const planetName = params.name;

		let title: string;
		if (is.null(areaName)) {
			title = planetName;
		} else {
			title = `${planetName}, ${areaName}`;
		}

		if (hasCombatStarted) {
			title = `Combat on ${title}`;
		}

		return title;
	}, [areaName, hasCombatStarted, params.name]);

	const onReturnToHeadquarters = useCallback((): void => {
		history.push(routes.Headquarters(cloud, titleId));
	}, [cloud, history, titleId]);

	if (!hasTitleId) {
		return null;
	}

	if (!hasPlayerId) {
		return <Redirect to={routes.MainMenu(cloud, titleId)} />;
	}

	return (
		<Page title={getPageTitle()} shouldShowPlayerInfo>
			<PlanetPageContent
				areaName={areaName}
				cloud={cloud}
				titleId={titleId}
				getPlanetData={getPlanetData}
				onLeaveCombat={onLeaveCombat}
				setArea={setArea}
				combatProps={{
					areaName,
					enemies,
					enemyGroupName,
					onCombatFinished,
					onCombatStarted,
					onLeaveCombat,
					onReturnToHeadquarters,
					planetName,
				}}
				combatVictoryProps={{
					catalog,
					isCombatFinished,
					isLoadingRewards,
					itemsGranted,
					newLevel,
					newXP,
					onLeaveCombat,
					planetName,
					playerName,
				}}
			/>
		</Page>
	);
});

interface IPlanetPageContentProps {
	areaName: string;
	cloud: string;
	titleId: string;
	getPlanetData: () => IPlanetData;
	onLeaveCombat: () => void;
	setArea: (areaName: string) => void;

	combatProps: IPlanetPageCombat;
	combatVictoryProps: IPlanetPageCombatVictoryProps;
}

const PlanetPageContent: React.FunctionComponent<IPlanetPageContentProps> = React.memo(props => {
	const { areaName, cloud, getPlanetData, onLeaveCombat, setArea, titleId, combatProps, combatVictoryProps } = props;
	const planet = getPlanetData();

	if (is.null(planet)) {
		return null;
	}

	if (is.null(areaName)) {
		return (
			<React.Fragment>
				<BackLink to={routes.Guide(cloud, titleId)} label="Back to guide" />
				<h2>Welcome to {planet.name}</h2>
				<p>Choose a region to fight in:</p>
				<UlInline>
					{planet.areas.map(area => (
						<li key={area.name}>
							<PrimaryButton
								text={area.name}
								onClick={setArea.bind(this, area.name)}
								ariaLabel={`Fight in ${area.name}`}
							/>
						</li>
					))}
				</UlInline>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<BackLink onClick={onLeaveCombat} label={`Back to ${planet.name}`} />
			<h2>
				{planet.name}, near {areaName}
			</h2>
			<PlanetPageCombatVictory {...combatVictoryProps} />
			<PlanetPageCombat {...combatProps} />
		</React.Fragment>
	);
});

interface IPlanetPageCombat {
	areaName: string;
	enemies: ITitleDataEnemies;
	enemyGroupName: string;
	onCombatFinished: () => void;
	onCombatStarted: () => void;
	onLeaveCombat: () => void;
	onReturnToHeadquarters: () => void;
	planetName: string;
}

const PlanetPageCombat: React.FunctionComponent<IPlanetPageCombat> = React.memo(props => {
	const {
		areaName,
		enemies,
		enemyGroupName,
		onCombatFinished,
		onCombatStarted,
		onLeaveCombat,
		onReturnToHeadquarters,
		planetName,
	} = props;
	if (is.null(enemies) || is.null(enemyGroupName)) {
		return null;
	}

	const enemyGroup = enemies.enemyGroups.find(g => g.name === enemyGroupName);
	const enemyData = enemyGroup.enemies.map(e => enemies.enemies.find(d => d.name === e));

	return (
		<Combat
			planet={planetName}
			area={areaName}
			enemyGroup={enemyGroup}
			enemies={enemyData}
			onCombatFinished={onCombatFinished}
			onLeaveCombat={onLeaveCombat}
			onReturnToHeadquarters={onReturnToHeadquarters}
			onCombatStarted={onCombatStarted}
		/>
	);
});

interface IPlanetPageCombatVictoryProps {
	catalog: PlayFabClientModels.CatalogItem[];
	isCombatFinished: boolean;
	isLoadingRewards: boolean;
	itemsGranted: string[];
	newLevel: number;
	newXP: number;
	onLeaveCombat: () => void;
	planetName: string;
	playerName: string;
}

const PlanetPageCombatVictory: React.FunctionComponent<IPlanetPageCombatVictoryProps> = React.memo(props => {
	const {
		catalog,
		isCombatFinished,
		isLoadingRewards,
		itemsGranted,
		newLevel,
		newXP,
		onLeaveCombat,
		planetName,
		playerName,
	} = props;

	if (!isCombatFinished) {
		return null;
	}

	const title = <h3>Excellent work, {playerName}!</h3>;

	if (isLoadingRewards) {
		return (
			<DocumentCardCombat role="alert">
				<DivDocumentCardInterior>
					{title}
					<SpinnerLeft label="Reporting victory to headquarters..." labelPosition="right" />
				</DivDocumentCardInterior>
			</DocumentCardCombat>
		);
	}

	return (
		<DocumentCardCombat role="alert">
			<DivDocumentCardInterior>
				{title}
				<DlStats>
					{!is.null(newXP) && (
						<React.Fragment>
							<dt>Experience</dt>
							<dd>{newXP} XP gained</dd>
						</React.Fragment>
					)}
					{!is.null(newLevel) && (
						<React.Fragment>
							<dt>Level</dt>
							<dd>Congratulations, you reached level {newLevel}</dd>
						</React.Fragment>
					)}
				</DlStats>
				<DlStats>
					<dt>Rewards</dt>
					{itemsGranted.map((itemId, index) => (
						<dd key={index}>{catalog.find(i => i.ItemId === itemId).DisplayName}</dd>
					))}
				</DlStats>
				<p>
					<PrimaryButton onClick={onLeaveCombat} text={`Return to ${planetName}`} />
				</p>
			</DivDocumentCardInterior>
		</DocumentCardCombat>
	);
});
