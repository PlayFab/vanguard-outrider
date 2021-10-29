import { utilities } from "./shared/utilities";

export const routeNames = {
	Index: "/:cloud?",
	MainMenu: "/:cloud/:titleid/menu",
	Login: "/:cloud/:titleid/login",
	Guide: "/:cloud/:titleid/guide",
	Planet: "/:cloud/:titleid/planet/:name",
	Headquarters: "/:cloud/:titleid/headquarters",
	Store: "/:cloud/:titleid/headquarters/:store",
	Upload: "/:cloud/:titleid/upload",
	Download: "/:cloud/:titleid/download",
	LevelCurve: "/:cloud/:titleid/level-curve",
	Credits: "/:cloud/:titleid/credits",
	Generator: "/:cloud/:titleid/generator",
	Watch: "/:cloud/:titleid/watch",
	Tips: "/:cloud/:titleid/tips",
	Instructions: "/:cloud/instructions",
};

export const routes = {
	Index: (cloud?: string) => utilities.formatRoute(routeNames.Index, cloud),
	MainMenu: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.MainMenu, cloud, titleId),
	Login: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Login, cloud, titleId),
	Guide: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Guide, cloud, titleId),
	Planet: (cloud: string, titleId: string, planetName: string) =>
		utilities.formatRoute(routeNames.Planet, cloud, titleId, planetName),
	Headquarters: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Headquarters, cloud, titleId),
	Store: (cloud: string, titleId: string, store: string) =>
		utilities.formatRoute(routeNames.Store, cloud, titleId, store),
	Upload: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Upload, cloud, titleId),
	Download: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Download, cloud, titleId),
	LevelCurve: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.LevelCurve, cloud, titleId),
	Credits: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Credits, cloud, titleId),
	Generator: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Generator, cloud, titleId),
	Watch: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Watch, cloud, titleId),
	Tips: (cloud: string, titleId: string) => utilities.formatRoute(routeNames.Tips, cloud, titleId),
	Instructions: (cloud: string) => utilities.formatRoute(routeNames.Instructions, cloud),
};
