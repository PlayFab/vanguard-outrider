import React, { useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { PrimaryButton, DefaultButton } from "@fluentui/react";

import { Page } from "../components/page";
import styled, { UlInline } from "../styles";
import { routes } from "../routes";
import { Grid } from "../components/grid";
import { useSelector } from "react-redux";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { IApplicationState } from "../store/reducers";

const DivButton = styled.div`
	margin-top: ${s => s.theme.size.spacer};
`;

const DivAdvanced = styled.div`
	margin-top: ${s => s.theme.size.spacer5};
`;

export const MainMenuPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { cloud, titleId } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	const history = useHistory();

	const goToPage = useCallback(
		(uri: string) => {
			history.push(uri);
		},
		[history]
	);

	return (
		<Page title="Main Menu">
			<Grid grid6x6>
				<React.Fragment>
					<h2>First time</h2>
					<p>
						To play the game, you must <strong>upload game data</strong>. This will make your title ready to
						play.
					</p>
					<DivButton>
						<DefaultButton
							text="Upload data"
							onClick={goToPage.bind(this, routes.Upload(cloud, titleId))}
						/>
					</DivButton>
				</React.Fragment>
				<React.Fragment>
					<h2>Ready to play</h2>
					<p>
						If your title has data, select <strong>play game</strong> to create a new player or sign in as
						an existing player.
					</p>
					<DivButton>
						<PrimaryButton text="Play game" onClick={goToPage.bind(this, routes.Login(cloud, titleId))} />
					</DivButton>
				</React.Fragment>
			</Grid>
			<DivAdvanced>
				<h3>Advanced</h3>
				<UlInline role="presentation">
					<li>
						<DefaultButton
							text="Download data"
							onClick={goToPage.bind(this, routes.Download(cloud, titleId))}
						/>
					</li>
					<li>
						<DefaultButton
							text="Watch PlayFab work"
							onClick={goToPage.bind(this, routes.Watch(cloud, titleId))}
						/>
					</li>
					<li>
						<DefaultButton text="LiveOps tips" onClick={goToPage.bind(this, routes.Tips(cloud, titleId))} />
					</li>
					<li>
						<DefaultButton
							text="Data generators"
							onClick={goToPage.bind(this, routes.Generator(cloud, titleId))}
						/>
					</li>
					<li>
						<DefaultButton text="Credits" onClick={goToPage.bind(this, routes.Credits(cloud, titleId))} />
					</li>
				</UlInline>
			</DivAdvanced>
		</Page>
	);
});
