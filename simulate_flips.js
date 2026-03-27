const crypto = require('crypto');

function simulateFlip(gameId, playerChoice, blockhash) {
    const seed = `${gameId}:${blockhash}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const num = parseInt(hash.slice(0, 8), 16);
    const playerWins = num % 100 < 40;
    return playerWins ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');
}

function runSimulation(iterations) {
    let wins = 0;
    const playerChoice = 'heads';
    
    for (let i = 0; i < iterations; i++) {
        const gameId = `game-${i}`;
        const blockhash = crypto.randomBytes(32).toString('hex');
        const result = simulateFlip(gameId, playerChoice, blockhash);
        if (result === playerChoice) {
            wins++;
        }
    }
    
    console.log(`Simulation finished!`);
    console.log(`Total Flips: ${iterations}`);
    console.log(`Wins: ${wins}`);
    console.log(`Win Rate: ${(wins / iterations * 100).toFixed(2)}%`);
}

runSimulation(10000);
