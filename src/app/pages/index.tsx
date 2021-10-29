import { DefaultButton, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import { TextField } from "@fluentui/react/lib/TextField";
import { FontSizes } from "@uifabric/styling";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import carouselImage from "../../static/carousel_1@2x.png";
import { Grid } from "../components/grid";
import { Page } from "../components/page";
import { ICloudParams } from "../hooks/use-cloud";
import { routes } from "../routes";
import { is } from "../shared/is";
import { MAIN_CLOUD } from "../shared/types";
import { mainReducer } from "../store/reducers";
import styled, { DivConfirm, DivField, UlNull } from "../styles";

const UlButtons = styled(UlNull)`
	> li {
		display: inline-block;
		margin-right: ${s => s.theme.size.spacer2};

		&:last-child {
			margin-right: 0;
		}
	}
`;

const PMega = styled.p`
	font-size: ${FontSizes.xxLargePlus};
	max-width: ${s => s.theme.breakpointUnits.small};
`;

const DivFormWrapper = styled.div`
	margin-top: ${s => s.theme.size.spacer2};
`;

export const IndexPage: React.FunctionComponent = React.memo(() => {
	const history = useHistory();
	const { cloud: cloudParam = MAIN_CLOUD } = useParams<ICloudParams>();
	const dispatch = useDispatch();

	const [titleId, settitleId] = useState("");
	const [cloud, setcloud] = useState(cloudParam);
	const [error, seterror] = useState("");

	const clearError = useCallback(() => {
		seterror(null);
	}, []);

	const onChangeTitleId = useCallback((_: any, titleId: string) => {
		settitleId(titleId.trim());
	}, []);

	const onChangeCloud = useCallback((_: any, cloud: string) => {
		setcloud(cloud.trim());
	}, []);

	const onGetInstructions = useCallback(() => {
		history.push(routes.Instructions(cloud));
	}, [cloud, history]);

	const onContinue = useCallback(
		(e: React.SyntheticEvent<any>) => {
			if (!is.null(e)) {
				e.preventDefault();
			}

			if (is.null(titleId)) {
				seterror("Title ID is required");
				return;
			} else {
				clearError();
			}

			dispatch(mainReducer.actions.setTitleId(titleId));
			PlayFab.settings.titleId = titleId;
			dispatch(mainReducer.actions.setCloud(cloud));
			history.push(routes.MainMenu(cloud, titleId));
		},
		[clearError, cloud, dispatch, history, titleId]
	);

	const shouldShowCloudParam = !is.null(cloudParam) && cloudParam !== MAIN_CLOUD;

	return (
		<Page title="An Azure PlayFab Demo Game" shouldSetPageTitle={false}>
			<Grid grid6x6>
				<form onSubmit={onContinue}>
					<PMega>
						See how <a href="https://playfab.com/">Azure PlayFab</a> can be used to run live games
					</PMega>
					<DivFormWrapper>
						{!is.null(error) && (
							<MessageBar role="alert" messageBarType={MessageBarType.error}>
								<p>{error}</p>
							</MessageBar>
						)}
						<DivField>
							<Grid grid6x6>
								<TextField label="Your game's title ID" onChange={onChangeTitleId} value={titleId} />
								{shouldShowCloudParam && (
									<TextField label="Cloud" onChange={onChangeCloud} value={cloud} />
								)}
							</Grid>
						</DivField>

						<DivConfirm>
							<UlButtons role="presentation">
								<li>
									<PrimaryButton text="Continue" onClick={onContinue} ariaLabel="Continue" />
								</li>
								<li>
									<DefaultButton
										text="Learn more"
										onClick={onGetInstructions}
										ariaLabel="Read our instructions on how to use this website"
									/>
								</li>
							</UlButtons>
						</DivConfirm>
						<DivFormWrapper>
							<p>
								<a href="https://github.com/PlayFab/vanguard-outrider">Get the source code on GitHub</a>
							</p>
						</DivFormWrapper>
					</DivFormWrapper>
				</form>
				<img src={carouselImage} alt="Game screenshots" />
			</Grid>
		</Page>
	);
});
