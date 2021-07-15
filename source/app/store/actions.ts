import { action } from "typesafe-actions";
import { ActionTypes, EquipmentSlotTypes, IEquipItemInstance } from "./types";
import { ITitleDataEnemies, IPlanetData, ITitleDataPlanets, IStringDictionary } from "../shared/types";

export const actionSetCatalog = (catalog: PlayFabClientModels.CatalogItem[]) => action(ActionTypes.SET_CATALOG, catalog);
export const actionSetEnemies = (enemies: ITitleDataEnemies) => action(ActionTypes.SET_ENEMIES, enemies);
export const actionSetEnemiesFromTitleData = (data: IStringDictionary, key: string) => {
    const enemyData = JSON.parse(data[key]) as ITitleDataEnemies;
    return action(ActionTypes.SET_ENEMIES, enemyData);
};
export const actionSetInventory = (inventory: Partial<PlayFabClientModels.GetUserInventoryResult>) => action(ActionTypes.SET_INVENTORY, inventory);
export const actionSetPlanets = (planets: IPlanetData[]) => action(ActionTypes.SET_PLANETS, planets);
export const actionSetPlanetsFromTitleData = (data: IStringDictionary, key: string) => {
    const planetData = JSON.parse(data[key]) as ITitleDataPlanets;
    return action(ActionTypes.SET_PLANETS, planetData.planets);
};
export const actionSetPlayerId = (id: string) => action(ActionTypes.SET_PLAYER_ID, id);
export const actionSetPlayerHP = (hp: number) => action(ActionTypes.SET_PLAYER_HP, hp);
export const actionSetPlayerName = (name: string) => action(ActionTypes.SET_PLAYER_NAME, name);
export const actionSetStores = (stores: PlayFabClientModels.GetStoreItemsResult[]) => action(ActionTypes.SET_STORES, stores);
export const actionSetStoreNamesFromTitleData = (data: IStringDictionary, key: string) => {
    const storeNames = JSON.parse(data[key]) as string[];
    return action(ActionTypes.SET_STORE_NAMES, storeNames);
};
export const actionSetStoreNames = (names: string[]) => action(ActionTypes.SET_STORE_NAMES, names);
export const actionSetTitleId = (titleId: string) => action(ActionTypes.SET_TITLE_ID, titleId);
export const actionSetCloud = (cloud: string) => action(ActionTypes.SET_CLOUD, cloud);
export const actionSubtractPlayerHP = (damage: number) => action(ActionTypes.SUBTRACT_PLAYER_HP, damage);
export const actionSetEquipmentSingle = (item: PlayFabClientModels.ItemInstance, slot: EquipmentSlotTypes) => action(ActionTypes.SET_EQUIPMENT_SINGLE, {
    item,
    slot,
} as IEquipItemInstance);
export const actionSetEquipmentMultiple = (equips: IEquipItemInstance[]) => action(ActionTypes.SET_EQUIPMENT_MULTIPLE, equips);
export const actionSetPlayerLevel = (level: number) => action(ActionTypes.SET_PLAYER_LEVEL, level);
export const actionSetPlayerXP = (xp: number) => action(ActionTypes.SET_PLAYER_XP, xp);
export const actionAddPlayerXP = (xp: number) => action(ActionTypes.ADD_PLAYER_XP, xp);
export const actionPlayerLogOut = () => action(ActionTypes.PLAYER_LOG_OUT, null);
export const actionSetHasChosenCookies = (isRequired: boolean) => action(ActionTypes.SET_COOKIES_CHOSEN, isRequired);