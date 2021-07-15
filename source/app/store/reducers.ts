import { Reducer } from "redux";
import { IApplicationState, IAction, ActionTypes, IEquipItemInstance, IEquipmentSlotsDictionary } from "./types";
import { ITitleDataEnemies, IPlanetData } from "../shared/types";
import { is } from "../shared/is";
import { cookie } from "../shared/cookies";

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
    isCookieConsentRequired: false,
};

export const mainReducer: Reducer<IApplicationState, IAction<any>> = (state = initialState, action): IApplicationState => {
    switch(action.type) {
        case ActionTypes.SET_CATALOG:
            return {
                ...state,
                catalog: action.payload as PlayFabClientModels.CatalogItem[],
            };
        case ActionTypes.SET_ENEMIES:
            return {
                ...state,
                enemies: action.payload as ITitleDataEnemies,
            };
        case ActionTypes.SET_INVENTORY:
            return {
                ...state,
                inventory: action.payload as PlayFabClientModels.GetUserInventoryResult,
            };
        case ActionTypes.SET_PLANETS:
            return {
                ...state,
                planets: action.payload as IPlanetData[],
            };
        case ActionTypes.SET_PLAYER_ID:
            return {
                ...state,
                playerId: action.payload as string,
                hasPlayerId: !is.null(action.payload),
            };
        case ActionTypes.SET_PLAYER_NAME:
            return {
                ...state,
                playerName: action.payload as string,
            };
        case ActionTypes.SET_STORES:
            return {
                ...state,
                stores: action.payload as PlayFabClientModels.GetStoreItemsResult[],
            };
        case ActionTypes.SET_STORE_NAMES:
            return {
                ...state,
                storeNames: action.payload as string[],
            };
        case ActionTypes.SET_TITLE_ID:
            return {
                ...state,
                titleId: action.payload as string,
                hasTitleId: !is.null(action.payload),
            };
        case ActionTypes.SET_CLOUD:
            return {
                ...state,
                cloud: action.payload as string,
            };
        case ActionTypes.SET_PLAYER_HP:
            return {
                ...state,
                playerHP: action.payload as number,
            };
        case ActionTypes.SUBTRACT_PLAYER_HP:
            return {
                ...state,
                playerHP: Math.max(0, state.playerHP - action.payload as number),
            };
        case ActionTypes.SET_EQUIPMENT_SINGLE:
            const singleItem = (action.payload as IEquipItemInstance);
            return {
                ...state,
                equipment: {
                    ...state.equipment,
                    [singleItem.slot]: singleItem.item,
                }
            };
        case ActionTypes.SET_EQUIPMENT_MULTIPLE:
            const slotDictionary = (action.payload as IEquipItemInstance[]).reduce((dictionary, equip) => {
                dictionary[equip.slot] = equip.item;
                return dictionary;
            }, {} as IEquipmentSlotsDictionary);
            
            return {
                ...state,
                equipment: {
                    ...state.equipment,
                    ...slotDictionary,
                }
            };
        case ActionTypes.SET_PLAYER_LEVEL:
            return {
                ...state,
                playerLevel: action.payload as number,
            };
        case ActionTypes.SET_PLAYER_XP:
            return {
                ...state,
                playerXP: action.payload as number,
            };
        case ActionTypes.ADD_PLAYER_XP:
            return {
                ...state,
                playerXP: state.playerXP + action.payload as number,
            };
        case ActionTypes.PLAYER_LOG_OUT:
            return {
                ...state,
                playerXP: initialState.playerXP,
                inventory: initialState.inventory,
                equipment: initialState.equipment,
                hasPlayerId: initialState.hasPlayerId,
                playerId: initialState.playerId,
                playerHP: initialState.playerHP,
                playerLevel: initialState.playerLevel,
                playerName: initialState.playerName,
            };
        case ActionTypes.SET_COOKIES_CHOSEN:
            return {
                ...state,
                isCookieConsentRequired: action.payload as boolean,
            };
        default:
            return state;
    }
}
