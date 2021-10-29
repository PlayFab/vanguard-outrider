import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BackLink } from "../components/back-link";
import { IGeneratorLevelProps, LevelEditor } from "../components/generator/level-editor";
import { TitleNewsEditor } from "../components/generator/title-news";
import { Page } from "../components/page";
import { ICloudParams, useCloud } from "../hooks/use-cloud";
import { routes } from "../routes";
import { IApplicationState } from "../store/reducers";

export const GeneratorPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { cloud, titleId } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	const [levels, setLevels] = useState<IGeneratorLevelProps>({
		max: 50,
		xpToLevel1: 100,
		xpToLevelMax: 10000,
		xpPerLevelMultiplier: 1.15,
		hpPerLevelMultiplier: 5.75,
	});

	return (
		<Page title="Generator">
			<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
			<LevelEditor {...levels} onChange={setLevels} />
			<TitleNewsEditor />
		</Page>
	);
});
