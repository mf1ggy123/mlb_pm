export interface ScoreboardProps {
    inning: number;
    isTop: boolean; // Indicates whether it's the top or bottom of the inning
    homeScores: number;
    awayScores: number;
    outs: number;
    strikes: number;
    balls: number;
    bases: number[]; // Array of 4 booleans representing the bases (1st, 2nd, 3rd, Home)
    onUpdate: (updates: Partial<ScoreboardProps>) => void;
    teams: { [key: string]: string };

}