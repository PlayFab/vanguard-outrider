import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BackLink } from "../components/back-link";
import { Page } from "../components/page";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { routes } from "../routes";
import { IApplicationState } from "../store/reducers";
import { DlStats } from "../styles";

export const CreditsPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { cloud, titleId } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
	}));

	return (
		<Page title="Credits">
			<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
			<h2>Credits</h2>
			<p>This game was created at the 2019 Microsoft Hackathon.</p>
			<DlStats role="presentation">
				<dt>Development</dt>
				<dd>
					<a href="mailto:jordan.roher@microsoft.com">Jordan Roher</a>
				</dd>

				<dt>Logo</dt>
				<dd>
					<a href="https://www.linkedin.com/in/jasmineaye">Jasmine Aye</a>
				</dd>

				<dt>Azure build</dt>
				<dd>Julio Colon</dd>

				<dt>Initial data &amp; concept</dt>
				<dd>Ashton Summers, Aaron Lai</dd>
			</DlStats>
		</Page>
	);
});
