import React from "react";
import { TextField } from "office-ui-fabric-react";

import { is } from "../../shared/is";
import { Grid } from "../grid";

interface IGeneratorTitleNewsState {
    news: string;
}

export class TitleNewsEditor extends React.PureComponent<{}, IGeneratorTitleNewsState> {
    constructor(props: IGeneratorTitleNewsState) {
        super(props);

        this.state = {
            news: "<p>HTML in this box will be converted to a <strong>JSON-safe string</strong> for use in title news.</p>",
        };
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <h2>Title news</h2>
                <Grid grid6x6>
                    <TextField
                        multiline
                        rows={20}
                        label="Title news (HTML)"
                        onChange={this.onChangeNews}
                        value={this.state.news}
                    />
                    <TextField
                        multiline
                        rows={20}
                        label="Processed title news"
                        value={this.convertTitleNews()}
                        readOnly
                    />
                </Grid>
            </React.Fragment>
        );
    }

    private convertTitleNews(): string {
        if(is.null(this.state.news)) {
            return null;
        }

        return JSON.stringify({
            html: this.state.news.replace(/&/gi, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;")
        }, null, 4);
    }

    private onChangeNews = (_: any, newValue: string): void => {
        this.setState({
            news: newValue,
        });
    }
}