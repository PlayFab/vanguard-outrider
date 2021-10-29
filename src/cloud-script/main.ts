/// <reference path="../../node_modules/playfab-web-sdk/src/Typings/PlayFab/PlayFabClientApi.d.ts" />
/// <reference path="../../node_modules/playfab-web-sdk/src/Typings/PlayFab/PlayFabAdminApi.d.ts" />
import {
	ITitleDataPlanets,
	ITitleDataEnemies,
	IPlanetData,
	IStringDictionary,
	IAnyDictionary,
	ITitleDataLevel,
} from "../app/shared/types";

// PlayFab-supplied global variables
declare var currentPlayerId: string;
declare var server: any;
declare var handlers: any;

("use strict");
const App = {
	IsNull(data: any): boolean {
		return (
			typeof data === "undefined" ||
			data === null ||
			(typeof data === "string" && data.length === 0) ||
			(data.constructor === Array && data.length === 0)
		);
	},
	GetTitleData(keys: string[], isJSON: boolean): any {
		const data = server.GetTitleData({
			Keys: keys,
		}).Data;

		if (!isJSON) {
			return data;
		}

		return Object.keys(data).reduce((dictionary, key) => {
			dictionary[key] = JSON.parse(data[key]);

			return dictionary;
		}, {} as IAnyDictionary);
	},
	EvaluateRandomResultTable(catalogVersion: string, tableId: string): string {
		return server.EvaluateRandomResultTable({
			CatalogVersion: catalogVersion,
			TableId: tableId,
		}).ResultItemId;
	},
	GetPlayerStatistics(playerId: string, statisticNames: string[]): PlayFabServerModels.StatisticValue[] {
		return server.GetPlayerStatistics({
			PlayFabId: playerId,
			StatisticNames: statisticNames,
		}).Statistics;
	},
	UpdatePlayerStatistics(
		playerId: string,
		statistics: PlayFabServerModels.StatisticUpdate[]
	): PlayFabServerModels.UpdatePlayerStatisticsResult {
		return server.UpdatePlayerStatistics({
			PlayFabId: playerId,
			Statistics: statistics,
		});
	},
	ConsumeItem(playerId: string, itemInstanceId: string, count: number): PlayFabServerModels.ConsumeItemResult {
		return server.ConsumeItem({
			PlayFabId: playerId,
			ItemInstanceId: itemInstanceId,
			ConsumeCount: count,
		});
	},
	GrantItemsToUser(playerId: string, itemIds: string[], catalogVersion: string = null): void {
		const grantResult: PlayFabServerModels.GrantItemsToUserResult = server.GrantItemsToUser({
			PlayFabId: playerId,
			ItemIds: itemIds,
			CatalogVersion: catalogVersion,
		});

		// Is this a bundle of something we need to unpack?
		grantResult.ItemGrantResults.forEach(item => {
			if (!App.IsNull(item.ItemClass) && item.ItemClass.indexOf(App.CatalogItems.UnpackClassName) !== -1) {
				App.ConsumeItem(playerId, item.ItemInstanceId, item.RemainingUses);
			}
		});
	},
	GetUserInventory(playerId: string): PlayFabServerModels.GetUserInventoryResult {
		return server.GetUserInventory({
			PlayFabId: playerId,
		});
	},
	GetUserData(playerId: string, keys: string[]): PlayFabServerModels.GetUserDataResult {
		return server.GetUserData({
			PlayFabId: playerId,
			Keys: keys,
		});
	},
	GetUserInternalData(playerId: string, keys: string[]): PlayFabServerModels.GetUserDataResult {
		return server.GetUserInternalData({
			PlayFabId: playerId,
			Keys: keys,
		});
	},
	UpdateUserData(
		playerId: string,
		data: IStringDictionary,
		keysToRemove: string[],
		isPublic = false
	): PlayFabServerModels.UpdateUserDataResult {
		return server.UpdateUserData({
			PlayFabId: playerId,
			Data: data,
			KeysToRemove: keysToRemove,
			Permission: isPublic ? App.Config.PermissionPublic : App.Config.PermissionPrivate,
		});
	},
	UpdateUserInternalData(
		playerId: string,
		data: IStringDictionary,
		keysToRemove: string[],
		isPublic = false
	): PlayFabServerModels.UpdateUserDataResult {
		return server.UpdateUserInternalData({
			PlayFabId: playerId,
			Data: data,
			KeysToRemove: keysToRemove,
			Permission: isPublic ? App.Config.PermissionPublic : App.Config.PermissionPrivate,
		});
	},
	WritePlayerEvent(playerId: string, eventName: string, body: IAnyDictionary): void {
		// Event name only allows characters and underscores
		eventName = eventName.replace(/[^a-z_]/gi, "_");

		if (eventName.length > 64) {
			eventName = eventName.substr(0, 64);
		}

		server.WritePlayerEvent({
			PlayFabId: playerId,
			EventName: eventName,
			Body: body,
		});
	},
	Statistics: {
		Kills: "kills",
		Level: "level",
		XP: "xp",
	},
	TitleData: {
		Planets: "Planets",
		Enemies: "Enemies",
		Levels: "Levels",
	},
	UserData: {
		HP: "hp",
		MaxHP: "maxHP",
		Equipment: "equipment",
	},
	CatalogItems: {
		UnpackClassName: "unpack",
	},
	VirtualCurrency: {
		Credits: "CR",
	},
	Config: {
		StartingHP: 100,
		StartingLevel: 1,
		StartingXP: 0,
		PermissionPublic: "Public",
		PermissionPrivate: "Private",
	},
};

// ----- Callable functions ----- //

export interface IKilledEnemyGroupRequest {
	planet: string;
	area: string;
	enemyGroup: string;
	playerHP: number;
}

export interface IKilledEnemyGroupResponse {
	errorMessage?: string;
	itemsGranted?: string[];
	kills?: number;
	xp?: number;
	level?: number;
	hp?: number;
}

/*
    This function:
        1. Ensures the user isn't cheating by validating the monsters and location
        2. Updates kills statistic
        3. Updates XP statistic
        4. If appropriate, updates level, which includes:
            4a. Increased max HP
            4b. Item granted
            4c. Set current HP to max HP
        5. Updates new HP user data
        6. If this enemy group has a droptable, grant the user that item
*/
handlers.killedEnemyGroup = function (args: IKilledEnemyGroupRequest, context: any): IKilledEnemyGroupResponse {
	// Retrieve all the data we'll need to make these updates
	const titleData = App.GetTitleData([App.TitleData.Planets, App.TitleData.Enemies, App.TitleData.Levels], true);
	const planetData = (titleData[App.TitleData.Planets] as ITitleDataPlanets).planets;
	const enemyData = titleData[App.TitleData.Enemies] as ITitleDataEnemies;
	const userData = App.GetUserInternalData(currentPlayerId, [App.UserData.MaxHP]).Data;
	const statistics = App.GetPlayerStatistics(currentPlayerId, [
		App.Statistics.Kills,
		App.Statistics.XP,
		App.Statistics.Level,
	]);

	// STEP 1: Ensure the data submitted is valid
	const errorMessage = isKilledEnemyGroupValid(args, planetData, enemyData);

	if (!App.IsNull(errorMessage)) {
		return {
			errorMessage,
		};
	}

	// Data is valid, continue
	const fullEnemyGroup = enemyData.enemyGroups.find(e => e.name === args.enemyGroup);

	// Update player statistics and user data
	const itemsGranted: string[] = [];
	const statisticUpdates: PlayFabServerModels.StatisticUpdate[] = [];
	const userDataUpdates: IStringDictionary = {};
	const response: IKilledEnemyGroupResponse = {};

	// STEP 2: Update number of kills
	const killStatistic = statistics.find(s => s.StatisticName === App.Statistics.Kills);
	const startingKills = App.IsNull(killStatistic) ? 0 : killStatistic.Value;
	const newKills = startingKills + fullEnemyGroup.enemies.length;

	response.kills = newKills;

	statisticUpdates.push({
		StatisticName: App.Statistics.Kills,
		Value: newKills,
	});

	// STEP 3: How much XP you earned from that enemy group
	const xpStatistic = statistics.find(s => s.StatisticName === App.Statistics.XP);
	const startingXP = App.IsNull(xpStatistic) ? App.Config.StartingXP : xpStatistic.Value;

	const yourXP = fullEnemyGroup.enemies
		.map(e => enemyData.enemies.find(e2 => e2.name === e).xp)
		.reduce((totalXP, enemyXP) => {
			return totalXP + enemyXP;
		}, startingXP);

	response.xp = yourXP;

	statisticUpdates.push({
		StatisticName: App.Statistics.XP,
		Value: yourXP,
	});

	// STEP 4: Did you gain a level?
	let newMaxHP = App.IsNull(userData[App.UserData.MaxHP])
		? App.Config.StartingHP
		: parseInt(userData[App.UserData.MaxHP].Value);

	const levelStatistic = statistics.find(s => s.StatisticName === App.Statistics.Level);
	let originalLevelNumber = App.IsNull(levelStatistic) ? App.Config.StartingLevel : levelStatistic.Value;
	let yourLevelNumber = originalLevelNumber;

	// Allow the user to go up multiple levels simultaneously (somehow)
	let newLevel = levelPlayer(titleData[App.TitleData.Levels] as ITitleDataLevel[], yourLevelNumber, yourXP);
	while (!App.IsNull(newLevel)) {
		// Grant the user a new level and all the perks and privileges that come from it
		yourLevelNumber = newLevel.level;

		if (!App.IsNull(newLevel.itemGranted)) {
			itemsGranted.push(newLevel.itemGranted);
		}

		// HP goes up
		newMaxHP += newLevel.hpGranted;

		newLevel = levelPlayer(titleData[App.TitleData.Levels] as ITitleDataLevel[], yourLevelNumber, yourXP);
	}

	if (yourLevelNumber !== originalLevelNumber) {
		statisticUpdates.push({
			StatisticName: App.Statistics.Level,
			Value: yourLevelNumber,
		});

		response.level = yourLevelNumber;

		userDataUpdates[App.UserData.MaxHP] = newMaxHP.toString();
		userDataUpdates[App.UserData.HP] = newMaxHP.toString();

		response.hp = newMaxHP;
	} else {
		userDataUpdates[App.UserData.HP] = args.playerHP.toString();
	}

	// STEP 5: Do both updates
	App.UpdatePlayerStatistics(currentPlayerId, statisticUpdates);
	App.UpdateUserInternalData(currentPlayerId, userDataUpdates, null, false);

	// STEP 6: Grant items
	if (!App.IsNull(fullEnemyGroup.droptable)) {
		const itemGranted = App.EvaluateRandomResultTable(null, fullEnemyGroup.droptable);

		App.GrantItemsToUser(currentPlayerId, [itemGranted]);

		itemsGranted.push(itemGranted);
	}

	response.itemsGranted = itemsGranted;

	App.WritePlayerEvent(currentPlayerId, `combat_finished`, args);

	return response;
};

export interface IPlayerLoginResponse {
	playerHP: number;
	equipment: IStringDictionary;
	xp: number;
	level: number;
	inventory: Partial<PlayFabClientModels.GetUserInventoryResult>;
}

handlers.playerLogin = function (args: any, context: any): IPlayerLoginResponse {
	const response: IPlayerLoginResponse = {
		playerHP: 0,
		equipment: {},
		xp: 0,
		level: 1,
		inventory: null,
	};

	// Get inventory and convert from the server model to the client model (they look identical, except to TypeScript)
	const inventory = App.GetUserInventory(currentPlayerId);

	response.inventory = {
		Inventory: inventory.Inventory,
		VirtualCurrency: inventory.VirtualCurrency,
		VirtualCurrencyRechargeTimes: inventory.VirtualCurrencyRechargeTimes,
	};

	// Give new players some stats using user internal data
	const userDataRecords = [App.UserData.HP, App.UserData.Equipment, App.UserData.MaxHP];
	let userData = App.GetUserData(currentPlayerId, userDataRecords);
	const userInternalData = App.GetUserInternalData(currentPlayerId, userDataRecords);

	// Hey, I borked this up when I first made this game. User data is writable by the client.
	// Whoops! Super insecure. Now I have these 15 lines to convert user data to internal data.

	// Check to see if you are a user whose private stats should be in internal data
	const isUserDataNull = App.IsNull(userData.Data) || App.IsNull(Object.keys(userData.Data));
	const isUserDataInternalNull = App.IsNull(userInternalData.Data) || App.IsNull(Object.keys(userInternalData.Data));

	if (isUserDataNull && isUserDataInternalNull) {
		// You're an utterly new player. Use internal data.
	} else if (!isUserDataNull && isUserDataInternalNull) {
		// You're an old player that hasn't been migrated yet.
		// Set your internal data with what's new and clear out your regular user data
		App.UpdateUserInternalData(
			currentPlayerId,
			convertUserDataResultToStringDictionary(userData.Data),
			null,
			false
		);
		App.UpdateUserData(currentPlayerId, null, userDataRecords);
	} else if (isUserDataNull && !isUserDataInternalNull) {
		// You've been converted. Swap your user data for the results of the internal data call.
		userData = userInternalData;
	}

	// Done checking for that
	if (App.IsNull(userData.Data[App.UserData.HP])) {
		App.UpdateUserInternalData(
			currentPlayerId,
			{
				[App.UserData.HP]: App.Config.StartingHP.toString(),
				[App.UserData.MaxHP]: App.Config.StartingHP.toString(),
			},
			null,
			false
		);
		response.playerHP = App.Config.StartingHP;
	} else {
		response.playerHP = parseInt(userData.Data[App.UserData.HP].Value);
	}

	// We also need to know your current XP and level
	const statistics = App.GetPlayerStatistics(currentPlayerId, [App.Statistics.Level, App.Statistics.XP]);

	const statisticXP = statistics.find(s => s.StatisticName === App.Statistics.XP);
	if (!App.IsNull(statisticXP)) {
		response.xp = statisticXP.Value;
	}
	const statisticLevel = statistics.find(s => s.StatisticName === App.Statistics.Level);
	if (!App.IsNull(statisticLevel)) {
		response.level = statisticLevel.Value;
	}

	// And return any equipment which existing users might have
	if (!App.IsNull(userData.Data[App.UserData.Equipment])) {
		response.equipment = JSON.parse(userData.Data[App.UserData.Equipment].Value);
	}

	return response;
};

export interface IReturnToHomeBaseResponse {
	maxHP: number;
}

handlers.returnToHomeBase = function (args: any, context: any): IReturnToHomeBaseResponse {
	const hpAndMaxHP = App.GetUserInternalData(currentPlayerId, [App.UserData.HP, App.UserData.MaxHP]);

	const maxHP = parseInt(hpAndMaxHP.Data[App.UserData.MaxHP].Value);
	App.WritePlayerEvent(currentPlayerId, "travel_to_headquarters", null);

	if (hpAndMaxHP.Data[App.UserData.HP].Value === hpAndMaxHP.Data[App.UserData.MaxHP].Value) {
		return {
			maxHP,
		};
	}

	App.UpdateUserInternalData(
		currentPlayerId,
		{
			[App.UserData.HP]: hpAndMaxHP.Data[App.UserData.MaxHP].Value,
		},
		null,
		false
	);

	return {
		maxHP,
	};
};

export interface IEquipItemRequest {
	single?: IEquipItemInstanceRequest;
	multiple?: IEquipItemInstanceRequest[];
}

export interface IEquipItemInstanceRequest {
	itemInstanceId: string;
	slot: string;
}

handlers.equipItem = function (args: IEquipItemRequest, context: any): PlayFabServerModels.UpdateUserDataResult {
	const currentEquipment = App.GetUserInternalData(currentPlayerId, [App.UserData.Equipment]).Data;

	let returnResult: PlayFabServerModels.UpdateUserDataResult = null;

	const equipmentDictionary: IStringDictionary = App.IsNull(args.multiple)
		? { [args.single.slot]: args.single.itemInstanceId }
		: args.multiple.reduce((dictionary, request) => {
				dictionary[request.slot] = request.itemInstanceId;
				return dictionary;
		  }, {} as IStringDictionary);

	if (App.IsNull(currentEquipment[App.UserData.Equipment])) {
		returnResult = App.UpdateUserInternalData(
			currentPlayerId,
			{
				[App.UserData.Equipment]: JSON.stringify(equipmentDictionary),
			},
			null,
			true
		);
	} else {
		returnResult = App.UpdateUserInternalData(
			currentPlayerId,
			{
				[App.UserData.Equipment]: JSON.stringify({
					...JSON.parse(currentEquipment[App.UserData.Equipment].Value),
					...equipmentDictionary,
				}),
			},
			null,
			true
		);
	}

	App.WritePlayerEvent(currentPlayerId, "equipped_item", args);

	return returnResult;
};

// ----- Helpers ----- //

function isKilledEnemyGroupValid(
	args: IKilledEnemyGroupRequest,
	planetData: IPlanetData[],
	enemyData: ITitleDataEnemies
): string {
	const planet = planetData.find(p => p.name === args.planet);

	if (planet === undefined) {
		return `Planet ${args.planet} not found.`;
	}

	const area = planet.areas.find(a => a.name === args.area);

	if (area === undefined) {
		return `Area ${args.area} not found on planet ${args.planet}.`;
	}

	const enemyGroup = area.enemyGroups.find(e => e === args.enemyGroup);

	if (enemyGroup === undefined) {
		return `Enemy group ${args.enemyGroup} not found in area ${args.area} on planet ${args.planet}.`;
	}

	const fullEnemyGroup = enemyData.enemyGroups.find(e => e.name === args.enemyGroup);

	if (fullEnemyGroup === undefined) {
		return `Enemy group ${args.enemyGroup} not found.`;
	}

	return undefined;
}

function levelPlayer(titleDataLevels: ITitleDataLevel[], yourLevel: number, yourXP: number): ITitleDataLevel {
	let nextLevelNumber = yourLevel + 1;
	const nextLevel = titleDataLevels.find(l => l.level === nextLevelNumber);

	if (yourXP >= nextLevel.xp) {
		return nextLevel;
	}

	return null;
}

interface IUserDataDictionary {
	[key: string]: PlayFabClientModels.UserDataRecord;
}

function convertUserDataResultToStringDictionary(userData: IUserDataDictionary): IStringDictionary {
	if (App.IsNull(userData)) {
		return {};
	}

	return Object.keys(userData).reduce((dictionary: IStringDictionary, key: string) => {
		dictionary[key] = userData[key].Value;

		return dictionary;
	}, {} as IStringDictionary);
}
