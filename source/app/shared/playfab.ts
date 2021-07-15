import "playfab-web-sdk/src/PlayFab/PlayFabClientApi.js";
import "playfab-web-sdk/src/PlayFab/PlayFabAdminApi.js";

import { IStringDictionary } from "./types";
import { is } from "./is";

function LoginWithCustomID(titleId: string, customId: string, success: (data: PlayFabClientModels.LoginResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.LoginWithCustomID({
        TitleId: titleId,
        CustomId: customId,
        CreateAccount: true,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function UpdateUserTitleDisplayName(displayName: string, success: (data: PlayFabClientModels.UpdateUserTitleDisplayNameResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.UpdateUserTitleDisplayName({
        DisplayName: displayName,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    })
}

function GetUserInventory(success: (data: PlayFabClientModels.GetUserInventoryResult) => void, error: (message: string) => void) {
    PlayFab.ClientApi.GetUserInventory({},
        (result, problem) => {
            if(!is.null(problem)) {
                return error(problem.errorMessage);
            }

            if(result.code === 200) {
                success(result.data);
            }
            else {
                error(result.errorMessage);
            }
        }
    );
}

function GetTitleData(keys: string[], success: (data: IStringDictionary) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetTitleData({
        Keys: keys,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data.Data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function GetPlayerStatistics(keys: string[], success: (data: PlayFabClientModels.StatisticValue[]) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetPlayerStatistics({
        StatisticNames: keys,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data.Statistics);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function UpdatePlayerStatistics(statistic: string, amount: number, success: (data: PlayFabClientModels.UpdatePlayerStatisticsResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.UpdatePlayerStatistics({
        Statistics: [{
            StatisticName: statistic,
            Value: amount,
        }],
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function ExecuteCloudScript(functionName: string, functionParameter: any, success: (data: PlayFabClientModels.ExecuteCloudScriptResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.ExecuteCloudScript({
        FunctionName: functionName,
        FunctionParameter: functionParameter,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200 && is.null(result.data.Error)) {
            success(result.data);
        }
        else {
            if(is.null(result.data.Error)) {
                error(result.errorMessage);
            }
            else {
                error(result.data.Error.Error);
            }
        }
    })
}

function GetStoreItems(catalogVersion: string, storeId: string, success: (data: PlayFabClientModels.GetStoreItemsResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetStoreItems({
        CatalogVersion: catalogVersion,
        StoreId: storeId,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function PurchaseItem(catalogVersion: string, storeId: string, itemId: string, currency: string, price: number, success: (data: PlayFabClientModels.PurchaseItemResult) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.PurchaseItem({
        CatalogVersion: catalogVersion,
        ItemId: itemId,
        Price: price,
        StoreId: storeId,
        VirtualCurrency: currency,
    }, (result, errorResult) => {
        if(is.null(result)) {
            error(errorResult.errorMessage);
            return;
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    })
}

function GetCatalogItems(catalogVersion: string, success: (data: PlayFabClientModels.CatalogItem[]) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetCatalogItems({
        CatalogVersion: catalogVersion,
    }, (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data.Catalog);
        }
        else {
            error(result.errorMessage);
        }
    })
}

function GetTitleNews(count: number, success: (data: PlayFabClientModels.TitleNewsItem[]) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetTitleNews({
        Count: count,
    },
    (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data.News);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function GetLeaderboard(statistic: string, start: number, maxResults: number, success: (data: PlayFabClientModels.PlayerLeaderboardEntry[]) => void, error: (message: string) => void): void {
    PlayFab.ClientApi.GetLeaderboard({
        MaxResultsCount: maxResults,
        StartPosition: start,
        StatisticName: statistic,
    },
    (result, problem) => {
        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data.Leaderboard);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIAddVirtualCurrencyTypes(secretKey: string, currencies: PlayFabAdminModels.VirtualCurrencyData[], success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.AddVirtualCurrencyTypes({
        VirtualCurrencies: currencies,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPISetCatalogItems(secretKey: string, items: PlayFabAdminModels.CatalogItem[], catalogVersion: string, setAsDefault: boolean, success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.SetCatalogItems({
        Catalog: items,
        CatalogVersion: catalogVersion,
        SetAsDefaultCatalog: setAsDefault,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPISetStoreItems(secretKey: string, storeID: string, store: PlayFabAdminModels.StoreItem[], storeMarketing: PlayFabAdminModels.StoreMarketingModel, catalogVersion: string, success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.SetStoreItems({
        Store: store,
        MarketingData: storeMarketing,
        StoreId: storeID,
        CatalogVersion: catalogVersion,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPISetTitleData(secretKey: string, key: string, value: string, success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.SetTitleData({
        Key: key,
        Value: value,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIUpdateCloudScript(secretKey: string, file: string, publish: boolean, success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.UpdateCloudScript({
        Files: [{
            FileContents: file,
            Filename: "main.js"
        }],
        Publish: publish,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIUpdateRandomResultTables(secretKey: string, tables: PlayFabAdminModels.RandomResultTable[], catalogVersion: string, success: () => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.UpdateRandomResultTables({
        CatalogVersion: catalogVersion,
        Tables: tables,
    }, (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success();
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIListVirtualCurrencyTypes(secretKey: string, success: (data: PlayFabAdminModels.ListVirtualCurrencyTypesResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.ListVirtualCurrencyTypes({
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIGetCatalogItems(secretKey: string, catalogVersion: string, success: (data: PlayFabAdminModels.GetCatalogItemsResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.GetCatalogItems({
        CatalogVersion: catalogVersion,
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIGetRandomResultTables(secretKey: string, catalogVersion: string, success: (data: PlayFabAdminModels.GetRandomResultTablesResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.GetRandomResultTables({
        CatalogVersion: catalogVersion,
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIGetStoreItems(secretKey: string, catalogVersion: string, storeID: string, success: (data: PlayFabAdminModels.GetStoreItemsResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.GetStoreItems({
        CatalogVersion: catalogVersion,
        StoreId: storeID,
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIGetTitleData(secretKey: string, keys: string[], success: (data: PlayFabAdminModels.GetTitleDataResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.GetTitleData({
        Keys: keys
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

function AdminAPIGetCloudScriptRevision(secretKey: string, version: number, revision: number, success: (data: PlayFabAdminModels.GetCloudScriptRevisionResult) => void, error: (message: string) => void): void {
    PlayFab.settings.developerSecretKey = secretKey;

    PlayFab.AdminApi.GetCloudScriptRevision({
        Version: version,
        Revision: revision,
    },
    (result, problem) => {
        PlayFab.settings.developerSecretKey = undefined;

        if(!is.null(problem)) {
            return error(problem.errorMessage);
        }

        if(result.code === 200) {
            success(result.data);
        }
        else {
            error(result.errorMessage);
        }
    });
}

export const PlayFabHelper = {
    LoginWithCustomID,
    UpdateUserTitleDisplayName,
    GetTitleData,
    UpdatePlayerStatistics,
    ExecuteCloudScript,
    GetPlayerStatistics,
    GetUserInventory,
    GetStoreItems,
    PurchaseItem,
    GetCatalogItems,
    GetTitleNews,
    GetLeaderboard,

    AdminAPIAddVirtualCurrencyTypes,
    AdminAPISetCatalogItems,
    AdminAPISetStoreItems,
    AdminAPISetTitleData,
    AdminAPIUpdateCloudScript,
    AdminAPIUpdateRandomResultTables,
    AdminAPIListVirtualCurrencyTypes,
    AdminAPIGetCatalogItems,
    AdminAPIGetRandomResultTables,
    AdminAPIGetStoreItems,
    AdminAPIGetTitleData,
    AdminAPIGetCloudScriptRevision,
};
