import { DefaultButton, PrimaryButton } from "@fluentui/react";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { Page } from "../components/page";
import { ICloudParams, useCloud } from "../hooks/use-cloud";
import { routes } from "../routes";
import { is } from "../shared/is";
import { IPlanetData } from "../shared/types";
import { IApplicationState } from "../store/reducers";
import { IEquipmentSlots } from "../store/types";
import { SpinnerLeft, UlInline } from "../styles";

export const GuidePage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { cloud, titleId, equipment, hasPlayerId, hasTitleId, planets, playerName } = useSelector(
		(state: IApplicationState) => ({
			cloud: state.cloud,
			titleId: state.titleId,
			planets: state.planets,
			equipment: state.equipment,
			hasTitleId: state.hasTitleId,
			hasPlayerId: state.hasPlayerId,
			playerName: state.playerName,
		})
	);
	const history = useHistory();

	const sendToHeadquarters = useCallback(() => {
		history.push(routes.Headquarters(cloud, titleId));
	}, [cloud, history, titleId]);

	const sendToPlanet = useCallback(
		(name: string) => {
			history.push(routes.Planet(cloud, titleId, name));
		},
		[cloud, history, titleId]
	);

	if (!hasTitleId) {
		return null;
	}

	if (!hasPlayerId) {
		return <Redirect to={routes.MainMenu(cloud, titleId)} />;
	}

	return (
		<Page title="Guide" shouldShowPlayerInfo>
			<GuidePagePlanets
				equipment={equipment}
				planets={planets}
				playerName={playerName}
				sendToHeadquarters={sendToHeadquarters}
				sendToPlanet={sendToPlanet}
			/>
		</Page>
	);
});

interface IGuidePagePlanets {
	equipment: IEquipmentSlots;
	planets: IPlanetData[];
	playerName: string;
	sendToHeadquarters: () => void;
	sendToPlanet: (name: string) => void;
}

const GuidePagePlanets: React.FunctionComponent<IGuidePagePlanets> = React.memo(props => {
	const { equipment, planets, playerName, sendToHeadquarters, sendToPlanet } = props;

	if (is.null(planets)) {
		return <SpinnerLeft label="Loading planets..." labelPosition="right" />;
	}

	if (is.null(equipment) || is.null(equipment.weapon)) {
		return (
			<React.Fragment>
				<h2>Destinations</h2>
				<p>Welcome to the solar system, {playerName}.</p>
				<p>You can't go into space without a weapon. Buy one at headquarters.</p>
				<UlInline>
					<li key={"homebase"}>
						<PrimaryButton text="Headquarters" onClick={sendToHeadquarters} />
					</li>
				</UlInline>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<h2>Destinations</h2>
			<UlInline role="presentation">
				<li key={"homebase"}>
					<DefaultButton text="Headquarters" onClick={sendToHeadquarters} />
				</li>
				{planets.map(planet => (
					<li key={planet.name}>
						<PrimaryButton text={`Fly to ${planet.name}`} onClick={sendToPlanet.bind(this, planet.name)} />
					</li>
				))}
			</UlInline>
		</React.Fragment>
	);
});
