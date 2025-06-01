export interface ScoreboardProps {
    inning: number;
    isTop: boolean; // Indicates whether it's the top or bottom of the inning
    homeScores: number;
    awayScores: number;
    outs: number;
    strikes: number;
    balls: number;
}