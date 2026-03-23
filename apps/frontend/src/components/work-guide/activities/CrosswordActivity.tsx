'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { Activity } from '@repo/schemas';

interface Props {
    activity: Extract<Activity, { type: 'CROSSWORD' }> & { language?: string };
    language?: string;
}

type PlacedWord = {
    word: string;
    clue: string;
    x: number;
    y: number;
    isHorizontal: boolean;
    number: number;
    originalIndex: number;
};

type GridCell = {
    char: string;
    number?: number;
    isEmpty: boolean;
};

// Genera un crucigrama determinístico a partir de una lista de palabras
function generateCrossword(items: { word: string, clue_or_definition: string }[]) {
    const GRID_SIZE = 50; // Tablero temporal grande para evitar bordes
    const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const placedWords: PlacedWord[] = [];
    let wordNumberCount = 1;

    // Ordenamos palabras por longitud (las más largas suelen ser más fáciles de cruzar al principio)
    const wordsToPlace = items.map((item, i) => ({
        word: item.word.toUpperCase().replace(/\s+/g, ''),
        clue: item.clue_or_definition,
        originalIndex: i
    })).sort((a, b) => b.word.length - a.word.length);

    function canPlace(word: string, startX: number, startY: number, isHorizontal: boolean) {
        if (startX < 0 || startY < 0) return false;
        if (isHorizontal && startX + word.length >= GRID_SIZE) return false;
        if (!isHorizontal && startY + word.length >= GRID_SIZE) return false;

        let intersections = 0;

        // Comprobar la celda exactamente anterior a la palabra para asegurarse de que no se pega a otra palabra existente (en la misma dirección)
        if (isHorizontal) {
            if (startX > 0 && board[startY][startX - 1] !== '') return false;
            // Y celular posterior
            if (startX + word.length < GRID_SIZE && board[startY][startX + word.length] !== '') return false;
        } else {
            if (startY > 0 && board[startY - 1][startX] !== '') return false;
            if (startY + word.length < GRID_SIZE && board[startY + word.length][startX] !== '') return false;
        }

        for (let i = 0; i < word.length; i++) {
            const cx = isHorizontal ? startX + i : startX;
            const cy = isHorizontal ? startY : startY + i;
            const currentCell = board[cy][cx];

            if (currentCell === word[i]) {
                intersections++;
            } else if (currentCell !== '') {
                return false; // Conflicto de letras diferentes
            } else {
                // Es una celda vacía, ahora comprobar vecinos ortogonales para evitar palabras pegadas paralelamente
                const top = cy > 0 ? board[cy - 1][cx] : '';
                const bottom = cy < GRID_SIZE - 1 ? board[cy + 1][cx] : '';
                const left = cx > 0 ? board[cy][cx - 1] : '';
                const right = cx < GRID_SIZE - 1 ? board[cy][cx + 1] : '';

                if (isHorizontal) {
                    if (top !== '' || bottom !== '') return false;
                } else {
                    if (left !== '' || right !== '') return false;
                }
            }
        }

        // Si ya hay palabras, necesitamos al menos una intersección
        if (placedWords.length > 0 && intersections === 0) return false;

        return true;
    }

    function placeWord(wordObj: typeof wordsToPlace[0], x: number, y: number, isHorizontal: boolean) {
        // Verificar si la misma casilla inicial (x,y) ya tiene un número para otra palabra
        // Ej: dos palabras que arrancan exactamente en la misma letra
        let wordNum = wordNumberCount;
        const existingWordStart = placedWords.find(pw => pw.x === x && pw.y === y);

        if (existingWordStart) {
            wordNum = existingWordStart.number;
        } else {
            wordNumberCount++;
        }

        const word = wordObj.word;
        for (let i = 0; i < word.length; i++) {
            const cx = isHorizontal ? x + i : x;
            const cy = isHorizontal ? y : y + i;
            board[cy][cx] = word[i];
        }

        placedWords.push({
            word: wordObj.word,
            clue: wordObj.clue,
            x,
            y,
            isHorizontal,
            number: wordNum,
            originalIndex: wordObj.originalIndex
        });
    }

    // Colocar primera palabra en el centro del tablero horizontalmente
    if (wordsToPlace.length > 0) {
        const first = wordsToPlace.shift()!;
        placeWord(first, Math.floor(GRID_SIZE / 2) - Math.floor(first.word.length / 2), Math.floor(GRID_SIZE / 2), true);
    }

    // Intentar colocar las siguientes palabras
    const unplaced: typeof wordsToPlace = [];

    for (const w of wordsToPlace) {
        const word = w.word;
        let bestPlacement: { x: number, y: number, isHorizontal: boolean, score: number } | null = null;

        for (const pw of placedWords) {
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                // Buscamos dónde `pw` tiene la letra `char`
                for (let j = 0; j < pw.word.length; j++) {
                    if (pw.word[j] === char) {
                        // Posible intersección
                        // Si la colocada es Horizontal, la nueva debe ser Vertical
                        const isHorizontal = !pw.isHorizontal;
                        const intersectX = pw.isHorizontal ? pw.x + j : pw.x;
                        const intersectY = pw.isHorizontal ? pw.y : pw.y + j;

                        const startX = isHorizontal ? intersectX - i : intersectX;
                        const startY = isHorizontal ? intersectY : intersectY - i;

                        if (canPlace(word, startX, startY, isHorizontal)) {
                            // Puntuación: premiamos más cercanía al centro general
                            const distToCenter = Math.abs(startX - 25) + Math.abs(startY - 25);
                            const score = 100 - distToCenter;

                            if (!bestPlacement || score > bestPlacement.score) {
                                bestPlacement = { x: startX, y: startY, isHorizontal, score };
                            }
                        }
                    }
                }
            }
        }

        if (bestPlacement) {
            placeWord(w, bestPlacement.x, bestPlacement.y, bestPlacement.isHorizontal);
        } else {
            unplaced.push(w);
        }
    }

    // Si hay palabras que no pudimos cruzar, las forzamos en un extremo libre inferior horizontalmente
    if (unplaced.length > 0) {
        // Encontrar la 'y' más baja usada actualmente
        let maxY = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (board[y][x] !== '') maxY = y;
            }
        }

        let startY = maxY + 2;
        for (const w of unplaced) {
            let placed = false;
            // Buscar una fila libre abajo
            while (!placed && startY < GRID_SIZE) {
                if (canPlace(w.word, 5, startY, true)) {
                    placeWord(w, 5, startY, true);
                    placed = true;
                    startY += 2;
                } else {
                    startY++;
                }
            }
        }
    }

    return { board, placedWords };
}

export function CrosswordActivity({ activity }: Props) {
    const isEn = activity.language === 'en';
    const [grid, setGrid] = useState<GridCell[][] | null>(null);
    const [horizontalClues, setHorizontalClues] = useState<PlacedWord[]>([]);
    const [verticalClues, setVerticalClues] = useState<PlacedWord[]>([]);
    const hiddenCellStyle: CSSProperties = { visibility: 'hidden' };

    useEffect(() => {
        const { board, placedWords } = generateCrossword(activity.items);

        // Calcular Bounding Box para no renderizar 50x50 sino justo lo necesario
        let minX = 50, minY = 50, maxX = 0, maxY = 0;
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                if (board[y][x] !== '') {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (minX > maxX || minY > maxY) {
            // Failsafe por si no hay palabras
            minX = 0; minY = 0; maxX = 10; maxY = 10;
        }

        // Padding de 1 celda alrededor
        minX = Math.max(0, minX - 1);
        minY = Math.max(0, minY - 1);
        maxX = Math.min(49, maxX + 1);
        maxY = Math.min(49, maxY + 1);

        const finalGrid: GridCell[][] = [];
        for (let y = minY; y <= maxY; y++) {
            const row: GridCell[] = [];
            for (let x = minX; x <= maxX; x++) {
                const char = board[y][x];

                // Encontrar si alguna palabra *empieza* aquí para dibujar el numerito
                const startingWord = placedWords.find(pw => pw.x === x && pw.y === y);

                row.push({
                    char,
                    isEmpty: char === '',
                    number: startingWord ? startingWord.number : undefined
                });
            }
            finalGrid.push(row);
        }

        // Clasificar pistas y ordenarlas por número
        const horiz = placedWords.filter(pw => pw.isHorizontal).sort((a, b) => a.number - b.number);
        const vert = placedWords.filter(pw => !pw.isHorizontal).sort((a, b) => a.number - b.number);

        setGrid(finalGrid);
        setHorizontalClues(horiz);
        setVerticalClues(vert);
    }, [activity.items]);

    if (!grid) {
        return <div className="animate-pulse h-48 bg-gray-100 rounded"></div>;
    }

    return (
        <div className="space-y-6">
            {/* The Crossword Grid */}
            <div className="flex justify-center overflow-x-auto pb-4">
                <style dangerouslySetInnerHTML={{
                    __html: `
                  .crossword-cell input { display: none; }
                  @media print {
                     .crossword-cell { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                `}} />

                <div
                    className="grid gap-[1px] bg-black border-2 border-black p-[2px]"
                    style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1.8rem)`, width: 'max-content' }}
                >
                    {grid.map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${y}-${x}`}
                                className={`
                                    relative w-[1.8rem] h-[1.8rem] flex items-center justify-center
                                    ${cell.isEmpty ? 'bg-transparent border-0' : 'bg-white crossword-cell'}
                                `}
                                style={cell.isEmpty ? hiddenCellStyle : undefined}
                            >
                                {cell.number && (
                                    <span className="absolute top-[1px] left-[2px] text-[0.45rem] font-bold leading-none text-black select-none z-10">
                                        {cell.number}
                                    </span>
                                )}
                                {/* Las letras no se muestran al estudiante, es para resolver */}
                                {!cell.isEmpty && (
                                    <span className="opacity-0 group-hover:opacity-10 print:opacity-0 transition-opacity absolute inset-0 flex items-center justify-center font-bold text-gray-200">
                                        {cell.char}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* The Clues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <h4 className="font-bold text-sm mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">
                        → {isEn ? 'ACROSS' : 'HORIZONTAL'}
                    </h4>
                    <ol className="space-y-2.5">
                        {horizontalClues.map((item, i) => (
                            <li key={i} className="text-sm flex">
                                <span className="font-bold w-6 shrink-0">{item.number}.</span>
                                <span>
                                    {item.clue}
                                    <span className="text-gray-400 ml-1 whitespace-nowrap">({item.word.length})</span>
                                </span>
                            </li>
                        ))}
                        {horizontalClues.length === 0 && <p className="text-xs text-gray-400 italic">No hay palabras horizontales.</p>}
                    </ol>
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-2 uppercase tracking-wide border-b border-gray-200 pb-1">
                        ↓ {isEn ? 'DOWN' : 'VERTICAL'}
                    </h4>
                    <ol className="space-y-2.5">
                        {verticalClues.map((item, i) => (
                            <li key={i} className="text-sm flex">
                                <span className="font-bold w-6 shrink-0">{item.number}.</span>
                                <span>
                                    {item.clue}
                                    <span className="text-gray-400 ml-1 whitespace-nowrap">({item.word.length})</span>
                                </span>
                            </li>
                        ))}
                        {verticalClues.length === 0 && <p className="text-xs text-gray-400 italic">No hay palabras verticales.</p>}
                    </ol>
                </div>
            </div>
        </div>
    );
}
