import { IPlanetData, ITitleDataEnemies, ITEM_CLASS_WEAPON, ITEM_CLASS_ARMOR } from "../shared/types";

export enum ActionTypes {
    SET_CLOUD = "SET_CLOUD",
    SET_TITLE_ID = "SET_TITLE_ID",
    SET_PLAYER_ID = "SET_PLAYER_ID",
    SET_PLAYER_NAME = "SET_PLAYER_NAME",
    SET_CATALOG = "SET_CATALOG",
    SET_INVENTORY = "SET_INVENTORY",
    SET_PLAYER_HP = "SET_PLAYER_HP",
    SET_PLAYER_XP = "SET_PLAYER_XP",
    ADD_PLAYER_XP = "ADD_PLAYER_XP",
    SET_PLAYER_LEVEL = "SET_PLAYER_LEVEL",
    SET_STORES = "SET_STORES",
    SET_STORE_NAMES = "SET_STORE_NAMES",
    SET_PLANETS = "SET_PLANETS",
    SET_ENEMIES = "SET_ENEMIES",
    SUBTRACT_PLAYER_HP = "SUBTRACT_PLAYER_HP",
    SET_EQUIPMENT_SINGLE = "SET_EQUIPMENT_SINGLE",
    SET_EQUIPMENT_MULTIPLE = "SET_EQUIPMENT_MULTIPLE",
    PLAYER_LOG_OUT = "PLAYER_LOG_OUT",
    SET_COOKIES_CHOSEN = "SET_COOKIES_CHOSEN",
}

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
    isCookieConsentRequired: boolean;
}

interface IEquipmentSlots extends IEquipmentSlotsDictionary {
    weapon: PlayFabClientModels.ItemInstance;
    armor: PlayFabClientModels.ItemInstance;
}

export interface IEquipmentSlotsDictionary {
    [key: string]: PlayFabClientModels.ItemInstance
}

export enum EquipmentSlotTypes {
    weapon = "weapon",
    armor = "armor"
}

export function getSlotTypeFromItemClass(itemClass: string): EquipmentSlotTypes {
    switch(itemClass) {
        case ITEM_CLASS_WEAPON:
            return EquipmentSlotTypes.weapon;
        case ITEM_CLASS_ARMOR:
            return EquipmentSlotTypes.armor;
        default:
            return null;
    }
}

export interface IEquipItemInstance {
    item: PlayFabClientModels.ItemInstance;
    slot: EquipmentSlotTypes;
}

export interface IAction<T> {
    type: string;
    payload?: T;
}