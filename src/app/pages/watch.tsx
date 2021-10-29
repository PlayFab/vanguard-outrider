import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BackLink } from "../components/back-link";
import { Grid } from "../components/grid";
import { Page } from "../components/page";
import { ICloudParams, useCloud } from "../hooks/use-cloud";
import { routes } from "../routes";
import { utilities } from "../shared/utilities";
import { IApplicationState } from "../store/reducers";

export const WatchPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { cloud, titleId } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	return (
		<Page title="Watch PlayFab Work">
			<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
			<h2>Watch PlayFab Work</h2>
			<Grid grid6x6>
				<React.Fragment>
					<p>
						<strong>In browser:</strong> Open the developer tools in your browser and navigate to the
						network tab. All requests to PlayFab will be visible.
					</p>
					<ul role="presentation">
						<li>
							<strong>Windows:</strong> Press F12
						</li>
						<li>
							<strong>Macintosh:</strong> Press Command-Option-i
						</li>
					</ul>
				</React.Fragment>
				<React.Fragment>
					<p>
						<strong>In PlayFab:</strong> Keep the{" "}
						<a
							href={utilities.createPlayFabLink(cloud, titleId, "dashboard/monitoring/playstream", false)}
							target="_blank"
							rel="noreferrer">
							Dashboard &gt; PlayStream Monitor
						</a>{" "}
						page open to see all game activity as it happens.
					</p>
				</React.Fragment>
			</Grid>
		</Page>
	);
});
