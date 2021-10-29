import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { TextField } from "@fluentui/react/lib/TextField";
import { PrimaryButton, MessageBar, MessageBarType } from "@fluentui/react";

import { is } from "../shared/is";
import { routes } from "../routes";
import { PlayFabHelper } from "../shared/playfab";
import { Page } from "../components/page";
import { DivConfirm, DivField, SpinnerLeft } from "../styles";
import { TITLE_DATA_PLANETS, CATALOG_VERSION, TITLE_DATA_STORES, TITLE_DATA_ENEMIES } from "../shared/types";
import { IEquipItemInstance } from "../store/types";
import { CloudScriptHelper } from "../shared/cloud-script";
import { IPlayerLoginResponse } from "../../cloud-script/main";
import { BackLink } from "../components/back-link";
import { IApplicationState, mainReducer } from "../store/reducers";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { usePage } from "../hooks/use-page";
import { useDispatch, useSelector } from "react-redux";

export const LoginPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const history = useHistory();
	const { pageError, onPageClearError, onPageError, onPageNothing } = usePage();
	const { hasTitleId, cloud, titleId, playerLevel, inventory, catalog, planets } = useSelector(
		(state: IApplicationState) => ({
			hasTitleId: state.hasTitleId,
			cloud: state.cloud,
			titleId: state.titleId,
			playerLevel: state.playerLevel,
			inventory: state.inventory,
			catalog: state.catalog,
			planets: state.planets,
		})
	);
	const dispatch = useDispatch();

	const [playerName, setplayerName] = useState("");
	const [isLoggingIn, setisLoggingIn] = useState(false);

	const loadEquipment = useCallback(
		(response: IPlayerLoginResponse) => {
			if (is.null(response.equipment)) {
				// You have no equipment
				return;
			}

			const equipmentSlots = Object.keys(response.equipment);

			if (is.null(equipmentSlots)) {
				// You have an equipment log in user data, but nothing actually in there
				return;
			}

			const equipment = equipmentSlots
				.map(slot => {
					const item = response.inventory.Inventory.find(i => i.ItemInstanceId === response.equipment[slot]);

					if (is.null(item)) {
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

			dispatch(mainReducer.actions.setEquipmentMultiple(equipment));
		},
		[dispatch]
	);

	const onLoginComplete = useCallback(
		(player: PlayFabClientModels.LoginResult) => {
			dispatch(mainReducer.actions.setPlayerId(player.PlayFabId));
			dispatch(mainReducer.actions.setPlayerName(playerName));

			if (player.NewlyCreated) {
				PlayFabHelper.UpdateUserTitleDisplayName(playerName, onPageNothing, onPageError);
			}

			CloudScriptHelper.login(response => {
				dispatch(mainReducer.actions.setPlayerHP(response.playerHP));
				dispatch(mainReducer.actions.setPlayerLevel(response.level));
				dispatch(mainReducer.actions.setPlayerXP(response.xp));
				dispatch(
					mainReducer.actions.setInventory(response.inventory as PlayFabClientModels.GetUserInventoryResult)
				);
				loadEquipment(response);
			}, onPageError);

			PlayFabHelper.GetTitleData(
				[TITLE_DATA_PLANETS, TITLE_DATA_STORES, TITLE_DATA_ENEMIES],
				data => {
					dispatch(mainReducer.actions.setPlanetsFromTitleData({ data, key: TITLE_DATA_PLANETS }));
					dispatch(mainReducer.actions.setStoreNamesFromTitleData({ data, key: TITLE_DATA_STORES }));
					dispatch(mainReducer.actions.setEnemiesFromTitleData({ data, key: TITLE_DATA_ENEMIES }));
				},
				onPageError
			);

			PlayFabHelper.GetCatalogItems(
				CATALOG_VERSION,
				catalog => {
					dispatch(mainReducer.actions.setCatalog(catalog));
				},
				onPageError
			);
		},
		[dispatch, loadEquipment, onPageError, onPageNothing, playerName]
	);

	const login = useCallback(
		(e: React.SyntheticEvent<any>) => {
			if (!is.null(e)) {
				e.preventDefault();
			}

			if (is.null(playerName.trim())) {
				onPageError("Player name is required");
				return;
			}

			onPageClearError();

			setisLoggingIn(true);

			PlayFabHelper.LoginWithCustomID(titleId, playerName, onLoginComplete, onPageError);
		},
		[onLoginComplete, onPageClearError, onPageError, playerName, titleId]
	);

	const onChangePlayerName = useCallback((_: any, value: string) => {
		setplayerName(value);
	}, []);

	useEffect(() => {
		const haveDownloadedEverything =
			!is.null(playerLevel) && !is.null(inventory) && !is.null(catalog) && !is.null(planets);

		if (!haveDownloadedEverything) {
			return;
		}

		setisLoggingIn(false);
		history.push(routes.Guide(cloud, titleId));
	}, [catalog, cloud, history, inventory, planets, playerLevel, titleId]);

	if (!hasTitleId) {
		return null;
	}

	return (
		<Page title="Login">
			{!is.null(pageError) && (
				<MessageBar messageBarType={MessageBarType.error} role="alert">
					{pageError}
				</MessageBar>
			)}
			<form onSubmit={login}>
				<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
				<h2>Player name</h2>
				<p>Enter your name to play. Names are case sensitive.</p>
				<p>
					This will create a new player using{" "}
					<a href="https://api.playfab.com/documentation/client/method/LoginWithCustomID">Custom ID</a> or log
					you in with an existing account.
				</p>
				<DivField>
					<TextField label="Player name" value={playerName} onChange={onChangePlayerName} required />
				</DivField>
				<DivConfirm>
					{isLoggingIn ? (
						<SpinnerLeft label="Logging in..." labelPosition="right" />
					) : (
						<PrimaryButton text="Login" onClick={login} />
					)}
				</DivConfirm>
			</form>
		</Page>
	);
});
