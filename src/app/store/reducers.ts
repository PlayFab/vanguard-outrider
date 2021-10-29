import { createSlice } from "@reduxjs/toolkit";
import { is } from "../shared/is";
import { IPlanetData, IStringDictionary, ITitleDataEnemies, ITitleDataPlanets } from "../shared/types";
import { IEquipItemInstance, IEquipmentSlots, IEquipmentSlotsDictionary } from "./types";

export interface IApplicationState {
	cloud: string;
	titleId: string;
	hasTitleId: boolean;
	playerId: string;
	hasPlayerId: boolean;
	playerName: string;
	playerHP: number;
	playerXP: number;
	playerLevel: number;
	catalog: PlayFabClientModels.CatalogItem[];
	inventory: PlayFabClientModels.GetUserInventoryResult;
	stores: PlayFabClientModels.GetStoreItemsResult[];
	planets: IPlanetData[];
	enemies: ITitleDataEnemies;
	storeNames: string[];
	equipment: IEquipmentSlots;
}

const initialState: IApplicationState = {
	catalog: null,
	enemies: null,
	inventory: null,
	planets: null,
	playerId: undefined,
	playerName: null,
	playerHP: 0,
	playerLevel: 1,
	playerXP: 0,
	stores: null,
	titleId: undefined,
	cloud: undefined,
	hasPlayerId: false,
	hasTitleId: false,
	storeNames: null,
	equipment: null,
};

export interface IAppAction<T> {
	type: string;
	payload: T;
}

interface IDataWithKey {
	data: IStringDictionary;
	key: string;
}

export const mainReducer = createSlice({
	name: "main",
	initialState,
	reducers: {
		setCatalog: (state, action: IAppAction<PlayFabClientModels.CatalogItem[]>) => ({
			...state,
			catalog: action.payload,
		}),
		setEnemies: (state, action: IAppAction<ITitleDataEnemies>) => ({
			...state,
			enemies: action.payload,
		}),
		setEnemiesFromTitleData: (state, action: IAppAction<IDataWithKey>) => ({
			...state,
			enemies: JSON.parse(action.payload.data[action.payload.key]) as ITitleDataEnemies,
		}),
		setInventory: (state, action: IAppAction<PlayFabClientModels.GetUserInventoryResult>) => ({
			...state,
			inventory: action.payload,
		}),
		setPlanets: (state, action: IAppAction<IPlanetData[]>) => ({
			...state,
			planets: action.payload,
		}),
		setPlanetsFromTitleData: (state, action: IAppAction<IDataWithKey>) => ({
			...state,
			planets: (JSON.parse(action.payload.data[action.payload.key]) as ITitleDataPlanets).planets,
		}),
		setPlayerId: (state, action: IAppAction<string>) => ({
			...state,
			playerId: action.payload,
			hasPlayerId: !is.null(action.payload),
		}),
		setPlayerName: (state, action: IAppAction<string>) => ({
			...state,
			playerName: action.payload,
		}),
		setStores: (state, action: IAppAction<PlayFabClientModels.GetStoreItemsResult[]>) => ({
			...state,
			stores: action.payload,
		}),
		setStoreNames: (state, action: IAppAction<string[]>) => ({
			...state,
			storeNames: action.payload,
		}),
		setStoreNamesFromTitleData: (state, action: IAppAction<IDataWithKey>) => ({
			...state,
			storeNames: JSON.parse(action.payload.data[action.payload.key]) as string[],
		}),
		setTitleId: (state, action: IAppAction<string>) => ({
			...state,
			titleId: action.payload,
			hasTitleId: !is.null(action.payload),
		}),
		setCloud: (state, action: IAppAction<string>) => ({
			...state,
			cloud: action.payload,
		}),
		setPlayerHP: (state, action: IAppAction<number>) => ({
			...state,
			playerHP: action.payload,
		}),
		subtractPlayerHP: (state, action: IAppAction<number>) => ({
			...state,
			playerHP: Math.max(0, state.playerHP - action.payload),
		}),
		setEquipmentSingle: (state, action: IAppAction<IEquipItemInstance>) => ({
			...state,
			equipment: {
				...state.equipment,
				[action.payload.slot]: action.payload.item,
			},
		}),
		setEquipmentMultiple: (state, action: IAppAction<IEquipItemInstance[]>) => ({
			...state,
			equipment: {
				...state.equipment,
				...action.payload.reduce((dictionary, equip) => {
					dictionary[equip.slot] = equip.item;
					return dictionary;
				}, {} as IEquipmentSlotsDictionary),
			},
		}),
		setPlayerLevel: (state, action: IAppAction<number>) => ({
			...state,
			playerLevel: action.payload,
		}),
		setPlayerXP: (state, action: IAppAction<number>) => ({
			...state,
			playerXP: action.payload,
		}),
		addPlayerXP: (state, action: IAppAction<number>) => ({
			...state,
			playerXP: state.playerXP + action.payload,
		}),
		playerLogOut: state => ({
			...state,
			playerXP: initialState.playerXP,
			inventory: initialState.inventory,
			equipment: initialState.equipment,
			hasPlayerId: initialState.hasPlayerId,
			playerId: initialState.playerId,
			playerHP: initialState.playerHP,
			playerLevel: initialState.playerLevel,
			playerName: initialState.playerName,
		}),
	},
});
