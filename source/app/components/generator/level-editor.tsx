import React from "react";
import { TextField } from "office-ui-fabric-react";

import { ITitleDataLevel } from "../../shared/types";
import { DivField } from "../../styles";
import { is } from "../../shared/is";
import { Grid } from "../grid";

export interface IGeneratorLevelProps {
    max: number;
    xpToLevel1: number;
    xpToLevelMax: number;
    xpPerLevelMultiplier: number;
    hpPerLevelMultiplier: number;
}

interface IGeneratorLevelOtherProps {
    onChange: (data: IGeneratorLevelProps) => void;
}

type GeneratorLevelProps = IGeneratorLevelProps & IGeneratorLevelOtherProps;
type GeneratorLevelState = IGeneratorLevelProps;

export class LevelEditor extends React.PureComponent<GeneratorLevelProps, GeneratorLevelState> {
    constructor(props: GeneratorLevelProps) {
        super(props);

        this.state = {
            ...props,
        };
    }

    public render(): React.ReactNode {
        const xpPerLevel: ITitleDataLevel[] = [];

        for(let i = 0; i < this.props.max; i++) {
            let xp = this.calculateLevelCurve(i);

            if(i > 0) {
                xp += (xpPerLevel[i - 1].xp * this.props.xpPerLevelMultiplier);
            }

            xpPerLevel.push({
                level: i + 1,
                xp: Math.floor(xp),
                hpGranted: Math.floor(i * this.props.hpPerLevelMultiplier),
                itemGranted: null,
            });
        }
        
        return (
            <React.Fragment>
                <h2>Level curve</h2>
                <Grid grid8x4>
                    <React.Fragment>
                        <Grid grid6x6>
                            <TextField label="Maximum level" value={this.props.max.toString()} onChange={this.onChangeLevelMax} />
                            <TextField label="XP to level 1" value={this.props.xpToLevel1.toString()} onChange={this.onChangeLevelXPToLevel1} />
                            <TextField label="XP to level max" value={this.props.xpToLevelMax.toString()} onChange={this.onChangeLevelXPToLevelMax} />
                            <TextField label="XP per level modifier" value={this.props.xpPerLevelMultiplier.toString()} onChange={this.onChangeLevelXPPerLevelMultiplier} />
                            <TextField label="HP per level modifier" value={this.props.hpPerLevelMultiplier.toString()} onChange={this.onChangeLevelHPPerLevelMultiplier} />
                        </Grid>
                    </React.Fragment>
                    <DivField>
                        <TextField
                            multiline
                            rows={20}
                            label="Level title data"
                            aria-label="Level title data"
                            value={JSON.stringify(xpPerLevel, null, 4)}
                        />
                    </DivField>
                </Grid>
            </React.Fragment>
        );
    }

    private onChangeLevelMax = (_: any, newValue: string): void => {
        this.onChangeLevelVariable("max", parseInt(newValue));
    }

    private onChangeLevelXPToLevel1 = (_: any, newValue: string): void => {
        this.onChangeLevelVariable("xpToLevel1", parseInt(newValue));
    }

    private onChangeLevelXPToLevelMax = (_: any, newValue: string): void => {
        this.onChangeLevelVariable("xpToLevelMax", parseInt(newValue));
    }

    private onChangeLevelXPPerLevelMultiplier = (_: any, newValue: string): void => {
        this.onChangeLevelVariable("xpPerLevelMultiplier", parseFloat(newValue));
    }

    private onChangeLevelHPPerLevelMultiplier = (_: any, newValue: string): void => {
        this.onChangeLevelVariable("hpPerLevelMultiplier", parseFloat(newValue));
    }

    private onChangeLevelVariable(name: string, variable: number): void {
        // TODO: Make a better experience for entering floating point numbers
        if(!is.numeric(variable)) {
            return;
        }

        this.setState(prevState => ({
            ...prevState,
            [name]: variable,
        }), this.onChange);
    }

    private calculateLevelCurve(position: number): number {
        const minp = 0;
        const maxp = this.props.max - 1;
        
        // The result should be between 100 an 10000000
        const minv = Math.log(this.props.xpToLevel1);
        const maxv = Math.log(this.props.xpToLevelMax);
        
        // calculate adjustment factor
        const scale = (maxv-minv) / (maxp-minp);
        
        return Math.exp(minv + scale*(position-minp));
    }

    private onChange = (): void => {
        this.props.onChange(this.state);
    }
}