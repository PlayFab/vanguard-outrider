import { ITEM_CLASS_WEAPON, ITEM_CLASS_ARMOR } from "../shared/types";

export interface IEquipmentSlots extends IEquipmentSlotsDictionary {
	weapon: PlayFabClientModels.ItemInstance;
	armor: PlayFabClientModels.ItemInstance;
}

export interface IEquipmentSlotsDictionary {
	[key: string]: PlayFabClientModels.ItemInstance;
}

export enum EquipmentSlotTypes {
	weapon = "weapon",
	armor = "armor",
}

export function getSlotTypeFromItemClass(itemClass: string): EquipmentSlotTypes {
	switch (itemClass) {
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
