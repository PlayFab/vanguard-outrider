import React, { useCallback, useState } from "react";
import { TextField } from "@fluentui/react";

import { is } from "../../shared/is";
import { Grid } from "../grid";

export const TitleNewsEditor: React.FunctionComponent = React.memo(() => {
	const [news, setNews] = useState(
		"<p>HTML in this box will be converted to a <strong>JSON-safe string</strong> for use in title news.</p>"
	);

	const convertTitleNews = (): string => {
		if (is.null(news)) {
			return null;
		}

		return JSON.stringify(
			{
				html: news.replace(/&/gi, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;"),
			},
			null,
			4
		);
	};

	const onChangeNews = useCallback((_: any, newValue: string): void => {
		setNews(newValue);
	}, []);

	return (
		<React.Fragment>
			<h2>Title news</h2>
			<Grid grid6x6>
				<TextField multiline rows={20} label="Title news (HTML)" onChange={onChangeNews} value={news} />
				<TextField multiline rows={20} label="Processed title news" value={convertTitleNews()} readOnly />
			</Grid>
		</React.Fragment>
	);
});
