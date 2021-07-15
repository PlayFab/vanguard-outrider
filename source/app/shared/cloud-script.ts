import { IEquipItemInstanceRequest, IEquipItemRequest, IPlayerLoginResponse, IReturnToHomeBaseResponse, IKilledEnemyGroupResponse, IKilledEnemyGroupRequest } from "../../cloud-script/main";
import { PlayFabHelper } from "./playfab";

enum CloudScriptFunctionNames {
    killedEnemyGroup = "killedEnemyGroup",
    playerLogin = "playerLogin",
    returnToHomeBase = "returnToHomeBase",
    equipItem = "equipItem"
}

function equipItem(items: IEquipItemInstanceRequest[], success: (data: PlayFabClientModels.ExecuteCloudScriptResult) => void, error: (message: string) => void): void {
    PlayFabHelper.ExecuteCloudScript(CloudScriptFunctionNames.equipItem,
        {
            single: items.length === 1
                ? items[0]
                : null,
            multiple: items.length > 1
                ? items
                : null,
        } as IEquipItemRequest, 
        success,
        error);
}

function login(success: (data: IPlayerLoginResponse) => void, error: (message: string) => void): void {
    PlayFabHelper.ExecuteCloudScript(CloudScriptFunctionNames.playerLogin, null, (data) => {
        success(data.FunctionResult as IPlayerLoginResponse);
    }, error);
}

function returnToHomeBase(success: (data: IReturnToHomeBaseResponse) => void, error: (message: string) => void): void {
    PlayFabHelper.ExecuteCloudScript(CloudScriptFunctionNames.returnToHomeBase, null, (data) => {
        success(data.FunctionResult as IReturnToHomeBaseResponse);
    }, error);
}

function killedEnemyGroup(combatReport: IKilledEnemyGroupRequest, success: (data: IKilledEnemyGroupResponse) => void, error: (message: string) => void): void {
    PlayFabHelper.ExecuteCloudScript(CloudScriptFunctionNames.killedEnemyGroup, combatReport, (data) => {
        success(data.FunctionResult as IKilledEnemyGroupResponse);
    }, error);
}

export const CloudScriptHelper = {
    equipItem,
    login,
    returnToHomeBase,
    killedEnemyGroup
};
