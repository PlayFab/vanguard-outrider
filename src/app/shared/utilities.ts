import { is } from "./is";
import { MAIN_CLOUD } from "../shared/types";

function getRandomInteger(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRoute(original: string, ...args: string[]): string {
	if (is.null(original) || is.null(args)) {
		return "";
	}

	const replaceRegEx = new RegExp("((?::)[a-z?]+)");

	let returnString = original;

	for (let i = 0; i < args.length; i++) {
		returnString = returnString.replace(replaceRegEx, args[i]);
	}

	return returnString;
}

function createPlayFabLink(cloud: string, titleId: string, uri: string, isReact: boolean): string {
	let urlRoot: string;
	if (cloud === MAIN_CLOUD) {
		urlRoot = "https://developer.playfab.com";
	} else {
		urlRoot = `https://${cloud}.${cloud}.playfab.com`;
	}

	return `${urlRoot}/en-US/${isReact ? `r/t/` : ``}${titleId}/${uri}`;
}

function setCloud(cloud: string): void {
	const playFabMainProdUrl = ".playfabapi.com";

	let prodUrl: string;
	if (is.null(cloud) || cloud === MAIN_CLOUD) {
		prodUrl = playFabMainProdUrl;
	} else {
		prodUrl = `.${cloud}${playFabMainProdUrl}`;
	}

	PlayFab.settings.productionServerUrl = prodUrl;
}

function htmlDecode(input: string): string {
	const e = document.createElement("div");
	e.innerHTML = input;
	return e.childNodes[0].nodeValue;
}

function parseTitleNewsDate(dateString: string): string {
	let dateTime = dateString;

	try {
		const trueDate = new Date(dateTime);
		dateTime = trueDate.toLocaleDateString();
	} catch {
		// Nothing to do
	}

	return dateTime;
}

export const utilities = {
	getRandomInteger,
	formatRoute,
	createPlayFabLink,
	setCloud,
	htmlDecode,
	parseTitleNewsDate,
};
