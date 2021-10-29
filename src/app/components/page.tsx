import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { utilities } from "../shared/utilities";
import { IApplicationState, mainReducer } from "../store/reducers";
import styled from "../styles";
import { Footer } from "./footer";
import { Header } from "./header";
import { Player } from "./player";

const DivWrapper = styled.div`
	background: ${s => s.theme.color.background000};
	border-top: 1px solid ${s => s.theme.color.border200};
	border-bottom: 1px solid ${s => s.theme.color.border200};
	margin: ${s => s.theme.size.spacer} 0;
`;

const MainPageContent = styled.main`
	padding: ${s => s.theme.size.spacer};
	margin: ${s => s.theme.size.spacer} auto;

	@media ${s => s.theme.breakpoint.large} {
		max-width: ${s => s.theme.breakpointUnits.large};
	}
`;

const DivHeaderWrapper = styled.div`
	display: grid;
	grid-gap: ${s => s.theme.size.spacer};
	grid-template-areas:
		"logo"
		"player";
	grid-template-columns: 1fr;
	margin: 0 auto;
	width: 100%;

	@media ${s => s.theme.breakpoint.medium} {
		max-width: ${s => s.theme.breakpointUnits.large};
		grid-template-areas: "logo player";
		grid-template-columns: auto 1fr;
	}
`;

const DivHeaderWrapperInner = styled.div`
	grid-area: logo;
`;

const DivHeaderWrapperPlayer = styled.div`
	grid-area: player;
`;

interface IProps {
	title?: string;
	shouldShowPlayerInfo?: boolean;
	shouldSetPageTitle?: boolean;
}

interface IParams {
	titleid: string;
	cloud: string;
}

export const Page: React.FunctionComponent<IProps> = React.memo(props => {
	const { shouldSetPageTitle = true, shouldShowPlayerInfo = false, title, children } = props;
	const params: IParams = useParams();
	const { titleId, cloud } = useSelector((state: IApplicationState) => ({
		titleId: state.titleId,
		cloud: state.cloud,
	}));
	const dispatch = useDispatch();

	useEffect(() => {
		if (params.titleid !== titleId) {
			PlayFab.settings.titleId = params.titleid;
			dispatch(mainReducer.actions.setTitleId(params.titleid));
		}

		if (params.cloud !== cloud) {
			utilities.setCloud(params.cloud);
			dispatch(mainReducer.actions.setCloud(params.cloud));
		}
	}, [cloud, dispatch, params.cloud, params.titleid, titleId]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div>
			<Helmet>
				{shouldSetPageTitle ? (
					<title>{title} - Vanguard Outrider</title>
				) : (
					<title>Vanguard Outrider, An Azure PlayFab Demo Game</title>
				)}
			</Helmet>
			<DivHeaderWrapper>
				<DivHeaderWrapperInner>
					<Header title={title} />
				</DivHeaderWrapperInner>
				{shouldShowPlayerInfo && (
					<DivHeaderWrapperPlayer>
						<Player />
					</DivHeaderWrapperPlayer>
				)}
			</DivHeaderWrapper>
			<DivWrapper>
				<MainPageContent>{children}</MainPageContent>
			</DivWrapper>
			<Footer />
		</div>
	);
});
