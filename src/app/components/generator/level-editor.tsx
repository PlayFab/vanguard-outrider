import React, { useCallback, useMemo } from "react";
import { TextField } from "@fluentui/react";

import { ITitleDataLevel } from "../../shared/types";
import { DivField } from "../../styles";
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

type Props = IGeneratorLevelProps & IGeneratorLevelOtherProps;

export const LevelEditor: React.FunctionComponent<Props> = props => {
	const { hpPerLevelMultiplier, max, onChange, xpPerLevelMultiplier, xpToLevel1, xpToLevelMax } = props;

	const setState = useCallback(
		(field: string, value: number) => {
			onChange({
				...props,
				[field]: value,
			});
		},
		[onChange, props]
	);

	const calculateLevelCurve = useCallback(
		(position: number): number => {
			const minp = 0;
			const maxp = max - 1;

			// The result should be between 100 an 10000000
			const minv = Math.log(xpToLevel1);
			const maxv = Math.log(xpToLevelMax);

			// calculate adjustment factor
			const scale = (maxv - minv) / (maxp - minp);

			return Math.exp(minv + scale * (position - minp));
		},
		[max, xpToLevel1, xpToLevelMax]
	);

	const onChangeLevelMax = useCallback(
		(_: any, newValue: string): void => {
			setState("max", parseInt(newValue));
		},
		[setState]
	);

	const onChangeLevelXPToLevel1 = useCallback(
		(_: any, newValue: string): void => {
			setState("xpToLevel1", parseInt(newValue));
		},
		[setState]
	);

	const onChangeLevelXPToLevelMax = useCallback(
		(_: any, newValue: string): void => {
			setState("xpToLevelMax", parseInt(newValue));
		},
		[setState]
	);

	const onChangeLevelXPPerLevelMultiplier = useCallback(
		(_: any, newValue: string): void => {
			setState("xpPerLevelMultiplier", parseFloat(newValue));
		},
		[setState]
	);

	const onChangeLevelHPPerLevelMultiplier = useCallback(
		(_: any, newValue: string): void => {
			setState("hpPerLevelMultiplier", parseFloat(newValue));
		},
		[setState]
	);

	const xpPerLevel: ITitleDataLevel[] = useMemo(() => {
		let xpLocal: ITitleDataLevel[] = [];
		for (let i = 0; i < max; i++) {
			let xp = calculateLevelCurve(i);

			if (i > 0) {
				xp += xpLocal[i - 1].xp * xpPerLevelMultiplier;
			}

			xpLocal.push({
				level: i + 1,
				xp: Math.floor(xp),
				hpGranted: Math.floor(i * hpPerLevelMultiplier),
				itemGranted: null,
			});
		}

		return xpLocal;
	}, [calculateLevelCurve, hpPerLevelMultiplier, max, xpPerLevelMultiplier]);

	return (
		<React.Fragment>
			<h2>Level curve</h2>
			<Grid grid8x4>
				<React.Fragment>
					<Grid grid6x6>
						<TextField label="Maximum level" value={max.toString()} onChange={onChangeLevelMax} />
						<TextField
							label="XP to level 1"
							value={xpToLevel1.toString()}
							onChange={onChangeLevelXPToLevel1}
						/>
						<TextField
							label="XP to level max"
							value={xpToLevelMax.toString()}
							onChange={onChangeLevelXPToLevelMax}
						/>
						<TextField
							label="XP per level modifier"
							value={xpPerLevelMultiplier.toString()}
							onChange={onChangeLevelXPPerLevelMultiplier}
						/>
						<TextField
							label="HP per level modifier"
							value={hpPerLevelMultiplier.toString()}
							onChange={onChangeLevelHPPerLevelMultiplier}
						/>
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
};
