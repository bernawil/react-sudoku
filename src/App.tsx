/* eslint-disable @typescript-eslint/ban-types */

/* eslint-disable @typescript-eslint/naming-convention */
import {styled} from 'styled-components';
import {chunk, clone, times, groupBy, omit, values} from 'lodash';
import './App.css';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

// Grid is composed of 9 3x3 blocks
const GRID_BLOCKS_SIZE = 9;

const initBoard = (): Array<Array<number | null>> => times(GRID_BLOCKS_SIZE).map(() => times(GRID_BLOCKS_SIZE).map(() => null));

function separateIntoBlocks<T>(grid: T[][]): T[][] {
	const blocks = [];

	for (let blockRow = 0; blockRow < 3; blockRow++) {
		for (let blockCol = 0; blockCol < 3; blockCol++) {
			const block = [];

			for (let row = blockRow * 3; row < ((blockRow + 1) * 3); row++) {
				for (let col = blockCol * 3; col < ((blockCol + 1) * 3); col++) {
					block.push(grid[row][col]);
				}
			}

			blocks.push(block);
		}
	}

	return blocks;
}

function rowColMap<T>(board: T[][]) {
	return board.map((row, r) => row.map((colValue, c) => ({
		row: r,
		column: c,
		value: colValue,
	})));
}

function validateCell<T>(_board: Array<Array<Nullable<T>>>, {row, column, value}: {row: number; column: number; value: T}) {
	const board = clone(_board);
	board[row][column] = null;

	if (value === null) {
		return true;
	}

	for (let i = 0; i < 9; i++) {
		if (board[row][i] === value) {
			return false;
		}
	}

	for (let i = 0; i < 9; i++) {
		if (board[i][column] === value) {
			return false;
		}
	}

	return true;
}

function validateBlock<T>(block: T[]) {
	for (const group of values(omit(groupBy(block), 'null'))) {
		if (group.length > 1) {
			return false;
		}
	}

	return true;
}

type Nullable<T> = T | null;
function validateBoard<T>(_board: Array<Array<Nullable<T>>>) {
	const board = clone(_board);
	const separatedBlocks = separateIntoBlocks(board);
	let blockIdx = 0;
	const invalidBlocks = [];
	for (const block of separatedBlocks) {
		if (!validateBlock(block)) {
			invalidBlocks.push(blockIdx);
		}

		blockIdx++;
	}

	const invalidCells = [];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			const value = board[i][j];
			board[i][j] = null;
			if (!validateCell(board, {row: i, column: j, value})) {
				invalidCells.push({row: i, column: j});
			}

			board[i][j] = value;
		}
	}

	return {invalidBlocks, invalidCells};
}

const Cell = styled.input<{$highlight?: boolean; $valid?: boolean}>`
  width: 30px;
  height: 30px;
  border: 1px solid black;
  background: none;
  text-align: center;
  ${(props => props.$highlight ? 'background: #4C80D9; opacity: 0.7;' : '')}
  ${(props => props.$valid ? '' : 'background: red;')}
`;
const Group = styled.div<{$valid?: boolean}>`
  border: 1px solid black;
  padding: 0px;
  background: grey;
  ${props => props.$valid ? '' : `* > * {
    background: red;
  }`}
`;
const GroupLine = styled.div`
  display: flex;
`;
const GridLine = styled.div`
  display: flex;
  flex-direction: row;
`;
const Grid = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;
const CellBlock: React.FC<{
	row: number;
	column: number;
	value: number | undefined;
	handleHover: (obj: {row: number; column: number}) => void;
	highlight?: boolean;
	updateBoard: (obj: {row: number; column: number; value: number | null}) => void;
	board: any[][];
	invalidCells: Array<{
		row: number;
		column: number;
	}>;
}> = ({
	row, column, value, handleHover, highlight, updateBoard, board, invalidCells, ...rest
}) => {
	const [val, setVal] = useState<string>(value ? String(value) : '');

	useEffect(() => {
		updateBoard({row, column, value: val === '' ? null : Number(val)});
	}, [val]);

	const isInvalid = Boolean(invalidCells.find(invalidCell => {
		if (invalidCell.row === row && invalidCell.column === column) {
			return true;
		}

		return false;
	}));

	const handleChange = useCallback((e: {target: {value: any}}) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const inputVal = e.target.value;
		if ([
			'',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		].includes(inputVal)
		) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			setVal(inputVal);
		}
	}, []);

	return (<Cell
		$valid={!isInvalid}
		$highlight={highlight}
		value={val || ''}
		onChange={handleChange}
		onMouseOver={() => {
			handleHover({row, column});
		}}
		{...rest} />);
};

function Board({board, updateBoard, invalidBlocks, invalidCells}: {
	board: any[][];
	updateBoard: (obj: {row: number; column: number; value: number | null}) => void;
	invalidBlocks: number[];
	invalidCells: Array<{
		row: number;
		column: number;
	}>;
}) {
	const [hoverRowCol, setHoverRowCol] = useState({row: null, column: null});

	const rowColMappedBoard = rowColMap(board);
	const separatedBlocks = separateIntoBlocks(rowColMappedBoard);
	const renderedGroups = separatedBlocks.map((block, blockIdx) => {
		const isInvalidBlock = invalidBlocks?.includes(blockIdx);
		const blockLines = chunk(block, 3);
		const blockRender = blockLines.map((line, lineIdx) => (
			// eslint-disable-next-line react/jsx-key
			<GroupLine>
				{line.map(({...args}, cellIdx) => (
					<CellBlock
						board={board}
						updateBoard={updateBoard}
						invalidCells={invalidCells}
						key={`${blockIdx}-${lineIdx}-${cellIdx}`}
						handleHover={(arg: any) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							setHoverRowCol(arg);
						}}
						highlight={args.row === hoverRowCol.row || args.column === hoverRowCol.column}
						{...args}
					/>
				))}
			</GroupLine>
		),
		);

		return (
			<Group key={`block-group-${blockIdx}`} $valid={!isInvalidBlock}>
				{blockRender}
			</Group>
		);
	});

	return (
		<Grid>
			{chunk(renderedGroups, 3).map(gridLineGroup => (
				// eslint-disable-next-line react/jsx-key
				<GridLine>
					{gridLineGroup}
				</GridLine>
			))}
		</Grid>
	);
}

function App() {
	const [board, setBoard] = useState(initBoard());

	const _setBoard = ({row, column, value}: {row: number; column: number; value: number | null}) => {
		const newBoard = clone(board);
		board[row][column] = value ? value : null;
		setBoard(newBoard);
	};

	const {invalidBlocks, invalidCells} = useMemo(() => validateBoard(board), [board]);

	return (
		<>
			<h1>Sudoku</h1>
			<Board board={board} updateBoard={_setBoard} invalidBlocks={invalidBlocks} invalidCells={invalidCells}/>
		</>
	);
}

export default App;
