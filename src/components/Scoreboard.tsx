import React from 'react';
import { ScoreboardProps } from '../types';
import './Scoreboard.css';

const Scoreboard: React.FC<ScoreboardProps> = ({
    inning,
    isTop,
    homeScores,
    awayScores,
    outs,
    strikes,
    balls,
    bases,
    onUpdate,
}) => {
    // Handlers now call onUpdate with new state, no local state

    const handleReset = () => {
        onUpdate({
            strikes: 0,
            balls: 0,
            outs: 0,
            bases: [false, false, false, false],
        });
    };

    const handleResetCount = () => {
        onUpdate({
            strikes: 0,
            balls: 0,
        });
    };

    const handleScore = (score: number, isHome: boolean) => {
        if (isHome) {
            onUpdate({ homeScores: homeScores + score });
        } else {
            onUpdate({ awayScores: awayScores + score });
        }
    };

    const toggleInning = () => {
        if (!isTop) {
            onUpdate({
                isTop: true,
                inning: inning < 9 ? inning + 1 : inning,
                strikes: 0,
                balls: 0,
                outs: 0,
                bases: [false, false, false, false],
            });
        } else {
            onUpdate({
                isTop: false,
                strikes: 0,
                balls: 0,
                outs: 0,
                bases: [false, false, false, false],
            });
        }
    };

    const handleBaseClick = (index: number) => {
        console.log(`Base ${index} clicked`);
        const newBases = bases.map((base, i) => (i === index ? !base : base));
        onUpdate({ bases: newBases });
    };

    const handleStrikeClick = () => {
        if (strikes < 2) {
            onUpdate({ strikes: strikes + 1 });
        } else {
            if (outs + 1 >= 3) {
                // 3 outs, switch inning
                if (isTop) {
                    onUpdate({
                        strikes: 0,
                        balls: 0,
                        outs: 0,
                        isTop: false,
                        bases: [false, false, false, false],
                    });
                } else {
                    onUpdate({
                        strikes: 0,
                        balls: 0,
                        outs: 0,
                        isTop: true,
                        inning: inning < 9 ? inning + 1 : inning,
                        bases: [false, false, false, false],
                    });
                }
            } else {
                onUpdate({
                    strikes: 0,
                    balls: 0,
                    outs: outs + 1,
                });
            }
        }
    };

    const handleBallClick = () => {
        if (balls < 3) {
            onUpdate({ balls: balls + 1 });
        } else {
            // Walk: reset balls/strikes, advance runners
            let newBases = [...bases];
            if (bases[1]) {
                if (bases[2]) {
                    if (bases[3]) {
                        // Score
                        handleScore(1, !isTop);
                        newBases[3] = false;
                    }
                    newBases[3] = true;
                }
                newBases[2] = true;
            }
            newBases[1] = true;
            onUpdate({
                balls: 0,
                strikes: 0,
                bases: newBases,
            });
        }
    };

    const handleOutClick = () => {
        if (outs < 2) {
            onUpdate({
                outs: outs + 1,
                strikes: 0,
                balls: 0,
            });
        } else {
            // 3 outs, switch inning
            if (isTop) {
                onUpdate({
                    outs: 0,
                    strikes: 0,
                    balls: 0,
                    isTop: false,
                    bases: [false, false, false, false],
                });
            } else {
                onUpdate({
                    outs: 0,
                    strikes: 0,
                    balls: 0,
                    isTop: true,
                    inning: inning < 9 ? inning + 1 : inning,
                    bases: [false, false, false, false],
                });
            }
        }
    };

    const handleRunnerAction = (action: string, baseNum: number) => {
        let newBases = [...bases];
        if (action === 'moveToSecond') {
            if (bases[baseNum]) {
                newBases[baseNum] = false;
                newBases[2] = true;
            }
        } else if (action === 'moveToThird') {
            if (bases[baseNum]) {
                newBases[baseNum] = false;
                newBases[3] = true;
            }
        } else if (action === 'score') {
            if (bases[baseNum]) {
                newBases[baseNum] = false;
                handleScore(1, !isTop);
            }
        } else if (action === 'out') {
            if (bases[baseNum]) {
                newBases[baseNum] = false;
                handleOutClick();
            }
        } else if (action === 'Homerun') {
            const count = newBases.filter(Boolean).length;
            handleScore(count + 1, !isTop);
            newBases = [false, false, false, false];
        }
        console.log(`Runner action: ${action} on base ${baseNum}`);
        console.log('New bases state:', newBases);
        console.log('Current bases:', bases);
        onUpdate({ bases: newBases });
        console.log('New bases state:', newBases);
        console.log('Current bases:', bases);
    };

    return (
        <div className="container">
            <div className="scoreboard">
                <h1 className="score-header" style={{ fontSize: '30px', textAlign: 'center', margin: '5px 0' }}>
                    Score: Home ({homeScores}) - Away ({awayScores})
                </h1>
                <div className="inning" style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
                    Inning: {inning} ({isTop ? 'Top' : 'Bottom'})
                    <button
                        onClick={toggleInning}
                        style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '10px' }}
                    >
                        Switch Inning
                    </button>
                </div>
                <button
                    onClick={handleResetCount}
                    style={{
                        fontSize: '16px',
                        padding: '10px 80px',
                        margin: '0px auto',
                        display: 'block',
                        backgroundColor: 'lightcoral',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Reset Balls and Strikes
                </button>
                <div className="outs-strikes-balls">
                    <div className="outs">
                        <h2>Outs:</h2>
                        <div className="out-circles" onClick={handleOutClick}>
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="circle"
                                    style={{
                                        backgroundColor: index < outs ? 'red' : 'white',
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div className="strikes">
                        <h2>Strikes:</h2>
                        <div className="strike-circles" onClick={handleStrikeClick}>
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="circle"
                                    style={{
                                        backgroundColor: index < strikes ? 'red' : 'white',
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div className="balls">
                        <h2>Balls:</h2>
                        <div className="ball-circles" onClick={handleBallClick}>
                            {[0, 1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className="circle"
                                    style={{
                                        backgroundColor: index < balls ? 'green' : 'white',
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="diamond">
                    <div style={{ paddingTop: '50px' }}></div>
                    <div className="diamond-layout">
                        <div
                            className={`base ${bases[1] ? 'occupied' : ''}`}
                            onClick={() => handleBaseClick(1)}
                        >{bases[1] && (
                            <div className="runner-actions1">
                                <button onClick={() => handleRunnerAction('moveToSecond', 1)}
                                    style={{ backgroundColor: 'lightblue' }}
                                >
                                    2nd
                                </button>
                                <button onClick={() => handleRunnerAction('moveToThird', 1)}
                                    style={{ backgroundColor: 'lightyellow' }}
                                >
                                    3rd
                                </button>
                                <button onClick={() => handleRunnerAction('score', 1)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                >
                                    Score
                                </button>
                                <button
                                    onClick={() => handleRunnerAction('out', 1)}
                                    style={{ backgroundColor: 'salmon' }}
                                >
                                    Out
                                </button>
                            </div>
                        )}</div>
                        <div
                            className={`base ${bases[2] ? 'occupied' : ''}`}
                            onClick={() => handleBaseClick(2)}
                        >{bases[2] && (
                            <div className="runner-actions2">
                                <button onClick={() => handleRunnerAction('moveToThird', 2)}
                                    style={{ backgroundColor: 'lightyellow' }}
                                >
                                    3rd
                                </button>
                                <button onClick={() => handleRunnerAction('score', 2)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                >
                                    Score
                                </button>
                                <button
                                    onClick={() => handleRunnerAction('out', 2)}
                                    style={{ backgroundColor: 'salmon' }}
                                >
                                    Out
                                </button>
                            </div>
                        )}</div>
                        <div
                            className={`base ${bases[3] ? 'occupied' : ''}`}
                            onClick={() => handleBaseClick(3)}
                        >{bases[3] && (
                            <div className="runner-actions3">
                                <button onClick={() => handleRunnerAction('score', 3)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                >
                                    Score
                                </button>
                                <button
                                    onClick={() => handleRunnerAction('out', 3)}
                                    style={{ backgroundColor: 'salmon' }}
                                >
                                    Out
                                </button>
                            </div>
                        )}</div>
                        <div
                            className={`base ${bases[0] ? 'occupied' : ''}`}
                            onClick={() => handleRunnerAction("Homerun", 0)}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;