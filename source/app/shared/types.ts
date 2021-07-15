// ----- Title data ----- //

export interface ITitleDataPlanets {
    planets: IPlanetData[];
}

export interface IPlanetData {
    name: string;
    areas: IPlanetArea[];
}

export interface IPlanetArea {
    name: string;
    enemyGroups: string[];
}

export interface ITitleDataEnemies {
    enemies: ITitleDataEnemy[];
    enemyGroups: ITitleDataEnemyGroup[];
}

export interface ITitleDataEnemy {
    name: string;
    hp: number;
    damage: number;
    xp: number;
}

export interface ITitleDataEnemyGroup {
    name: string;
    enemies: string[];
    droptable: string;
}

export interface ITitleDataLevel {
    level: number;
    xp: number;
    itemGranted: string;
    hpGranted: number;
}

// ----- Catalog item custom data ----- //

export interface IWeaponItemCustomData {
    damage: number;
}

export interface IArmorItemCustomData {
    block: number;
    reduce: number;
}

// ----- Title news ----- //

export interface ITitleNewsData {
    html: string;
}

// ----- App interfaces ----- //

export interface IStringDictionary {
    [key: string]: string;
}

export interface INumberDictionary {
    [key: string]: number;
}

export interface IAnyDictionary {
    [key: string]: any;
}

export interface ILeaderboardDictionary {
    [key: string]: PlayFabClientModels.PlayerLeaderboardEntry[];
}

interface IProgressStage {
    key: string;
    title: string;
    filename: string;
}

export const PROGRESS_STAGES: IProgressStage[] = [{
    key: "currency",
    title: "Currencies",
    filename: "virtual-currency.json"
},
{
    key: "catalog",
    title: "Catalog",
    filename: "catalogs.json"
},
{
    key: "droptable",
    title: "Drop tables",
    filename: "drop-tables.json"
},
{
    key: "store",
    title: "Stores",
    filename: "stores.json"
},
{
    key: "titledata",
    title: "Title data",
    filename: "title-data.json"
},
{
    key: "cloudscript",
    title: "Cloud Script",
    filename: "cloud-script.json"
}];

export const VC_CREDITS = "CR";

export const CATALOG_VERSION = "Main";

export const TITLE_DATA_STORES = "Stores";
export const TITLE_DATA_PLANETS = "Planets";
export const TITLE_DATA_ENEMIES = "Enemies";

export const ITEM_CLASS_WEAPON = "weapon";
export const ITEM_CLASS_ARMOR = "armor";

export const STATISTIC_KILLS = "kills";
export const STATISTIC_LEVEL = "level";
export const STATISTIC_XP = "xp";

export const MAIN_CLOUD = "main";