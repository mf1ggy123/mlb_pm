import React, { useState } from 'react';
import { ScoreboardProps } from '../types';
import './Scoreboard.css'; // Assuming you have a CSS file for styling

const Scoreboard: React.FC<ScoreboardProps> = ({ inning, isTop, homeScores, awayScores, outs, strikes, balls }) => {
    const [strikeCount, setStrikeCount] = useState(strikes); // Track the number of strikes
    const [ballCount, setBallCount] = useState(balls); // Track the number of balls
    const [outCount, setOutCount] = useState(outs); // Track the number of outs
    const [currentInning, setCurrentInning] = useState(inning);
    const [isTopInning, setIsTopInning] = useState(isTop);
    const [bases, setBases] = useState([false, false, false, false]); // Track occupied bases (home, first, second, third)
    const [homeScore, setHomeScore] = useState(homeScores); // Track home team score
    const [awayScore, setAwayScore] = useState(awayScores); // Track away team score



    const handleReset = () => {
        setStrikeCount(0);
        setBallCount(0);
        setOutCount(0);
        setBases([false, false, false, false]); // Reset all bases
    }
    const handleResetCount = () => {
        setStrikeCount(0);
        setBallCount(0);
    }
    const handleScore = (score: number, isHome: boolean) => {
        
        if (isHome) {
            setHomeScore((prevScore) => prevScore + score); // Increment home team score
        } else {
            setAwayScore((prevScore) => prevScore + score); // Increment away team score
        }
    };
    const toggleInning = () => {
        if (!isTopInning) {
            // If switching from bottom to top, increment the inning
            setCurrentInning((prevInning) => (prevInning < 9 ? prevInning + 1 : prevInning));
        }
        setIsTopInning((prevIsTop) => !prevIsTop); // Toggle between top and bottom
        handleReset(); // Reset counts and bases when switching innings
    };
    
    const handleBaseClick = (index: number) => {
        setBases((prevBases) =>
            prevBases.map((base, i) => (i === index ? !base : base)) // Toggle the clicked base
        );
    };

    const handleStrikeClick = () => {
        if (strikeCount < 2) {
            setStrikeCount((prevCount) => prevCount + 1); // Increment strike count
        } else {
            setStrikeCount(0); // Reset strikes
            setOutCount((prevOuts) => prevOuts + 1); // Increment outs
            setBallCount(0); // Reset balls

            if (outCount + 1 >= 3) {
                // If 3 outs, switch to the next inning
                setOutCount(0);
                if (isTopInning) {
                    setIsTopInning(false); // Switch to bottom of the inning
                } else {
                    setIsTopInning(true); // Switch to top of the next inning
                    setCurrentInning((prevInning) => (prevInning < 9 ? prevInning + 1 : prevInning));
                }
            }
        }
    };

    const handleBallClick = () => {
        console.log(ballCount, strikeCount, outCount, bases);
        if (ballCount < 3) {
            setBallCount((prevCount) => prevCount + 1); // Increment ball count
        } else {
            setBallCount(0); // Reset balls
            setStrikeCount(0); // Reset strikes

            setBases((prevBases) => {
                const newBases = [...prevBases];
                if (prevBases[1]) {
                    // If someone is on first base, move them to second base
                    if(prevBases[2]) {
                        // If someone is on second base, move them to third base  
                        if(prevBases[3]) {
                            // If someone is on third base, score a run
                            if (isTopInning) {
                                // Increment away score
                                console.log("Away scores a run");
                                handleScore(1, false);
                            } else {
                                // Increment home score
                                console.log("Home scores a run");
                                handleScore(1, true);
                            }
                        } 
                        newBases[3] = true; // Occupy third base
                    }

                    newBases[2] = true; // Occupy second base
                }
                newBases[1] = true; // Occupy first base
                return newBases;
            });
        }
        console.log(ballCount, strikeCount, outCount, bases, homeScore, awayScore);
    };

    const handleOutClick = () => {
        if (outCount < 2) {
            setOutCount((prevOuts) => prevOuts + 1); // Increment outs
            setStrikeCount(0); // Reset strikes
            setBallCount(0); // Reset balls
        } else {
            // Reset outs, strikes, and balls, and switch the inning
            setOutCount(0);
            setStrikeCount(0);
            setBallCount(0);
            toggleInning();
            // if (isTopInning) {
            //     setIsTopInning(false); // Switch to bottom of the inning
            // } else {
            //     setIsTopInning(true); // Switch to top of the next inning
            //     setCurrentInning((prevInning) => (prevInning < 9 ? prevInning + 1 : prevInning));
            // }
        }
    };

    const handleRunnerAction = (action: string, baseNum: number) => {
        setBases((prevBases) => {
            const newBases = [...prevBases]; // Copy the current state of bases
            if (action === 'moveToSecond') {
                if (prevBases[baseNum]) {
                    newBases[baseNum] = false; // Remove runner from first base
                    newBases[2] = true; // Move runner to second base
                }
            } else if (action === 'moveToThird') {
                if (prevBases[baseNum]) {
                    newBases[baseNum] = false; // Remove runner from first base
                    newBases[3] = true; // Move runner to third base
                }
            } else if (action === 'score') {
                if (prevBases[baseNum]) {
                    newBases[baseNum] = false; // Remove runner from first base
                    handleScore(1, !isTopInning); // Increment score for the appropriate team
                }
            } else if (action === 'out') {
                if (prevBases[baseNum]) {
                    console.log(`Runner on base ${baseNum} is out`);
                    newBases[baseNum] = false; // Remove runner from first base
                    handleOutClick(); // Increment outs
                }
            }
            else if (action === 'Homerun') {
                // Handle a homerun: all runners score
                const count = newBases.filter(Boolean).length;
                handleScore(count + 1, !isTopInning); // Increment score for the team
                newBases.fill(false); // Clear all bases
                setStrikeCount(0);
                setBallCount(0);
            }
            setBases(newBases); // Update the bases state
            return newBases;
        });
    };

    return (
        <div className="container">
            <div className="scoreboard">
                <h1 className="score-header" style={{ fontSize: '30px', textAlign: 'center', margin: '5px 0' }}>
                    Score: Home ({homeScore}) - Away ({awayScore})
                </h1>
                <div className="inning" style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
                    Inning: {currentInning} ({isTopInning ? 'Top' : 'Bottom'})
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
                                        backgroundColor: index < outCount ? 'red' : 'white',
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
                                        backgroundColor: index < strikeCount ? 'red' : 'white',
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
                                        backgroundColor: index < ballCount ? 'green' : 'white',
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
                                <button onClick={() => handleRunnerAction('moveToSecond',1)}
                                    style={{ backgroundColor: 'lightblue' }}
                                    >
                                        2nd
                                </button>
                                <button onClick={() => handleRunnerAction('moveToThird',1)}
                                style={{ backgroundColor: 'lightyellow' }}
                                    >
                                        3rd
                                </button>
                                <button onClick={() => handleRunnerAction('score',1)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                    >
                                        Score
                                        </button>
                                <button 
                                    onClick={() => handleRunnerAction('out',1)} 
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
                                <button onClick={() => handleRunnerAction('moveToThird',2)}
                                style={{ backgroundColor: 'lightyellow' }}
                                >
                                3rd
                        </button>
                                <button onClick={() => handleRunnerAction('score',2)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                    >
                                        Score
                                        </button>
                                <button 
                                    onClick={() => handleRunnerAction('out',2)} 
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
                                <button onClick={() => handleRunnerAction('score',3)}
                                    style={{ backgroundColor: 'lightgreen' }}
                                    >
                                        Score
                                        </button>
                                <button 
                                    onClick={() => handleRunnerAction('out',3)} 
                                    style={{ backgroundColor: 'salmon' }}
                                >
                                    Out
                                </button>
                            </div>
                        )}</div>
                        <div
                            className={`base ${bases[0] ? 'occupied' : ''}`}
                            onClick={() => handleRunnerAction("Homerun",0)}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;